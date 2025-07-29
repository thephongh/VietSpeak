# Vietnamese Text-to-Speech Application

A modern, AI-powered Vietnamese Text-to-Speech application with voice cloning capabilities, built with Next.js and FastAPI.

## 🎯 Current Status: Stage 2 Complete

**Foundation & Setup** and **Core TTS Features** have been successfully implemented with full TTS functionality.

### ✅ Completed Features

#### Frontend (Next.js 15 + TypeScript)
- ⚛️ Next.js 15 with App Router
- 🎨 Tailwind CSS 4 styling
- 🧩 ShadCN/UI component library
- 🔧 TypeScript configuration
- 📱 Responsive design foundation
- 🔗 API client for backend communication
- 📝 Text input with file upload and drag-and-drop
- 🎵 Professional audio player with full controls
- 🎛️ Voice controls (speed, pitch, volume)
- 🧹 Text processing with markdown removal
- 📊 Real-time text statistics and duration estimation

#### Backend (FastAPI + Python 3.13)
- 🐍 FastAPI with modern Python 3.13
- 🎤 Enhanced TTS service using Google TTS (gTTS)
- 🔊 Audio processing with librosa and soundfile
- 📁 Local file storage system with metadata
- 🌐 CORS configuration for frontend integration
- 📋 RESTful API endpoints with comprehensive responses
- 🌍 Multi-language support (Vietnamese, English, French)
- 🧼 Server-side text cleaning and processing
- 📈 Audio generation statistics and analytics

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

## 🧪 Testing the Application

### Automated Startup (Recommended)
```bash
# Start both frontend and backend servers
./scripts/start-dev.sh both

# Or start individually
./scripts/start-dev.sh frontend  # Starts on port 3000
./scripts/start-dev.sh backend   # Starts on port 8000
```

### Manual Startup (Alternative)
```bash
# Terminal 1 - Backend
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### Step-by-Step Testing

1. **Start the Application**
   ```bash
   ./scripts/start-dev.sh both
   ```

2. **Verify Backend is Running**
   - Visit http://localhost:8000 in your browser
   - You should see: `{"message": "Vietnamese TTS API is running", "version": "1.0.0"}`
   - Check API docs at http://localhost:8000/docs

3. **Verify Frontend is Running**
   - Visit http://localhost:3000 in your browser
   - You should see the Vietnamese TTS interface

4. **Test Basic TTS Functionality**
   - Enter text: `Xin chào! Đây là bài kiểm tra tiếng Việt.`
   - Select language: Vietnamese
   - Click "Generate Speech"
   - Audio should generate and appear in the player

5. **Test Different Languages**
   - English: `Hello! This is a test of English speech synthesis.`
   - French: `Bonjour! Ceci est un test de synthèse vocale française.`

6. **Test Audio Controls**
   - Use play/pause/stop buttons
   - Adjust playback speed (0.5x to 2x)
   - Control volume
   - Download generated audio

7. **Test Voice Controls**
   - Adjust speech speed (0.5x to 2.0x)
   - Try different preset options (Slow & Clear, Natural, Fast & Deep)

8. **Test File Upload**
   - Click "Upload File" button
   - Upload a text file or paste content
   - Verify text is extracted and cleaned

### Health Check Endpoints

```bash
# Backend health check
curl http://localhost:8000/api/health

# Expected response:
# {"status": "healthy", "version": "1.0.0", "project": "Vietnamese TTS"}

# List available voices
curl http://localhost:8000/api/tts/voices

# Test TTS synthesis
curl -X POST http://localhost:8000/api/tts/synthesize \
  -H "Content-Type: application/json" \
  -d '{"text": "Xin chào", "language": "vi"}'
```

### Troubleshooting

#### Frontend Won't Start
```bash
cd frontend
npm install  # Reinstall dependencies
npm run dev  # Try starting again
```

#### Backend Won't Start
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt  # Reinstall dependencies
uvicorn app.main:app --reload
```

#### Audio Generation Fails
- Check backend logs for TTS engine errors
- Verify internet connection (required for Google TTS)
- Try shorter text inputs first

#### CORS Errors
- Ensure backend is running on port 8000
- Verify frontend is running on port 3000
- Check browser console for specific CORS errors

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

### Basic Usage
1. Open http://localhost:3000 in your browser
2. Enter Vietnamese, English, or French text in the text area
3. Optionally upload a text file using the "Upload File" button
4. Select language (Vietnamese, English, French, or Auto-detect)
5. Choose a voice from the available options
6. Adjust speech speed using the voice controls sidebar
7. Click "Generate Speech" to create audio
8. Use the audio player to play, pause, control volume, and download

### Advanced Features
- **Text Processing**: Enable/disable markdown cleaning for formatted text
- **File Upload**: Drag and drop text files or paste content directly
- **Voice Controls**: Fine-tune speech rate with presets (Slow & Clear, Natural, Fast & Deep)
- **Audio Player**: Full controls including skip, restart, speed adjustment, and download
- **Multi-language**: Automatic language detection or manual selection
- **Real-time Stats**: View word count, character count, and estimated duration

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

### Stage 2: Core TTS Features ✅ Completed
- [x] Enhanced TTS engines (Google TTS with audio processing)
- [x] Voice customization (speed, pitch, volume controls)
- [x] File upload functionality with drag-and-drop
- [x] Language detection and multi-language support
- [x] Professional audio player with full controls
- [x] Text processing and markdown cleaning
- [x] Real-time statistics and duration estimation

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

**Stage 1 & 2 Complete** ✅ | **Next: Stage 3 - Voice Cloning & Advanced Features** 🎯