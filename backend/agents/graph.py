import json
import re
from typing import Annotated, Sequence, TypedDict, List, Dict, Any
from langchain_core.messages import BaseMessage, AIMessage, HumanMessage
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages

# Internal Imports
from agents.state import AgentState
from agents.router import route_request
from services.scheme_service import scheme_service
from services.mimo_service import mimo_service
from services.tavily_service import tavily_service
from database import AsyncSessionLocal

# --- Node Implementations ---

async def router_node(state: AgentState):
    """Determines which agent should handle the query."""
    return await route_request(state)

async def scheme_agent_node(state: AgentState):
    """
    MAYA Final Node: Syncs with corrected SchemeService dictionaries.
    Logic: Processes clean data for AI ranking and Frontend display.
    """
    messages = state["messages"]
    last_message = messages[-1].content
    
    # 1. Number extraction (e.g., "top 3")
    match = re.search(r'\b\d+\b', last_message)
    requested_count = int(match.group()) if match else None
    
    async with AsyncSessionLocal() as db:
        # IMPORTANT: Service ab List[dict] return kar raha hai
        schemes = await scheme_service.search_schemes(db, last_message, limit=3)
    
    if schemes:
        schemes_data = []
        for s in schemes:
            # Helper for JSON parsing (just in case they come as strings)
            def safe_parse(val):
                if val is None: return None
                if isinstance(val, (dict, list)): return val
                try: return json.loads(val)
                except: return val

            # --- STEP 2: DATA MAPPING (Synced with Service Keys) ---
            sd = {
                "id": str(s.get('id')).strip(),
                "name": s.get('name'),
                "category": s.get('category') or "Business",
                "description": s.get('description'),
                "benefits": safe_parse(s.get('benefits')) or [],
                # Keys are now identical to models.py
                "eligibility_criteria": safe_parse(s.get('eligibility_criteria')), 
                "required_documents": safe_parse(s.get('required_documents')) or [],
                "application_mode": str(s.get('application_mode') or "Online/Offline"),
                "link": s.get('link'),
                "tags": safe_parse(s.get('tags')) or []
            }
            schemes_data.append(sd)

        # --- STEP 3: AI ANALYSIS (REASONING) ---
        analysis_input = [{"id": x["id"], "name": x["name"], "desc": x["description"]} for x in schemes_data]
        prompt = f"""
        Analyze these government schemes for the query: "{last_message}"
        Data: {json.dumps(analysis_input)}
        
        Return ONLY a JSON object:
        {{
            "chat_summary": "Friendly 1-2 sentence overview",
            "schemes_metadata": [
                {{"id": "...", "relevance_score": 0-100, "explanation": "Why this fits?"}}
            ]
        }}
        """
        
        ai_response = await mimo_service.generate_text(prompt)
        
        try:
            # AI JSON Parse karna
            cleaned_json = ai_response.replace('```json', '').replace('```', '').strip()
            parsed = json.loads(cleaned_json)
            chat_text = parsed.get("chat_summary", "I found these relevant schemes for you:")
            
            # Metadata mapping
            metadata_map = {str(item.get('id')).strip(): item for item in parsed.get("schemes_metadata", [])}
            
            # --- STEP 4: FINAL MERGE & SORT ---
            final_schemes = []
            for sd in schemes_data:
                sid = sd['id']
                if sid in metadata_map:
                    sd.update({
                        "relevance_score": metadata_map[sid].get("relevance_score", 75),
                        "explanation": metadata_map[sid].get("explanation", "")
                    })
                else:
                    sd.update({"relevance_score": 50, "explanation": "Matching record found in database."})
                final_schemes.append(sd)

            # Highest score first
            final_schemes.sort(key=lambda x: x.get('relevance_score', 0), reverse=True)
            display_schemes = final_schemes[:requested_count] if requested_count else final_schemes

            return {
                "messages": [AIMessage(content=chat_text)],
                "schemes": display_schemes,
                "current_agent": "scheme"
            }

        except Exception as e:
            print(f"❌ Analysis Error: {e}")
            fallback = schemes_data[:requested_count] if requested_count else schemes_data
            return {
                "messages": [AIMessage(content="I found these schemes in our database:")], 
                "schemes": fallback,
                "current_agent": "scheme"
            }

    return {
        "messages": [AIMessage(content="I'm sorry, I couldn't find any specific schemes matching your query.")], 
        "schemes": [],
        "current_agent": "scheme"
    }

    # If no results in DB
    return {
        "messages": [AIMessage(content="I'm sorry, I couldn't find any specific schemes for that in my database.")], 
        "schemes": [],
        "current_agent": "scheme"
    }

