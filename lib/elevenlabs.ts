const ELEVENLABS_API_BASE = 'https://api.elevenlabs.io/v1';

function getApiHeaders() {
  if (!process.env.ELEVENLABS_API_KEY) {
    throw new Error('ElevenLabs API key not configured');
  }
  
  return {
    'xi-api-key': process.env.ELEVENLABS_API_KEY,
    'Content-Type': 'application/json',
  };
}

function getMultipartHeaders() {
  if (!process.env.ELEVENLABS_API_KEY) {
    throw new Error('ElevenLabs API key not configured');
  }
  
  return {
    'xi-api-key': process.env.ELEVENLABS_API_KEY,
  };
}

export interface VoiceCloneRequest {
  name: string;
  description?: string;
  labels?: Record<string, string>;
  files: File[];
}

export interface VoiceCloneResponse {
  voice_id: string;
  name: string;
  description: string;
  labels: Record<string, string>;
  created_at: string;
  preview_url?: string;
}

export interface TextToSpeechRequest {
  text: string;
  voice_id: string;
  model_id?: string;
  voice_settings?: {
    stability?: number;
    similarity_boost?: number;
    style?: number;
    use_speaker_boost?: boolean;
  };
}

export async function cloneVoice({
  name,
  description = '',
  labels = {},
  files,
}: VoiceCloneRequest): Promise<VoiceCloneResponse> {
  try {
    // Create FormData for multipart upload
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description || `Cloned voice: ${name}`);
    
    // Enhanced labels for better voice differentiation
    const voiceLabels = {
      accent: labels.accent || (labels.language === 'fr' ? 'french' : labels.language === 'vi' ? 'vietnamese' : 'unknown'),
      age: labels.age || 'adult',
      gender: labels.gender || 'unknown',
      use_case: 'text-to-speech',
      created_by: 'tts-vietnam-app',
      language: labels.language || 'vi',
      timestamp: new Date().toISOString(),
      ...labels,
    };
    formData.append('labels', JSON.stringify(voiceLabels));

    // Add audio files with validation
    console.log(`Cloning voice "${name}" with ${files.length} audio files`);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(`Adding file ${i + 1}: ${file.name} (${file.size} bytes)`);
      formData.append('files', file);
    }

    const response = await fetch(`${ELEVENLABS_API_BASE}/voices/add`, {
      method: 'POST',
      headers: getMultipartHeaders(),
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Voice cloning failed for "${name}":`, errorText);
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log(`Successfully cloned voice "${name}" with ID: ${result.voice_id}`);

    return {
      voice_id: result.voice_id,
      name: name,
      description: description || `Cloned voice: ${name}`,
      labels: voiceLabels,
      created_at: new Date().toISOString(),
      preview_url: result.preview_url,
    };

  } catch (error) {
    console.error('ElevenLabs voice cloning error:', error);
    throw new Error(`Voice cloning failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function generateSpeech({
  text,
  voice_id,
  model_id = 'eleven_multilingual_v2',
  voice_settings = {
    stability: 0.5,
    similarity_boost: 0.8,
    style: 0.0,
    use_speaker_boost: true,
  },
}: TextToSpeechRequest): Promise<Buffer> {
  try {
    // Ensure voice_id is properly formatted and not empty
    if (!voice_id || voice_id.trim() === '') {
      throw new Error('Voice ID is required and cannot be empty');
    }

    console.log(`Generating speech with voice_id: ${voice_id}, model: ${model_id}`);
    console.log('Voice settings:', voice_settings);

    const requestBody = {
      text,
      model_id,
      voice_settings: {
        stability: Math.max(0, Math.min(1, voice_settings.stability || 0.5)),
        similarity_boost: Math.max(0, Math.min(1, voice_settings.similarity_boost || 0.8)),
        style: Math.max(0, Math.min(1, voice_settings.style || 0.0)),
        use_speaker_boost: voice_settings.use_speaker_boost !== false,
      },
    };

    const response = await fetch(`${ELEVENLABS_API_BASE}/text-to-speech/${voice_id}`, {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`ElevenLabs API error for voice ${voice_id}:`, errorText);
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuffer);
    
    console.log(`Generated audio for voice ${voice_id}: ${audioBuffer.length} bytes`);
    return audioBuffer;

  } catch (error) {
    console.error('ElevenLabs TTS error:', error);
    throw new Error(`Speech generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getVoices() {
  try {
    const response = await fetch(`${ELEVENLABS_API_BASE}/voices`, {
      method: 'GET',
      headers: getApiHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    return data.voices.map((voice: any) => ({
      id: voice.voice_id,
      name: voice.name,
      description: voice.description || '',
      labels: voice.labels || {},
      preview_url: voice.preview_url,
      available_for_tiers: voice.available_for_tiers,
      settings: voice.settings,
    }));

  } catch (error) {
    console.error('Error fetching ElevenLabs voices:', error);
    throw new Error(`Failed to fetch voices: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function deleteVoice(voice_id: string): Promise<void> {
  try {
    const response = await fetch(`${ELEVENLABS_API_BASE}/voices/${voice_id}`, {
      method: 'DELETE',
      headers: getApiHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
    }
  } catch (error) {
    console.error('Error deleting ElevenLabs voice:', error);
    throw new Error(`Failed to delete voice: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getVoiceSettings(voice_id: string) {
  try {
    const response = await fetch(`${ELEVENLABS_API_BASE}/voices/${voice_id}/settings`, {
      method: 'GET',
      headers: getApiHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching voice settings:', error);
    throw new Error(`Failed to fetch voice settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function updateVoiceSettings(
  voice_id: string,
  settings: {
    stability?: number;
    similarity_boost?: number;
    style?: number;
    use_speaker_boost?: boolean;
  }
) {
  try {
    const response = await fetch(`${ELEVENLABS_API_BASE}/voices/${voice_id}/settings/edit`, {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating voice settings:', error);
    throw new Error(`Failed to update voice settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper function to validate audio file for voice cloning
export function validateAudioFile(file: File): { isValid: boolean; error?: string } {
  const maxSize = 25 * 1024 * 1024; // 25MB
  const allowedTypes = ['audio/mp3', 'audio/wav', 'audio/mpeg', 'audio/ogg', 'audio/flac'];
  
  if (file.size > maxSize) {
    return { isValid: false, error: 'File size must be less than 25MB' };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'File must be MP3, WAV, OGG, or FLAC format' };
  }
  
  return { isValid: true };
}

// Helper function to get optimized voice settings based on language and voice characteristics
export function getOptimizedVoiceSettings(language: string, voiceLabels?: any) {
  const baseSettings = {
    stability: 0.5,
    similarity_boost: 0.8,
    style: 0.0,
    use_speaker_boost: true,
  };

  // Language-specific optimizations
  switch (language) {
    case 'fr':
      return {
        ...baseSettings,
        stability: 0.6, // Slightly more stable for French
        similarity_boost: 0.9, // Higher similarity for French pronunciation
        style: 0.1, // Slight style for French expressiveness
      };
    case 'vi':
      return {
        ...baseSettings,
        stability: 0.5,
        similarity_boost: 0.85,
        style: 0.05,
      };
    case 'en':
      return {
        ...baseSettings,
        stability: 0.4, // More dynamic for English
        similarity_boost: 0.8,
        style: 0.2,
      };
    default:
      return baseSettings;
  }
}

// Helper function to estimate voice cloning quality
export function estimateVoiceQuality(files: File[]): number {
  if (files.length === 0) return 0;
  
  let qualityScore = 0.3; // Base score
  
  // Bonus for multiple files
  if (files.length > 1) {
    qualityScore += Math.min(files.length * 0.1, 0.3);
  }
  
  // Bonus for longer duration (estimated from file size)
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  const estimatedDuration = totalSize / (128 * 1024); // Rough estimate in seconds
  
  if (estimatedDuration > 30) {
    qualityScore += 0.2;
  }
  
  if (estimatedDuration > 60) {
    qualityScore += 0.2;
  }
  
  return Math.min(qualityScore, 1.0);
}