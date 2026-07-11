import os
import logging
from ibm_watsonx_ai import Credentials
from ibm_watsonx_ai.foundation_models import ModelInference
from ibm_watsonx_ai.metanames import GenTextParamsMetaNames as GenParams

logger = logging.getLogger("fitness-buddy")
logging.basicConfig(level=logging.INFO)

# Load Watsonx environment variables
WATSONX_APIKEY = os.getenv("WATSONX_APIKEY", "")
WATSONX_PROJECT_ID = os.getenv("WATSONX_PROJECT_ID", "")
WATSONX_URL = os.getenv("WATSONX_URL", "https://us-south.ml.cloud.ibm.com")
MODEL_ID = os.getenv("WATSONX_MODEL_ID", "ibm/granite-3-8b-instruct")

_model_inference = None
DEMO_MODE = False

if not WATSONX_APIKEY or not WATSONX_PROJECT_ID:
    logger.warning(
        "WATSONX_APIKEY or WATSONX_PROJECT_ID environment variables are missing. "
        "Fitness Buddy will run in DEMO MODE with mock responses."
    )
    DEMO_MODE = True
else:
    try:
        credentials = Credentials(
            url=WATSONX_URL,
            api_key=WATSONX_APIKEY
        )
        
        # Configure model parameters
        generate_params = {
            GenParams.MAX_NEW_TOKENS: 600,
            GenParams.TEMPERATURE: 0.7,
            GenParams.MIN_NEW_TOKENS: 1,
            GenParams.DECODING_METHOD: "sample"
        }
        
        _model_inference = ModelInference(
            model_id=MODEL_ID,
            credentials=credentials,
            project_id=WATSONX_PROJECT_ID,
            params=generate_params
        )
        logger.info(f"Watsonx ModelInference successfully initialized for model: {MODEL_ID}")
    except Exception as e:
        logger.error(f"Failed to initialize Watsonx.ai client: {e}. Falling back to DEMO MODE.")
        DEMO_MODE = True

def query_watsonx(prompt: str) -> str:
    """
    Sends the compiled prompt to Watsonx.ai or falls back to standard demo mode outputs.
    """
    if DEMO_MODE or not _model_inference:
        # Mock answers for demonstration when credentials are not configured yet
        return get_mock_response(prompt)
    
    try:
        logger.info("Querying Watsonx.ai with prompt...")
        response = _model_inference.generate_text(prompt=prompt)
        return response.strip()
    except Exception as e:
        logger.error(f"Error querying Watsonx.ai: {e}")
        return f"[Error connecting to watsonx.ai: {e}]. Here is a fallback response:\n\n{get_mock_response(prompt)}"

def get_mock_response(prompt: str) -> str:
    """
    Generates high-quality mock responses containing standard exercise/nutrition guidance.
    """
    prompt_lower = prompt.lower()
    
    # Try to parse the intent from the prompt to make the mock response highly realistic
    if "workout" in prompt_lower or "exercise" in prompt_lower or "cardio" in prompt_lower or "training" in prompt_lower:
        return (
            "[Demo Mode - IBM Granite Mock Coach]:\n"
            "Here is a personalized home workout plan tailored to your profile:\n\n"
            "1. **Dynamic Warm-up (3 mins)**: Arm circles, hip openers, and light jumping jacks.\n"
            "2. **Bodyweight Squats**: 3 sets of 12 reps (focus on depth and keeping your chest up).\n"
            "3. **Push-Ups / Incline Push-Ups**: 3 sets of 8-10 reps (modify on knees or a wall if needed for injuries).\n"
            "4. **Glute Bridges**: 3 sets of 15 reps (squeezing at the top to support your lower back).\n"
            "5. **Plank Hold**: 3 rounds of 20-30 seconds (keep your core tight and spine neutral).\n\n"
            "Remember to breathe and stay hydrated! Let me know if you need to adjust any movement."
        )
    elif "meal" in prompt_lower or "protein" in prompt_lower or "diet" in prompt_lower or "nutrition" in prompt_lower or "recipe" in prompt_lower:
        return (
            "[Demo Mode - IBM Granite Mock Coach]:\n"
            "Here is a balanced meal guidance recommendation based on your dietary profile:\n\n"
            "*   **Breakfast**: Oatmeal cooked in almond milk, topped with a scoop of protein powder, chia seeds, and fresh berries.\n"
            "*   **Lunch**: Large mixed greens salad with Grilled Chicken (or Tofu/Tempeh for vegetarian options), cherry tomatoes, cucumber, avocado slices, and olive oil dressing.\n"
            "*   **Snack**: A handful of raw almonds and an apple, or carrot sticks with organic hummus.\n"
            "*   **Dinner**: Baked salmon (or grilled portobello steaks) served with roasted broccoli and half a cup of quinoa.\n\n"
            "Ensure you maintain adequate hydration throughout the day (aim for 2.5–3 liters of water)."
        )
    elif "motivate" in prompt_lower or "motivation" in prompt_lower or "lazy" in prompt_lower or "struggle" in prompt_lower:
        return (
            "[Demo Mode - IBM Granite Mock Coach]:\n"
            "Hey! Listen, it is completely normal to feel unmotivated or low on energy sometimes. "
            "But remember: *The only bad workout is the one that didn't happen.* You don't have to be perfect; "
            "you just have to take the first step. Commit to just 5 minutes of movement today. Put your shoes on, "
            "stretch, and start. If you want to stop after 5 minutes, you have permission to—but 90% of the time, "
            "once you start, you'll want to keep going. You've got this! Let's get moving."
        )
    
    return (
        "[Demo Mode - IBM Granite Mock Coach]:\n"
        "Hello! I am your Fitness Buddy. I received your message and profile information. "
        "To get the best out of me, ask me a question about workouts, diet/nutrition recipes, or request "
        "some motivation to get your session started!"
    )
