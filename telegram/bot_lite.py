# -*- coding: utf-8 -*-
"""
🚀 LIGHTWEIGHT TELEGRAM BOT
Optimized for fast startup and low memory usage on all devices
"""
import os
import sys
import asyncio
import logging
from pathlib import Path
from typing import Optional, Dict, Any
from functools import lru_cache

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Import telegram bot at module level for type hints
try:
    from telegram import Update
    from telegram.ext import (
        Application,
        CommandHandler,
        MessageHandler,
        CallbackQueryHandler,
        filters,
        ContextTypes
    )
    TELEGRAM_AVAILABLE = True
except ImportError:
    TELEGRAM_AVAILABLE = False
    Update = None
    Application = None
    CommandHandler = None
    MessageHandler = None
    CallbackQueryHandler = None
    filters = None
    ContextTypes = None
    logger.warning("python-telegram-bot not available")


# ============================================================================
# LIGHTWEIGHT BOT HANDLERS
# ============================================================================

class LiteBotHandlers:
    """Optimized bot handlers with caching"""
    
    def __init__(self):
        self._cache = {}
    
    @lru_cache(maxsize=1000)
    def get_welcome_message(self, user_id: int) -> str:
        """Cached welcome message"""
        return (
            "🚀 *EduUp AI Academy* ga xush kelibsiz!\n\n"
            "📚 *Xususiyatlar:*\n"
            "• AI o'qituvchi\n"
            "• IELTS/DTM tayyorlash\n"
            "• Matematika mashqlari\n"
            "• Progress tracking\n\n"
            "🎯 Boshlash uchun /start bosing"
        )
    
    async def start_command(self, update, context) -> None:
        """Optimized start command"""
        user_id = update.effective_user.id
        message = self.get_welcome_message(user_id)
        
        await update.message.reply_text(
            message,
            parse_mode='Markdown',
            disable_web_page_preview=True
        )
    
    async def help_command(self, update, context) -> None:
        """Lightweight help command"""
        help_text = (
            "📖 *Yordam:*\n\n"
            "/start - Boshlash\n"
            "/help - Yordam\n"
            "/profile - Profil\n"
            "/courses - Kurslar\n"
            "/exams - Imtihonlar\n"
            "/miniapp - Mini App ochish"
        )
        await update.message.reply_text(help_text, parse_mode='Markdown')
    
    async def button_callback(self, update, context) -> None:
        """Optimized button handler"""
        query = update.callback_query
        await query.answer()
        
        data = query.data
        if data == "courses":
            await query.edit_message_text("📚 Kurslar tez orada...")
        elif data == "exams":
            await query.edit_message_text("🎯 Imtihonlar tez orada...")
        elif data == "profile":
            await query.edit_message_text("👤 Profil tez orada...")


# ============================================================================
# LIGHTWEIGHT BOT APPLICATION
# ============================================================================

class LiteTelegramBot:
    """Lightweight Telegram bot optimized for all devices"""
    
    def __init__(self, token: Optional[str] = None):
        self.token = token or os.getenv('TELEGRAM_BOT_TOKEN')
        self.handlers = LiteBotHandlers()
        self.application = None
    
    async def initialize(self) -> bool:
        """Initialize bot with lazy loading"""
        if not self.token:
            logger.error("TELEGRAM_BOT_TOKEN not found")
            return False
        
        if not TELEGRAM_AVAILABLE:
            logger.error("python-telegram-bot not available")
            return False
        
        try:
            # Build application with optimized settings
            self.application = (
                Application.builder()
                .token(self.token)
                .build()
            )
            
            # Register handlers
            self.application.add_handler(CommandHandler("start", self.handlers.start_command))
            self.application.add_handler(CommandHandler("help", self.handlers.help_command))
            self.application.add_handler(CallbackQueryHandler(self.handlers.button_callback))
            
            logger.info("✅ Lite Telegram Bot initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"❌ Bot initialization failed: {e}")
            return False
    
    async def start(self) -> None:
        """Start the bot"""
        if not self.application:
            logger.error("Application not initialized")
            return
        
        try:
            logger.info("🚀 Starting Lite Telegram Bot...")
            await self.application.initialize()
            await self.application.start()
            await self.application.run_polling(
                allowed_updates=Update.ALL_TYPES,
                drop_pending_updates=True
            )
        except Exception as e:
            logger.error(f"❌ Bot failed to start: {e}")
    
    async def stop(self) -> None:
        """Stop the bot gracefully"""
        if self.application:
            logger.info("🛑 Stopping Lite Telegram Bot...")
            await self.application.updater.stop()
            await self.application.stop()
            await self.application.shutdown()


# ============================================================================
# MAIN ENTRY POINT
# ============================================================================

async def main():
    """Main entry point"""
    bot = LiteTelegramBot()
    
    if await bot.initialize():
        try:
            await bot.start()
        except KeyboardInterrupt:
            logger.info("👋 Bot stopped by user")
        finally:
            await bot.stop()
    else:
        logger.error("❌ Failed to initialize bot")


if __name__ == "__main__":
    asyncio.run(main())
