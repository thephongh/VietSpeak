from gtts import gTTS
import os
import uuid
from typing import Optional, Dict, List
from app.core.config import settings
from app.services.text_processor import TextProcessor
import librosa
import soundfile as sf
import numpy as np

class TTSService:
    def __init__(self):
        self.supported_languages = {
            'vi': 'vi',  # Vietnamese
            'en': 'en',  # English
            'fr': 'fr'   # French
        }
    
    async def synthesize_text(
        self, 
        text: str, 
        language: str = 'vi',
        speed: float = 1.0,
        voice_id: Optional[str] = None,
        clean_text: bool = True
    ) -> Dict[str, any]:
        """
        Synthesize text to speech and return audio info
        """
        if language not in self.supported_languages:
            raise ValueError(f"Unsupported language: {language}")
        
        # Process text if requested
        processed_text = text
        if clean_text:
            processed_text = TextProcessor.clean_text(text)
            
        if len(processed_text) > settings.max_text_length:
            raise ValueError(f"Text too long. Maximum length: {settings.max_text_length}")
        
        # Auto-detect language if not specified
        if language == 'auto':
            language = TextProcessor.detect_language(processed_text)
            if language == 'unknown':
                language = 'vi'  # Default to Vietnamese
        
        # Check if this is a cloned voice
        if voice_id and not voice_id.startswith('gtts_'):
            # This is a cloned voice, use voice cloning service
            try:
                from app.services.voice_cloning_service import VoiceCloningService
                voice_cloning_service = VoiceCloningService()
                return await voice_cloning_service.synthesize_with_cloned_voice(
                    text=processed_text,
                    voice_id=voice_id,
                    language=language,
                    speed=speed
                )
            except Exception as e:
                # Fallback to regular TTS if voice cloning fails
                print(f"Voice cloning failed, falling back to regular TTS: {e}")
        
        # Generate unique filename
        audio_id = str(uuid.uuid4())
        temp_path = os.path.join(settings.audio_path, f"{audio_id}_temp.mp3")
        final_path = os.path.join(settings.audio_path, f"{audio_id}.wav")
        
        try:
            # Create TTS
            tts = gTTS(
                text=processed_text, 
                lang=self.supported_languages[language], 
                slow=(speed < 0.8)
            )
            tts.save(temp_path)
            
            # Process audio (convert to WAV and adjust speed if needed)
            audio, sr = librosa.load(temp_path, sr=22050)
            
            # Adjust speed if needed
            if speed != 1.0:
                audio = librosa.effects.time_stretch(audio, rate=speed)
            
            # Save as WAV
            sf.write(final_path, audio, sr)
            
            # Clean up temp file
            if os.path.exists(temp_path):
                os.remove(temp_path)
            
            # Get text statistics
            text_stats = TextProcessor.get_text_stats(processed_text)
            
            return {
                "audio_id": audio_id,
                "original_text": text,
                "processed_text": processed_text,
                "language": language,
                "speed": speed,
                "voice_id": voice_id,
                "stats": {
                    "characters": text_stats.characters,
                    "words": text_stats.words,
                    "sentences": text_stats.sentences,
                    "estimated_duration": text_stats.estimated_duration
                },
                "file_info": {
                    "path": final_path,
                    "format": "wav",
                    "sample_rate": sr
                }
            }
            
        except Exception as e:
            # Clean up files in case of error
            for path in [temp_path, final_path]:
                if os.path.exists(path):
                    os.remove(path)
            raise Exception(f"TTS synthesis failed: {str(e)}")
    
    def get_audio_path(self, audio_id: str) -> str:
        """Get full path to audio file"""
        return os.path.join(settings.audio_path, f"{audio_id}.wav")
    
    def get_voices(self) -> list:
        """Get available voices including cloned voices"""
        # Default voices
        default_voices = [
            {
                "id": "gtts_vi",
                "name": "Vietnamese (Google)",
                "language": "vi",
                "type": "default"
            },
            {
                "id": "gtts_en",
                "name": "English (Google)",
                "language": "en", 
                "type": "default"
            },
            {
                "id": "gtts_fr",
                "name": "French (Google)",
                "language": "fr",
                "type": "default"
            }
        ]
        
        # Add cloned voices
        try:
            from app.services.local_storage import LocalStorageService
            storage_service = LocalStorageService()
            voice_profiles = storage_service.get_all_voice_profiles()
            
            cloned_voices = [
                {
                    "id": profile["voice_id"],
                    "name": f"{profile['name']} (Cloned)",
                    "language": profile["language"],
                    "type": "cloned",
                    "created_at": profile.get("created_at"),
                    "quality_score": profile.get("quality_score")
                }
                for profile in voice_profiles
            ]
            
            return default_voices + cloned_voices
            
        except Exception as e:
            print(f"Error loading cloned voices: {e}")
            return default_voices