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
            # Use the standard multilingual XTTS v2 model which works best
            model_name = "tts_models/multilingual/multi-dataset/xtts_v2"
            
            print(f"Loading XTTS model: {model_name}")
            self.xtts_model = TTS(model_name)
            print(f"Successfully loaded XTTS model: {model_name}")
            
            # Verify model supports required languages
            if hasattr(self.xtts_model, 'languages'):
                supported_langs = self.xtts_model.languages
                print(f"Supported languages: {supported_langs}")
                
        except Exception as e:
            print(f"Failed to initialize XTTS model: {e}")
            print("Falling back to basic TTS mode")
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
                "sample_rate": int(sample_rate),
                "method": "xtts"
            }
            
        except Exception as e:
            raise Exception(f"XTTS synthesis failed: {str(e)}")
    
    def _run_xtts_synthesis(self, text: str, speaker_wav: str, output_path: str, language: str):
        """Run XTTS synthesis (blocking operation) with enhanced parameters"""
        try:
            # Enhanced XTTS parameters for better voice cloning quality
            self.xtts_model.tts_to_file(
                text=text,
                file_path=output_path,
                speaker_wav=speaker_wav,
                language=language,
                # Additional parameters for better quality (if supported)
                temperature=0.7,  # Lower temperature for more consistent voice
                length_penalty=1.0,  # Balanced length penalty
                repetition_penalty=5.0,  # Higher repetition penalty for natural speech
                top_k=50,  # Limit vocabulary for consistency
                top_p=0.8,  # Nucleus sampling for natural variety
            )
        except TypeError:
            # Fallback if advanced parameters not supported
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
                "sample_rate": int(sr),
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
        """Process and validate uploaded audio sample with enhanced quality"""
        try:
            # Load audio file with higher quality settings
            audio, sr = librosa.load(audio_file_path, sr=22050)
            
            # Get audio duration
            duration = librosa.get_duration(y=audio, sr=sr)
            
            # Validate duration (3 seconds minimum, 300 seconds maximum)
            if duration < 3.0:
                raise ValueError("Audio sample too short. Minimum 3 seconds required.")
            if duration > 300.0:
                raise ValueError("Audio sample too long. Maximum 5 minutes allowed.")
            
            # Enhanced audio preprocessing for better voice cloning
            # 1. Trim silence more aggressively
            audio_trimmed, _ = librosa.effects.trim(audio, top_db=25)
            
            # 2. Apply noise reduction using spectral gating
            audio_denoised = self._apply_noise_reduction(audio_trimmed, sr)
            
            # 3. Normalize with RMS normalization for consistent loudness
            rms = librosa.feature.rms(y=audio_denoised)[0]
            target_rms = 0.2  # Target RMS level
            current_rms = np.sqrt(np.mean(rms**2))
            if current_rms > 0:
                audio_normalized = audio_denoised * (target_rms / current_rms)
            else:
                audio_normalized = audio_denoised
            
            # 4. Apply gentle high-pass filter to remove low-frequency noise
            audio_filtered = librosa.effects.preemphasis(audio_normalized)
            
            # 5. Ensure audio is not clipping
            audio_final = np.clip(audio_filtered, -0.99, 0.99)
            
            # Calculate enhanced quality score
            quality_score = await self._calculate_enhanced_audio_quality(audio_final, sr)
            
            # Save processed audio to temporary file
            processed_path = os.path.join(tempfile.gettempdir(), f"processed_{voice_id}.wav")
            sf.write(processed_path, audio_final, sr)
            
            return {
                "duration": float(duration),
                "sample_rate": int(sr),
                "quality_score": float(quality_score),
                "processed_path": processed_path
            }
            
        except Exception as e:
            raise Exception(f"Audio processing failed: {str(e)}")
    
    def _apply_noise_reduction(self, audio: np.ndarray, sr: int) -> np.ndarray:
        """Apply spectral gating noise reduction"""
        try:
            # Compute short-time Fourier transform
            stft = librosa.stft(audio, n_fft=2048, hop_length=512)
            magnitude = np.abs(stft)
            phase = np.angle(stft)
            
            # Estimate noise floor from quiet segments
            frame_energy = np.mean(magnitude, axis=0)
            noise_threshold = np.percentile(frame_energy, 20)  # Bottom 20% as noise
            
            # Create spectral gate mask
            noise_mask = frame_energy < noise_threshold * 1.5
            
            # Apply gentle noise reduction
            for i, is_noise in enumerate(noise_mask):
                if is_noise:
                    magnitude[:, i] *= 0.3  # Reduce noise frames by 70%
            
            # Reconstruct audio
            stft_cleaned = magnitude * np.exp(1j * phase)
            audio_cleaned = librosa.istft(stft_cleaned, hop_length=512)
            
            return audio_cleaned
            
        except Exception as e:
            print(f"Noise reduction failed: {e}")
            return audio
    
    async def _calculate_enhanced_audio_quality(self, audio: np.ndarray, sr: int) -> float:
        """Calculate enhanced audio quality score with multiple metrics"""
        try:
            # 1. Signal-to-Noise Ratio estimation
            stft = librosa.stft(audio)
            magnitude = np.abs(stft)
            
            # Estimate SNR from spectral characteristics
            spectral_energy = np.mean(magnitude, axis=1)
            voice_freq_range = (sr * 85 // sr, sr * 255 // sr)  # Typical voice range
            voice_energy = np.mean(spectral_energy[voice_freq_range[0]:voice_freq_range[1]])
            total_energy = np.mean(spectral_energy)
            snr_score = min(voice_energy / (total_energy + 1e-8), 1.0)
            
            # 2. Dynamic range (good speech has varied amplitude)
            rms = librosa.feature.rms(y=audio)[0]
            dynamic_range = np.std(rms) / (np.mean(rms) + 1e-8)
            dynamic_score = min(dynamic_range * 2, 1.0)
            
            # 3. Spectral rolloff (speech clarity indicator)
            rolloff = librosa.feature.spectral_rolloff(y=audio, sr=sr)[0]
            rolloff_score = min(np.mean(rolloff) / 4000, 1.0)  # Normalize to 4kHz
            
            # 4. Zero crossing rate (speech articulation)
            zcr = librosa.feature.zero_crossing_rate(audio)[0]
            zcr_mean = np.mean(zcr)
            zcr_score = min(zcr_mean * 15, 1.0)  # Normalize ZCR
            
            # 5. Harmonic-to-noise ratio estimation
            harmonic, percussive = librosa.effects.hpss(audio)
            harmonic_energy = np.mean(harmonic**2)
            percussive_energy = np.mean(percussive**2)
            hnr_score = harmonic_energy / (harmonic_energy + percussive_energy + 1e-8)
            
            # Weighted combination of quality metrics
            quality_score = (
                snr_score * 0.25 +           # Signal clarity
                dynamic_score * 0.15 +       # Dynamic range
                rolloff_score * 0.2 +        # Spectral content
                zcr_score * 0.15 +          # Articulation
                hnr_score * 0.25            # Harmonic content
            )
            
            return round(min(quality_score, 1.0), 2)
            
        except Exception as e:
            print(f"Enhanced quality calculation failed: {e}")
            return 0.6  # Default moderate quality
    
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
                    return {"quality_score": float(0.8)}  # Good quality if generation succeeded
            
            return {"quality_score": float(0.5)}  # Default quality
            
        except Exception as e:
            print(f"Voice quality test failed: {e}")
            return {"quality_score": float(0.3)}  # Lower quality if test failed
    
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