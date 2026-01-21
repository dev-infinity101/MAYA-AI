from typing import List, Optional, TypedDict, Annotated, Sequence, Dict, Any
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages

class AgentState(TypedDict):
    """
    MAYA 1.0 - Global State Management
    Sare nodes isi state se data read aur write karte hain.
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