# Project Structure

## Root Directory

```
tts-vietnam/
├── frontend/                          # Next.js frontend application
│   ├── app/                          # Next.js App Router structure
│   │   ├── (main)/                   # Main application routes
│   │   ├── dashboard/                # Main TTS interface
│   │   │   ├── page.tsx
│   │   │   └── layout.tsx
│   │   ├── voices/                   # Voice management
│   │   │   ├── page.tsx
│   │   │   ├── clone/
│   │   │   └── library/
│   │   ├── settings/                 # User preferences
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/                   # Reusable UI components
│   │   ├── ui/                      # ShadCN/UI components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── slider.tsx
│   │   │   └── progress.tsx
│   │   ├── tts/                     # TTS-specific components
│   │   │   ├── text-input.tsx
│   │   │   ├── voice-selector.tsx
│   │   │   ├── audio-player.tsx
│   │   │   ├── voice-controls.tsx
│   │   │   └── text-processor.tsx
│   │   ├── voice-cloning/           # Voice cloning components
│   │   │   ├── voice-recorder.tsx
│   │   │   ├── upload-audio.tsx
│   │   │   ├── training-progress.tsx
│   │   │   └── voice-preview.tsx
│   │   ├── layout/                  # Layout components
│   │   │   ├── header.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── footer.tsx
│   │   │   └── navigation.tsx
│   │   └── common/                  # Common utility components
│   │       ├── loading-spinner.tsx
│   │       ├── error-boundary.tsx
│   │       ├── file-upload.tsx
│   │       └── theme-toggle.tsx
│   ├── lib/                         # Utility libraries and configurations
│   │   ├── utils.ts                 # Utility functions
│   │   ├── api.ts                   # API client configuration
│   │   ├── auth.ts                  # Authentication utilities
│   │   ├── constants.ts             # Application constants
│   │   ├── validations.ts           # Form validation schemas
│   │   └── store/                   # State management
│   │       ├── use-tts-store.ts
│   │       ├── use-voice-store.ts
│   │       └── use-user-store.ts
│   ├── hooks/                       # Custom React hooks
│   │   ├── use-audio-player.ts
│   │   ├── use-voice-cloning.ts
│   │   ├── use-file-upload.ts
│   │   ├── use-tts-synthesis.ts
│   │   └── use-local-storage.ts
│   ├── types/                       # TypeScript type definitions
│   │   ├── api.ts                   # API response types
│   │   ├── audio.ts                 # Audio-related types
│   │   ├── voice.ts                 # Voice and TTS types
│   │   └── user.ts                  # User and auth types
│   ├── public/                      # Static assets
│   │   ├── icons/
│   │   ├── images/
│   │   ├── audio/                   # Sample audio files
│   │   └── favicon.ico
│   ├── styles/                      # Styling files
│   │   ├── globals.css
│   │   ├── design-system.css        # Custom design system
│   │   └── components.css
│   ├── __tests__/                   # Frontend tests
│   │   ├── components/
│   │   ├── pages/
│   │   └── utils/
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── package.json
│   └── .env.local
├── backend/                         # FastAPI backend application
│   ├── app/                         # Main application package
│   │   ├── __init__.py
│   │   ├── main.py                  # FastAPI application entry point
│   │   ├── core/                    # Core configurations
│   │   │   ├── __init__.py
│   │   │   ├── config.py            # Application settings
│   │   │   ├── storage.py           # Local storage configuration
│   │   │   └── logging.py           # Logging configuration
│   │   ├── api/                     # API routes
│   │   │   ├── __init__.py
│   │   │   ├── deps.py              # API dependencies
│   │   │   ├── api_v1/              # API version 1
│   │   │   │   ├── __init__.py
│   │   │   │   ├── api.py           # API router
│   │   │   │   └── endpoints/       # Individual route handlers
│   │   │   │       ├── __init__.py
│   │   │   │       ├── tts.py       # TTS synthesis endpoints
│   │   │   │       ├── voices.py    # Voice management endpoints
│   │   │   │       ├── storage.py   # Storage management endpoints
│   │   │   │       ├── audio.py     # Audio file endpoints
│   │   │   │       └── health.py    # Health check endpoints
│   │   ├── models/                  # Data models for local storage
│   │   │   ├── __init__.py
│   │   │   ├── voice.py             # Voice profile data structures
│   │   │   ├── audio.py             # Audio file metadata structures
│   │   │   └── preferences.py       # User preferences data structures
│   │   ├── schemas/                 # Pydantic schemas
│   │   │   ├── __init__.py
│   │   │   ├── voice.py             # Voice schemas
│   │   │   ├── tts.py               # TTS request/response schemas
│   │   │   ├── audio.py             # Audio schemas
│   │   │   └── storage.py           # Local storage schemas
│   │   ├── services/                # Business logic services
│   │   │   ├── __init__.py
│   │   │   ├── tts_service.py       # TTS synthesis service
│   │   │   ├── voice_cloning.py     # Voice cloning service
│   │   │   ├── audio_processor.py   # Audio processing utilities
│   │   │   ├── text_processor.py    # Text cleaning and processing
│   │   │   ├── local_storage.py     # Local storage management
│   │   │   └── macos_optimizer.py   # macOS Silicon optimizations
│   │   ├── ml_models/               # Machine learning models
│   │   │   ├── __init__.py
│   │   │   ├── coqui_tts.py         # Coqui TTS integration
│   │   │   ├── voice_cloning_model.py # Voice cloning model
│   │   │   ├── language_detection.py # Language detection
│   │   │   └── model_manager.py     # Model loading and management
│   │   ├── utils/                   # Utility functions
│   │   │   ├── __init__.py
│   │   │   ├── audio_utils.py       # Audio processing utilities
│   │   │   ├── text_utils.py        # Text processing utilities
│   │   │   ├── file_utils.py        # File handling utilities
│   │   │   └── validation.py        # Validation utilities
│   │   └── tests/                   # Backend tests
│   │       ├── __init__.py
│   │       ├── conftest.py          # Test configuration
│   │       ├── test_tts.py          # TTS endpoint tests
│   │       ├── test_voices.py       # Voice endpoint tests
│   │       └── test_audio.py        # Audio processing tests
│   ├── optimizations/              # Platform-specific optimizations
│   │   ├── macos/                   # macOS Silicon optimizations
│   │   │   ├── metal_acceleration.py
│   │   │   ├── core_ml_integration.py
│   │   │   └── memory_management.py
│   │   └── web/                     # Web browser optimizations
│   │       ├── web_audio_api.py
│   │       └── streaming_optimization.py
│   ├── storage/                     # Local file storage
│   │   ├── audio/                   # Generated audio files
│   │   ├── uploads/                 # User uploaded files
│   │   ├── models/                  # ML model files
│   │   └── voices/                  # Voice profile data
│   ├── requirements.txt             # Python dependencies
│   ├── requirements-dev.txt         # Development dependencies
│   ├── Dockerfile
│   ├── .env                         # Environment variables
│   └── run.py                       # Development server runner
├── docs/                            # Project documentation
│   ├── Implementation.md            # Implementation plan
│   ├── project_structure.md         # This file
│   ├── UI_UX_doc.md                # UI/UX design specifications
│   ├── features.md                  # Feature requirements
│   ├── api/                         # API documentation
│   │   ├── endpoints.md
│   │   └── schemas.md
│   └── deployment/                  # Deployment guides
│       ├── docker.md
│       ├── cloud.md
│       └── environment.md
├── scripts/                         # Development and deployment scripts
│   ├── setup.sh                     # Initial setup script
│   ├── start-dev.sh                 # Development server starter
│   ├── build.sh                     # Build script
│   ├── test.sh                      # Testing script
│   └── deploy.sh                    # Deployment script
├── .github/                         # GitHub workflows and templates
│   └── workflows/
│       ├── ci.yml                   # Continuous integration
│       ├── cd.yml                   # Continuous deployment
│       └── tests.yml                # Automated testing
├── docker-compose.yml               # Docker development environment
├── docker-compose.prod.yml          # Docker production environment
├── .gitignore
├── README.md
└── LICENSE
```

