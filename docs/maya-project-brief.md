MAYA MSME MITRA - MVP Project Brief
What We're Building
A web-based AI chatbot that helps small businesses discover government schemes and get business advice through specialized AI agents.
Core Features (MVP):
Government Scheme Navigator


Chat with AI to find relevant schemes
Get matched with top 3-5 schemes based on your business
Simple eligibility checking
Links to apply
Business Consultant Agents (4 specialized helpers)


Market Agent: Research competitors, market size
Brand Agent: Suggest business names, taglines
Marketing Agent: Low-budget marketing ideas
Financial Agent: Help with pricing, basic calculations
Simple Chat Interface


Clean, WhatsApp-like UI
Conversation history
Quick action buttons

Tech Stack (Deployment-Safe)
Frontend
- React 18 (stable)
- TypeScript
- Vite (fast, reliable build)
- Tailwind CSS (no runtime dependencies)
- Axios (for API calls)

Why these?
All are production-proven
No experimental features
Vercel/Netlify support out of the box
No complex build configurations
Backend
- Python 3.11
- FastAPI (most popular Python web framework)
- Pydantic (built-in validation)
- Python-dotenv (environment variables)

Why these?
FastAPI is deployment-friendly (Render, Railway, AWS)
No complex C++ dependencies
Works with standard WSGI/ASGI servers
AI/ML Stack
- OpenAI Python SDK (official, stable)
- LangChain Core (minimal, stable core only)
- LangGraph (for agent orchestration)

⚠️ AVOIDING PROBLEMATIC PACKAGES:
❌ NO llama-cpp-python (C++ compilation issues)
❌ NO faiss-cpu (binary dependencies)
❌ NO transformers (too heavy, CUDA issues)
❌ NO torch/tensorflow (massive size, deployment hell)
✅ YES to pure Python packages only
Database
- PostgreSQL (standard, all platforms support it)
- psycopg2-binary (pre-compiled, no build needed)

For Vector Search:
Option 1: Pinecone (managed, zero deployment issues)
Option 2: pgvector extension (if using managed PostgreSQL)
Option 3: Simple cosine similarity in Python (fallback)

Deployment Stack
Frontend: Vercel (free, automatic)
Backend: Render.com (free tier, Python-friendly)
Database: Neon.tech (free PostgreSQL with pgvector)


How We're Building It
Phase 1: Basic Setup (Week 1)
1. Create React app with Vite
2. Setup FastAPI with basic "Hello World"
3. Create PostgreSQL database on Neon
4. Connect frontend to backend (test with ping endpoint)

Deliverable: Frontend and backend talking to each other
Phase 2: Chat Interface (Week 2)
1. Build chat UI component
2. Create API endpoint: POST /api/chat
3. Integrate OpenAI API (simple completion)
4. Test basic conversation flow

Deliverable: Working chat that responds using GPT-4
Phase 3: Scheme Navigator (Weeks 3-4)
1. Create schemes table in PostgreSQL
2. Add 30 schemes manually (structured data)
3. Build search logic:
   - Extract: industry, location, turnover from user message
   - Filter: schemes matching criteria
   - Rank: by relevance
4. Format response nicely

Database Structure:
CREATE TABLE schemes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200),
    category VARCHAR(50),
    description TEXT,
    industry VARCHAR(100),
    min_turnover DECIMAL,
    max_turnover DECIMAL,
    location VARCHAR(50),
    benefits TEXT,
    eligibility_json JSONB,
    link VARCHAR(500)
);

API Endpoint:
@app.post("/api/schemes/search")
async def search_schemes(query: str, user_profile: dict):
    # 1. Extract business info from query using GPT
    # 2. Filter schemes from database
    # 3. Format top 3 matches
    return {"schemes": [...]}

Phase 4: Multi-Agent System (Weeks 5-7)
1. Setup LangGraph
2. Create 4 agent system prompts
3. Build intent router (which agent to use?)
4. Integrate web search for Market Agent
5. Test each agent separately

Agent Architecture:
from langgraph.graph import StateGraph

# Define state
class AgentState(TypedDict):
    messages: List[dict]
    current_agent: str
    
# Create graph
workflow = StateGraph(AgentState)

# Add nodes
workflow.add_node("router", route_to_agent)
workflow.add_node("market_agent", market_research)
workflow.add_node("brand_agent", brand_strategy)
workflow.add_node("marketing_agent", marketing_plan)
workflow.add_node("financial_agent", financial_advice)

# Add edges
workflow.add_edge("router", "market_agent")
workflow.add_edge("router", "brand_agent")
# ... etc

Intent Router (Simple):
def route_to_agent(query: str) -> str:
    prompt = f"""
    Classify this query into ONE category:
    - scheme: asking about government schemes
    - market: market research, competitors
    - brand: naming, branding
    - marketing: promotion, advertising
    - financial: pricing, money matters
    
    Query: {query}
    Category:
    """
    
    response = openai.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=10
    )
    
    return response.choices[0].message.content.strip()

