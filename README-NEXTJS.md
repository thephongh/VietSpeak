# 🇻🇳 Vietnamese TTS - Next.js Edition

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
   git checkout nextjs-cloud-tts
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
   - Create service account with Cloud Speech Client role
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

## 📋 API Reference

### Text-to-Speech Endpoints

#### `POST /api/tts/synthesize`

Generate speech using Google Cloud TTS

```json
{
  "text": "Xin chào Việt Nam!",
  "language": "vi",
  "voice": "vi-VN-Neural2-A",
  "speed": 1.0,
  "pitch": 0
}
```

#### `GET /api/tts/voices`

Get available Google Cloud voices

```json
{
  "voices": [
    {
      "id": "vi-VN-Neural2-A",
      "name": "Vietnamese Neural2 Female",
      "language": "vi",
      "type": "Neural2"
    }
  ]
}
```

### Voice Cloning Endpoints

#### `POST /api/voices/clone`

Create custom voice using ElevenLabs

```javascript
const formData = new FormData();
formData.append("name", "My Voice");
formData.append("description", "Custom Vietnamese voice");
formData.append("audio_file", audioFile);
```

#### `POST /api/voices/synthesize`

Generate speech with cloned voice

```json
{
  "text": "Hello from my cloned voice!",
  "voice_id": "cloned-voice-id",
  "stability": 0.5,
  "similarity_boost": 0.8
}
```

## 🎨 Design System

### Color Palette

- **Primary**: Vietnam flag inspired red-gold gradient
- **Secondary**: Clean whites and soft grays
- **Accent**: Subtle blues and greens for interactions

### Typography

- **Display**: Inter with weighted hierarchy
- **Body**: Clean, readable font stack
- **Code**: JetBrains Mono for technical elements

### Components

- **Glass Cards**: Translucent backgrounds with blur effects
- **Smooth Animations**: Framer Motion powered transitions
- **Apple-style Buttons**: Subtle shadows and hover states
- **Modern Controls**: Custom sliders and inputs

## 🌐 Deployment

### Vercel (Recommended)

1. **Deploy to Vercel**

   ```bash
   npm run build
   npx vercel --prod
   ```

2. **Configure Environment Variables**

   - Add all .env variables in Vercel dashboard
   - Ensure GOOGLE_CLOUD_PRIVATE_KEY is properly escaped

3. **Custom Domain** (Optional)
   - Add domain in Vercel dashboard
   - Configure DNS records

### Other Platforms

- **Netlify**: Use `npm run build` and deploy `dist/` folder
- **Railway**: Connect GitHub repo with automatic deployments
- **Digital Ocean**: Use App Platform with Node.js buildpack

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
- **Total Estimated Cost**: $0-50/month for most applications

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

## 🆘 Support

- **Documentation**: Check this README and code comments
- **Issues**: Create GitHub issue with reproduction steps
- **Discussions**: Use GitHub Discussions for questions

## 🎯 Roadmap

- [ ] **Audio Effects**: Reverb, echo, and audio processing
- [ ] **Batch Processing**: Multiple text inputs at once
- [ ] **Voice Mixing**: Combine multiple voices
- [ ] **SSML Support**: Advanced speech markup
- [ ] **Mobile Apps**: React Native versions
- [ ] **API Webhooks**: Integration with external services

---

Built with ❤️ using Next.js, Google Cloud TTS, and ElevenLabs

**Vietnamese TTS** - Making Vietnamese speech synthesis accessible and beautiful.
