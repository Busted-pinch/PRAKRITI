from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from functools import partial

from src.langgraph.state import UnifiedState
from src.core.aggregate_data import AggregateData
from src.langgraph.supervisor import supervisor_agent
from src.langgraph.agents.environment_agent import environment_agent
from src.langgraph.agents.micro_learning_agent import micro_learning_agent
from src.langgraph.agents.chatbot_agent import chatbot_agent

datastore = AggregateData()

workflow = StateGraph(UnifiedState)

workflow.add_node("supervisor", partial(supervisor_agent, datastore=datastore))
workflow.add_node("environment_analyst", partial(environment_agent, datastore=datastore))
workflow.add_node("micro_learner", partial(micro_learning_agent, datastore=datastore))
workflow.add_node("chatbot", partial(chatbot_agent, datastore=datastore))


def route_supervisor(state):
    return state["next_agent"]


workflow.add_conditional_edges(
    "supervisor",
    route_supervisor,
    {
        "environment_analyst": "environment_analyst",
        "micro_learner": "micro_learner",
        "chatbot": "chatbot"
    }
)

workflow.add_edge("environment_analyst", END)
workflow.add_edge("micro_learner", END)
workflow.add_edge("chatbot", END)

workflow.set_entry_point("supervisor")

checkpointer = MemorySaver()
app = workflow.compile(checkpointer=checkpointer)