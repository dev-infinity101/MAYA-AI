from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field

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
    session_id: Optional[str] = None
    user_profile: Optional[UserProfile] = None

class ChatResponse(BaseModel):
    response: str
    session_id: str
    agent: Optional[str] = "MAYA"
    schemes: List[SchemeResponse] = Field(default_factory=list)
