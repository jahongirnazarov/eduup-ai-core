# MALIKA 3D Platform - Backend API

FastAPI-based backend for the MALIKA 3D educational platform.

## Installation

1. Install Python 3.8 or higher
2. Install dependencies:
```bash
pip install -r requirements.txt
```

## Running the Server

Development mode:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Production mode:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

## API Endpoints

### Health Check
- `GET /` - Health check endpoint

### Lessons
- `GET /api/lessons` - Get all lessons
- `GET /api/lessons/{lesson_id}` - Get specific lesson
- `POST /api/lessons` - Create new lesson
- `PUT /api/lessons/{lesson_id}` - Update lesson
- `DELETE /api/lessons/{lesson_id}` - Delete lesson

### User Progress
- `POST /api/progress` - Save user progress
- `GET /api/progress/{user_id}/{lesson_id}` - Get specific progress
- `GET /api/progress/{user_id}` - Get all user progress

### Feedback
- `POST /api/feedback` - Submit feedback
- `GET /api/feedback` - Get all feedbacks
- `DELETE /api/feedback/{feedback_id}` - Delete feedback

### Analytics
- `GET /api/analytics` - Get platform analytics
- `PUT /api/analytics` - Update analytics

### Configuration
- `GET /api/config/subjects` - Get available subjects
- `GET /api/config/levels` - Get available levels

### AI (Stub)
- `POST /api/ai/generate` - Generate content (WebLLM pending)
- `POST /api/ai/chat` - Chat with AI (WebLLM pending)

## API Documentation

Once the server is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Architecture

- **Framework**: FastAPI
- **CORS**: Enabled for all origins (configure for production)
- **Static Files**: Serves frontend from `/static`
- **Data Storage**: In-memory (upgrade to database for production)

## Future Enhancements

- Database integration (PostgreSQL/MongoDB)
- Authentication & Authorization
- Real-time WebSocket support
- WebLLM integration for AI endpoints
- File upload for 3D models
- Rate limiting
- Caching layer
- Logging and monitoring
