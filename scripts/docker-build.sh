#!/bin/bash

# Vietnamese TTS Docker Build Script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🐳 Building Vietnamese TTS Docker Image${NC}"
echo "============================================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Set image name and tag
IMAGE_NAME="vietnamese-tts"
TAG="${1:-latest}"
FULL_IMAGE_NAME="${IMAGE_NAME}:${TAG}"

echo -e "${YELLOW}📦 Building image: ${FULL_IMAGE_NAME}${NC}"

# Build the Docker image
docker build -t "${FULL_IMAGE_NAME}" .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Docker image built successfully!${NC}"
    echo -e "${GREEN}📋 Image details:${NC}"
    docker images | grep "${IMAGE_NAME}"
    
    echo ""
    echo -e "${GREEN}🚀 To run the container:${NC}"
    echo "   docker run -p 3000:3000 --env-file .env.local ${FULL_IMAGE_NAME}"
    echo ""
    echo -e "${GREEN}🐙 Or using docker-compose:${NC}"
    echo "   docker-compose up"
    echo ""
    echo -e "${GREEN}🌐 The app will be available at: http://localhost:3000${NC}"
else
    echo -e "${RED}❌ Docker build failed!${NC}"
    exit 1
fi