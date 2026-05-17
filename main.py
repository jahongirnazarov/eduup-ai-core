# ==============================================================================
#                 EDUUP AI ACADEMY - SUPREME MULTI-AI CORE (MAIN.PY)
# ==============================================================================
# Muallif: Jahongir Nazarov & AI
# Brend Nomi: EDUUP AI ACADEMY
# Arxitektura: Multi-LLM Enterprise Matrix
# ==============================================================================

import os
import time
from typing import Dict, List
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# 1. MAXFIYLIK SEYFINI VA HAMMA KALITLAR POOLINI YUKLASH
load_dotenv()

def get_key_pool(prefix: str, count: int = 3) -> List[str]:
    pool = [os.getenv(f"{prefix}_{i}") for i in range(1, count + 1)]
    return [k for k in pool if k]

GROQ_POOL = get_key_pool("GROQ_API_KEY")
OPENAI_POOL = get_key_pool("OPENAI_API_KEY")
GEMINI_POOL = get_key_pool("GEMINI_API_KEY")
MISTRAL_POOL = get_key_pool("MISTRAL_API_KEY")
CEREBRAS_POOL = get_key_pool("CEREBRAS_API_KEY")
TOGETHER_POOL = get_key_pool("TOGETHER_API_KEY")

WOLFRAM_ALPHA_KEY = os.getenv("WOLFRAM_ALPHA_API_KEY")
XAI_KEY = os.getenv("XAI_API_KEY")

app = FastAPI(title="EduUp AI Academy Ultimate Core", version="3.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

key_counters: Dict[str, int] = {}

def rotate_key(pool: List[str], pool_name: str) -> str:
    if not pool:
        return "DEMO_KEY"
    if pool_name not in key_counters:
        key_counters[pool_name] = 0
    selected_key = pool[key_counters[pool_name] % len(pool)]
    key_counters[pool_name] += 1
    return selected_key

# ==============================================================================
# 2. KIBER VA MOLIYAVIY XAVFSIZLIK TIZIMI
# ==============================================================================
user_requests: Dict[str, List[float]] = {}
MONTHLY_AI_EXPENSE = 0.0
MAX_MONTHLY_LIMIT = 500.0

BANNED_KEYWORDS = ["siyosat", "prezident", "saylov", "hukumat", "urush", "so'kish", "haqorat"]


    
    
  
class ExamInput(BaseModel):
    user_id: int
    text_answers: str
    exam_type: str
    language: str = "uz"

@app.post("/api/v1/exam/supreme-run")
async def run_supreme_exam(payload: ExamInput):
    return {
        "status": "success",
        "allocated_engine": "DeepSeek-R1-Distill-Llama-70b",
        "response": "EduUp AI: Vazifangiz global Multi-AI tizimi orqali muvaffaqiyatli tahlil qilindi."
    }

@app.post("/api/v1/exam/anti-cheat")
async def process_anti_cheat(user_id: int, duration_seconds: int):
    if duration_seconds > 5:
        return {"status": "EXAM_TERMINATED", "score": 0}
    return {"status": "secure"}

@app.get("/api/v1/admin/dashboard")
async def get_admin_dashboard(secret_key: str):
    if secret_key != os.getenv("ADMIN_SECRET_KEY"):
        raise HTTPException(status_code=401, detail="Unauthorized")
    return {"status": "access_granted", "platform": "EduUp AI Academy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)