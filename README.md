# Vietnamese Text-to-Speech Application

A modern, AI-powered Vietnamese Text-to-Speech application with voice cloning capabilities, built with Next.js and FastAPI.

## 🎯 Current Status: Stage 1 Complete

**Foundation & Setup** has been successfully implemented with all core infrastructure in place.

### ✅ Completed Features

#### Frontend (Next.js 15 + TypeScript)
- ⚛️ Next.js 15 with App Router
- 🎨 Tailwind CSS 4 styling
- 🧩 ShadCN/UI component library
- 🔧 TypeScript configuration
- 📱 Responsive design foundation
- 🔗 API client for backend communication

#### Backend (FastAPI + Python 3.13)
- 🐍 FastAPI with modern Python 3.13
- 🎤 Basic TTS service using Google TTS (gTTS)
- 🔊 Audio processing with librosa and soundfile
- 📁 Local file storage system
- 🌐 CORS configuration for frontend integration
- 📋 RESTful API endpoints

#### Infrastructure
- 🗂️ Complete project structure following best practices
- 📜 Development scripts for easy setup and deployment
- 🔄 Cross-platform compatibility (optimized for macOS)
- 📊 Health monitoring and storage management

## 🚀 Quick Start

### Prerequisites
- Python 3.11+ (Python 3.13 recommended)
- Node.js 18+
- At least 2GB RAM
- 5GB disk space

### Setup
```bash
# Run the setup script
./scripts/setup.sh

# Start both servers
./scripts/start-dev.sh both
```

### Access
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 📁 Project Structure

```
tts-vietnam/
├── frontend/          # Next.js React application
├── backend/           # FastAPI Python application
├── scripts/           # Development and deployment scripts
├── docs/             # Project documentation
└── README.md         # This file
```

## 🎮 Usage

1. Open http://localhost:3000 in your browser
2. Enter Vietnamese, English, or French text
3. Select a voice (currently Google TTS voices)
4. Click "Generate Speech" to create audio
5. Play the generated audio directly in the browser

## 🛠️ Development Scripts

- `./scripts/setup.sh` - Initial project setup
- `./scripts/start-dev.sh [backend|frontend|both]` - Start development servers
- `./scripts/build.sh` - Build the application
- `./scripts/test.sh` - Run tests
- `./scripts/deploy.sh` - Create deployment package

## 📋 API Endpoints

### TTS Endpoints
- `POST /api/tts/synthesize` - Convert text to speech
- `GET /api/tts/audio/{audio_id}` - Download audio file
- `GET /api/tts/voices` - List available voices

### Health & Monitoring
- `GET /api/health` - Health check
- `GET /` - Root endpoint

## 🔧 Technology Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Components**: ShadCN/UI (Radix-based)
- **Build Tool**: Next.js built-in bundler

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.13
- **TTS Engine**: Google Text-to-Speech (gTTS)
- **Audio Processing**: librosa, soundfile, pydub
- **Server**: Uvicorn with hot reload

### Infrastructure
- **Storage**: Local file system
- **API**: RESTful with automatic OpenAPI docs
- **Development**: Hot reload for both frontend and backend

## 📈 Roadmap

### Stage 2: Core TTS Features (Next)
- [ ] Advanced TTS engines (Coqui TTS)
- [ ] Voice customization (speed, pitch)
- [ ] File upload functionality
- [ ] Language detection
- [ ] Audio player with controls

### Stage 3: Voice Cloning
- [ ] Custom voice training
- [ ] Voice profile management
- [ ] Reference audio upload
- [ ] Voice quality validation

### Stage 4: UI/UX Enhancement
- [ ] Advanced audio controls
- [ ] Dark/light mode
- [ ] Mobile optimization
- [ ] Export functionality

### Stage 5: Testing & Deployment
- [ ] Comprehensive testing
- [ ] Cloud deployment
- [ ] Performance optimization
- [ ] Documentation

## 🐛 Known Issues

All issues are tracked in `/Docs/Bug_tracking.md` with resolutions.

## 🤝 Contributing

This is a development project following the implementation plan in `/Docs/Implementation.md`.

## 📄 License

This project is for development and educational purposes.

---

**Stage 1 Complete** ✅ | **Next: Stage 2 - Core TTS Features** 🎯