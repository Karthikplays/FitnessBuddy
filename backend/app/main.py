import os
import logging
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Initialize dotenv
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("fitness-buddy")

# Import our custom Watsonx/Router layers
from app.agent_router import route_and_generate
from app.parse_guide import load_cached_or_parse

app = FastAPI(
    title="Fitness Buddy API",
    description="Backend API for Fitness Buddy Agentic AI health and fitness coach",
    version="1.0.0"
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Schemas
class UserProfile(BaseModel):
    fitnessLevel: str
    goals: List[str]
    limitations: Optional[str] = None
    dietaryPreference: str

class ChatRequest(BaseModel):
    message: str
    profile: UserProfile

# Global storage for Docling parsed text context (Phase 5)
RAG_KNOWLEDGE_BASE = ""

@app.on_event("startup")
def startup_event():
    # Load and cache document using Docling (RAG Pipeline)
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    docs_dir = os.path.abspath(os.path.join(backend_dir, "..", "..", "docs"))
    pdf_path = os.path.join(docs_dir, "fitness_guide.pdf")
    md_path = os.path.join(docs_dir, "fitness_guide.md")
    
    logger.info("Checking for fitness guide reference documents at startup...")
    rag_text = load_cached_or_parse(pdf_path, md_path)
    if rag_text:
        update_rag_context(rag_text)

@app.get("/")
def read_root():
    return {"message": "Welcome to Fitness Buddy API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/onboard")
def onboard_user(profile: UserProfile):
    logger.info(f"Onboarding user profile: {profile}")
    # Return success confirmation
    return {
        "status": "success",
        "message": "User onboarding profile loaded successfully.",
        "profile": profile
      }

@app.post("/chat")
def chat_with_coach(request: ChatRequest):
    logger.info(f"Received chat request: {request.message}")
    try:
        # Convert profile to dict for routing prompt compiler
        profile_dict = request.profile.model_dump()
        
        # Inject knowledge context if loaded (RAG context from Phase 5)
        response_text = route_and_generate(
            message=request.message,
            profile=profile_dict,
            rag_context=RAG_KNOWLEDGE_BASE
        )
        return {"response": response_text}
    except Exception as e:
        logger.error(f"Error handling chat request: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def update_rag_context(text: str):
    """
    Helper function used in Phase 5 to update RAG reference knowledge.
    """
    global RAG_KNOWLEDGE_BASE
    RAG_KNOWLEDGE_BASE = text
    logger.info("RAG Knowledge base context updated.")
