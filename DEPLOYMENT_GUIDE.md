# EduUp Imperial Modular Architecture - Deployment Guide

## 🚀 Quick Start

### Windows
```bash
start.bat
```

### Linux/Mac
```bash
chmod +x start.sh
./start.sh
```

The server will start at: **http://localhost:8000**

---

## 📋 Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- 4GB RAM minimum
- 10GB disk space

---

## 🔧 Installation

### 1. Clone or Download the Project
```bash
cd "edu up ai  startap"
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables
Edit `.env` file with your settings:
```env
ENVIRONMENT=development
DEBUG=true
HOST=0.0.0.0
PORT=8000
SECRET_KEY=your-secret-key-change-in-production
DATABASE_PATH=eduup_core.db

# AI API Keys (Optional - for AI features)
GROQ_API_KEYS=your-groq-api-key
OPENAI_API_KEYS=your-openai-api-key
GOOGLE_API_KEYS=your-google-api-key

# Telegram Bot Token (Optional - for Telegram integration)
TELEGRAM_BOT_TOKENS=your-telegram-bot-token

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

---

## 🌐 Access Points

### Web Application
- **Main Website**: http://localhost:8000
- **Health Check**: http://localhost:8000/health
- **API Settings**: http://localhost:8000/api/v1/settings

### PWA (Progressive Web App)
- **PWA Manifest**: http://localhost:8000/api/v1/pwa/manifest
- **Service Worker**: http://localhost:8000/api/v1/pwa/service-worker
- **Install**: Visit http://localhost:8000 and click "Install App" button

### Telegram Mini App
- **Mini App Config**: http://localhost:8000/api/v1/telegram/mini-app-config
- **Webhook**: http://localhost:8000/api/v1/telegram/webhook

---

## 🔑 API Endpoints

### AI Services
- `POST /api/v1/ai/query` - AI query with zero-hallucination verification
- `POST /api/v1/ai/math-solve` - Solve mathematical problems

### Education
- `POST /api/v1/education/ielts-score` - Score IELTS writing tasks
- `GET /api/v1/education/cambridge-blueprint/{exam_type}` - Get Cambridge exam blueprints
- `POST /api/v1/education/curriculum` - Generate curriculum

### Payments
- `POST /api/v1/payments/process` - Process payment notifications
- `GET /api/v1/payments/tax-savings` - Calculate tax savings
- `POST /api/v1/payments/installment-plan` - Calculate installment plans

### Multimodal
- `POST /api/v1/multimodal/intent` - Detect intent from text input

### WebSocket
- `WS /ws/olympiad/{student_id}` - Olympiad real-time sessions

---

## 📱 Platform Features

### Web Application
- ✅ Responsive design (mobile-first)
- ✅ PWA installable on desktop and mobile
- ✅ Offline capability with service worker
- ✅ Fast loading with aggressive caching

### Telegram Bot
- ✅ Bot commands (/start, /help, /courses, /exam, /profile, /support)
- ✅ Inline keyboard buttons
- ✅ Mini App integration
- ✅ Webhook support

### Telegram Mini App
- ✅ Full-featured web app inside Telegram
- ✅ Seamless user authentication
- ✅ Course browsing and enrollment
- ✅ Exam practice
- ✅ Payment processing

---

## 🔒 Security Features

- Post-quantum cryptography (Kyber-1024 simulation)
- Fixed-point accounting guard (28-digit precision)
- Volatile RAM cache ledger
- Cyber fortress shield
- Rate limiting
- CORS protection

---

## 💰 Payment Integration

- App Store tax bypass (30% savings)
- Uzum Nasiya installment plans
- Secure payment routing
- Escrow pipeline
- Tax-free distribution through Telegram Mini App

---

## 🐳 Docker Deployment

### Using Docker Compose
```bash
docker-compose up -d
```

### Manual Docker Build
```bash
docker build -t eduup-app .
docker run -p 8000:8000 eduup-app
```

---

## 📊 Monitoring

### Health Check
```bash
curl http://localhost:8000/health
```

### Logs
Check the console output for real-time logs.

---

## 🛠️ Troubleshooting

### Server Won't Start
1. Check Python version: `python --version`
2. Install dependencies: `pip install -r requirements.txt`
3. Check port 8000 is not in use

### AI Features Not Working
1. Configure API keys in `.env` file
2. Verify API keys are valid
3. Check internet connection

### Database Errors
1. Ensure `eduup_core.db` file exists
2. Check file permissions
3. Delete and recreate database if corrupted

### PWA Not Installing
1. Serve over HTTPS (required for PWA)
2. Check service worker is registered
3. Clear browser cache and retry

---

## 📝 Development Mode

To run in development mode with auto-reload:
```bash
python main_modular.py
```

The server will automatically reload when you make changes.

---

## 🚀 Production Deployment

### 1. Set Environment Variables
```env
ENVIRONMENT=production
DEBUG=false
SECRET_KEY=your-strong-secret-key
```

### 2. Use Production Server
```bash
uvicorn main_modular:app --host 0.0.0.0 --port 8000 --workers 4
```

### 3. Configure Reverse Proxy (Nginx)
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 4. Enable HTTPS
Use Let's Encrypt or your SSL certificate provider.

---

## 📞 Support

For issues or questions:
- Email: support@eduup.ai
- Telegram: @eduup_support
- Website: https://eduup.ai/support

---

## 🎉 Success!

Your EduUp Imperial Modular Architecture is now running!
- Web: http://localhost:8000
- Telegram Bot: Configure your bot token in .env
- PWA: Install from the website

**Both bot and site are fully operational!** 🚀