Phase 5: Polish & Deploy (Weeks 8)
1. Add user authentication (simple email/password)
2. Store conversation history
3. Add loading states, error handling
4. Deploy frontend to Vercel
5. Deploy backend to Render
6. Connect production database


Deployment Configuration Files
frontend/.env
VITE_API_URL=https://your-backend.onrender.com

backend/.env
OPENAI_API_KEY=sk-...
DATABASE_URL=postgresql://user:pass@neon.tech/maya
CORS_ORIGINS=https://your-frontend.vercel.app

backend/requirements.txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-dotenv==1.0.0
openai==1.3.0
langchain-core==0.1.0
langgraph==0.0.20
psycopg2-binary==2.9.9
sqlalchemy==2.0.23
pydantic==2.5.0
python-multipart==0.0.6
httpx==0.25.1

Note: All versions are stable, no experimental packages
Deploy Commands
Backend (Render.com):
Build Command: pip install -r requirements.txt
Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT

Frontend (Vercel):
# Vercel auto-detects Vite projects
# Just connect GitHub repo and deploy


Avoiding Common Deployment Issues
✅ DO:
Use official, stable package versions
Use managed services (Pinecone, Neon, OpenAI)
Use environment variables for all secrets
Test locally with production-like setup
Use psycopg2-binary (not psycopg2)
Keep dependencies minimal
❌ DON'T:
Use packages requiring C++ compilation
Use local vector databases (Chroma, FAISS)
Use heavy ML models (BERT, LLaMA)
Hardcode API keys
Use SQLite in production
Install unnecessary packages

Alternative: Even Simpler Vector Search (No pgvector)
If pgvector causes issues, use pure Python:
from openai import OpenAI
import numpy as np

client = OpenAI()

# Generate embeddings
def get_embedding(text: str):
    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=text
    )
    return response.data[0].embedding

# Cosine similarity
def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

# Search schemes
def search_schemes(query: str, schemes: list):
    query_embedding = get_embedding(query)
    
    results = []
    for scheme in schemes:
        scheme_embedding = get_embedding(scheme['description'])
        score = cosine_similarity(query_embedding, scheme_embedding)
        results.append((scheme, score))
    
    # Return top 3
    return sorted(results, key=lambda x: x[1], reverse=True)[:3]

Store embeddings in database to avoid regenerating:
ALTER TABLE schemes ADD COLUMN embedding FLOAT[];


MVP Success Criteria
Technical:
✅ Chat works without crashes
✅ Schemes returned in <5 seconds
✅ Agents give sensible responses
✅ Deployed and accessible via URL
✅ No "500 Internal Server Error"
Functional:
✅ User can find at least 1 relevant scheme
✅ Each agent provides useful advice
✅ Conversation history saved
✅ Works on mobile browsers
Performance:
✅ 95% uptime
✅ <$50/month in API costs (careful usage)
✅ Handles 10 concurrent users

Cost Breakdown (Monthly)
OpenAI API: $30-40 (with caching)
Render.com: $0 (free tier, then $7)
Neon.tech: $0 (free tier)
Vercel: $0 (free tier)
Domain: $1/month (.in domain)

Total: ~$31-48/month


File Structure
maya-mvp/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Chat.tsx
│   │   │   ├── Message.tsx
│   │   │   ├── SchemeCard.tsx
│   │   ├── App.tsx
│   │   ├── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   ├── .env
│
├── backend/
│   ├── main.py              # FastAPI app
│   ├── agents/
│   │   ├── router.py
│   │   ├── market_agent.py
│   │   ├── brand_agent.py
│   │   ├── marketing_agent.py
│   │   ├── financial_agent.py
│   ├── database.py          # DB connection
│   ├── models.py            # Pydantic models
│   ├── schemes.py           # Scheme search logic
│   ├── requirements.txt
│   ├── .env
│
├── README.md
└── docs/
    └── API.md


Quick Start Commands
Setup Backend:
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload

Setup Frontend:
cd frontend
npm install
npm run dev

Run Both:
# Terminal 1
cd backend && uvicorn main:app --reload

# Terminal 2
cd frontend && npm run dev


Testing Strategy
Manual Testing:
Chat basic queries → Should respond
Ask for schemes → Should return 3 schemes
Ask for business name → Should give suggestions
Refresh page → History should persist
API Testing (Postman):
POST http://localhost:8000/api/chat
Body: {
  "message": "I need a loan for my food business",
  "user_id": "test123"
}


Emergency Fallbacks
If OpenAI API fails:
Show cached responses for common queries
Display error: "AI temporarily unavailable"
If database fails:
Use in-memory cache for schemes
Disable history temporarily
If deployment fails:
Deploy to Railway.app (alternative)
Use Supabase (alternative DB)
Use Claude API instead of OpenAI

Summary
We're building a simple, production-ready AI chatbot that:
Helps MSMEs find government schemes
Provides business advice via 4 specialized agents
Uses only stable, deployment-friendly technologies
Can be deployed for <$50/month
Takes 8 weeks to build
No complex dependencies, no deployment nightmares, just working software.

