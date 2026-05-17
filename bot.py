# ==============================================================================
#                      EDUUP AI - DUAL BOT MASTER CONTROLLER (BOT.PY)
# ==============================================================================
import os
import asyncio
from dotenv import load_dotenv
from telegram import Update, WebAppInfo, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, ContextTypes

load_dotenv()

# .env faylidan ikkala botning tokenlarini xavfsiz o'qish
PRIMARY_TOKEN = os.getenv("BOT_TOKEN_PRIMARY")
BACKUP_TOKEN = os.getenv("BOT_TOKEN_BACKUP")

MINI_APP_URL = "https://127.0.0.1:8000"  # Kelajakda index.html shu yerda ochiladi

async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    user_name = update.effective_user.first_name
    welcome_text = (
        f"👋 Salom, {user_name}! \n\n"
        f"🚀 EduUp AI Academy global raqamli ekotizimiga xush kelibsiz!\n"
        f"Biz DeepSeek, Qwen va GPT-4o kabi dunyoning barcha eng kuchli sun'iy "
        f"intellektlarini bitta joyga jamlab, imtihon ballaringizni cho'qqiga ko'taramiz.\n\n"
        f"👇 Darslarni boshlash va 4 ta siklli diagnostik imtihondan o'tish uchun "
        f"pastdagi 'EduUp Mini App' ko'k tugmasini bosing:"
    )
    
    keyboard = [[InlineKeyboardButton(text="📱 EduUp Mini App", web_app=WebAppInfo(url=MINI_APP_URL))]]
    reply_markup = InlineKeyboardMarkup(keyboard)
    await update.message.reply_text(text=welcome_text, reply_markup=reply_markup, parse_mode="Markdown")

async def launch_instance(token: str, name: str):
    if not token or "eduup" in token: return
    app_instance = Application.builder().token(token).build()
    app_instance.add_handler(CommandHandler("start", start_command))
    await app_instance.initialize()
    await app_instance.start()
    await app_instance.updater.start_polling()
    print(f"✅ {name} Telegram tarmoqlarida muvaffaqiyatli ishga tushdi!")

async def main():
    print("🤖 EduUp AI dual-bot va barcha xalqaro AI platformalari yuklanmoqda...")
    await asyncio.gather(
        launch_instance(PRIMARY_TOKEN, "ASOSIY_BOT (@eduup_app_bot)"),
        launch_instance(BACKUP_TOKEN, "ZAXIRA_BOT (@eduupai_bot)")
    )
    while True: await asyncio.sleep(3600 )
if __name__ == "__main__":
    asyncio.run(main())