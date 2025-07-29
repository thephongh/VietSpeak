import os
import uuid
import tempfile
from datetime import datetime
from typing import Dict, Optional, Any
import librosa
import soundfile as sf
import numpy as np
import asyncio
import shutil

from app.core.config import settings
from app.services.text_processor import TextProcessor

try:
    from TTS.api import TTS
    XTTS_AVAILABLE = True
except ImportError:
    XTTS_AVAILABLE = False
    print("Warning: TTS library not available. Voice cloning will use fallback mode.")

class VoiceCloningService:
    def __init__(self):
        self.xtts_model = None
        self.fallback_mode = not XTTS_AVAILABLE
        
        if XTTS_AVAILABLE and not self.fallback_mode:
            self._initialize_xtts()
    
    def _initialize_xtts(self):
        """Initialize XTTS model for voice cloning"""
        try:
            # Load XTTS-v2 model
            self.xtts_model = TTS("tts_models/multilingual/multi-dataset/xtts_v2")
            print("XTTS model loaded successfully")
        except Exception as e:
            print(f"Failed to load XTTS model: {e}")
            self.fallback_mode = True
    
    async def create_voice_profile(
        self, 
        voice_id: str, 
        name: str, 
        language: str,
        audio_file_path: str,
        description: Optional[str] = None
    ) -> Dict[str, Any]:
        """Create a new voice profile from uploaded audio sample"""
        
        # Validate and process audio file
        audio_info = await self._process_audio_sample(audio_file_path, voice_id)
        
        # Create voice profile directory
        voice_dir = os.path.join(settings.voices_path, voice_id)
        os.makedirs(voice_dir, exist_ok=True)
        
        # Save processed audio sample
        sample_path = os.path.join(voice_dir, "sample.wav")
        shutil.copy2(audio_info["processed_path"], sample_path)
        
        # Create voice profile data
        profile_data = {
            "voice_id": voice_id,
            "name": name,
            "description": description,
            "language": language,
            "created_at": datetime.now().isoformat(),
            "sample_duration": audio_info["duration"],
            "quality_score": audio_info["quality_score"],
            "file_info": {
                "sample_path": sample_path,
                "sample_rate": audio_info["sample_rate"],
                "format": "wav"
            }
        }
        
        # If XTTS is available, prepare voice for cloning
        if not self.fallback_mode and self.xtts_model:
            try:
                # Test voice cloning with a short sample
                test_result = await self._test_voice_quality(sample_path, language)
                profile_data["quality_score"] = test_result["quality_score"]
            except Exception as e:
                print(f"Voice quality test failed: {e}")
        
        return profile_data
    
    async def synthesize_with_cloned_voice(
        self,
        text: str,
        voice_id: str,
        language: str = "vi",
        speed: float = 1.0
    ) -> Dict[str, Any]:
        """Generate speech using a cloned voice"""
        
        # Get voice sample path
        voice_sample_path = self.get_voice_sample_path(voice_id)
        if not os.path.exists(voice_sample_path):
            raise FileNotFoundError(f"Voice sample not found for voice_id: {voice_id}")
        
        # Process text
        processed_text = TextProcessor.clean_text(text)
        
        # Generate unique audio ID
        audio_id = str(uuid.uuid4())
        output_path = os.path.join(settings.audio_path, f"{audio_id}.wav")
        
        if not self.fallback_mode and self.xtts_model:
            # Use XTTS for voice cloning
            result = await self._synthesize_with_xtts(
                processed_text, voice_sample_path, output_path, language, speed
            )
        else:
            # Fallback: Use basic TTS with voice characteristics applied
            result = await self._synthesize_fallback(
                processed_text, voice_sample_path, output_path, language, speed
            )
        
        # Get text statistics
        text_stats = TextProcessor.get_text_stats(processed_text)
        
        return {
            "audio_id": audio_id,
            "original_text": text,
            "processed_text": processed_text,
            "voice_id": voice_id,
            "language": language,
            "speed": speed,
            "stats": {
                "characters": text_stats.characters,
                "words": text_stats.words,
                "sentences": text_stats.sentences,
                "estimated_duration": text_stats.estimated_duration
            },
            "file_info": {
                "path": output_path,
                "format": "wav",
                "sample_rate": result["sample_rate"]
            }
        }
    
    async def _synthesize_with_xtts(
        self, text: str, speaker_wav: str, output_path: str, language: str, speed: float
    ) -> Dict[str, Any]:
        """Synthesize using XTTS voice cloning"""
        try:
            # Map language codes for XTTS
            xtts_language_map = {
                "vi": "vi",  # Vietnamese
                "en": "en",  # English
                "fr": "fr"   # French
            }
            
            xtts_lang = xtts_language_map.get(language, "en")
            
            # Run XTTS synthesis in executor to avoid blocking
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(
                None,
                self._run_xtts_synthesis,
                text, speaker_wav, output_path, xtts_lang
            )
            
            # Apply speed adjustment if needed
            if speed != 1.0:
                audio, sr = librosa.load(output_path, sr=None)
                audio_adjusted = librosa.effects.time_stretch(audio, rate=speed)
                sf.write(output_path, audio_adjusted, sr)
                sample_rate = sr
            else:
                audio, sample_rate = librosa.load(output_path, sr=None)
            
            return {
                "sample_rate": sample_rate,
                "method": "xtts"
            }
            
        except Exception as e:
            raise Exception(f"XTTS synthesis failed: {str(e)}")
    
    def _run_xtts_synthesis(self, text: str, speaker_wav: str, output_path: str, language: str):
        """Run XTTS synthesis (blocking operation)"""
        self.xtts_model.tts_to_file(
            text=text,
            file_path=output_path,
            speaker_wav=speaker_wav,
            language=language
        )
    
    async def _synthesize_fallback(
        self, text: str, voice_sample_path: str, output_path: str, language: str, speed: float
    ) -> Dict[str, Any]:
        """Fallback synthesis using basic TTS with voice characteristics"""
        try:
            # Import gTTS for fallback
            from gtts import gTTS
            
            # Generate basic TTS
            temp_path = os.path.join(tempfile.gettempdir(), f"temp_{uuid.uuid4()}.mp3")
            
            # Map language for gTTS
            gtts_lang_map = {
                "vi": "vi",
                "en": "en", 
                "fr": "fr"
            }
            gtts_lang = gtts_lang_map.get(language, "en")
            
            tts = gTTS(text=text, lang=gtts_lang, slow=(speed < 0.8))
            tts.save(temp_path)
            
            # Load basic TTS audio
            basic_audio, sr = librosa.load(temp_path, sr=22050)
            
            # Load voice sample for characteristics
            voice_audio, voice_sr = librosa.load(voice_sample_path, sr=22050)
            
            # Apply basic voice transfer (pitch and formant shifting)
            processed_audio = await self._apply_voice_characteristics(
                basic_audio, voice_audio, sr
            )
            
            # Apply speed adjustment
            if speed != 1.0:
                processed_audio = librosa.effects.time_stretch(processed_audio, rate=speed)
            
            # Save final audio
            sf.write(output_path, processed_audio, sr)
            
            # Clean up temp file
            if os.path.exists(temp_path):
                os.remove(temp_path)
            
            return {
                "sample_rate": sr,
                "method": "fallback"
            }
            
        except Exception as e:
            raise Exception(f"Fallback synthesis failed: {str(e)}")
    
    async def _apply_voice_characteristics(
        self, basic_audio: np.ndarray, voice_sample: np.ndarray, sr: int
    ) -> np.ndarray:
        """Apply basic voice characteristics from sample to generated audio"""
        try:
            # Extract pitch characteristics from voice sample
            voice_pitch = librosa.yin(voice_sample, fmin=50, fmax=400)
            voice_pitch_mean = np.nanmean(voice_pitch[voice_pitch > 0])
            
            # Extract pitch from basic audio
            basic_pitch = librosa.yin(basic_audio, fmin=50, fmax=400)
            basic_pitch_mean = np.nanmean(basic_pitch[basic_pitch > 0])
            
            # Calculate pitch shift ratio
            if not np.isnan(voice_pitch_mean) and not np.isnan(basic_pitch_mean) and basic_pitch_mean > 0:
                pitch_shift_ratio = voice_pitch_mean / basic_pitch_mean
                # Limit pitch shift to reasonable range
                pitch_shift_ratio = np.clip(pitch_shift_ratio, 0.5, 2.0)
                
                # Apply pitch shift
                modified_audio = librosa.effects.pitch_shift(
                    basic_audio, sr=sr, n_steps=12 * np.log2(pitch_shift_ratio)
                )
            else:
                modified_audio = basic_audio
            
            return modified_audio
            
        except Exception as e:
            print(f"Voice characteristics application failed: {e}")
            return basic_audio
    
    async def _process_audio_sample(self, audio_file_path: str, voice_id: str) -> Dict[str, Any]:
        """Process and validate uploaded audio sample"""
        try:
            # Load audio file
            audio, sr = librosa.load(audio_file_path, sr=22050)
            
            # Get audio duration
            duration = librosa.get_duration(y=audio, sr=sr)
            
            # Validate duration (3 seconds minimum, 300 seconds maximum)
            if duration < 3.0:
                raise ValueError("Audio sample too short. Minimum 3 seconds required.")
            if duration > 300.0:
                raise ValueError("Audio sample too long. Maximum 5 minutes allowed.")
            
            # Trim silence
            audio_trimmed, _ = librosa.effects.trim(audio, top_db=20)
            
            # Normalize audio
            audio_normalized = librosa.util.normalize(audio_trimmed)
            
            # Calculate quality score based on audio characteristics
            quality_score = await self._calculate_audio_quality(audio_normalized, sr)
            
            # Save processed audio to temporary file
            processed_path = os.path.join(tempfile.gettempdir(), f"processed_{voice_id}.wav")
            sf.write(processed_path, audio_normalized, sr)
            
            return {
                "duration": duration,
                "sample_rate": sr,
                "quality_score": quality_score,
                "processed_path": processed_path
            }
            
        except Exception as e:
            raise Exception(f"Audio processing failed: {str(e)}")
    
    async def _calculate_audio_quality(self, audio: np.ndarray, sr: int) -> float:
        """Calculate audio quality score (0.0 to 1.0)"""
        try:
            # Calculate RMS energy
            rms = librosa.feature.rms(y=audio)[0]
            rms_mean = np.mean(rms)
            
            # Calculate spectral centroid (brightness)
            spectral_centroids = librosa.feature.spectral_centroid(y=audio, sr=sr)[0]
            spectral_centroid_mean = np.mean(spectral_centroids)
            
            # Calculate zero crossing rate (speech clarity)
            zcr = librosa.feature.zero_crossing_rate(audio)[0]
            zcr_mean = np.mean(zcr)
            
            # Simple quality scoring (can be improved with more sophisticated methods)
            energy_score = min(rms_mean * 10, 1.0)  # Normalize to 0-1
            clarity_score = min(spectral_centroid_mean / 2000, 1.0)  # Normalize to 0-1
            speech_score = min(zcr_mean * 20, 1.0)  # Normalize to 0-1
            
            # Weighted average
            quality_score = (energy_score * 0.3 + clarity_score * 0.4 + speech_score * 0.3)
            
            return round(min(quality_score, 1.0), 2)
            
        except Exception as e:
            print(f"Quality calculation failed: {e}")
            return 0.5  # Default moderate quality
    
    async def _test_voice_quality(self, sample_path: str, language: str) -> Dict[str, Any]:
        """Test voice cloning quality with a short sample"""
        try:
            test_text = {
                "vi": "Xin chào, đây là bài kiểm tra giọng nói.",
                "en": "Hello, this is a voice test.",
                "fr": "Bonjour, ceci est un test de voix."
            }.get(language, "Hello, this is a voice test.")
            
            # Generate short test audio (if XTTS available)
            test_audio_path = os.path.join(tempfile.gettempdir(), f"test_{uuid.uuid4()}.wav")
            
            if self.xtts_model:
                self.xtts_model.tts_to_file(
                    text=test_text,
                    file_path=test_audio_path,
                    speaker_wav=sample_path,
                    language=language
                )
                
                # Calculate quality score based on successful generation
                if os.path.exists(test_audio_path):
                    os.remove(test_audio_path)
                    return {"quality_score": 0.8}  # Good quality if generation succeeded
            
            return {"quality_score": 0.5}  # Default quality
            
        except Exception as e:
            print(f"Voice quality test failed: {e}")
            return {"quality_score": 0.3}  # Lower quality if test failed
    
    def get_voice_sample_path(self, voice_id: str) -> str:
        """Get path to voice sample file"""
        return os.path.join(settings.voices_path, voice_id, "sample.wav")
    
    async def delete_voice_profile(self, voice_id: str):
        """Delete voice profile and all associated files"""
        try:
            voice_dir = os.path.join(settings.voices_path, voice_id)
            if os.path.exists(voice_dir):
                shutil.rmtree(voice_dir)
                
        except Exception as e:
            raise Exception(f"Failed to delete voice profile: {str(e)}")
    
    def is_xtts_available(self) -> bool:
        """Check if XTTS is available and working"""
        return XTTS_AVAILABLE and not self.fallback_mode and self.xtts_model is not None