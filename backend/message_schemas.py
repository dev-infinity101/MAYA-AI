"""
message_schemas.py
──────────────────
Pydantic models that define exactly what goes inside the JSONB `content`
field for each `content_type`. Using Pydantic here ensures we never save
malformed data to the database.

Usage:
    from message_schemas import TextPayload, SchemeResultsPayload, AgentResponsePayload
    payload = SchemeResultsPayload(query=..., summary=..., schemes=[...])
    # Pass payload.model_dump() as the `content` arg to save_message()
"""

from pydantic import BaseModel
from typing import Optional


class TextPayload(BaseModel):
    """Simple plain-text message (user or assistant)."""
    text: str


class SchemeResult(BaseModel):
    """A single scheme card — full payload so frontend can rebuild card on reload."""
    scheme_id: int
    name: str
    category: str
    match_score: int          # 0-100
    explanation: str
    qualify_status: str       # eligible | partial | check_manually
    match_reasons: list[str]
    missing_docs: list[str]
    application_mode: str
    link: str


class SchemeResultsPayload(BaseModel):
    """
    Saved when scheme_agent_node fires.
    content_type = "scheme_results"
    """
    query: str
    summary: str              # conversational text from LLM
    schemes: list[dict]       # raw scheme dicts (flexible, matches existing graph output)


class AgentSection(BaseModel):
    """A titled section within an agent response (for future structured display)."""
    title: str
    body: str


class AgentResponsePayload(BaseModel):
    """
    Saved by all text agents (market, brand, finance, marketing, general, off_topic).
    content_type = "agent_response"
    """
    agent: str                # market | financial | brand | marketing | general | off_topic
    summary: str              # full markdown / plain text response
    sections: list[AgentSection] = []
    sources: Optional[list[str]] = []
