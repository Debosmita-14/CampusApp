# AI-Powered Campus Resource Management System

This project contains two primary applications:
1. **React Native (Expo) Frontend**: A mobile app for students to book rooms, browse events, check lost & found, and talk to an AI assistant.
2. **FastAPI Backend**: A highly performant python backend server holding mock RAG data, ready for integration with true LLM toolsets (via Google GenAI or others).

## Features Designed
- Home Screen (Dynamic dashboard design with custom gradients)
- Room Booking View (Live booking state representation)
- AI Chatbot View (Mock RAG responses handling campus requests)
- Event Registrations View (Calendar-lite interface)
- Lost & Found Feed (Tag-based card design)

## Setup Instructions

### 1. Backend (FastAPI)
The backend manages the endpoints that mobile uses to interact with the broader ecosystem, including the AI logic.
```bash
cd backend
python -m venv venv
# On windows:
venv\Scripts\Activate.ps1
# Install dependencies (already executed for you in background):
pip install fastapi uvicorn pydantic firebase-admin google-genai python-dotenv sentence-transformers faiss-cpu
# Run the development server:
uvicorn main:app --reload
```
API Documentation will be automatically generated and available at: http://localhost:8000/docs

### 2. Frontend (React Native via Expo)
The mobile frontend provides the interactive UI built on top of React Navigation.
```bash
cd frontend
# Start the expo server
npx expo start
```
Download "Expo Go" on your iOS or Android device, or use an emulator to run the application natively.

## Architecture & Styling
- **Tech Stack**: React Native, Python 3.10+, FastAPI.
- **Theming**: Tailored dark mode using 'Slate' and 'Indigo' color palettes (`#0f172a`, `#6366f1`) to give it a premium, focused appearance. Clean navigation flows via BottomTabs.
