@echo off
REM EduUp Imperial Modular Architecture - Startup Script
REM This script starts the FastAPI server with all modular components

echo ========================================
echo EduUp Global AI Academy
echo Imperial Modular Architecture
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8 or higher
    pause
    exit /b 1
)

REM Check if required packages are installed
echo Checking dependencies...
python -c "import fastapi" >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing dependencies...
    pip install -r requirements.txt
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Start the server
echo.
echo Starting EduUp Imperial Modular Architecture...
echo Server will be available at: http://localhost:8000
echo Press CTRL+C to stop the server
echo.

python main_modular.py

pause
