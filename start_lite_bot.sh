#!/bin/bash

echo "🚀 Starting Lightweight Telegram Bot..."
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install minimal dependencies
echo "Installing minimal dependencies..."
pip install python-telegram-bot --quiet

# Set environment variables
export TELEGRAM_BOT_TOKEN=$1

if [ -z "$TELEGRAM_BOT_TOKEN" ]; then
    echo "ERROR: Please provide Telegram Bot Token"
    echo "Usage: ./start_lite_bot.sh YOUR_BOT_TOKEN"
    exit 1
fi

# Start the lightweight bot
echo "Starting bot..."
python telegram/bot_lite.py
