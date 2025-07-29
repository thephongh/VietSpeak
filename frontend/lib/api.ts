const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface TTSRequest {
  text: string;
  language?: string;
  speed?: number;
  voice_id?: string;
  clean_text?: boolean;
}

export interface TTSResponse {
  audio_id: string;
  message: string;
  stats?: {
    characters: number;
    words: number;
    sentences: number;
    estimated_duration: number;
  };
  processed_text?: string;
  language?: string;
}

export interface Voice {
  id: string;
  name: string;
  language: string;
  type: string;
  created_at?: string;
  quality_score?: number;
}

export interface VoiceProfile {
  voice_id: string;
  name: string;
  language: string;
  description?: string;
  created_at: string;
  sample_duration?: number;
  quality_score?: number;
}

export interface VoiceUploadResponse {
  voice_id: string;
  message: string;
  status: string;
}

export interface VoiceCloneRequest {
  text: string;
  voice_id: string;
  language?: string;
  speed?: number;
}

export interface VoiceCloneResponse {
  audio_id: string;
  message: string;
  voice_id: string;
  stats?: {
    characters: number;
    words: number;
    sentences: number;
    estimated_duration: number;
  };
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API Error: ${error}`);
    }

    return response.json();
  }

  async postFormData<T>(endpoint: string, formData: FormData): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API Error: ${error}`);
    }

    return response.json();
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API Error: ${error}`);
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API Error: ${error}`);
    }

    return response.json();
  }

  async synthesizeText(request: TTSRequest): Promise<TTSResponse> {
    return this.post<TTSResponse>('/api/tts/synthesize', request);
  }

  async getVoices(): Promise<Voice[]> {
    return this.get<Voice[]>('/api/tts/voices');
  }

  getAudioUrl(audioId: string): string {
    return `${this.baseUrl}/api/tts/audio/${audioId}`;
  }

  async healthCheck(): Promise<{ status: string; version: string; project: string }> {
    return this.get('/api/health');
  }

  // Voice Cloning Methods
  async uploadVoiceSample(formData: FormData): Promise<VoiceUploadResponse> {
    return this.postFormData<VoiceUploadResponse>('/api/voice-cloning/upload-sample', formData);
  }

  async cloneVoice(request: VoiceCloneRequest): Promise<VoiceCloneResponse> {
    return this.post<VoiceCloneResponse>('/api/voice-cloning/clone', request);
  }

  async getVoiceProfiles(): Promise<VoiceProfile[]> {
    return this.get<VoiceProfile[]>('/api/voice-cloning/profiles');
  }

  async getVoiceProfile(voiceId: string): Promise<VoiceProfile> {
    return this.get<VoiceProfile>(`/api/voice-cloning/profiles/${voiceId}`);
  }

  async deleteVoiceProfile(voiceId: string): Promise<{ message: string }> {
    return this.delete<{ message: string }>(`/api/voice-cloning/profiles/${voiceId}`);
  }

  getVoiceSampleUrl(voiceId: string): string {
    return `${this.baseUrl}/api/voice-cloning/sample/${voiceId}`;
  }
}

export const apiClient = new ApiClient();