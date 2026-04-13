Okay. Running locally means your first job is making your backend publicly accessible so Twilio can reach it. Here's the complete setup guide.

---

## Architecture Overview

```
User WhatsApp message
        ↓
Twilio receives it
        ↓
Twilio POSTs to your webhook URL
        ↓
FastAPI /webhook/whatsapp endpoint
        ↓
Routes to existing MAYA agents (same graph.py)
        ↓
Response sent back via Twilio API
        ↓
User sees reply on WhatsApp
```

Your existing agents require zero changes. WhatsApp is just a new input/output surface sitting on top of what already works.

---

## Step 1 — Expose Localhost via ngrok (30 mins)

Twilio needs a public HTTPS URL to send messages to. ngrok creates a temporary public tunnel to your local server.

```bash
# Install ngrok
# Windows: download from ngrok.com and add to PATH
# Mac: brew install ngrok
# Linux: snap install ngrok

# Authenticate (free account at ngrok.com)
ngrok authtoken YOUR_NGROK_TOKEN

# Start tunnel pointing to your FastAPI port
ngrok http 8000
```

ngrok gives you a URL like:
```
Forwarding  https://abc123.ngrok-free.app -> http://localhost:8000
```

Copy that HTTPS URL — this is your webhook base URL. It changes every time you restart ngrok, so keep it running during development.

---

## Step 2 — Install Twilio SDK

```bash
pip install twilio
```

Add to your `.env`:
```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

The sandbox number is always `+14155238886` for Twilio Sandbox.

---

## Step 3 — Create WhatsApp Router

Create `routers/whatsapp.py`:

```python
# routers/whatsapp.py
import logging
import asyncio
from fastapi import APIRouter, Request, Response, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from twilio.rest import Client
from twilio.request_validator import RequestValidator
from langchain_core.messages import HumanMessage

from app.config import settings
from database import get_db, AsyncSessionLocal
from agents.graph import app_graph
from models import Conversation, User, UserProfile
from services.message_service import save_message
from services.user_service import get_or_create_whatsapp_user
import uuid

router = APIRouter(prefix="/webhook", tags=["whatsapp"])
logger = logging.getLogger(__name__)

# Twilio client — initialized once
twilio_client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
validator = RequestValidator(settings.TWILIO_AUTH_TOKEN)


def send_whatsapp_reply(to: str, message: str):
    """
    Send a WhatsApp message via Twilio.
    Splits long messages — WhatsApp has 1600 char limit.
    """
    # WhatsApp message limit is 1600 characters
    chunks = [message[i:i+1500] for i in range(0, len(message), 1500)]

    for chunk in chunks:
        twilio_client.messages.create(
            from_=settings.TWILIO_WHATSAPP_NUMBER,
            to=to,
            body=chunk
        )


def format_schemes_for_whatsapp(schemes: list, summary: str) -> str:
    """
    Convert scheme cards to WhatsApp-friendly text.
    No HTML, no markdown tables — just clean formatted text.
    WhatsApp supports *bold* and _italic_.
    """
    if not schemes:
        return summary

    lines = [summary, ""]

    for i, scheme in enumerate(schemes[:3], 1):  # max 3 schemes
        score = scheme.get("relevance_score", 0)
        name  = scheme.get("name", "")
        explanation = scheme.get("explanation", "")
        benefits = scheme.get("benefits", [])
        link = scheme.get("link", "")
        app_mode = scheme.get("application_mode", "")

        lines.append(f"*{i}. {name}*")
        lines.append(f"✅ Match: {score}%")

        if explanation:
            lines.append(f"📌 {explanation}")

        if benefits:
            first_benefit = benefits[0] if isinstance(benefits, list) else str(benefits)
            lines.append(f"💰 {first_benefit}")

        if app_mode:
            lines.append(f"📋 Apply: {app_mode}")

        if link:
            lines.append(f"🔗 {link}")

        lines.append("")  # blank line between schemes

    lines.append("Reply with a scheme name to generate your application draft.")
    return "\n".join(lines)


