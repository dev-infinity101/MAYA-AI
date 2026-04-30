"""
scripts/seed_demo_data.py

Run BEFORE the demo to populate the dashboard with realistic numbers.
Creates 50 demo users, ~500 messages spread over 30 days (more on recent days),
8 business reports, and 25 draft interactions.

Does NOT touch real users. Safe to run multiple times (skips existing demo users).

Usage:
    cd backend
    python seed_demo_data.py
"""

import asyncio
import random
from datetime import datetime, timedelta

from sqlalchemy import select
from database import AsyncSessionLocal
from models import (
    User, UserProfile, Conversation, Message,
    UserSchemeInteraction, Scheme, OutcomeTracking
)

# ── Demo data constants ───────────────────────────────────────────────────────

CITIES = [
    "Lucknow", "Varanasi", "Kanpur", "Agra", "Gorakhpur",
    "Meerut", "Prayagraj", "Bareilly", "Aligarh", "Jhansi",
    "Mathura", "Moradabad", "Firozabad", "Saharanpur", "Noida",
]

BUSINESSES = [
    "Food Processing", "Handicrafts", "Tailoring & Garments",
    "Pottery & Ceramics", "Retail Store", "Dairy Products",
    "Carpentry & Furniture", "Blacksmith & Metal Work",
    "Beauty Parlour", "Mobile & Electronics Repair",
    "Pickle & Papad Making", "Leather Goods", "Basket Weaving",
    "Shoe Making & Repair", "Toy Making",
]

CATEGORIES = ["General", "SC", "ST", "OBC", "Women", "Women", "Women"]  # Women weighted higher

SECTORS = ["manufacturing", "services", "trading"]

TURNOVER_RANGES = ["Under ₹10 Lakh", "₹10L - ₹50L", "₹50L - ₹5Cr"]

AGENTS = [
    "scheme", "market", "brand", "finance", "marketing", "general",
    "scheme", "scheme",  # scheme weighted higher (most common)
]

DEMO_MESSAGES = [
    "mujhe PMEGP ke baare mein batao",
    "I want to start a food processing unit",
    "What schemes are available for women entrepreneurs?",
    "mudra loan kaise milega",
    "How to register on GeM portal?",
    "mera business plan banana hai",
    "ODOP yojana kya hai?",
    "I need funding for my tailoring business",
    "PM Vishwakarma scheme eligibility",
    "subsidy on machinery purchase UP",
]

# ── Seed function ─────────────────────────────────────────────────────────────

