from langgraph.graph import StateGraph, END
from agents.state import AgentState
from agents.router import route_request
from services.scheme_service import scheme_service
from services.mimo_service import mimo_service
from services.tavily_service import tavily_service
from database import AsyncSessionLocal
from langchain_core.messages import AIMessage

# --- Node Implementations ---

async def router_node(state: AgentState):
    return await route_request(state)

async def scheme_agent_node(state: AgentState):
    messages = state["messages"]
    last_message = messages[-1].content
    
    # 1. Search schemes
    async with AsyncSessionLocal() as db:
        schemes = await scheme_service.search_schemes(db, last_message)
    
    # 2. Format response using LLM
    if schemes:
        schemes_text = "\n\n".join([f"Name: {s.name}\nCategory: {s.category}\nBenefits: {s.benefits}\nDescription: {s.description}" for s in schemes])
        prompt = f"""
        You are the 'Scheme Navigator' for the MAYA AI Assistant.
        
        User Query: {last_message}
        
        I have found the following relevant government schemes:
        {schemes_text}
        
        Task:
        1. Present the top 1-2 most relevant schemes to the user.
        2. Briefly explain WHY each scheme is a good fit for their query.
        3. Mention key benefits.
        4. End with an encouraging closing, inviting them to ask about eligibility or application steps.
        
        Style: Professional, helpful, and concise. Use bullet points for readability.
        CRITICAL: Do NOT start with a greeting or self-introduction. Jump straight into the results.
        """
        response_text = await mimo_service.generate_text(prompt)
    else:
        response_text = "I searched our database but couldn't find any specific government schemes that match your exact query. \n\nCould you try rephrasing? For example, tell me your industry (e.g., 'textiles'), your goal (e.g., 'loan for machinery'), or your business size."
        
    return {"messages": [AIMessage(content=response_text)]}

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

    # Add nodes
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