async def general_agent_node(state: AgentState):
    messages = state["messages"]
    last_message = messages[-1].content
    
    # Custom greeting logic for exact or very close matches
    clean_message = last_message.strip().lower().rstrip('?!.')
    greetings = ["hey", "hi", "hello", "hi there", "hey there", "good morning", "good afternoon", "good evening"]
    
    if clean_message in greetings:
        response = "Hey there! What's up? I'm MAYA, India's Business AI assistant. What can I help you with today?"
    else:
        # If it's a general query but not just a greeting, use a prompt that forbids repeating the intro
        prompt = f"""
        The user has a general query: "{last_message}"
        
        Task:
        Provide a helpful and direct answer. 
        CRITICAL: Do NOT include any greetings like "Hello", "Hi", or "I am MAYA". 
        Just answer the question directly.
        """
        response = await mimo_service.generate_text(prompt)
        
    return {"messages": [AIMessage(content=response)]}


# Placeholder nodes for other agents (to be implemented)
async def market_agent_node(state: AgentState):
    messages = state["messages"]
    last_message = messages[-1].content
    
    # Perform web search
    search_results = tavily_service.search(last_message)
    
    prompt = f"""
    You are an expert Market Research Analyst for MSMEs in India.
    User Query: {last_message}
    
    Here is some real-time market data I found:
    {search_results}
    
    Task:
    Provide insights on market trends, competitor analysis, or industry outlook relevant to the user's query, using the provided market data.
    Focus on actionable data for small businesses.
    If the query is too vague, ask clarifying questions about their specific industry or location.
    
    CRITICAL: Do NOT start with a greeting or self-introduction. Jump straight into the market insights.
    """
    response = await mimo_service.generate_text(prompt)
    return {"messages": [AIMessage(content=response)]}

async def brand_agent_node(state: AgentState):
    messages = state["messages"]
    last_message = messages[-1].content
    
    prompt = f"""
    You are a creative Brand Consultant for MSMEs.
    User Query: {last_message}
    
    Task:
    Help the user with branding, business names, taglines, or brand identity.
    Be creative, modern, and culturally relevant to the Indian market if applicable.
    Provide 3-5 distinct options where appropriate.
    
    CRITICAL: Do NOT start with a greeting or self-introduction. Jump straight into the branding suggestions.
    """
    response = await mimo_service.generate_text(prompt)
    return {"messages": [AIMessage(content=response)]}

async def finance_agent_node(state: AgentState):
    messages = state["messages"]
    last_message = messages[-1].content
    
    prompt = f"""
    You are a Financial Advisor for MSMEs.
    User Query: {last_message}
    
    Task:
    Provide advice on financial planning, loan eligibility (general), pricing strategies, or cost management.
    Do NOT give specific legal or tax advice; provide general guidance.
    If they ask about specific government schemes, briefly mention them but suggest asking the 'Scheme Navigator' for details.
    
    CRITICAL: Do NOT start with a greeting or self-introduction. Jump straight into the financial advice.
    """
    response = await mimo_service.generate_text(prompt)
    return {"messages": [AIMessage(content=response)]}

async def marketing_agent_node(state: AgentState):
    messages = state["messages"]
    last_message = messages[-1].content
    
    prompt = f"""
    You are a Marketing Strategist for small businesses.
    User Query: {last_message}
    
    Task:
    Suggest low-cost, high-impact marketing strategies (Digital Marketing, Social Media, Local SEO, etc.).
    Tailor the advice to the specific business type mentioned in the query.
    Focus on practical steps they can take immediately.
    
    CRITICAL: Do NOT start with a greeting or self-introduction. Jump straight into the marketing strategies.
    """
    response = await mimo_service.generate_text(prompt)
    return {"messages": [AIMessage(content=response)]}

# --- Graph Construction ---

def create_graph():
    workflow = StateGraph(AgentState)

    # Nodes registration
    workflow.add_node("router", router_node)
    workflow.add_node("scheme", scheme_agent_node)
    workflow.add_node("market", market_agent_node)
    workflow.add_node("brand", brand_agent_node)
    workflow.add_node("finance", finance_agent_node)
    workflow.add_node("marketing", marketing_agent_node)
    workflow.add_node("general", general_agent_node)

     # Set entry point
    workflow.set_entry_point("router")

    # Add conditional edges based on router output
    workflow.add_conditional_edges(
        "router",
        lambda x: x["current_agent"],
        {
            "scheme": "scheme",
            "market": "market",
            "brand": "brand",
            "finance": "finance",
            "marketing": "marketing",
            "general": "general"
        }
    )

    # All agents go to END for now (single turn)
    workflow.add_edge("scheme", END)
    workflow.add_edge("market", END)
    workflow.add_edge("brand", END)
    workflow.add_edge("finance", END)
    workflow.add_edge("marketing", END)
    workflow.add_edge("general", END)

    return workflow.compile()

app_graph = create_graph()