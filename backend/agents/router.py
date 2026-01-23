from langchain_core.prompts import ChatPromptTemplate
from services.mimo_service import mimo_service
from agents.state import AgentState
from langchain_core.messages import HumanMessage, SystemMessage

ROUTER_PROMPT = """
You are an intelligent intent classifier for the MAYA AI Assistant.
MAYA is STRICTLY focused on:
1. Government Schemes & Loans for Business/MSME
2. Market Research & Competitor Analysis
3. Branding & Marketing for Small Businesses
4. Financial Planning for Business

Classify the user's query into one of these categories:

1. 'scheme': Questions about government schemes, loans, subsidies, eligibility, application processes.
2. 'market': Questions about market trends, competitors, industry analysis.
3. 'brand': Questions about business names, logos, taglines, brand identity.
4. 'finance': Questions about business finance, pricing, cost management, profit margins.
5. 'marketing': Questions about advertising, social media promotion, sales strategies.
6. 'general': ONLY for greetings (Hello, Hi) or questions asking "Who are you?".
7. 'off_topic': ANY question that is NOT about Business, MSMEs, Schemes, or Markets (e.g., "Who won the cricket match?", "Tell me a joke", "Coding help", "Politics", "Movies").

Return ONLY the category name.
"""

async def route_request(state: AgentState) -> dict:
    messages = state["messages"]
    last_message = messages[-1]
    
    # Simple logic for now, using LLM for classification
    prompt = f"{ROUTER_PROMPT}\n\nUser Query: {last_message.content}"
    
    category = await mimo_service.generate_text(prompt)
    category = category.strip().lower()
    
    # Normalize response
    valid_categories = ['scheme', 'market', 'brand', 'finance', 'marketing', 'general', 'off_topic']
    if category not in valid_categories:
        # Fallback for uncertain queries - treat as general/off_topic
        category = 'off_topic'
        
    print(f"Routing to: {category}")
    return {"current_agent": category}