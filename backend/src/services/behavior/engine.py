from typing import Dict
from collections import defaultdict
from .taxonomy import HOBBY_TO_INTEREST
from .models import QuestionnaireResponse, BehavioralModel
from .taxonomy import DISEASE_CATEGORIES, INTERESTS, HOBBIES 


# ------------------------
# Utility Functions
# ------------------------

def normalize(answer: int) -> float:
    if answer < 1 or answer > 5:
        raise ValueError("Answers must be between 1 and 5")
    return (answer - 1) / 4


def clamp(value: float, min_val=0.0, max_val=1.0):
    return max(min_val, min(max_val, value))


# ------------------------
# Disease Effects
# ------------------------

def apply_disease_effects(model: Dict[str, float], diseases):

    diseases = [d.lower() for d in diseases]

    if any(d in DISEASE_CATEGORIES["respiratory"] for d in diseases):
        model["health_sensitivity"] += 0.4
        model["outdoor_affinity"] -= 0.3
        model["risk_tolerance"] -= 0.2

    if any(d in DISEASE_CATEGORIES["cardiovascular"] for d in diseases):
        model["risk_tolerance"] -= 0.3
        model["health_sensitivity"] += 0.2

    if any(d in DISEASE_CATEGORIES["metabolic"] for d in diseases):
        model["risk_tolerance"] -= 0.2

    if any(d in DISEASE_CATEGORIES["neurological_mental"] for d in diseases):
        model["risk_tolerance"] -= 0.3
        model["social_energy"] -= 0.2

    if any(d in DISEASE_CATEGORIES["musculoskeletal"] for d in diseases):
        model["outdoor_affinity"] -= 0.2

    if any(d in DISEASE_CATEGORIES["autoimmune"] for d in diseases):
        model["health_sensitivity"] += 0.3

    return {k: clamp(v) for k, v in model.items()}


# ------------------------
# Cross Parameter Coupling
# ------------------------

def apply_coupling(model):

    model["abstract_thinking"] = clamp(
        model["abstract_thinking"] + 0.2 * model["creativity_bias"]
    )

    model["risk_tolerance"] = clamp(
        model["risk_tolerance"] - 0.15 * model["structure_preference"]
    )

    model["outdoor_affinity"] = clamp(
        model["outdoor_affinity"] - 0.25 * model["health_sensitivity"]
    )

    model["structure_preference"] = clamp(
        model["structure_preference"] + 0.1 * model["analytical_decision"]
    )

    return model


def build_interest_vector(selected_interests, hobbies):

    interest_vector = {}

    # Explicit interests
    for interest in selected_interests:
        interest_vector[interest.lower()] = 1.0

    # Map hobbies to interests
    for hobby in hobbies:
        mapped = HOBBY_TO_INTEREST.get(hobby.lower())
        if mapped:
            interest_vector[mapped] = 1.0

    return interest_vector


# ------------------------
# Main Engine
# ------------------------

def derive_behavior_model(data: QuestionnaireResponse) -> BehavioralModel:

    scores = defaultdict(float)
    weights = defaultdict(float)

    def apply(param, value, weight):
        scores[param] += value * weight
        weights[param] += abs(weight)

    norm = [normalize(a) for a in data.answers]

    # 10 Questions Mapping
    apply("social_energy", 1 - norm[0], 1.0)
    apply("abstract_thinking", norm[1], 1.0)
    apply("structure_preference", norm[2], 1.0)
    apply("outdoor_affinity", 1 - norm[3], 1.0)
    apply("social_energy", norm[4], 1.0)
    apply("structure_preference", norm[5], 0.8)
    apply("risk_tolerance", norm[6], 1.0)
    apply("outdoor_affinity", 1 - norm[7], 0.8)
    apply("abstract_thinking", norm[8], 0.8)
    apply("creativity_bias", norm[9], 1.0)

    model = {
        param: clamp(scores[param] / weights[param])
        for param in scores
    }

    # Defaults
    for param in [
        "analytical_decision",
        "health_sensitivity",
        "risk_tolerance",
        "creativity_bias",
    ]:
        model.setdefault(param, 0.5)

    # Disease effects
    model = apply_disease_effects(model, data.diseases)


   # Hobby reinforcement (capped + proportional)

    reinforcement = defaultdict(float)
    hobbies_lower = [h.lower() for h in data.hobbies]

    for hobby in hobbies_lower:

        if hobby in ["public speaking", "community volunteering", "event organizing"]:
            reinforcement["social_energy"] += 0.2

        if hobby in ["creative writing", "music production", "painting", "video editing"]:
            reinforcement["creativity_bias"] += 0.2

        if hobby in ["running", "cycling", "martial arts", "trekking"]:
            reinforcement["risk_tolerance"] += 0.2

        if hobby in ["meditation practice", "yoga sessions", "meal planning"]:
            reinforcement["health_sensitivity"] += 0.2


    # STEP 2 — APPLY CAP + PROPORTIONAL BOOST
    REINFORCEMENT_CAP = 0.3

    for param, bonus in reinforcement.items():
        capped_bonus = min(bonus, REINFORCEMENT_CAP)
        model[param] += capped_bonus * (1 - model[param])


    # Constraint effects
    if data.constraints.max_physical_intensity == "low":
        model["risk_tolerance"] -= 0.2

    if data.constraints.aqi_sensitivity == "very_sensitive":
        model["health_sensitivity"] += 0.4

    # Coupling
    model = apply_coupling(model)

    interest_vector = build_interest_vector(
    data.selected_interests,
    data.hobbies
    )
    model = {k: clamp(v) for k, v in model.items()}

    return BehavioralModel(
        **model,
        interest_vector=interest_vector
    )


# ------------------------
# MBTI
# ------------------------

def derive_mbti(model: BehavioralModel) -> str:
    return (
        ("E" if model.social_energy >= 0.5 else "I") +
        ("N" if model.abstract_thinking >= 0.5 else "S") +
        ("T" if model.analytical_decision >= 0.5 else "F") +
        ("J" if model.structure_preference >= 0.5 else "P")
    )
