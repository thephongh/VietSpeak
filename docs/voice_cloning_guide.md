# Vietnamese Voice Cloning Guide

## Overview

The TTS Vietnam project supports voice cloning for Vietnamese voices using advanced AI models. This guide explains how to set up and use voice cloning effectively.

## Current Status

### Without TTS Library (Fallback Mode)
When the TTS library is not installed, the system uses a fallback method that:
- Uses Google TTS (gTTS) for basic synthesis
- Applies simple pitch shifting to match voice characteristics
- Results in robotic-sounding voices
- Not recommended for production use

### With TTS Library (Recommended)
When properly set up with the TTS library:
- Uses Vietnamese-optimized models (viXTTS or vnTTS)
- Provides natural-sounding voice cloning
- Requires only 6 seconds of audio for cloning
- Supports multiple languages including Vietnamese

## Setup Instructions

### 1. Install TTS Library

```bash
cd backend
pip install TTS
# or run the setup script
./setup_voice_cloning.sh
```

### 2. System Requirements

- **Minimum Requirements:**
  - Python 3.8+
  - 4GB RAM
  - 2GB disk space for models

- **Recommended Requirements:**
  - CUDA-capable GPU
  - 8GB+ RAM
  - SSD storage

### 3. Audio Sample Requirements

For best voice cloning results:
- **Duration:** 6-30 seconds of clear speech
- **Quality:** High-quality recording (44.1kHz or higher)
- **Content:** Natural speaking voice, no background music
- **Language:** Native Vietnamese speaker for Vietnamese voices
- **Format:** WAV, MP3, FLAC, or M4A

## Models Used

### Vietnamese-Optimized Models
1. **viXTTS** (Primary)
   - Fine-tuned from XTTS-v2.0.3
   - Trained on viVoice dataset
   - Best for Vietnamese voices
   - Supports 18 languages

2. **vnTTS** (Alternative)
   - Community-developed model
   - Focused on Vietnamese language
   - Good alternative if viXTTS unavailable

3. **XTTS-v2** (Fallback)
   - Standard multilingual model
   - Supports Vietnamese among 24 languages
   - Less optimized for Vietnamese

## Known Limitations

### Vietnamese Language Specific
- Poor performance with sentences under 10 words
- May produce trailing sounds with short inputs
- Best results with 15+ word sentences

### General Limitations
- First synthesis may be slower (model loading)
- GPU recommended for real-time performance
- Voice quality depends on sample quality

## Troubleshooting

### Issue: Robotic Voice Output
**Cause:** TTS library not installed, using fallback mode
**Solution:** Install TTS library with `pip install TTS`

### Issue: Model Download Fails
**Cause:** Network issues or insufficient disk space
**Solution:** 
1. Check internet connection
2. Ensure 2GB+ free disk space
3. Try manual download with setup script

### Issue: Slow Performance
**Cause:** Running on CPU instead of GPU
**Solution:** 
1. Install CUDA toolkit
2. Install PyTorch with CUDA support
3. Ensure GPU is available

### Issue: Poor Voice Quality
**Cause:** Low-quality audio sample
**Solution:** 
1. Use higher quality recording
2. Remove background noise
3. Ensure clear pronunciation
4. Use longer sample (15-30 seconds)

## Best Practices

1. **Audio Preparation**
   - Record in quiet environment
   - Use consistent speaking pace
   - Include variety in intonation
   - Avoid emotional extremes

2. **Text Input**
   - Use complete sentences
   - Include proper punctuation
   - Avoid very short phrases
   - Use natural language

3. **Performance Optimization**
   - Pre-load models at startup
   - Cache frequently used voices
   - Use GPU acceleration
   - Batch process when possible

## API Usage Example

```python
# Upload voice sample
curl -X POST "http://localhost:8000/api/voice-cloning/upload-sample" \
  -F "audio_file=@voice_sample.wav" \
  -F "name=My Voice" \
  -F "language=vi"

# Synthesize with cloned voice
curl -X POST "http://localhost:8000/api/tts/synthesize" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Xin chào, đây là giọng nói được sao chép của tôi.",
    "voice_id": "your-voice-id",
    "language": "vi"
  }'
```

## Future Improvements

- Support for emotion control
- Voice style transfer
- Real-time voice conversion
- Multi-speaker synthesis
- Fine-tuning on custom datasets