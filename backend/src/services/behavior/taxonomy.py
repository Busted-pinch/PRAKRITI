# ------------------------
# DISEASE TAXONOMY
# ------------------------

DISEASE_CATEGORIES = {
    "respiratory": [
        "asthma",
        "copd",
        "chronic bronchitis",
        "allergic rhinitis",
    ],
    "cardiovascular": [
        "hypertension",
        "heart disease",
        "arrhythmia",
    ],
    "metabolic": [
        "diabetes",
        "thyroid disorders",
        "obesity",
    ],
    "neurological_mental": [
        "anxiety disorder",
        "depression",
        "adhd",
        "migraine",
    ],
    "musculoskeletal": [
        "arthritis",
        "chronic back pain",
    ],
    "autoimmune": [
        "lupus",
        "rheumatoid arthritis",
    ],
    "none": ["none"],
}


# ------------------------
# INTEREST DOMAIN TAXONOMY
# ------------------------

INTERESTS = [
    # Intellectual
    "science",
    "technology",
    "psychology",
    "philosophy",
    "economics",
    "history",

    # Creative
    "visual arts",
    "literature",
    "music",
    "design",
    "film & media",

    # Physical
    "sports",
    "fitness",
    "outdoor adventure",

    # Environmental
    "sustainability",
    "climate awareness",
    "conservation",

    # Social
    "community engagement",
    "public discourse",
    "networking",

    # Digital
    "gaming",
    "software development",
    "artificial intelligence",

    # Wellness
    "mental wellness",
    "nutrition",
    "mindfulness",

    # Professional
    "entrepreneurship",
    "finance",
    "leadership",
    "career growth"
]

# ------------------------
# HOBBY TAXONOMY
# ------------------------

HOBBIES = [
    # Intellectual Activities
    "reading research papers",
    "participating in debates",
    "building science projects",
    "learning new programming languages",

    # Creative Activities
    "painting",
    "creative writing",
    "music production",
    "photography",
    "video editing",

    # Physical Activities
    "running",
    "cycling",
    "weightlifting",
    "martial arts",
    "trekking",

    # Environmental Activities
    "urban gardening",
    "tree plantation",
    "wildlife volunteering",

    # Social Activities
    "public speaking",
    "community volunteering",
    "event organizing",

    # Digital Activities
    "strategy gaming",
    "competitive gaming",
    "app development",
    "game development",

    # Wellness Activities
    "meditation practice",
    "yoga sessions",
    "meal planning",

    # Professional Activities
    "startup building",
    "stock investing",
    "leadership workshops"
]


HOBBY_TO_INTEREST = {
    # Intellectual
    "reading research papers": "science",
    "building science projects": "science",
    "learning new programming languages": "technology",

    # Creative
    "creative writing": "literature",
    "music production": "music",
    "painting": "visual arts",
    "video editing": "film & media",

    # Physical
    "running": "sports",
    "cycling": "sports",
    "weightlifting": "fitness",
    "martial arts": "sports",
    "trekking": "outdoor adventure",

    # Environmental
    "urban gardening": "sustainability",
    "tree plantation": "climate awareness",
    "wildlife volunteering": "conservation",

    # Social
    "public speaking": "public discourse",
    "community volunteering": "community engagement",
    "event organizing": "community engagement",

    # Digital
    "strategy gaming": "gaming",
    "competitive gaming": "gaming",
    "app development": "software development",
    "game development": "software development",

    # Wellness
    "meditation practice": "mindfulness",
    "yoga sessions": "mindfulness",
    "meal planning": "nutrition",

    # Professional
    "startup building": "entrepreneurship",
    "stock investing": "finance",
    "leadership workshops": "leadership",
}