async def seed_demo_data():
    """Create realistic-looking analytics data for the dashboard."""
    async with AsyncSessionLocal() as db:
        print("🌱 Starting demo data seeding...")

        # ── Check schemes exist ───────────────────────────────────────────────
        result = await db.execute(select(Scheme.id))
        scheme_ids = [row[0] for row in result.all()]

        if not scheme_ids:
            print("❌ No schemes found in database. Please run the regular seed script first.")
            print("   Run: python seed.py")
            return

        print(f"   Found {len(scheme_ids)} schemes in DB")

        # ── Create 50 demo users ──────────────────────────────────────────────
        user_ids: list[str] = []
        created_users = 0

        for i in range(50):
            clerk_id = f"demo_user_{i:03d}"

            existing = await db.execute(
                select(User).where(User.clerk_user_id == clerk_id)
            )
            if existing.scalar_one_or_none():
                user_ids.append(clerk_id)
                continue

            city = random.choice(CITIES)
            category = random.choice(CATEGORIES)
            business = random.choice(BUSINESSES)

            user = User(
                clerk_user_id=clerk_id,
                email=f"demo{i:03d}@maya-demo.in",
                name=_random_name(i),
                created_at=datetime.utcnow() - timedelta(days=random.randint(1, 45)),
            )
            db.add(user)

            profile = UserProfile(
                clerk_user_id=clerk_id,
                full_name=_random_name(i),
                category=category,
                state="Uttar Pradesh",
                city=city,
                business_name=f"{city} {business}",
                business_type=business,
                sector=random.choice(SECTORS),
                turnover_range=random.choice(TURNOVER_RANGES),
                udyam_registered=random.choice([True, False, False]),  # most not yet registered
                existing_loan=random.choice([True, False, False, False]),
                primary_goal=random.choice(["Get government funding", "Expand business", "Start new venture"]),
                onboarding_complete=True,
            )
            db.add(profile)
            user_ids.append(clerk_id)
            created_users += 1

        await db.flush()
        print(f"   ✅ {created_users} demo users created ({50 - created_users} already existed)")

        # ── Create conversations + messages (30 days, realistic activity) ─────
        total_messages = 0
        conv_ids: list = []

        for day_offset in range(30):
            date_ts = datetime.utcnow() - timedelta(days=day_offset)
            # Recent days have more activity (realistic growth curve)
            if day_offset < 3:
                num_convs = random.randint(12, 20)
            elif day_offset < 7:
                num_convs = random.randint(8, 14)
            elif day_offset < 14:
                num_convs = random.randint(4, 9)
            else:
                num_convs = random.randint(1, 5)

            for _ in range(num_convs):
                uid = random.choice(user_ids)
                msg_text = random.choice(DEMO_MESSAGES)

                conv = Conversation(
                    clerk_user_id=uid,
                    title=msg_text[:50],
                    created_at=date_ts + timedelta(minutes=random.randint(0, 900)),
                    updated_at=date_ts + timedelta(minutes=random.randint(10, 960)),
                )
                db.add(conv)
                await db.flush()
                conv_ids.append(conv.id)

                # User message
                db.add(Message(
                    conversation_id=conv.id,
                    role="user",
                    content_type="text",
                    content={"text": msg_text},
                    agent_used=None,
                    created_at=date_ts + timedelta(minutes=random.randint(0, 900)),
                ))
                total_messages += 1

                # Assistant response (always comes back)
                agent = random.choice(AGENTS)
                db.add(Message(
                    conversation_id=conv.id,
                    role="assistant",
                    content_type="text",
                    content={"text": f"Demo response for {msg_text[:30]}..."},
                    agent_used=agent,
                    created_at=date_ts + timedelta(minutes=random.randint(1, 961)),
                ))
                total_messages += 1

                # Some conversations have scheme results
                if random.random() < 0.4:
                    db.add(Message(
                        conversation_id=conv.id,
                        role="assistant",
                        content_type="scheme_results",
                        content={
                            "summary": "Found matching schemes",
                            "schemes": [{"id": random.choice(scheme_ids), "name": "PMEGP", "match_score": random.randint(70, 98)}]
                        },
                        agent_used="scheme",
                        created_at=date_ts + timedelta(minutes=random.randint(2, 962)),
                    ))
                    total_messages += 1

        await db.flush()
        print(f"   ✅ {total_messages} messages across {len(conv_ids)} conversations")

        # ── Create 8 business reports ─────────────────────────────────────────
        if conv_ids:
            for j in range(8):
                conv_id = random.choice(conv_ids)
                db.add(Message(
                    conversation_id=conv_id,
                    role="assistant",
                    content_type="business_report",
                    content={
                        "report": f"## Business Report {j+1}\n\nDemo business analysis report for a UP MSME.",
                        "business_context": {
                            "query": random.choice(DEMO_MESSAGES),
                            "city": random.choice(CITIES),
                        }
                    },
                    agent_used="report_pipeline",
                    created_at=datetime.utcnow() - timedelta(days=random.randint(0, 20)),
                ))
            print("   ✅ 8 business report messages created")

        # ── Create 25 draft interactions ──────────────────────────────────────
        draft_count = 0
        for _ in range(25):
            uid = random.choice(user_ids)
            sid = random.choice(scheme_ids)

            # Check if this user-scheme combo already exists
            existing_draft = await db.execute(
                select(UserSchemeInteraction).where(
                    UserSchemeInteraction.clerk_user_id == uid,
                    UserSchemeInteraction.scheme_id == sid,
                )
            )
            if existing_draft.scalar_one_or_none():
                continue

            db.add(UserSchemeInteraction(
                clerk_user_id=uid,
                scheme_id=sid,
                application_status="draft_generated",
                draft_letter="[Demo draft generated by MAYA]",
                bookmarked=random.choice([True, False]),
                updated_at=datetime.utcnow() - timedelta(days=random.randint(0, 25)),
            ))
            draft_count += 1

        await db.flush()
        print(f"   ✅ {draft_count} scheme draft interactions created")

        # ── Create some OutcomeTracking rows ──────────────────────────────────
        outcome_count = 0
        for i in range(10):
            uid = random.choice(user_ids)
            sid = random.choice(scheme_ids)

            existing_ot = await db.execute(
                select(OutcomeTracking).where(
                    OutcomeTracking.clerk_user_id == uid,
                    OutcomeTracking.scheme_id == sid,
                )
            )
            if existing_ot.scalar_one_or_none():
                continue

            submitted = random.random() < 0.4
            approved = submitted and random.random() < 0.5

            db.add(OutcomeTracking(
                clerk_user_id=uid,
                scheme_id=sid,
                draft_generated=True,
                draft_date=datetime.utcnow() - timedelta(days=random.randint(5, 30)),
                submitted=submitted,
                submit_date=datetime.utcnow() - timedelta(days=random.randint(1, 15)) if submitted else None,
                approved=approved if submitted else None,
                amount_approved=random.choice([500000, 1000000, 2500000]) if approved else None,
            ))
            outcome_count += 1

        await db.commit()
        print(f"   ✅ {outcome_count} outcome tracking rows created")

        print("\n✅ Demo seeding complete!")
        print(f"   👥 50 demo users")
        print(f"   💬 {total_messages} messages ({len(conv_ids)} conversations)")
        print(f"   📊 8 business reports")
        print(f"   📝 {draft_count} application drafts")
        print(f"   🎯 {outcome_count} outcome tracking rows")
        print("\n   Dashboard should now show meaningful numbers. 🚀")


# ── Name generator ────────────────────────────────────────────────────────────

def _random_name(seed: int) -> str:
    first_names = [
        "Ramesh", "Sunita", "Priya", "Ajay", "Kavita", "Mohan", "Geeta",
        "Suresh", "Anita", "Vijay", "Rekha", "Ashok", "Meena", "Rakesh",
        "Sita", "Dinesh", "Radha", "Mahesh", "Lata", "Vinod", "Shanti",
        "Rajesh", "Usha", "Anil", "Pushpa", "Deepak", "Saroj", "Santosh",
        "Kamla", "Mukesh", "Seema", "Naresh", "Pooja", "Bharat", "Neha",
        "Ravi", "Sudha", "Amit", "Asha", "Sanjay", "Nirmala", "Pramod",
        "Savita", "Hemant", "Sarita", "Vikas", "Manju", "Girish", "Kiran",
        "Naveen",
    ]
    return first_names[seed % len(first_names)] + f" (Demo)"


if __name__ == "__main__":
    asyncio.run(seed_demo_data())
