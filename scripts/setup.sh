#!/bin/bash

# Vietnamese TTS Application Setup Script
echo "🎤 Setting up Vietnamese TTS Application..."

# Check for Python 3.11+
echo "📋 Checking Python version..."
if command -v python3.13 &> /dev/null; then
    PYTHON_CMD="python3.13"
elif command -v python3.12 &> /dev/null; then
    PYTHON_CMD="python3.12"
elif command -v python3.11 &> /dev/null; then
    PYTHON_CMD="python3.11"
else
    echo "❌ Python 3.11+ required but not found"
    exit 1
fi

echo "✅ Using $PYTHON_CMD"

# Check for Node.js 18+
echo "📋 Checking Node.js version..."
NODE_VERSION=$(node --version 2>/dev/null | cut -d'v' -f2 | cut -d'.' -f1)
if [ -z "$NODE_VERSION" ] || [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ required"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Setup backend
echo "🐍 Setting up backend..."
cd backend

if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    $PYTHON_CMD -m venv venv
fi

echo "Installing Python dependencies..."
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements-basic.txt
pip install -r requirements-audio.txt
pip install pydantic-settings

echo "✅ Backend setup complete"

# Setup frontend
echo "⚛️  Setting up frontend..."
cd ../frontend

if [ ! -d "node_modules" ]; then
    echo "Installing Node.js dependencies..."
    npm install
fi

echo "✅ Frontend setup complete"

# Create environment files
echo "📝 Creating environment files..."
cd ..

if [ ! -f "backend/.env" ]; then
    cat > backend/.env << EOL
# Backend Environment Variables
PROJECT_NAME="Vietnamese TTS API"
VERSION="1.0.0"
MAX_TEXT_LENGTH=10000
DEFAULT_VOICE="gtts_vi"
EOL
    echo "✅ Created backend/.env"
fi

if [ ! -f "frontend/.env.local" ]; then
    cat > frontend/.env.local << EOL
# Frontend Environment Variables
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME="Vietnamese TTS"
EOL
    echo "✅ Created frontend/.env.local"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📚 Next steps:"
echo "1. Start the backend: ./scripts/start-dev.sh backend"
echo "2. Start the frontend: ./scripts/start-dev.sh frontend"
echo "3. Open http://localhost:3000 in your browser"
echo ""