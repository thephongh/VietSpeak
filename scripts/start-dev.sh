#!/bin/bash

# Vietnamese TTS Development Server Starter
SERVICE=$1

if [ -z "$SERVICE" ]; then
    echo "Usage: $0 [backend|frontend|both]"
    echo ""
    echo "Examples:"
    echo "  $0 backend   - Start only the backend server"
    echo "  $0 frontend  - Start only the frontend server"
    echo "  $0 both      - Start both servers"
    exit 1
fi

start_backend() {
    echo "🐍 Starting backend server..."
    cd backend
    source venv/bin/activate
    python run.py &
    BACKEND_PID=$!
    echo "✅ Backend started (PID: $BACKEND_PID) at http://localhost:8000"
    cd ..
}

start_frontend() {
    echo "⚛️  Starting frontend server..."
    cd frontend
    npm run dev &
    FRONTEND_PID=$!
    echo "✅ Frontend started (PID: $FRONTEND_PID) at http://localhost:3000"
    cd ..
}

case $SERVICE in
    backend)
        start_backend
        wait
        ;;
    frontend)
        start_frontend
        wait
        ;;
    both)
        start_backend
        start_frontend
        echo ""
        echo "🎤 Vietnamese TTS servers are running:"
        echo "   Backend:  http://localhost:8000"
        echo "   Frontend: http://localhost:3000"
        echo ""
        echo "Press Ctrl+C to stop both servers"
        
        # Wait for both processes
        trap 'kill $BACKEND_PID $FRONTEND_PID 2>/dev/null' EXIT
        wait
        ;;
    *)
        echo "❌ Invalid service: $SERVICE"
        echo "Valid options: backend, frontend, both"
        exit 1
        ;;
esac