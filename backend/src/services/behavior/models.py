from pydantic import BaseModel, Field
from typing import List, Dict


class ActivityConstraints(BaseModel):
    max_physical_intensity: str  # low / moderate / high
    aqi_sensitivity: str         # very_sensitive / somewhat_sensitive / not_sensitive


class QuestionnaireResponse(BaseModel):
    answers: List[int]  # 10 Likert
    diseases: List[str]
    selected_interests: List[str]
    hobbies: List[str]  # Explicit user hobbies
    constraints: ActivityConstraints


class BehavioralModel(BaseModel):
    social_energy: float
    abstract_thinking: float
    analytical_decision: float
    structure_preference: float
    creativity_bias: float
    risk_tolerance: float
    outdoor_affinity: float
    health_sensitivity: float
    interest_vector: Dict[str, float]
