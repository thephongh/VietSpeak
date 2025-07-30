# 🐳 Docker Setup Guide

This guide explains how to run the Vietnamese TTS application using Docker.

## 📋 Prerequisites

- Docker 20.10+ installed and running
- Docker Compose v2.0+ (optional)
- Environment variables configured (see `.env.example`)

## 🚀 Quick Start

### 1. Build the Docker Image

```bash
# Using npm script (recommended)
npm run docker:build

# Or manually
docker build -t vietnamese-tts:latest .
```

### 2. Run the Container

```bash
# Using npm script with environment file
npm run docker:run

# Or manually
docker run -p 3000:3000 --env-file .env.local vietnamese-tts:latest
```

### 3. Access the Application

Open your browser and navigate to: http://localhost:3000

## 🔧 Docker Compose (Recommended)

### Basic Usage

```bash
# Start the application
npm run docker:compose

# Or with rebuild
npm run docker:compose:build

# Stop the application
docker-compose down
```

### Production Setup with Nginx

```bash
# Start with production profile (includes nginx)
docker-compose --profile production up
```

## 🌍 Environment Variables

Create a `.env.local` file with your configuration:

```env
# Google Cloud TTS
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_PRIVATE_KEY_ID=your-key-id
GOOGLE_CLOUD_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_CLOUD_CLIENT_EMAIL=service-account@project.iam.gserviceaccount.com
GOOGLE_CLOUD_CLIENT_ID=your-client-id
GOOGLE_CLOUD_CLIENT_X509_CERT_URL=your-cert-url

# ElevenLabs (for voice cloning)
ELEVENLABS_API_KEY=your-elevenlabs-api-key

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🔍 Health Check

The Docker container includes a health check endpoint:

```bash
# Check if the container is healthy
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "services": {
    "google-cloud-tts": {"status": "configured"},
    "elevenlabs": {"status": "configured"}
  }
}
```

## 📊 Container Management

### View Running Containers
```bash
docker ps
```

### View Logs
```bash
# Docker Compose
docker-compose logs -f

# Direct container
docker logs vietnamese-tts
```

### Stop Containers
```bash
# Docker Compose
docker-compose down

# Direct container
docker stop vietnamese-tts
```

### Remove Containers and Images
```bash
# Clean up everything
npm run docker:clean

# Or manually
docker-compose down --rmi all --volumes --remove-orphans
```

## 🏗️ Build Options

### Development Build
```bash
docker build --target builder -t vietnamese-tts:dev .
```

### Custom Tag
```bash
./scripts/docker-build.sh v1.0.0
```

### Multi-platform Build
```bash
docker buildx build --platform linux/amd64,linux/arm64 -t vietnamese-tts:latest .
```

## 🔒 Security Considerations

1. **Environment Variables**: Never commit `.env.local` to version control
2. **API Keys**: Store sensitive keys in Docker secrets or external key management
3. **Network**: Use custom networks for production deployments
4. **Updates**: Regularly update the base Node.js image

## 🐛 Troubleshooting

### Container Won't Start
```bash
# Check logs
docker logs vietnamese-tts

# Check if port is already in use
lsof -i :3000

# Verify environment variables
docker exec vietnamese-tts env | grep GOOGLE_CLOUD
```

### Build Failures
```bash
# Clear Docker cache
docker builder prune

# Rebuild without cache
docker build --no-cache -t vietnamese-tts:latest .
```

### Permission Issues
```bash
# Fix file permissions
chmod +x scripts/docker-build.sh

# Run with proper user
docker run --user $(id -u):$(id -g) vietnamese-tts:latest
```

## 📈 Production Deployment

### Using Docker Compose with SSL

1. Configure SSL certificates in `./ssl/` directory
2. Update `nginx.conf` for your domain
3. Run with production profile:

```bash
docker-compose --profile production up -d
```

### Environment Variables for Production

```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Health Monitoring

The container includes health checks that can be monitored by orchestration tools:

```bash
# Check health status
docker inspect --format='{{.State.Health.Status}}' vietnamese-tts
```

## 🔄 Updates and Maintenance

### Update the Application
```bash
# Pull latest code
git pull origin main

# Rebuild and restart
npm run docker:compose:build
```

### Backup Data (if applicable)
```bash
# Create volume backup
docker run --rm -v tts-vietnam_data:/data -v $(pwd):/backup alpine tar czf /backup/backup.tar.gz /data
```

---

For more information, see the main [README.md](../README.md) or visit our documentation.