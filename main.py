# ==============================================================================
#          EDUUP AI ACADEMY - UNIFIED MULTI-AI & DUAL-BOT SUPREME CORE
# ==============================================================================
import os
import asyncio
from typing import Dict, List
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from telegram import Update, WebAppInfo, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, ContextTypes

load_dotenv()

# 1. KALITLAR VA TOKENLAR SEYFI
GROQ_POOL = [os.getenv("GROQ_API_KEY_1")]
PRIMARY_TOKEN = os.getenv("BOT_TOKEN_PRIMARY")
BACKUP_TOKEN = os.getenv("BOT_TOKEN_BACKUP")
MINI_APP_URL = "https://onrender.com" # Server manzili

app = FastAPI(title="EduUp AI Academy Unified Core")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ExamInput(BaseModel):
    user_id: int
    text_answers: str
    exam_type: str
    language: str = "uz"

@app.post("/api/v1/exam/supreme-run")
async def run_supreme_exam(payload: ExamInput):
    return {"status": "success", "response": "EduUp AI Core: Muvaffaqiyatli tahlil qilindi."}

# ==============================================================================
# 2. TELEGRAM TELEGRAM BOT LOGIKASI (BACKGROUND PROCESS)
# ==============================================================================
async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    user_name = update.effective_user.first_name
    welcome_text = (
        f"👋 Salom, {user_name}! \n\n"
        f"🚀 EduUp AI Academy global raqamli ekotizimiga xush kelibsiz!\n"
        f"Biz barcha imtihonlarni bitta joyga jamlab, ballaringizni ko'taramiz.\n\n"
        f"👇 Darslarni boshlash uchun pastdagi 'EduUp Mini App' tugmasini bosing:"
    )
    keyboard = [[InlineKeyboardButton(text="📱 EduUp Mini App", web_app=WebAppInfo(url=MINI_APP_URL))]]
    await update.message.reply_text(text=welcome_text, reply_markup=InlineKeyboardMarkup(keyboard), parse_mode="Markdown")

async def launch_bot_instance(token: str, name: str):
    if not token or "Siz_" in token: return
    try:
        bot_app = Application.builder().token(token).build()
        bot_app.add_handler(CommandHandler("start", start_command))
        await bot_app.initialize()
        await bot_app.start()
        await bot_app.updater.start_polling()
        print(f"✅ {name} Tarmoqda JONLI tirildi!")
    except Exception as e:
        print(f"❌ {name} xato: {e}")

# FastAPI ishga tushganda orqa fonda botlarni ham parallel yoqish
@app.on_event("startup")
async def startup_event():
    print("🤖 Dual-Bot tizimi orqa fonda yuklanmoqda...")
    asyncio.create_task(launch_bot_instance(PRIMARY_TOKEN, "ASOSIY_BOT"))
    asyncio.create_task(launch_bot_instance(BACKUP_TOKEN, "ZAXIRA_BOT"))