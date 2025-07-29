#!/bin/bash
# Setup script for Vietnamese voice cloning with TTS library

echo "Setting up Vietnamese voice cloning support..."

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Install TTS library with CUDA support if available
echo "Installing TTS library..."
pip install TTS

# Download Vietnamese-optimized models
echo "Downloading Vietnamese voice models..."
python -c "
from TTS.api import TTS
import os

print('Downloading Vietnamese-optimized models...')
try:
    # Try to download Vietnamese models
    model = TTS('capleaf/viXTTS')
    print('viXTTS model downloaded successfully')
except Exception as e:
    print(f'viXTTS download failed: {e}')
    try:
        # Fallback to standard XTTS
        model = TTS('tts_models/multilingual/multi-dataset/xtts_v2')
        print('Standard XTTS model downloaded successfully')
    except Exception as e2:
        print(f'XTTS download failed: {e2}')
"

echo "Voice cloning setup complete!"
echo "Note: For best performance with Vietnamese voices, ensure you have:"
echo "  - A CUDA-capable GPU (optional but recommended)"
echo "  - At least 4GB of free RAM"
echo "  - High-quality audio samples (6-30 seconds of clear speech)"