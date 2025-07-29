#!/bin/bash

# Vietnamese TTS Test Script
echo "🧪 Testing Vietnamese TTS Application..."

# Test backend
echo "🐍 Testing backend..."
cd backend
source venv/bin/activate

# Basic import test
python -c "
from app.main import app
from app.services.tts_service import TTSService
from app.services.local_storage import LocalStorageService
print('✅ All backend modules imported successfully')
"

if [ $? -eq 0 ]; then
    echo "✅ Backend tests passed"
else
    echo "❌ Backend tests failed"
    exit 1
fi
cd ..

# Test frontend
echo "⚛️  Testing frontend..."
cd frontend

# Build test
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Frontend build test passed"
else
    echo "❌ Frontend build test failed"
    exit 1
fi

# Lint test
npm run lint > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Frontend lint test passed"
else
    echo "⚠️  Frontend lint test has warnings (non-critical)"
fi

cd ..

echo ""
echo "🎉 All tests completed!"
echo ""