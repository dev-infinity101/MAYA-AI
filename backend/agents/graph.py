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
        schemes = await scheme_service.search_schemes(db, last_message, limit=10)
    
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

async def market_agent_node(state: AgentState):
    """Agent for real-time market research using Tavily."""
    last_message = state["messages"][-1].content
    search_results = tavily_service.search(last_message)
    prompt = f"Analyze market data for: {last_message}\nData: {search_results}"
    response = await mimo_service.generate_text(prompt)
    return {"messages": [AIMessage(content=response)]}

async def general_agent_node(state: AgentState):
    """Handles greetings and business FAQs."""
    last_message = state["messages"][-1].content
    clean_message = last_message.strip().lower().rstrip('?!.')
    greetings = ["hey", "hi", "hello", "hey there", "good morning", "good afternoon"]
    
    if any(greet in clean_message for greet in greetings):
        response = "Hey! I'm MAYA, your business AI partner. How can I help you grow today?"
    else:
        response = await mimo_service.generate_text(f"Helpful response for: {last_message}")
    
    return {"messages": [AIMessage(content=response)]}

# Placeholder nodes for Brand, Finance, and Marketing
async def brand_agent_node(state: AgentState):
    response = await mimo_service.generate_text(f"Brand advice for: {state['messages'][-1].content}")
    return {"messages": [AIMessage(content=response)]}

async def finance_agent_node(state: AgentState):
    response = await mimo_service.generate_text(f"Finance advice for: {state['messages'][-1].content}")
    return {"messages": [AIMessage(content=response)]}

async def marketing_agent_node(state: AgentState):
    response = await mimo_service.generate_text(f"Marketing strategy for: {state['messages'][-1].content}")
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

    workflow.set_entry_point("router")

    # Routing logic based on router_node's decision
    workflow.add_conditional_edges(
        "router",
        lambda x: x["current_agent"],
        {
            "scheme": "scheme", "market": "market", "brand": "brand",
            "finance": "finance", "marketing": "marketing", "general": "general"
        }
    )

    # All paths lead to END
    for node in ["scheme", "market", "brand", "finance", "marketing", "general"]:
        workflow.add_edge(node, END)

    return workflow.compile()

app_graph = create_graph()