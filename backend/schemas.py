from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field, field_validator


class SchemeBase(BaseModel):
    name: str
    category: str
    description: str
    benefits: List[str] = Field(default_factory=list)
    eligibility_criteria: Optional[Dict[str, Any]] = None
    required_documents: List[str] = Field(default_factory=list)
    application_mode: Optional[str] = "Online/Offline"
    link: Optional[str] = None
    tags: List[str] = Field(default_factory=list)


class SchemeResponse(SchemeBase):
    id: Union[str, int]
    relevance_score: Optional[float] = None
    explanation: Optional[str] = None
    key_benefit: Optional[str] = None

    class Config:
        from_attributes = True


class UserProfile(BaseModel):
    location: Optional[str] = None
    age: Optional[int] = None
    category: Optional[str] = None
    income: Optional[str] = None
    gender: Optional[str] = None
    occupation: Optional[str] = None


class ChatRequest(BaseModel):
    message: str
    # V2: conversation_id replaces session_id for proper DB threading
    conversation_id: Optional[str] = None
    clerk_user_id: Optional[str] = None    # Clerk auth user id
    # Legacy: still accept session_id from old frontend calls
    session_id: Optional[str] = None
    user_profile: Optional[UserProfile] = None
    # For streaming endpoint: which agent to use
    agent: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    session_id: str                         # kept for backwards compat
    conversation_id: Optional[str] = None   # V2: new field
    agent: Optional[str] = "MAYA"
    schemes: List[SchemeResponse] = Field(default_factory=list)

    @field_validator('response', mode='before')
    @classmethod
    def validate_response(cls, v: Any) -> str:
        """
        Strictly validate and normalize the 'response' field.
        1. If it's a string, return as is.
        2. If it's a list (from LangChain/Gemini), convert to string.
        3. Reject other types or empty values if needed.
        """
        if isinstance(v, str):
            return v
        if isinstance(v, list):
            text_parts = []
            for item in v:
                if isinstance(item, str):
                    text_parts.append(item)
                elif isinstance(item, dict) and 'text' in item:
                    text_parts.append(str(item['text']))
                elif isinstance(item, dict) and 'type' in item and item['type'] == 'text':
                    text_parts.append(str(item.get('text', '')))
                else:
                    text_parts.append(str(item))
            return "\n".join(text_parts)

        return str(v)
