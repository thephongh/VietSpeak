# Storage Directory Structure

This directory contains all local file storage for the Vietnamese TTS application.

## Directory Organization

### `/audio/`
- Generated audio files from TTS synthesis
- Files are named with UUIDs (e.g., `abc123-def456.wav`)
- Automatic cleanup after 24 hours of inactivity

### `/voices/`
- Custom voice model files and metadata
- Organized by voice ID subdirectories
- Contains both model files and metadata JSON

### `/uploads/`
- Temporary storage for user-uploaded audio files
- Used for voice cloning reference audio
- Files are automatically cleaned up after processing

### `/models/`
- Downloaded and cached TTS model files
- Language-specific model storage
- Optimized for Apple Silicon when available

### `/cache/`
- Temporary processing files
- Cached intermediate results
- Automatic cleanup based on age and usage

## File Management

- All directories have automatic cleanup policies
- Large files are compressed when possible
- Metadata is stored in JSON format alongside binary files
- File paths are relative to the storage root directory