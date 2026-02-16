from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from functools import partial
import os
from dotenv import load_dotenv

from src.langgraph.state import UnifiedState
from src.AggregateData.datastore import Datastore
from src.langgraph.supervisor import supervisor_agent
from src.langgraph.agents.environment_agent import environment_agent
from src.langgraph.agents.digital_twin_agent import digital_twin_agent
from src.langgraph.agents.micro_learning_agent import micro_learning_agent
from src.langgraph.agents.chatbot_agent import chatbot_agent

load_dotenv()

# Initialize Global Datastore Instance
datastore = Datastore()

# Bind datastore to agents to create callable nodes
env_node = partial(environment_agent, datastore=datastore)
dt_node = partial(digital_twin_agent, datastore=datastore)
ml_node = partial(micro_learning_agent, datastore=datastore)
chat_node = partial(chatbot_agent, datastore=datastore)
supervisor_node = partial(supervisor_agent, datastore=datastore)

# Define the Graph
workflow = StateGraph(UnifiedState)

# Add Nodes
workflow.add_node("supervisor", supervisor_node)
workflow.add_node("environment_analyst", env_node)
workflow.add_node("digital_twin", dt_node)
workflow.add_node("micro_learner", ml_node)
workflow.add_node("chatbot", chat_node)

# Define Logic for Routing
def route_supervisor(state):
    return state["next_agent"]

# Add Edges
workflow.add_conditional_edges(
    "supervisor",
    route_supervisor,
    {
        "environment_analyst": "environment_analyst",
        "digital_twin": "digital_twin",
        "micro_learner": "micro_learner",
        "chatbot": "chatbot",
        "FINISH": END
    }
)

# Workers always report back to Supervisor to decide next steps (or to finish)
workflow.add_edge("environment_analyst", "supervisor")
workflow.add_edge("digital_twin", "supervisor")
workflow.add_edge("micro_learner", "supervisor")
workflow.add_edge("chatbot", "supervisor")

# Entry Point
workflow.set_entry_point("supervisor")

# Configure Checkpointer
checkpointer = MemorySaver()

# Compile the Graph
app = workflow.compile(checkpointer=checkpointer)