def format_agent_response_for_whatsapp(text: str) -> str:
    """
    Clean markdown formatting that doesn't render on WhatsApp.
    Convert markdown to WhatsApp-compatible format.
    """
    import re

    # Convert markdown bold **text** to WhatsApp *text*
    text = re.sub(r'\*\*(.*?)\*\*', r'*\1*', text)

    # Remove markdown headers ### 
    text = re.sub(r'#{1,6}\s+', '', text)

    # Convert markdown tables to simple text
    # Remove table separator rows like |---|---|
    text = re.sub(r'\|[-| :]+\|\n', '', text)
    # Convert table rows to simple lines
    text = re.sub(r'\|(.*?)\|', lambda m: m.group(1).strip(), text)

    # Remove excessive blank lines
    text = re.sub(r'\n{3,}', '\n\n', text)

    return text.strip()


@router.post("/whatsapp")
async def whatsapp_webhook(request: Request):
    """
    Main webhook endpoint — Twilio calls this on every incoming message.

    Flow:
    1. Parse incoming WhatsApp message
    2. Identify or create user by phone number
    3. Get or create conversation for this phone number
    4. Run through MAYA's existing agent graph
    5. Format response for WhatsApp
    6. Send reply via Twilio
    7. Return 200 immediately (Twilio requires fast response)
    """
    form_data = await request.form()
    form_dict = dict(form_data)

    # Extract message details from Twilio's payload
    from_number  = form_dict.get("From", "")  # e.g. whatsapp:+919876543210
    to_number    = form_dict.get("To", "")
    message_body = form_dict.get("Body", "").strip()
    num_media    = int(form_dict.get("NumMedia", 0))

    logger.info(f"WhatsApp message from {from_number}: {message_body[:50]}")

    # Handle empty messages
    if not message_body and num_media == 0:
        return Response(content="", media_type="text/xml")

    # Handle voice notes (future — for now inform user)
    if num_media > 0 and not message_body:
        send_whatsapp_reply(
            from_number,
            "🎤 Voice messages coming soon! Please type your question for now.\n\n"
            "Try: 'What schemes am I eligible for?' or 'I need a business loan'"
        )
        return Response(content="", media_type="text/xml")

    # Process in background — Twilio needs 200 response within 15s
    # but agent processing can take longer
    asyncio.create_task(
        process_whatsapp_message(from_number, message_body)
    )

    # Return empty 200 immediately — reply sent async
    return Response(content="", media_type="text/xml")


async def process_whatsapp_message(from_number: str, message_body: str):
    """
    Background task — runs the full MAYA agent pipeline.
    Sends WhatsApp reply when done.
    Decoupled from the webhook response so Twilio doesn't timeout.
    """
    try:
        # Use phone number as the user identifier for WhatsApp users
        # Strip "whatsapp:" prefix and use number as clerk_user_id proxy
        phone = from_number.replace("whatsapp:", "")
        wa_user_id = f"wa_{phone}"  # prefix to distinguish from Clerk users

        async with AsyncSessionLocal() as db:
            # Get or create a WhatsApp user
            await get_or_create_whatsapp_user(db, wa_user_id, phone)

            # Get or create conversation for this phone number
            # Each phone number gets one persistent conversation
            conversation = await get_or_create_wa_conversation(
                db, wa_user_id
            )
            conversation_id = str(conversation.id)

            # Save user message
            await save_message(
                db=db,
                conversation_id=uuid.UUID(conversation_id),
                role="user",
                content_type="text",
                content={"text": message_body},
                agent_used=None
            )

        # Run MAYA agent graph — same as web chat
        result = await app_graph.ainvoke({
            "messages": [HumanMessage(content=message_body)],
            "schemes": [],
            "current_agent": "",
            "conversation_id": conversation_id,
            "clerk_user_id": wa_user_id
        })

        # Extract response
        agent_used  = result.get("current_agent", "general")
        schemes     = result.get("schemes", [])
        raw_message = result["messages"][-1].content

        # Format response based on agent type
        if agent_used == "scheme" and schemes:
            reply = format_schemes_for_whatsapp(schemes, raw_message)
        else:
            reply = format_agent_response_for_whatsapp(raw_message)

        # Send WhatsApp reply
        send_whatsapp_reply(from_number, reply)

    except Exception as e:
        logger.error(f"WhatsApp processing error: {e}", exc_info=True)
        send_whatsapp_reply(
            from_number,
            "Sorry, something went wrong. Please try again in a moment."
        )