## Detailed Structure Explanation

### Frontend Organization (`/frontend`)

#### App Router Structure (`/app`)
- Uses Next.js 15 App Router for improved performance and developer experience
- Simplified routing without authentication complexity
- Nested layouts for consistent UI structure
- Server and client components optimized for TTS application needs

#### Component Architecture (`/components`)
- **UI Components**: ShadCN/UI-based components for consistent design
- **TTS Components**: Specialized components for text-to-speech functionality
- **Voice Cloning**: Dedicated components for voice cloning features
- **Layout Components**: Reusable layout and navigation components
- **Common Components**: Utility components used across the application

#### State Management (`/lib/store`)
- Zustand stores for different application domains
- Separate stores for TTS, voice management, and user data
- Optimized for real-time audio processing requirements

#### Custom Hooks (`/hooks`)
- Audio player management with play/pause/stop controls
- Voice cloning workflow management
- File upload with progress tracking
- TTS synthesis with error handling

### Backend Organization (`/backend`)

#### API Structure (`/app/api`)
- RESTful API design with versioning support
- Endpoint separation by domain (TTS, voices, audio, storage)
- Local file system integration for data persistence
- Health check endpoints for monitoring
- macOS Silicon optimized processing endpoints

#### Data Layer (`/models` & `/schemas`)
- Local storage data structures and JSON serialization
- Pydantic schemas for request/response validation
- File system organization for voices and audio files
- Browser localStorage integration schemas

