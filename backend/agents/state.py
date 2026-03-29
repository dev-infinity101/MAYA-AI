from typing import List, Optional, TypedDict, Annotated, Sequence, Dict, Any
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages


class AgentState(TypedDict):
    """
    MAYA V2 Flash — Global State Management
    Sare nodes isi state se data read aur write karte hain.

    V2 additions (schema redesign):
      - conversation_id  → UUID string passed in from API endpoint
      - clerk_user_id    → identifies the user (Clerk auth)
    Both fields flow through the graph automatically once passed via ainvoke().
    """

    # Annotated + add_messages ensures ki chat history append hoti rahe, delete na ho
    messages: Annotated[Sequence[BaseMessage], add_messages]

    # Kaunsa agent abhi active hai (scheme, market, finance, etc.)
    current_agent: Optional[str]

    # User ki details (Location, Industry, Category) ranking ke liye
    user_profile: Optional[Dict[str, Any]]

    # --- CRITICAL FIX: DATA PERSISTENCE ---
    # Isme database se fetch ki gayi schemes aur AI ka analysis (score/explanation) store hoga.
    # Iske bina data graph se bahar main.py tak nahi pahunch payega.
    schemes: List[Dict[str, Any]]

    # Graph flow control ke liye
    next_step: Optional[str]

    # --- V2: DB PERSISTENCE ---
    # UUID string — passed in from API endpoint so nodes can save messages directly
    conversation_id: Optional[str]
    # Clerk user ID — identifies the user across graph nodes
    clerk_user_id: Optional[str]