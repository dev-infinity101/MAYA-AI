from sqlalchemy import Column, Integer, String, Text, JSON
from pgvector.sqlalchemy import Vector
from database import Base

class Scheme(Base):
    __tablename__ = "schemes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text)
    benefits = Column(Text)
    eligibility_criteria = Column(JSON)
    category = Column(String, index=True)
    link = Column(String)
    
    # Gemini 768-dimension vector
    embedding = Column(Vector(768))