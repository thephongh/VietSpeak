#!/bin/bash

# Vietnamese TTS Build Script
echo "🔨 Building Vietnamese TTS Application..."

# Build frontend
echo "⚛️  Building frontend..."
cd frontend
npm run build
if [ $? -eq 0 ]; then
    echo "✅ Frontend build successful"
else
    echo "❌ Frontend build failed"
    exit 1
fi
cd ..

# Test backend
echo "🐍 Testing backend..."
cd backend
source venv/bin/activate
python -c "from app.main import app; print('✅ Backend imports successful')"
if [ $? -eq 0 ]; then
    echo "✅ Backend validation successful"
else
    echo "❌ Backend validation failed"
    exit 1
fi
cd ..

echo ""
echo "🎉 Build complete!"
echo ""
echo "📦 Build artifacts:"
echo "   Frontend: frontend/.next/"
echo "   Backend: backend/app/"
echo ""