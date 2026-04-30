# routers/whatsapp.py
import logging
import asyncio
import time
import uuid
import re
from fastapi import APIRouter, Request, Response, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from twilio.rest import Client
from twilio.request_validator import RequestValidator
from langchain_core.messages import HumanMessage

from config import settings
from database import get_db, AsyncSessionLocal
from agents.graph import app_graph
from models import Conversation, User, UserProfile
from services.message_service import save_message
from services.user_service import get_or_create_whatsapp_user

router = APIRouter(prefix="/webhook", tags=["whatsapp"])
logger = logging.getLogger(__name__)

# Twilio client — initialized once
twilio_client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
validator = RequestValidator(settings.TWILIO_AUTH_TOKEN)


def send_whatsapp_reply(to: str, message: str):
    """
    Send a WhatsApp message via Twilio.
    Splits long messages — WhatsApp has 1600 char limit.
    Includes a small delay for sandbox rate limits.
    """
    # WhatsApp message limit is 1600 characters
    chunks = [message[i:i+1500] for i in range(0, len(message), 1500)]

    for i, chunk in enumerate(chunks):
        twilio_client.messages.create(
            from_=settings.TWILIO_WHATSAPP_NUMBER,
            to=to,
            body=chunk
        )
        if i < len(chunks) - 1:
            time.sleep(1)  # Sandbox rate limit


def format_schemes_for_whatsapp(schemes: list, summary: str, lang: str = 'en') -> str:
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
        match_label = "मिलान" if lang == 'hi' else "Match"
        lines.append(f"✅ {match_label}: {score}%")

        if explanation:
            lines.append(f"📌 {explanation}")

        if benefits:
            first_benefit = benefits[0] if isinstance(benefits, list) and benefits else str(benefits)
            lines.append(f"💰 {first_benefit}")

        if app_mode:
            apply_label = "आवेदन" if lang == 'hi' else "Apply"
            lines.append(f"📋 {apply_label}: {app_mode}")

        if link:
            lines.append(f"🔗 {link}")

        lines.append("")

    footer = ("योजना का नाम भेजें और हम आपका आवेदन पत्र तैयार करेंगे।"
              if lang == 'hi' else
              "Reply with a scheme name to generate your application draft.")
    lines.append(footer)
    return "\n".join(lines)


def format_agent_response_for_whatsapp(text: str) -> str:
    """
    Clean markdown formatting that doesn't render on WhatsApp.
    Convert markdown to WhatsApp-compatible format.
    """
    # Convert markdown bold **text** to WhatsApp *text*
    text = re.sub(r'\*\*(.*?)\*\*', r'*\1*', text)

    # Remove markdown headers ### 
    text = re.sub(r'#{1,6}\s+', '', text)

    # Convert markdown tables to simple text (very basic)
    # Remove table separator rows like |---|---|
    text = re.sub(r'\|[-| :]+\|\n', '', text)
    # Convert table rows to simple lines
    text = re.sub(r'\|(.*?)\|', lambda m: m.group(1).strip() + ": ", text)

    # Remove excessive blank lines
    text = re.sub(r'\n{3,}', '\n\n', text)

    return text.strip()


@router.post("/whatsapp")
async def whatsapp_webhook(request: Request):
    """
    Main webhook endpoint — Twilio calls this on every incoming message.
    """
    form_data = await request.form()
    form_dict = dict(form_data)

    # Extract message details from Twilio's payload
    from_number  = form_dict.get("From", "")  # e.g. whatsapp:+919876543210
    message_body = form_dict.get("Body", "").strip()
    num_media    = int(form_dict.get("NumMedia", 0))

    logger.info(f"WhatsApp message from {from_number}: {message_body[:50]}")

    # Handle empty messages
    if not message_body and num_media == 0:
        return Response(content="", media_type="text/xml")

    # Handle voice notes
    if num_media > 0 and not message_body:
        send_whatsapp_reply(
            from_number,
            "🎤 Voice messages coming soon! Please type your question for now.\n\n"
            "Try: 'What schemes am I eligible for?' or 'I need a business loan'\n\n"
            "या हिंदी में लिखें: 'मुझे लोन चाहिए' / 'कौन सी योजना मिलेगी'"
        )
        return Response(content="", media_type="text/xml")

    # Process in background — Twilio needs 200 response within 15s
    asyncio.create_task(
        process_whatsapp_message(from_number, message_body)
    )

    return Response(content="", media_type="text/xml")


async def process_whatsapp_message(from_number: str, message_body: str):
    """
    Background task to process MAYA logic.
    """
    try:
        # Use phone number as the user identifier for WhatsApp users
        phone = from_number.replace("whatsapp:", "")
        wa_user_id = f"wa_{phone}"  # prefix to distinguish from Clerk users

        async with AsyncSessionLocal() as db:
            # Get or create a WhatsApp user
            await get_or_create_whatsapp_user(db, wa_user_id, phone)

            # Get or create conversation for this phone number
            conversation = await get_or_create_wa_conversation(db, wa_user_id)
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
        config = {"configurable": {"thread_id": conversation_id}}
        result = await app_graph.ainvoke({
            "messages": [HumanMessage(content=message_body)],
            "user_profile": {"location": "India"}, # Placeholder
            "schemes": [],
            "conversation_id": conversation_id,
            "clerk_user_id": wa_user_id
        }, config)

        # Extract response
        agent_used  = result.get("current_agent", "general")
        schemes     = result.get("schemes", [])
        
        # Get the last AI message
        if result["messages"] and hasattr(result["messages"][-1], "content"):
            raw_message = result["messages"][-1].content
        else:
            raw_message = "I processed your request but didn't generate a text response."

        # FIX: Ensure content is always a string (like main.py)
        if isinstance(raw_message, list):
            text_parts = []
            for block in raw_message:
                if isinstance(block, dict) and 'text' in block:
                    text_parts.append(block['text'])
                elif isinstance(block, str):
                    text_parts.append(block)
            raw_message = "\n".join(text_parts)

        # Detect language from the incoming message for formatter
        wa_lang = result.get("detected_lang", "en") or "en"

        # Format response based on agent type
        if agent_used == "scheme" and schemes:
            reply = format_schemes_for_whatsapp(schemes, raw_message, lang=wa_lang)
        else:
            reply = format_agent_response_for_whatsapp(raw_message)

        # Send WhatsApp reply
        send_whatsapp_reply(from_number, reply)

    except Exception as e:
        logger.error(f"WhatsApp processing error: {e}", exc_info=True)
        send_whatsapp_reply(
            from_number,
            "Sorry, I encountered an error. Please try again in a moment."
        )


async def get_or_create_wa_conversation(
    db: AsyncSession, wa_user_id: str
) -> Conversation:
    """
    WhatsApp users get one persistent conversation per phone number.
    """
    from sqlalchemy import select

    result = await db.execute(
        select(Conversation).where(
            Conversation.clerk_user_id == wa_user_id
        ).order_by(Conversation.created_at.desc()).limit(1)
    )
    conversation = result.scalars().first()

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
