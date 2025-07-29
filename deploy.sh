#!/bin/bash

# Vietnamese TTS Next.js Deployment Script
# This script helps deploy the Next.js application to Vercel

set -e

echo "🚀 Vietnamese TTS Next.js Deployment Script"
echo "==========================================="

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if Next.js project
if ! grep -q "next" package.json; then
    echo "❌ Error: This doesn't appear to be a Next.js project."
    exit 1
fi

echo "✅ Verified Next.js project structure"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Type check
echo "🔍 Running type check..."
npx tsc --noEmit

# Build the project
echo "🏗️  Building the project..."
npm run build

echo "✅ Build completed successfully!"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "⚠️  Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
echo ""
echo "Make sure you have set the following environment variables in Vercel:"
echo "- GOOGLE_CLOUD_PROJECT_ID"
echo "- GOOGLE_CLOUD_PRIVATE_KEY_ID"
echo "- GOOGLE_CLOUD_PRIVATE_KEY"
echo "- GOOGLE_CLOUD_CLIENT_EMAIL"
echo "- GOOGLE_CLOUD_CLIENT_ID"
echo "- GOOGLE_CLOUD_CLIENT_X509_CERT_URL"
echo "- ELEVENLABS_API_KEY"
echo "- NEXT_PUBLIC_APP_URL"
echo ""

read -p "Have you set all environment variables in Vercel dashboard? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Deploying to Vercel..."
    vercel --prod
    echo ""
    echo "🎉 Deployment completed!"
    echo "Your Vietnamese TTS application is now live!"
else
    echo "❌ Please set up environment variables in Vercel dashboard first:"
    echo "   1. Go to https://vercel.com/dashboard"
    echo "   2. Select your project"
    echo "   3. Go to Settings > Environment Variables"
    echo "   4. Add all required environment variables"
    echo "   5. Run this script again"
fi

echo ""
echo "📚 Post-deployment checklist:"
echo "- Test text-to-speech functionality"
echo "- Test voice cloning feature"
echo "- Verify all API integrations work"
echo "- Check responsive design on mobile"
echo "- Test error handling and edge cases"
echo ""
echo "🎊 Vietnamese TTS deployment complete!"