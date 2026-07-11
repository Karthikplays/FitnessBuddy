import logging
from app.watsonx_service import query_watsonx, DEMO_MODE

logger = logging.getLogger("fitness-buddy")

# Prompt Templates
CLASSIFY_PROMPT_TEMPLATE = """You are an intent routing classifier. Your job is to classify the user's query into exactly one of three categories: 'WORKOUT', 'NUTRITION', or 'MOTIVATION'.

Categories:
- WORKOUT: Questions about exercises, routines, reps, sets, stretching, posture, or physical activity.
- NUTRITION: Questions about diets, meal ideas, recipes, calories, protein intake, macros, or hydration.
- MOTIVATION: Messages expressing laziness, fatigue, lack of discipline, discouragement, or asking for inspiration.

User Query: "{message}"

Respond with ONLY the category name in uppercase (WORKOUT, NUTRITION, or MOTIVATION). Do not add any other text.
Intent:"""

WORKOUT_SYSTEM_PROMPT = """You are Fitness Buddy's Workout Coach, a senior personal trainer specializing in home workouts.
You must design a personalized, safe, and highly structured exercise guide.

User Profile context:
- Fitness Level: {fitness_level}
- Goals: {goals}
- Physical Limitations / Injuries: {limitations}

Instructions:
- Keep the workout safe. If the user has limitations (like lower back pain or bad knees), explicitly structure the movements to be low impact or provide alternative exercises.
- Provide clear sets, reps, and pacing.
- Use a supportive, coaching tone.

User Query: {message}
Workout Plan:"""

NUTRITION_SYSTEM_PROMPT = """You are Fitness Buddy's Nutrition Specialist, a professional registered dietitian.
You must provide personalized nutrition advice and meal suggestions.

User Profile context:
- Dietary Preference: {dietary_preference}
- Goals: {goals}
- Allergies / Limitations: {limitations}

Instructions:
- Ensure all recipes and food suggestions strictly adhere to their dietary preference ({dietary_preference}).
- Focus on how this supports their primary goals ({goals}).
- Emphasize hydration and proper meal timing.
- Keep suggestions actionable and easy to prepare at home.

User Query: {message}
Nutrition Guide:"""

MOTIVATION_SYSTEM_PROMPT = """You are Fitness Buddy's Motivational Coach, an inspiring and empathetic mentor.
Your job is to light a fire under the user and help them overcome mental friction, fatigue, or doubt.

User Profile context:
- Fitness Level: {fitness_level}
- Goals: {goals}
- Limitations: {limitations}

Instructions:
- Keep the response punchy, high-energy, and empathetic.
- Provide a concrete mental tip (e.g., the 5-second rule, starting with just 2 minutes).
- Highlight the connection between their actions today and their ultimate goals ({goals}).

User Query: {message}
Motivational boost:"""

def classify_intent(message: str) -> str:
    """
    Classifies the user intent using Granite or keyword matching fallback in demo mode.
    """
    if DEMO_MODE:
        # Fast local classifier fallback for demo mode
        msg_lower = message.lower()
        if any(w in msg_lower for w in ["meal", "diet", "protein", "recipe", "food", "eat", "snack"]):
            return "NUTRITION"
        if any(w in msg_lower for w in ["lazy", "tired", "motivation", "motivate", "struggle", "give up", "hard"]):
            return "MOTIVATION"
        return "WORKOUT"

    prompt = CLASSIFY_PROMPT_TEMPLATE.format(message=message)
    try:
        response = query_watsonx(prompt).strip().upper()
        logger.info(f"Watsonx Classified Intent: '{response}'")
        for category in ["WORKOUT", "NUTRITION", "MOTIVATION"]:
            if category in response:
                return category
        return "WORKOUT"  # Default fallback
    except Exception as e:
        logger.error(f"Classification failed: {e}. Defaulting to WORKOUT.")
        return "WORKOUT"

def route_and_generate(message: str, profile: dict, rag_context: str = "") -> str:
    """
    Routes the query to the correct prompt chain and generates a Granite response.
    """
    intent = classify_intent(message)
    
    # Extract profile attributes
    fitness_level = profile.get("fitnessLevel", "beginner")
    goals = ", ".join(profile.get("goals", ["general_health"]))
    limitations = profile.get("limitations", "none") or "none"
    dietary_preference = profile.get("dietaryPreference", "balanced")
    
    # Select prompt template
    if intent == "NUTRITION":
        prompt = NUTRITION_SYSTEM_PROMPT.format(
            dietary_preference=dietary_preference,
            goals=goals,
            limitations=limitations,
            message=message
        )
    elif intent == "MOTIVATION":
        prompt = MOTIVATION_SYSTEM_PROMPT.format(
            fitness_level=fitness_level,
            goals=goals,
            limitations=limitations,
            message=message
        )
    else:  # WORKOUT
        prompt = WORKOUT_SYSTEM_PROMPT.format(
            fitness_level=fitness_level,
            goals=goals,
            limitations=limitations,
            message=message
        )

    # Inhibit RAG context if present (for Phase 5)
    if rag_context:
        prompt = f"Additional Reference Knowledge Context:\n{rag_context}\n\n" + prompt

    logger.info(f"Routing query with intent: {intent}")
    return query_watsonx(prompt)