#### Business Logic (`/services`)
- TTS synthesis orchestration
- Voice cloning pipeline management
- Audio processing and file management
- Text preprocessing and language detection

#### ML Models (`/ml_models`)
- Coqui TTS integration with model management
- Voice cloning model implementation
- Language detection for multi-language support
- Efficient model loading and caching

### Storage Organization

#### Local File System Structure
- **Generated Audio**: `/storage/audio/` - TTS generated files with timestamp naming
- **User Uploads**: `/storage/uploads/` - User-provided audio for cloning (temporary)
- **Voice Profiles**: `/storage/voices/` - Trained voice model data and metadata JSON
- **ML Models**: `/storage/models/` - Downloaded TTS models optimized for Silicon
- **Cache**: `/storage/cache/` - Temporary processing files and model cache
- **Preferences**: Local JSON files for user settings and voice library metadata

#### Browser Storage Integration
- **localStorage**: User preferences, voice library metadata, recent generations
- **sessionStorage**: Temporary data during voice cloning sessions
- **IndexedDB**: Large audio files and voice model references for offline access

### Platform Optimizations

#### macOS Silicon Optimizations
- **Metal Performance Shaders**: GPU acceleration for audio processing
- **Core ML Integration**: Optimized TTS model inference using Apple's ML framework
- **Accelerate Framework**: Vectorized audio operations for better performance
- **Memory Management**: Efficient memory allocation for large audio files
- **Native ARM64 Dependencies**: All Python packages compiled for Apple Silicon

#### Web Browser Optimizations
- **Web Audio API**: Browser-native audio processing and real-time effects
- **AudioWorklet**: Low-latency audio processing in separate thread
- **Streaming Audio**: Progressive audio loading and playback
- **Web Workers**: Background processing for TTS generation
- **Service Workers**: Offline caching of voice models and generated audio
- **WebAssembly**: Performance-critical audio processing modules

### Development Workflow

#### Environment Setup
- Frontend and backend can be developed independently
- Native macOS development without Docker for better Silicon performance
- Hot reloading optimized for local development

#### Testing Strategy
- Frontend: Jest and React Testing Library
- Backend: Pytest with API and integration tests
- End-to-end testing for complete TTS workflows

#### Deployment Structure
- Containerized applications for easy deployment
- Environment-specific configurations
- CI/CD pipeline with automated testing and deployment

### Configuration Management

#### Environment Variables
- **Frontend**: API endpoints, storage paths, browser feature flags
- **Backend**: Local storage paths, ML model configurations, macOS optimization flags
- **Shared**: Feature flags, platform-specific optimizations, cache settings

#### Build Configuration
- **Next.js**: Optimized for audio processing, Web Audio API integration, and PWA support
- **FastAPI**: Configured for ML model serving with macOS Silicon optimizations
- **Native Builds**: Direct compilation for Apple Silicon without containerization
- **Web Assembly**: Compiled audio processing modules for browser performance

This structure supports:
- **Platform Optimization**: Native macOS Silicon performance with browser compatibility
- **Local-First Architecture**: No external dependencies, works offline
- **Performance**: Hardware acceleration and browser-native audio processing
- **Maintainability**: Organized code with platform-specific optimizations
- **Development**: Fast iteration with native tooling and hot reloading
- **Deployment**: Simple local installation or web deployment without infrastructure dependencies
- **Cross-Platform**: Optimized for macOS while maintaining web browser compatibility