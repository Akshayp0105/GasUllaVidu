# GasUllaVidu Safety AI Backend

This is the FastAPI backend for the GasUllaVidu Safety AI Assistant. It handles natural language queries about LPG safety using OpenAI's API.

## Features
- Natural language safety assistance
- Intent detection and safety level inference
- Streaming and non-streaming chat endpoints
- Knowledge base grounding for LPG safety in India

## Setup Instructions

### 1. Prerequisite
- Python 3.8+
- OpenAI API Key

### 2. Install Dependencies
Navigate to the `backend` directory and run:
```bash
pip install -r requirements.txt
```

### 3. Configuration
Copy `.env.example` to `.env` and fill in your OpenAI API Key:
```bash
cp .env.example .env
```

### 4. Run the Server
Start the FastAPI server:
```bash
uvicorn app.main:app --reload
```
The API will be available at `http://localhost:8000`. You can access the auto-generated documentation at `http://localhost:8000/docs`.

## Project Structure
- `app/main.py`: Main FastAPI application and endpoints.
- `app/assistant_domain.py`: Domain logic for intent detection, safety, and knowledge base.
- `requirements.txt`: Python dependencies.
