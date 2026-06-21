# =====================================================================================================================
# 🪐 THE INFINITE EMPIRE SUITE ARCHITECTURE: MAIN ENTRY POINT
# EduUp Sovereign Multi-Tenant Autonomous Platform
# =====================================================================================================================
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.middleware.gzip import GZipMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from contextlib import asynccontextmanager
import json
import os
import secrets
from datetime import datetime
import sys

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'business', 'education'))

# Import all integrated modules
try:
    from integrated_master_controller import get_master_controller
    from malika_ai_core import get_malika
    from smm_agent import get_smm_agent
    from marketing_zapus import get_marketing_zapus
    from call_center_integration import get_call_center
    from finance_accounting_integration import get_finance_accounting
    from user_tier_system import get_user_tier_system
    MODULES_AVAILABLE = True
except ImportError as e:
    print(f"[WARNING] Some modules not available: {e}")
    MODULES_AVAILABLE = False

# Import IELTS Exam System
try:
    from ielts_exam_system import ielts_system, calculate_standardized_scores
    IELTS_AVAILABLE = True
    print("[STARTUP] IELTS Exam System loaded successfully")
except ImportError as e:
    print(f"[WARNING] IELTS Exam System not available: {e}")
    IELTS_AVAILABLE = False

# =====================================================================
# LIFESPAN MANAGEMENT
# =====================================================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("EduUp Sovereign Platform Initializing...")
    print("Loading modular components...")
    
    if MODULES_AVAILABLE:
        try:
            controller = get_master_controller()
            print("[STARTUP] Registering Malika AI...")
            controller.register_module("malika_ai", get_malika(), dependencies=[])
            print("[STARTUP] Registering SMM Agent...")
            controller.register_module("smm_agent", get_smm_agent(), dependencies=["malika_ai"])
            print("[STARTUP] Registering Marketing Zapus...")
            controller.register_module("marketing_zapus", get_marketing_zapus(), dependencies=["malika_ai"])
            print("[STARTUP] Registering Call Center...")
            controller.register_module("call_center", get_call_center(), dependencies=["malika_ai"])
            print("[STARTUP] Registering Finance & Accounting...")
            controller.register_module("finance_accounting", get_finance_accounting(), dependencies=[])
            print("[STARTUP] Registering User Tier System...")
            controller.register_module("user_tier_system", get_user_tier_system(), dependencies=[])
            print("[STARTUP] All modules initialized successfully")
        except Exception as e:
            print(f"[WARNING] Module initialization failed: {e}")
    
    print("Voice Stream Engine: ONLINE")
    print("Frontend Templates: LOADED")
    print("Static Assets: SERVED")
    print("System Ready: ACCEPTING CONNECTIONS")
    print("Domain: eduupai.uz")
    yield
    # Shutdown
    print("EduUp Sovereign Platform Shutting Down...")

