from typing import List, Optional, TypedDict, Annotated, Sequence, Dict, Any
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages

class AgentState(TypedDict):
    """
    MAYA 1.0 - Global State Management
    Sare nodes isi state se data read aur write karte hain.
    """
    
    # Annotated + add_messages ensures that messages are appended to the list
    messages: Annotated[Sequence[BaseMessage], add_messages]
    
    # Current active agent (scheme, market, finance, etc.)
    current_agent: Optional[str]
    
    # User's details (Location, Industry, Category) ranking ke liye
    user_profile: Optional[Dict[str, Any]]
    
    # --- CRITICAL FIX: DATA PERSISTENCE ---
    # here we store the schemes fetched from the database.
    # wuthout this, the graph would not be able to access the schemes.
    schemes: List[Dict[str, Any]] 
    
    # for flow control
    next_step: Optional[str]