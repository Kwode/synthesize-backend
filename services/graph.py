from langchain_openai import ChatOpenAI
from langgraph.graph import START, END, StateGraph
from typing import TypedDict
from typing_extensions import Literal
from langchain_community.tools.tavily_search import TavilySearchResults
from dotenv import load_dotenv
from typing import Any


load_dotenv()

class State(TypedDict):
    question: str
    search_query: str
    search_result: Any
    enough_info: bool
    attempts: int
    final_answer: str

llm = ChatOpenAI(
    model= 'gpt-4o-mini',
    max_completion_tokens=200
)

search_tool = TavilySearchResults(max_results = 5)


def think(state):

   prompt = f"""
        User Question:
        {state['question']}

        Previous Search Results:
        {state.get('search_result', '')}

        Attempt:
        {state.get('attempts', 0)}

        Generate an improved search query that fills missing information.
    """
   response = llm.invoke(prompt).content
   
   return {"search_query": response}

def act(state):

    search_result = search_tool.invoke(
        {"query": state["search_query"]}
    )

    return {
        "search_result": search_result
    }

def observe(state):

    prompt = f"""

        You are a expert research evaluator, evalutate the search results below and determine whether it's enough to answer the user's question

        User Question:
        {state["question"]}

        Search Results:
        {state["search_result"]}

        if the results are good enough to answer the user's question, respond explicitly with YES, if not respond explicitly with NO
    """    
    
    response = llm.invoke(prompt).content.strip().upper()

    return{
        "enough_info": response == "YES"
    }

def increment(state):

    return {
        "attempts": state.get("attempts", 0) + 1
    }

def router(state) -> Literal["think", "answer"]:

    if state.get("attempts", 0) >= 3:
        return "answer"

    if state['enough_info']:
        return "answer"
    
    return "think"

def final_answer(state):

    prompt = f"""
        Based on the user's question and the search result, give a final response to the user:

        Question:
        {state["question"]}

        Search Results:
        {state["search_result"]}
    """

    response = llm.invoke(prompt).content

    return {
        "final_answer": response
    }


builder = StateGraph(State)

builder.add_node("think", think)
builder.add_node("act", act)
builder.add_node("observe", observe)
builder.add_node("increment", increment)
builder.add_node("answer", final_answer)

builder.add_edge(START, "think")
builder.add_edge("think", "act")
builder.add_edge("act", "observe")
builder.add_edge("observe", "increment")
builder.add_conditional_edges("increment", router)
builder.add_edge("answer", END)

graph = builder.compile()