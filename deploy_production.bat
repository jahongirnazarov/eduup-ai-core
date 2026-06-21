@echo off
REM EduUp AI - Production Deployment Script for eduupai.uz
REM This script prepares and deploys the site for production

echo ========================================
echo EduUp AI - Production Deployment
echo Domain: eduupai.uz
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

REM Install dependencies if needed
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

REM Kill any existing process on port 8000
echo Checking port 8000...
netstat -ano | findstr :8000 >nul 2>&1
if %errorlevel% equ 0 (
    echo Port 8000 is in use, killing process...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000') do taskkill /F /PID %%a >nul 2>&1
    timeout /t 2 >nul
)

REM Start the server
echo.
echo Starting EduUp AI Platform...
echo Domain: eduupai.uz
echo URL: http://localhost:8000
echo Press CTRL+C to stop the server
echo.

python main.py

pause