async def get_or_create_wa_conversation(
    db: AsyncSession, wa_user_id: str
) -> Conversation:
    """
    WhatsApp users get one persistent conversation per phone number.
    Unlike web users who can have multiple conversations.
    """
    from sqlalchemy import select

    result = await db.execute(
        select(Conversation).where(
            Conversation.clerk_user_id == wa_user_id
        ).order_by(Conversation.created_at.desc())
    )
    conversation = result.scalar_one_or_none()

    if conversation:
        return conversation

    conversation = Conversation(
        clerk_user_id=wa_user_id,
        title="WhatsApp Chat"
    )
    db.add(conversation)
    await db.commit()
    await db.refresh(conversation)
    return conversation
```

---

## Step 4 — Add WhatsApp User Helper

Add to `services/user_service.py`:

```python
async def get_or_create_whatsapp_user(
    db: AsyncSession,
    wa_user_id: str,
    phone: str
) -> User:
    """
    WhatsApp users are identified by phone number.
    Created with wa_ prefix to distinguish from Clerk users.
    No password, no email — phone is their identity.
    """
    result = await db.execute(
        select(User).where(User.clerk_user_id == wa_user_id)
    )
    user = result.scalar_one_or_none()

    if user:
        return user

    user = User(
        clerk_user_id=wa_user_id,
        email=f"{phone}@whatsapp.maya",  # placeholder
        name=phone
    )
    db.add(user)
    await db.flush()

    # Empty profile — WhatsApp onboarding handled conversationally
    profile = UserProfile(
        clerk_user_id=wa_user_id,
        onboarding_complete=False
    )
    db.add(profile)
    await db.commit()
    await db.refresh(user)
    return user
```

---

## Step 5 — Register Router in `main.py`

```python
# main.py
from routers.whatsapp import router as whatsapp_router
app.include_router(whatsapp_router)
```

---

## Step 6 — Configure Twilio Sandbox Webhook

1. Go to [console.twilio.com](https://console.twilio.com)
2. Navigate to **Messaging → Try it out → Send a WhatsApp message**
3. You'll see the Sandbox configuration page
4. Find **"When a message comes in"** field
5. Enter your ngrok URL:
```
https://abc123.ngrok-free.app/webhook/whatsapp
```
6. Set method to **HTTP POST**
7. Click **Save**

---

## Step 7 — Join the Sandbox

Before testing, you and anyone testing must join the sandbox:

1. From Twilio console, note the sandbox join code — something like `join xyz-abc`
2. Send that exact message to `+1 415 523 8886` on WhatsApp
3. You'll get a confirmation — now you're connected

---

## Step 8 — Test the Flow

Start your FastAPI server and ngrok, then send these test messages:

```
# Test basic routing
"hi"
→ Should get MAYA greeting

# Test scheme agent  
"I want a loan to start a textile business"
→ Should get 2-3 scheme cards formatted for WhatsApp

# Test off-topic guard
"who is Virat Kohli"
→ Should get polite redirect

# Test general agent
"how should I price my handmade soap"
→ Should get business advice
```

---

## Step 9 — Handle the Rate Limit Correctly

Twilio Sandbox allows only 1 message per second. Add a small delay for multi-part responses:

```python
def send_whatsapp_reply(to: str, message: str):
    import time

    chunks = [message[i:i+1500] for i in range(0, len(message), 1500)]

    for i, chunk in enumerate(chunks):
        twilio_client.messages.create(
            from_=settings.TWILIO_WHATSAPP_NUMBER,
            to=to,
            body=chunk
        )
        if i < len(chunks) - 1:
            time.sleep(1)  # Sandbox rate limit
```

---

## Final Checklist

```
□ ngrok installed and running on port 8000
□ ngrok HTTPS URL copied
□ TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN,
  TWILIO_WHATSAPP_NUMBER added to .env
□ pip install twilio done
□ routers/whatsapp.py created
□ get_or_create_whatsapp_user() added to user_service.py
□ whatsapp_router registered in main.py
□ Twilio sandbox webhook URL updated to ngrok URL
□ Your phone joined the sandbox (sent join code)
□ Tested: greeting works ✅
□ Tested: scheme search returns formatted cards ✅
□ Tested: off-topic gets redirected ✅

WHEN READY TO DEPLOY
□ Deploy backend to Koyeb
□ Replace ngrok URL with Koyeb URL in Twilio console
□ ngrok no longer needed
```

Once this is working on sandbox, the transition to production WhatsApp is just a Meta Business verification — the code stays identical.