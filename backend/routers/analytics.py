import logging
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text

from database import get_db
from models import User, Conversation, Message, UserSchemeInteraction

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/dashboard")
async def get_dashboard_metrics(db: AsyncSession = Depends(get_db)):
    """
    Public analytics endpoint — no auth required.
    Aggregates platform-wide metrics for the impact dashboard.
    """
    try:
        total_users = await db.scalar(select(func.count()).select_from(User)) or 0
        total_conversations = await db.scalar(select(func.count()).select_from(Conversation)) or 0
        total_messages = await db.scalar(select(func.count()).select_from(Message)) or 0

        scheme_searches = await db.scalar(
            select(func.count()).select_from(Message).where(Message.agent_used == "scheme")
        ) or 0

        drafts_generated = await db.scalar(
            select(func.count()).select_from(UserSchemeInteraction).where(
                UserSchemeInteraction.application_status == "draft_generated"
            )
        ) or 0

        reports_generated = await db.scalar(
            select(func.count()).select_from(Message).where(
                Message.content_type == "business_report"
            )
        ) or 0

        # Agent usage breakdown
        agent_rows = await db.execute(
            select(Message.agent_used, func.count().label("count"))
            .where(Message.agent_used.isnot(None))
            .group_by(Message.agent_used)
        )
        agent_breakdown = {row.agent_used: row.count for row in agent_rows}

        # Daily activity — last 30 days (assistant messages only to avoid double-counting)
        daily_rows = await db.execute(text("""
            SELECT DATE(created_at) as date, COUNT(*) as count
            FROM messages
            WHERE created_at > NOW() - INTERVAL '30 days'
              AND role = 'assistant'
            GROUP BY DATE(created_at)
            ORDER BY date
        """))
        activity_data = [{"date": str(row.date), "count": row.count} for row in daily_rows]

        # Top schemes by interaction count
        try:
            top_rows = await db.execute(text("""
                SELECT s.name, COUNT(usi.id) as interactions
                FROM user_scheme_interactions usi
                JOIN schemes s ON s.id = usi.scheme_id
                GROUP BY s.name
                ORDER BY interactions DESC
                LIMIT 5
            """))
            top_schemes = [{"name": row.name, "interactions": row.interactions} for row in top_rows]
        except Exception:
            top_schemes = []

        estimated_value = drafts_generated * 200000  # ₹2L avg per draft

        return {
            "overview": {
                "total_users": total_users,
                "total_conversations": total_conversations,
                "total_messages": total_messages,
                "scheme_searches": scheme_searches,
                "drafts_generated": drafts_generated,
                "reports_generated": reports_generated,
                "estimated_value_unlocked": estimated_value,
            },
            "agent_breakdown": agent_breakdown,
            "daily_activity": activity_data,
            "top_schemes": top_schemes,
        }

    except Exception as e:
        logger.error(f"Dashboard metrics error: {e}", exc_info=True)
        return {
            "overview": {
                "total_users": 0, "total_conversations": 0, "total_messages": 0,
                "scheme_searches": 0, "drafts_generated": 0, "reports_generated": 0,
                "estimated_value_unlocked": 0,
            },
            "agent_breakdown": {},
            "daily_activity": [],
            "top_schemes": [],
        }
