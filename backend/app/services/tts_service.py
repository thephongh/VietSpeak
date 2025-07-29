from gtts import gTTS
import os
import uuid
from typing import Optional
from app.core.config import settings
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
        voice_id: Optional[str] = None
    ) -> str:
        """
        Synthesize text to speech and return audio file path
        """
        if language not in self.supported_languages:
            raise ValueError(f"Unsupported language: {language}")
        
        if len(text) > settings.max_text_length:
            raise ValueError(f"Text too long. Maximum length: {settings.max_text_length}")
        
        # Generate unique filename
        audio_id = str(uuid.uuid4())
        temp_path = os.path.join(settings.audio_path, f"{audio_id}_temp.mp3")
        final_path = os.path.join(settings.audio_path, f"{audio_id}.wav")
        
        try:
            # Create TTS
            tts = gTTS(text=text, lang=self.supported_languages[language], slow=False)
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
            
            return audio_id
            
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
        """Get available voices"""
        return [
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