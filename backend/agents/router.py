from langchain_core.prompts import ChatPromptTemplate
from services.mimo_service import mimo_service
from agents.state import AgentState
from langchain_core.messages import HumanMessage, SystemMessage

ROUTER_PROMPT = """
You are an intelligent intent classifier for the MAYA AI Assistant.
Classify the user's query into one of the following categories:

1. 'scheme': The user is asking about government schemes, loans, subsidies, or eligibility.
2. 'market': The user is asking about market research, competitors, or industry trends.
3. 'brand': The user is asking about branding, business names, or taglines.
4. 'finance': The user is asking about financial advice, pricing, or calculations (not specific schemes).
5. 'marketing': The user is asking about marketing strategies or promotion.
6. 'general': The user is saying hello, asking who you are, or general conversation.

Return ONLY the category name (e.g., 'scheme', 'market', 'general'). Do not add any explanation.
"""

async def route_request(state: AgentState) -> dict:
    messages = state["messages"]
    last_message = messages[-1]
    
    # Simple logic for now, using LLM for classification
    prompt = f"{ROUTER_PROMPT}\n\nUser Query: {last_message.content}"
    
    category = await mimo_service.generate_text(prompt)
    category = category.strip().lower()
    
    # Normalize response
    valid_categories = ['scheme', 'market', 'brand', 'finance', 'marketing', 'general']
    if category not in valid_categories:
        category = 'general'
        
    print(f"Routing to: {category}")
    return {"current_agent": category}
