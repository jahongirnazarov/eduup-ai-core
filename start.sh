#!/bin/bash
# EduUp Imperial Modular Architecture - Startup Script
# This script starts the FastAPI server with all modular components

echo "========================================"
echo "EduUp Global AI Academy"
echo "Imperial Modular Architecture"
echo "========================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python is not installed or not in PATH"
    echo "Please install Python 3.8 or higher"
    exit 1
fi

# Check if required packages are installed
echo "Checking dependencies..."
python3 -c "import fastapi" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "Installing dependencies..."
    pip3 install -r requirements.txt
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to install dependencies"
        exit 1
    fi
fi

# Start the server
echo ""
echo "Starting EduUp Imperial Modular Architecture..."
echo "Server will be available at: http://localhost:8000"
echo "Press CTRL+C to stop the server"
echo ""

python3 main_modular.py
