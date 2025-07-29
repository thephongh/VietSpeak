// Local Storage utilities for voice preferences and data

export interface VoicePreferences {
  preferred_language: string;
  preferred_speed: number;
  preferred_pitch?: number;
  auto_clean_text: boolean;
  default_voice_id?: string;
  default_cloned_voice_id?: string;
}

export interface VoiceProfile {
  voice_id: string;
  name: string;
  language: string;
  description?: string;
  created_at: string;
  sample_duration?: number;
  quality_score?: number;
  elevenlabs_voice_id?: string;
  usage_count?: number;
  last_used?: string;
}

export interface AudioHistory {
  id: string;
  text: string;
  language: string;
  voice_id?: string;
  created_at: string;
  audio_data?: string; // base64 audio data
  stats?: {
    characters: number;
    words: number;
    sentences: number;
    estimated_duration: number;
  };
}

const STORAGE_KEYS = {
  VOICE_PREFERENCES: 'tts-voice-preferences',
  VOICE_PROFILES: 'tts-voice-profiles',
  AUDIO_HISTORY: 'tts-audio-history',
  VOICE_USAGE: 'tts-voice-usage',
} as const;

class StorageManager {
  // Voice Preferences
  getVoicePreferences(): VoicePreferences {
    if (typeof window === 'undefined') {
      return this.getDefaultPreferences();
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.VOICE_PREFERENCES);
      if (stored) {
        return { ...this.getDefaultPreferences(), ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Error loading voice preferences:', error);
    }
    
    return this.getDefaultPreferences();
  }

  updateVoicePreferences(updates: Partial<VoicePreferences>): void {
    if (typeof window === 'undefined') return;

    try {
      const current = this.getVoicePreferences();
      const updated = { ...current, ...updates };
      localStorage.setItem(STORAGE_KEYS.VOICE_PREFERENCES, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving voice preferences:', error);
    }
  }

  private getDefaultPreferences(): VoicePreferences {
    return {
      preferred_language: 'vi',
      preferred_speed: 1.0,
      preferred_pitch: 0,
      auto_clean_text: true,
    };
  }

  // Voice Profiles (Cloned Voices)
  saveVoiceProfile(profile: VoiceProfile): void {
    if (typeof window === 'undefined') return;

    try {
      const profiles = this.getAllVoiceProfiles();
      const updated = profiles.filter(p => p.voice_id !== profile.voice_id);
      updated.push({
        ...profile,
        created_at: profile.created_at || new Date().toISOString(),
      });
      
      localStorage.setItem(STORAGE_KEYS.VOICE_PROFILES, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving voice profile:', error);
    }
  }

  getAllVoiceProfiles(): VoiceProfile[] {
    if (typeof window === 'undefined') return [];

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.VOICE_PROFILES);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading voice profiles:', error);
      return [];
    }
  }

  getVoiceProfile(voiceId: string): VoiceProfile | null {
    const profiles = this.getAllVoiceProfiles();
    return profiles.find(p => p.voice_id === voiceId) || null;
  }

  deleteVoiceProfile(voiceId: string): void {
    if (typeof window === 'undefined') return;

    try {
      const profiles = this.getAllVoiceProfiles();
      const updated = profiles.filter(p => p.voice_id !== voiceId);
      localStorage.setItem(STORAGE_KEYS.VOICE_PROFILES, JSON.stringify(updated));
    } catch (error) {
      console.error('Error deleting voice profile:', error);
    }
  }

  // Voice Usage Statistics
  recordVoiceUsage(voiceId: string): void {
    if (typeof window === 'undefined') return;

    try {
      const usage = this.getVoiceUsage();
      usage[voiceId] = {
        count: (usage[voiceId]?.count || 0) + 1,
        last_used: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEYS.VOICE_USAGE, JSON.stringify(usage));
    } catch (error) {
      console.error('Error recording voice usage:', error);
    }
  }

  getVoiceUsage(): Record<string, { count: number; last_used: string }> {
    if (typeof window === 'undefined') return {};

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.VOICE_USAGE);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error loading voice usage:', error);
      return {};
    }
  }

  // Audio History
  saveAudioHistory(audio: AudioHistory): void {
    if (typeof window === 'undefined') return;

    try {
      const history = this.getAudioHistory();
      // Limit history to 50 items to prevent storage overflow
      const updated = [audio, ...history.slice(0, 49)];
      localStorage.setItem(STORAGE_KEYS.AUDIO_HISTORY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving audio history:', error);
    }
  }

  getAudioHistory(): AudioHistory[] {
    if (typeof window === 'undefined') return [];

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.AUDIO_HISTORY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading audio history:', error);
      return [];
    }
  }

  deleteAudioHistory(audioId: string): void {
    if (typeof window === 'undefined') return;

    try {
      const history = this.getAudioHistory();
      const updated = history.filter(h => h.id !== audioId);
      localStorage.setItem(STORAGE_KEYS.AUDIO_HISTORY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error deleting audio history:', error);
    }
  }

  clearAudioHistory(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(STORAGE_KEYS.AUDIO_HISTORY);
    } catch (error) {
      console.error('Error clearing audio history:', error);
    }
  }

  // Storage cleanup
  clearAllData(): void {
    if (typeof window === 'undefined') return;

    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }

  getStorageSize(): number {
    if (typeof window === 'undefined') return 0;

    try {
      let totalSize = 0;
      Object.values(STORAGE_KEYS).forEach(key => {
        const item = localStorage.getItem(key);
        if (item) {
          totalSize += item.length;
        }
      });
      return totalSize;
    } catch (error) {
      console.error('Error calculating storage size:', error);
      return 0;
    }
  }

  // Export/Import functionality
  exportData(): string {
    if (typeof window === 'undefined') return '{}';

    try {
      const data: Record<string, any> = {};
      Object.values(STORAGE_KEYS).forEach(key => {
        const item = localStorage.getItem(key);
        if (item) {
          data[key] = JSON.parse(item);
        }
      });
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Error exporting data:', error);
      return '{}';
    }
  }

  importData(jsonData: string): void {
    if (typeof window === 'undefined') return;

    try {
      const data = JSON.parse(jsonData);
      Object.entries(data).forEach(([key, value]) => {
        if (Object.values(STORAGE_KEYS).includes(key as any)) {
          localStorage.setItem(key, JSON.stringify(value));
        }
      });
    } catch (error) {
      console.error('Error importing data:', error);
      throw new Error('Invalid data format');
    }
  }
}

// Export singleton instance
export const storage = new StorageManager();

// Convenience exports
export const {
  getVoicePreferences,
  updateVoicePreferences,
  saveVoiceProfile,
  getAllVoiceProfiles,
  getVoiceProfile,
  deleteVoiceProfile,
  recordVoiceUsage,
  getVoiceUsage,
  saveAudioHistory,
  getAudioHistory,
  deleteAudioHistory,
  clearAudioHistory,
} = storage;