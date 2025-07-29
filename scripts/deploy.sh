#!/bin/bash

# Vietnamese TTS Deployment Script
echo "🚀 Preparing Vietnamese TTS for deployment..."

# Run tests first
echo "🧪 Running tests..."
./scripts/test.sh
if [ $? -ne 0 ]; then
    echo "❌ Tests failed. Deployment aborted."
    exit 1
fi

# Build application
echo "🔨 Building application..."
./scripts/build.sh
if [ $? -ne 0 ]; then
    echo "❌ Build failed. Deployment aborted."
    exit 1
fi

# Create deployment package
echo "📦 Creating deployment package..."
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
PACKAGE_NAME="vietnamese-tts-$TIMESTAMP.tar.gz"

tar -czf "$PACKAGE_NAME" \
    --exclude='*/node_modules' \
    --exclude='*/venv' \
    --exclude='*/.next' \
    --exclude='*/storage' \
    --exclude='*/.git' \
    frontend/ backend/ scripts/ docs/ \
    README.md package.json

echo "✅ Deployment package created: $PACKAGE_NAME"

# Create deployment instructions
cat > "deploy-instructions-$TIMESTAMP.txt" << EOL
Vietnamese TTS Deployment Instructions
=====================================

Package: $PACKAGE_NAME
Created: $(date)

Deployment Steps:
1. Extract the package on the target server
2. Run ./scripts/setup.sh to install dependencies
3. Configure environment variables in:
   - backend/.env
   - frontend/.env.local
4. Start services with ./scripts/start-dev.sh both

System Requirements:
- Python 3.11+
- Node.js 18+
- At least 2GB RAM
- 5GB disk space

Port Configuration:
- Backend: 8000
- Frontend: 3000

Health Check Endpoints:
- Backend: http://localhost:8000/health
- Frontend: http://localhost:3000

EOL

echo "✅ Deployment instructions created: deploy-instructions-$TIMESTAMP.txt"
echo ""
echo "🎉 Deployment preparation complete!"
echo ""
echo "📋 Files created:"
echo "   - $PACKAGE_NAME"
echo "   - deploy-instructions-$TIMESTAMP.txt"
echo ""