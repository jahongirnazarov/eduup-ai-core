@echo off
echo 🚀 Starting Lightweight Telegram Bot...
echo.

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install minimal dependencies
echo Installing minimal dependencies...
pip install python-telegram-bot --quiet

REM Set environment variables
set TELEGRAM_BOT_TOKEN=%1

if "%TELEGRAM_BOT_TOKEN%"=="" (
    echo ERROR: Please provide Telegram Bot Token
    echo Usage: start_lite_bot.bat YOUR_BOT_TOKEN
    pause
    exit /b 1
)

REM Start the lightweight bot
echo Starting bot...
python telegram\bot_lite.py

pause