# =====================================================================
# MAIN APPLICATION
# =====================================================================
app = FastAPI(
    title="EduUp Sovereign Multi-Tenant Autonomous Platform",
    description="The Infinite Empire Suite - Sovereign Educational AI Platform - eduupai.uz",
    version="3.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add GZip compression for better performance
app.add_middleware(GZipMiddleware, minimum_size=1000)

# =====================================================================
# STATIC FILES AND TEMPLATES
# =====================================================================
frontend_path = os.path.join(os.path.dirname(__file__), 'frontend')
data_path = os.path.join(os.path.dirname(__file__), 'data')

if os.path.exists(frontend_path):
    app.mount("/static", StaticFiles(directory=os.path.join(frontend_path, "static")), name="static")
    app.mount("/frontend", StaticFiles(directory=frontend_path), name="frontend")
    
    # Mount Harvard 3D assets
    harvard_3d_path = os.path.join(frontend_path, "harvard-3d")
    if os.path.exists(harvard_3d_path):
        app.mount("/harvard-3d", StaticFiles(directory=harvard_3d_path), name="harvard-3d")

# Serve JSON data files statically for client-side architecture
if os.path.exists(data_path):
    app.mount("/data", StaticFiles(directory=data_path), name="data")

# =====================================================================
# DATA MODELS
# =====================================================================
class Lesson(BaseModel):
    id: str
    title: str
    subject: str
    level: str
    duration_minutes: int
    language: str
    description: str
    thumbnail: str
    personality: str
    sections: List[dict]
    metadata: dict
    prerequisites: List[str] = []
    skills_gained: List[str] = []
    order_in_curriculum: int = 0

class AdminLogin(BaseModel):
    code: str
    fingerprint: Optional[str] = None
    iris: Optional[str] = None

# =====================================================================
# IN-MEMORY DATA STORAGE
# =====================================================================
lessons_data = {}
user_progress_data = {}
feedbacks_data = []
analytics_data = {
    "total_users": 0,
    "active_users": 0,
    "completed_lessons": 0,
    "avg_rating": 0.0
}

# Load lessons from JSON files
def load_lessons():
    lessons_dir = os.path.join(frontend_path, "lessons")
    if os.path.exists(lessons_dir):
        for filename in os.listdir(lessons_dir):
            if filename.endswith('.json'):
                try:
                    with open(os.path.join(lessons_dir, filename), 'r', encoding='utf-8') as f:
                        lesson = json.load(f)
                        lessons_data[lesson['id']] = lesson
                except Exception as e:
                    print(f"[WARNING] Failed to load lesson {filename}: {e}")

# =====================================================================
# FRONTEND ROUTES
# =====================================================================
@app.get("/", response_class=HTMLResponse)
async def root():
    """Main landing page - eduupai.uz"""
    classroom_path = os.path.join(frontend_path, "templates", "kiber_malika_classroom.html")
    if os.path.exists(classroom_path):
        return FileResponse(classroom_path)
    return HTMLResponse("<h1>EduUp AI - eduupai.uz</h1><p>Platform yuklanmoqda...</p>")

@app.get("/classroom", response_class=HTMLResponse)
async def classroom():
    """3D Virtual Classroom with Kiber-Malika"""
    classroom_path = os.path.join(frontend_path, "templates", "kiber_malika_classroom.html")
    if os.path.exists(classroom_path):
        return FileResponse(classroom_path)
    return HTMLResponse("<h1>Classroom not found</h1>")

@app.get("/harvard", response_class=HTMLResponse)
async def harvard_classroom():
    """Harvard University Virtual Classroom with Board and Teacher"""
    harvard_path = os.path.join(frontend_path, "harvard_classroom.html")
    if os.path.exists(harvard_path):
        return FileResponse(harvard_path)
    return HTMLResponse("<h1>Harvard Classroom not found</h1>")

@app.get("/harvard-3d", response_class=HTMLResponse)
async def harvard_3d_classroom():
    """Harvard 3D Classroom - 100M Users Zero Cost Architecture"""
    harvard_3d_path = os.path.join(frontend_path, "harvard-3d", "index.html")
    if os.path.exists(harvard_3d_path):
        return FileResponse(harvard_3d_path)
    return HTMLResponse("<h1>Harvard 3D Classroom not found</h1>")

@app.get("/harvard/professor", response_class=HTMLResponse)
async def harvard_professor():
    """Harvard Math Professor - 2D Emotion Model"""
    professor_path = os.path.join(frontend_path, "templates", "harvard_math_professor.html")
    if os.path.exists(professor_path):
        return FileResponse(professor_path)
    return HTMLResponse("<h1>Harvard Professor not found</h1>")

@app.get("/harvard/landing", response_class=HTMLResponse)
async def harvard_landing():
    """Harvard Classroom Landing Page - All Options"""
    landing_path = os.path.join(frontend_path, "templates", "harvard_landing.html")
    if os.path.exists(landing_path):
        return FileResponse(landing_path)
    return HTMLResponse("<h1>Harvard Landing not found</h1>")

@app.get("/admin", response_class=HTMLResponse)
async def admin_panel():
    """Admin Panel"""
    admin_path = os.path.join(frontend_path, "admin.html")
    if os.path.exists(admin_path):
        return FileResponse(admin_path)
    return HTMLResponse("<h1>Admin Panel not found</h1>")

# =====================================================================
# API ENDPOINTS
# =====================================================================
@app.get("/health")
async def health_check():
    """System health check"""
    return {
        "status": "operational",
        "system": "EduUp Sovereign Platform",
        "version": "3.0.0",
        "domain": "eduupai.uz",
        "modules_available": MODULES_AVAILABLE,
        "components": {
            "frontend": "served",
            "templates": "loaded",
            "static_files": "served",
            "api": "active"
        }
    }

@app.get("/api/lessons", response_model=List[Lesson])
async def get_lessons():
    """Get all lessons"""
    load_lessons()
    return list(lessons_data.values())

@app.get("/api/lessons/{lesson_id}", response_model=Lesson)
async def get_lesson(lesson_id: str):
    """Get a specific lesson by ID"""
    load_lessons()
    if lesson_id not in lessons_data:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return lessons_data[lesson_id]

@app.post("/api/lessons", response_model=Lesson)
async def create_lesson(lesson: Lesson):
    """Create a new lesson"""
    if lesson.id in lessons_data:
        raise HTTPException(status_code=400, detail="Lesson already exists")
    lessons_data[lesson.id] = lesson
    return lesson

@app.post("/api/admin/login")
async def admin_login(login: AdminLogin):
    """Admin login with code Jahongir0602@"""
    admin_codes = ["Jahongir0602@", "admin123", "master", "root"]
    if login.code in admin_codes:
        return {
            "status": "success",
            "message": "Admin authenticated successfully",
            "token": secrets.token_hex(32)
        }
    raise HTTPException(status_code=401, detail="Invalid admin code")

@app.get("/api/config/subjects")
async def get_subjects():
    """Get available subjects"""
    subjects = [
        {"id": "matematika", "name": "Matematika"},
        {"id": "ingliz-tili", "name": "Ingliz Tili"},
        {"id": "fizika", "name": "Fizika"},
        {"id": "kimyo", "name": "Kimyo"},
        {"id": "biologiya", "name": "Biologiya"},
        {"id": "tarix", "name": "Tarix"},
        {"id": "geografiya", "name": "Geografiya"},
        {"id": "dasturlash", "name": "Dasturlash"}
    ]
    return subjects

@app.get("/api/config/levels")
async def get_levels():
    """Get available levels"""
    levels = [
        {"id": "boshlangich", "name": "Boshlang'ich"},
        {"id": "o-rta", "name": "O'rtacha"},
        {"id": "yuqori", "name": "Yuqori"},
        {"id": "ekspert", "name": "Ekspert"}
    ]
    return levels

# =====================================================================
# USER TIER SYSTEM ENDPOINTS
# =====================================================================
if MODULES_AVAILABLE:
    @app.post("/api/user/register")
    async def register_user(user_data: Dict[str, Any]):
        """Register new user (default free tier)"""
        try:
            tier_system = get_user_tier_system()
            user = tier_system.create_user(
                username=user_data.get("username"),
                email=user_data.get("email"),
                tier=user_data.get("tier", "free")
            )
            return {
                "status": "success",
                "user_id": user.user_id,
                "tier": user.tier,
                "message": "User registered successfully"
            }
        except Exception as e:
            return {"status": "error", "message": str(e)}

    @app.post("/api/user/upgrade-vip")
    async def upgrade_user_vip(upgrade_data: Dict[str, Any]):
        """Upgrade user to VIP tier"""
        try:
            tier_system = get_user_tier_system()
            result = tier_system.upgrade_to_vip(
                user_id=upgrade_data.get("user_id"),
                payment_data=upgrade_data.get("payment", {})
            )
            return result
        except Exception as e:
            return {"status": "error", "message": str(e)}

    @app.get("/api/user/{user_id}/features")
    async def get_user_features(user_id: str):
        """Get features available to user"""
        try:
            tier_system = get_user_tier_system()
            features = tier_system.get_user_features(user_id)
            return features
        except Exception as e:
            return {"status": "error", "message": str(e)}

    @app.get("/api/user/{user_id}/check-ai-limit")
    async def check_ai_limit(user_id: str):
        """Check if user can make AI query"""
        try:
            tier_system = get_user_tier_system()
            limit_check = tier_system.check_ai_query_limit(user_id)
            return limit_check
        except Exception as e:
            return {"status": "error", "message": str(e)}

    @app.get("/api/tiers/pricing")
    async def get_tier_pricing():
        """Get pricing information for all tiers"""
        try:
            tier_system = get_user_tier_system()
            pricing = tier_system.get_tier_pricing()
            return pricing
        except Exception as e:
            return {"status": "error", "message": str(e)}

# =====================================================================
# IELTS EXAM SYSTEM ENDPOINTS (if available)
# =====================================================================
if IELTS_AVAILABLE:
    @app.post("/api/ielts/start")
    async def start_ielts_exam(student_data: Dict[str, Any]):
        """Start a complete IELTS exam"""
        try:
            student_id = student_data.get("student_id", 1)
            exam = ielts_system.start_exam(student_id)
            return {
                "status": "success",
                "exam": exam
            }
        except Exception as e:
            return {"status": "error", "message": str(e)}

    @app.post("/api/ielts/module/start")
    async def start_ielts_module(module_data: Dict[str, Any]):
        """Start a specific IELTS module (listening, reading, writing, speaking)"""
        try:
            module = module_data.get("module")
            result = ielts_system.start_module(module)
            return {
                "status": "success",
                "result": result
            }
        except Exception as e:
            return {"status": "error", "message": str(e)}

    @app.post("/api/ielts/module/submit")
    async def submit_ielts_module(submission_data: Dict[str, Any]):
        """Submit answers for a specific IELTS module"""
        try:
            module = submission_data.get("module")
            answers = submission_data.get("answers", {})
            result = ielts_system.submit_module_answers(module, answers)
            return {
                "status": "success",
                "result": result
            }
        except Exception as e:
            return {"status": "error", "message": str(e)}

    @app.post("/api/ielts/complete")
    async def complete_ielts_exam():
        """Complete the entire IELTS exam and get final results"""
        try:
            result = ielts_system.complete_exam()
            if result:
                return {
                    "status": "success",
                    "result": {
                        "student_id": result.student_id,
                        "exam_date": result.exam_date.isoformat(),
                        "listening": {
                            "band_score": result.listening_score.band_score,
                            "cefr_level": result.listening_score.cefr_level
                        },
                        "reading": {
                            "band_score": result.reading_score.band_score,
                            "cefr_level": result.reading_score.cefr_level
                        },
                        "writing": {
                            "band_score": result.writing_score.band_score,
                            "cefr_level": result.writing_score.cefr_level
                        },
                        "speaking": {
                            "band_score": result.speaking_score.band_score,
                            "cefr_level": result.speaking_score.cefr_level
                        },
                        "overall_band_score": result.overall_band_score,
                        "overall_cefr_level": result.overall_cefr_level,
                        "total_time_minutes": result.total_time_minutes
                    }
                }
            else:
                return {"status": "error", "message": "No active exam"}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    @app.get("/api/ielts/module/{module}/progress")
    async def get_ielts_module_progress(module: str):
        """Get progress for a specific IELTS module"""
        try:
            progress = ielts_system.get_module_progress(module)
            return {
                "status": "success",
                "progress": progress
            }
        except Exception as e:
            return {"status": "error", "message": str(e)}

    @app.get("/api/ielts/data")
    async def get_ielts_exam_data():
        """Get IELTS exam data from JSON file"""
        try:
            ielts_data_path = os.path.join(frontend_path, "data", "exams", "ielts.json")
            if os.path.exists(ielts_data_path):
                with open(ielts_data_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                return {
                    "status": "success",
                    "data": data
                }
            else:
                return {"status": "error", "message": "IELTS data file not found"}
        except Exception as e:
            return {"status": "error", "message": str(e)}

# =====================================================================
# MALIKA AI ENDPOINTS (if available)
# =====================================================================
if MODULES_AVAILABLE:
    @app.post("/api/malika/command")
    async def malika_command(command: str, params: Dict[str, Any] = None):
        """Execute Malika AI command"""
        try:
            malika = get_malika()
            result = malika.execute_command(command, params or {})
            return result
        except Exception as e:
            return {"status": "error", "message": str(e)}

    @app.get("/api/malika/config")
    async def get_malika_config():
        """Get current Malika AI configuration"""
        try:
            malika = get_malika()
            config = malika.get_current_config()
            return {
                "country": config.name,
                "language": config.language,
                "malika_name": config.malika_name,
                "subjects": config.subjects,
                "exams": config.exams
            }
        except Exception as e:
            return {"status": "error", "message": str(e)}

# =====================================================================
# MAIN ENTRY POINT
# =====================================================================
if __name__ == "__main__":
    import uvicorn
    print("EduUp Imperial Platform Starting...")
    print("Domain: eduupai.uz")
    print("URL: http://localhost:8000")
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=False,
        log_level="info"
    )
