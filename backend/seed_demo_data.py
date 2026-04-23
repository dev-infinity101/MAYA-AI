"""
Run BEFORE the demo to populate dashboard with realistic numbers.
Does NOT fake real data — creates plausible test records.
"""

import asyncio
from datetime import datetime, timedelta
import random

from sqlalchemy import select
from database import AsyncSessionLocal
from models import User, UserProfile, Conversation, Message, UserSchemeInteraction, Scheme

async def seed_demo_data():
    """Create realistic-looking analytics data."""
    async with AsyncSessionLocal() as db:
        print("Starting demo data seeding...")
        
        # Check existing schemes to use their IDs
        result = await db.execute(select(Scheme.id))
        scheme_ids = [row[0] for row in result.all()]
        
        if not scheme_ids:
            print("❌ No schemes found in database. Please run regular seed script first.")
            return

        # Track conversation IDs for assigning reports later
        conv_ids = []

        # Create 45 demo users (realistic for a pilot)
        for i in range(45):
            clerk_id = f"demo_user_{i}"
            
            # Check if user already exists
            existing_user = await db.execute(select(User).where(User.clerk_user_id == clerk_id))
            if existing_user.scalar_one_or_none():
                continue

            user = User(
                clerk_user_id=clerk_id,
                email=f"demo{i}@test.com",
                name=f"Demo MSME {i}",
            )
            db.add(user)
            
            # Create profile
            profile = UserProfile(
                clerk_user_id=clerk_id,
                category=random.choice(["General", "SC", "ST", "OBC", "Women"]),
                state="Uttar Pradesh",
                city=random.choice(["Lucknow", "Varanasi", "Kanpur", "Agra", "Gorakhpur"]),
                business_type=random.choice(["Food Processing", "Handicrafts", "Tailoring", "Retail", "Manufacturing"]),
                sector=random.choice(["manufacturing", "services", "trading"]),
                turnover_range=random.choice(["Under ₹10 Lakh", "₹10L - ₹50L", "₹50L - ₹5Cr"]),
                onboarding_complete=True,
            )
            db.add(profile)
        
        await db.flush()

        # Create conversations and messages (spread over 30 days)
        agents = ["scheme", "market", "brand", "finance", "marketing", "general"]
        
        for day_offset in range(30):
            date = datetime.utcnow() - timedelta(days=day_offset)
            # More activity on recent days
            num_messages = random.randint(5, 25) if day_offset < 7 else random.randint(1, 10)
            
            for _ in range(num_messages):
                user_id = f"demo_user_{random.randint(0, 44)}"
                conv = Conversation(clerk_user_id=user_id, title="Demo conversation", created_at=date, updated_at=date)
                db.add(conv)
                await db.flush()
                conv_ids.append(conv.id)
                
                msg = Message(
                    conversation_id=conv.id,
                    role="assistant",
                    content_type="text",
                    content={"text": "Demo response"},
                    agent_used=random.choice(agents),
                    created_at=date,
                )
                db.add(msg)
        
        # Create scheme interactions (drafts)
        for _ in range(23):
            interaction = UserSchemeInteraction(
                clerk_user_id=f"demo_user_{random.randint(0, 44)}",
                scheme_id=random.choice(scheme_ids),
                application_status="draft_generated",
            )
            db.add(interaction)
        
        # Create a few business reports
        if conv_ids:
            for _ in range(8):
                msg = Message(
                    conversation_id=random.choice(conv_ids),
                    role="assistant",
                    content_type="business_report",
                    content={"report": "Demo report", "business_context": {}},
                    agent_used="report_pipeline",
                )
                db.add(msg)
        
        await db.commit()
        print("✅ Demo data seeded: 45 users, ~400 messages, 23 drafts, 8 reports")

if __name__ == "__main__":
    asyncio.run(seed_demo_data())
