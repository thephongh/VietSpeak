# 🇻🇳 Vietnamese TTS - AI-Powered Text-to-Speech

A modern, beautiful Vietnamese Text-to-Speech application built with Next.js 14, featuring Google Cloud TTS integration and ElevenLabs voice cloning capabilities.

## ✨ Features

### 🎯 Core Features
- **High-Quality Vietnamese TTS** - Google Cloud Neural2 voices
- **Voice Cloning** - Upload audio samples to create custom voices via ElevenLabs
- **Multi-Language Support** - Vietnamese, English, and French
- **Real-time Audio Processing** - Microphone recording and file upload
- **Beautiful Apple-like UI** - Modern glassmorphism design with smooth animations

### 🎛️ Advanced Controls
- **Voice Speed Control** - Adjust speech rate from 0.25x to 4x
- **Pitch Adjustment** - Fine-tune voice pitch (-20 to +20)
- **Stability & Similarity** - Advanced ElevenLabs voice settings
- **Text Processing** - Auto-clean markdown, formatting, and special characters
- **Audio Export** - Download generated speech as MP3/WAV files

### 📱 User Experience
- **Responsive Design** - Works perfectly on mobile and desktop
- **Progressive Web App** - Installable as native app
- **Real-time Feedback** - Live character count, duration estimates
- **Voice Library** - Manage and organize custom voices
- **Audio History** - Track and replay previous generations

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Google Cloud TTS API credentials
- ElevenLabs API key (for voice cloning)

### Installation

1. **Clone and setup**
   ```bash
   git clone <repository-url>
   cd tts-vietnam
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API credentials
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   ```
   http://localhost:3000
   ```

## 🔧 Configuration

### Google Cloud TTS Setup

1. **Create Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create new project or select existing
   - Enable Text-to-Speech API

2. **Create Service Account**
   - Navigate to IAM & Admin > Service Accounts
   - Create service account with Text-to-Speech Client role
   - Download JSON key file

3. **Configure Environment Variables**
   ```env
   GOOGLE_CLOUD_PROJECT_ID=your-project-id
   GOOGLE_CLOUD_PRIVATE_KEY_ID=key-id-from-json
   GOOGLE_CLOUD_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   GOOGLE_CLOUD_CLIENT_EMAIL=service-account@project.iam.gserviceaccount.com
   GOOGLE_CLOUD_CLIENT_ID=client-id-from-json
   GOOGLE_CLOUD_CLIENT_X509_CERT_URL=cert-url-from-json
   ```

### ElevenLabs Setup (Voice Cloning)

1. **Get API Key**
   - Sign up at [ElevenLabs](https://elevenlabs.io)
   - Go to Profile > API Keys
   - Generate new API key

2. **Configure Environment**
   ```env
   ELEVENLABS_API_KEY=your-api-key-here
   ```

## 🌐 Deployment

### 🚀 Vercel (Recommended)

1. **Quick Deploy**
   ```bash
   # Deploy to Vercel
   npm run build
   npx vercel --prod
   ```

2. **Environment Variables Setup**
   - Copy all variables from `.env.example` to Vercel dashboard
   - Set `NEXT_PUBLIC_APP_URL` to your Vercel domain

3. **One-Click Deploy**
   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/tts-vietnam)

### 🐳 Docker Deployment

```bash
# Build and run with Docker
npm run docker:build
npm run docker:run

# Or with docker-compose
npm run docker:compose
```

📖 **See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed deployment instructions**

## 💰 Cost Estimates

### Google Cloud TTS
- **Free Tier**: 1M characters/month (Neural2/WaveNet), 4M chars/month (Standard)
- **Paid**: $16/1M characters (Neural2), $4/1M characters (Standard)

### ElevenLabs
- **Free Tier**: 10K characters/month
- **Creator**: $5/month (30K characters)
- **Pro**: $22/month (100K characters)

### Hosting
- **Vercel**: Free for personal projects, $20/month for teams

## 🛡️ Security & Privacy

- **API Keys**: Stored securely in environment variables
- **CORS**: Configured for production domains only
- **Rate Limiting**: Built-in protection against abuse
- **Data Privacy**: Audio files processed in memory, not stored permanently

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ using Next.js, Google Cloud TTS, and ElevenLabs