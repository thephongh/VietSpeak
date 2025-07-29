interface TTSRequest {
  text: string;
  language?: string;
  voice?: string;
  speed?: number;
  pitch?: number;
  clean_text?: boolean;
}

interface VoiceCloneRequest {
  text: string;
  voice_id: string;
  elevenlabs_voice_id: string;
  language?: string;
  speed?: number;
  stability?: number;
  similarity_boost?: number;
  style?: number;
  clean_text?: boolean;
}

interface Voice {
  id: string;
  name: string;
  language: string;
  gender?: string;
  type: string;
  quality?: string;
  description?: string;
}

interface TTSResponse {
  audio_id: string;
  original_text: string;
  processed_text: string;
  language: string;
  voice?: string;
  speed: number;
  pitch?: number;
  stats: {
    characters: number;
    words: number;
    sentences: number;
    estimated_duration: number;
  };
  audio_data: string; // base64 encoded audio
  file_info: {
    format: string;
    sample_rate: number;
  };
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}/api${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Text-to-Speech with Google Cloud TTS
  async synthesizeText(request: TTSRequest): Promise<TTSResponse> {
    return this.request<TTSResponse>('/tts/synthesize', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Get available Google Cloud TTS voices
  async getVoices(): Promise<{ voices: Voice[]; count: number }> {
    return this.request<{ voices: Voice[]; count: number }>('/tts/voices');
  }

  // Voice cloning with ElevenLabs
  async cloneVoice(formData: FormData): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/voices/clone`, {
      method: 'POST',
      body: formData, // Don't set Content-Type for FormData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Synthesize with cloned voice
  async synthesizeWithClonedVoice(request: VoiceCloneRequest): Promise<TTSResponse> {
    return this.request<TTSResponse>('/voices/synthesize', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Get cloned voices
  async getClonedVoices(): Promise<{ voices: Voice[]; count: number }> {
    return this.request<{ voices: Voice[]; count: number }>('/voices/list');
  }

  // Delete cloned voice
  async deleteVoice(voiceId: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/voices/delete/${voiceId}`, {
      method: 'DELETE',
    });
  }

  // Health check
  async healthCheck(): Promise<any> {
    return this.request<any>('/health');
  }

  // Helper method to create audio URL from base64 data
  createAudioUrl(audioData: string): string {
    return audioData; // audioData is already in data URL format
  }

  // Download audio file
  downloadAudio(audioData: string, filename: string = 'audio.mp3'): void {
    const link = document.createElement('a');
    link.href = audioData;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// Export singleton instance
export const apiClient = new ApiClient(
  typeof window !== 'undefined' ? window.location.origin : ''
);