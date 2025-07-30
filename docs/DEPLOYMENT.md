# 🚀 Deployment Guide

This guide covers deploying the Vietnamese TTS application to various platforms.

## 🌐 Vercel Deployment (Recommended)

### Prerequisites
- Vercel account
- GitHub repository (for automatic deployments)
- Environment variables configured

### Quick Deploy

1. **Deploy Button (Fastest)**
   ```
   https://vercel.com/new/git/external?repository-url=https://github.com/yourusername/tts-vietnam
   ```

2. **Vercel CLI**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel --prod
   ```

3. **GitHub Integration**
   - Connect your repository to Vercel
   - Push to main branch for automatic deployments

### Environment Variables Setup

In your Vercel dashboard, add these environment variables:

```env
# Google Cloud TTS Configuration
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_PRIVATE_KEY_ID=your-private-key-id
GOOGLE_CLOUD_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_CONTENT\n-----END PRIVATE KEY-----\n"
GOOGLE_CLOUD_CLIENT_EMAIL=your-service-account@project-id.iam.gserviceaccount.com
GOOGLE_CLOUD_CLIENT_ID=your-client-id
GOOGLE_CLOUD_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/your-service-account%40project-id.iam.gserviceaccount.com

# ElevenLabs API (for voice cloning)
ELEVENLABS_API_KEY=your-elevenlabs-api-key

# Application URL (set to your Vercel domain)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### Domain Configuration

1. **Custom Domain** (Optional)
   - Go to your Vercel project settings
   - Add your custom domain
   - Configure DNS records as instructed

2. **SSL Certificate**
   - Automatically provided by Vercel
   - Supports custom domains

### Build Configuration

The app is already configured for Vercel with:
- `vercel.json` configuration file
- Optimized for serverless functions
- Automatic deployments on git push

## 🐳 Docker Deployment

### Docker Hub
```bash
# Build and tag
docker build -t yourusername/vietnamese-tts:latest .

# Push to Docker Hub
docker push yourusername/vietnamese-tts:latest

# Pull and run on any server
docker pull yourusername/vietnamese-tts:latest
docker run -p 3000:3000 --env-file .env.local yourusername/vietnamese-tts:latest
```

### DigitalOcean App Platform
```yaml
# app.yaml
name: vietnamese-tts
services:
- name: web
  source_dir: /
  github:
    repo: yourusername/tts-vietnam
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: GOOGLE_CLOUD_PROJECT_ID
    value: your-project-id
    type: SECRET
  # ... add other environment variables
```

### Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway link
railway up
```

## ☁️ AWS Deployment

### AWS Lambda + API Gateway
```bash
# Install Serverless Framework
npm install -g serverless

# Create serverless.yml configuration
# Deploy
serverless deploy
```

### AWS ECS (Docker)
```bash
# Build and push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin your-account.dkr.ecr.us-east-1.amazonaws.com

docker build -t vietnamese-tts .
docker tag vietnamese-tts:latest your-account.dkr.ecr.us-east-1.amazonaws.com/vietnamese-tts:latest
docker push your-account.dkr.ecr.us-east-1.amazonaws.com/vietnamese-tts:latest
```

## 🏗️ Self-Hosted Options

### Traditional VPS (Ubuntu/CentOS)
```bash
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone and setup
git clone https://github.com/yourusername/tts-vietnam.git
cd tts-vietnam
npm install
npm run build

# Setup environment
cp .env.example .env.local
# Edit .env.local with your values

# Install PM2 for process management
npm install -g pm2
pm2 start npm --name "vietnamese-tts" -- start
pm2 startup
pm2 save
```

### Nginx Reverse Proxy
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔒 Security Considerations

### Environment Variables
- Never commit sensitive keys to version control
- Use platform-specific secret management (Vercel Environment Variables, AWS Secrets Manager, etc.)
- Rotate API keys regularly

### CORS Configuration
- Update CORS origins for production domains
- Remove wildcard (*) origins in production

### Rate Limiting
- Implement rate limiting for API endpoints
- Monitor usage to prevent abuse

### SSL/TLS
- Always use HTTPS in production
- Modern platforms (Vercel, Netlify) provide SSL automatically

## 📊 Monitoring & Analytics

### Health Checks
All deployments include a health check endpoint:
```
GET /api/health
```

### Logging
- Enable structured logging for production
- Use platform-specific logging (Vercel Logs, CloudWatch, etc.)

### Performance Monitoring
- Monitor API response times
- Track error rates
- Set up alerts for downtime

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-args: '--prod'
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 🧪 Testing Before Deployment

### Pre-deployment Checklist
- [ ] All environment variables configured
- [ ] Build completes successfully (`npm run build`)
- [ ] Health check endpoint responds correctly
- [ ] TTS functionality works with test text
- [ ] Voice cloning feature operates (if ElevenLabs configured)
- [ ] UI displays correctly on mobile and desktop
- [ ] API rate limiting configured
- [ ] Error handling implemented

### Testing Commands
```bash
# Test build
npm run build

# Test production locally
npm start

# Test health endpoint
curl http://localhost:3000/api/health

# Run linting
npm run lint
```

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for TypeScript errors

2. **API Errors**
   - Verify environment variables are set correctly
   - Check API quotas and billing
   - Validate service account permissions

3. **Performance Issues**
   - Enable caching where appropriate
   - Optimize bundle size
   - Use CDN for static assets

### Getting Help
- Check the [main README](../README.md) for setup instructions
- Review [Docker documentation](./DOCKER.md) for containerized deployments
- Open an issue in the GitHub repository

---

Choose the deployment method that best fits your needs. Vercel is recommended for its simplicity and excellent Next.js integration.