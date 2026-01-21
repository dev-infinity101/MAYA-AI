from pydantic import BaseModel, HttpUrl
from typing import List, Dict, Any, Optional

class EligibilityCriteria(BaseModel):
    type: str
    sector: str
    authority: str
    min_age: Optional[int] = 18
    social_category: List[str]
    geography: str
    ownership_stake: str

class SchemeCreate(BaseModel):
    name: str
    description: str
    benefits: List[str]
    eligibility_criteria: EligibilityCriteria
    required_documents: List[str]
    application_mode: str
    category: str
    link: HttpUrl
    tags: List[str]

class SchemeResponse(SchemeCreate):
    id: int
    class Config:
        from_attributes = True