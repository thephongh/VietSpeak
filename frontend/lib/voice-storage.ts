// Voice profile management with localStorage persistence

export interface StoredVoiceProfile {
  voice_id: string;
  name: string;
  language: string;
  description?: string;
  created_at: string;
  sample_duration?: number;
  quality_score?: number;
  is_favorite?: boolean;
  usage_count?: number;
  last_used?: string;
}

export interface VoicePreferences {
  default_voice_id?: string;
  preferred_language: string;
  preferred_speed: number;
  auto_clean_text: boolean;
  show_quality_badges: boolean;
}

class VoiceStorageManager {
  private readonly VOICE_PROFILES_KEY = 'tts_voice_profiles';
  private readonly VOICE_PREFERENCES_KEY = 'tts_voice_preferences';
  private readonly RECENT_VOICES_KEY = 'tts_recent_voices';
  private readonly MAX_RECENT_VOICES = 10;

  // Voice Profiles Management
  getVoiceProfiles(): StoredVoiceProfile[] {
    try {
      const stored = localStorage.getItem(this.VOICE_PROFILES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get voice profiles from localStorage:', error);
      return [];
    }
  }

  saveVoiceProfile(profile: StoredVoiceProfile): void {
    try {
      const profiles = this.getVoiceProfiles();
      const existingIndex = profiles.findIndex(p => p.voice_id === profile.voice_id);
      
      if (existingIndex >= 0) {
        profiles[existingIndex] = { ...profiles[existingIndex], ...profile };
      } else {
        profiles.push(profile);
      }
      
      localStorage.setItem(this.VOICE_PROFILES_KEY, JSON.stringify(profiles));
    } catch (error) {
      console.error('Failed to save voice profile to localStorage:', error);
    }
  }

  deleteVoiceProfile(voiceId: string): void {
    try {
      const profiles = this.getVoiceProfiles();
      const filteredProfiles = profiles.filter(p => p.voice_id !== voiceId);
      localStorage.setItem(this.VOICE_PROFILES_KEY, JSON.stringify(filteredProfiles));
      
      // Also remove from recent voices
      this.removeFromRecentVoices(voiceId);
      
      // Update preferences if this was the default voice
      const preferences = this.getVoicePreferences();
      if (preferences.default_voice_id === voiceId) {
        this.updateVoicePreferences({ ...preferences, default_voice_id: undefined });
      }
    } catch (error) {
      console.error('Failed to delete voice profile from localStorage:', error);
    }
  }

  getVoiceProfile(voiceId: string): StoredVoiceProfile | null {
    const profiles = this.getVoiceProfiles();
    return profiles.find(p => p.voice_id === voiceId) || null;
  }

  updateVoiceProfile(voiceId: string, updates: Partial<StoredVoiceProfile>): void {
    try {
      const profiles = this.getVoiceProfiles();
      const profileIndex = profiles.findIndex(p => p.voice_id === voiceId);
      
      if (profileIndex >= 0) {
        profiles[profileIndex] = { ...profiles[profileIndex], ...updates };
        localStorage.setItem(this.VOICE_PROFILES_KEY, JSON.stringify(profiles));
      }
    } catch (error) {
      console.error('Failed to update voice profile:', error);
    }
  }

  // Voice Preferences Management
  getVoicePreferences(): VoicePreferences {
    try {
      const stored = localStorage.getItem(this.VOICE_PREFERENCES_KEY);
      const defaults: VoicePreferences = {
        preferred_language: 'vi',
        preferred_speed: 1.0,
        auto_clean_text: true,
        show_quality_badges: true
      };
      
      return stored ? { ...defaults, ...JSON.parse(stored) } : defaults;
    } catch (error) {
      console.error('Failed to get voice preferences:', error);
      return {
        preferred_language: 'vi',
        preferred_speed: 1.0,
        auto_clean_text: true,
        show_quality_badges: true
      };
    }
  }

  updateVoicePreferences(preferences: Partial<VoicePreferences>): void {
    try {
      const current = this.getVoicePreferences();
      const updated = { ...current, ...preferences };
      localStorage.setItem(this.VOICE_PREFERENCES_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save voice preferences:', error);
    }
  }

  // Recent Voices Management
  getRecentVoices(): string[] {
    try {
      const stored = localStorage.getItem(this.RECENT_VOICES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get recent voices:', error);
      return [];
    }
  }

  addToRecentVoices(voiceId: string): void {
    try {
      let recent = this.getRecentVoices();
      
      // Remove if already exists
      recent = recent.filter(id => id !== voiceId);
      
      // Add to beginning
      recent.unshift(voiceId);
      
      // Limit to max recent voices
      recent = recent.slice(0, this.MAX_RECENT_VOICES);
      
      localStorage.setItem(this.RECENT_VOICES_KEY, JSON.stringify(recent));
    } catch (error) {
      console.error('Failed to add to recent voices:', error);
    }
  }

  removeFromRecentVoices(voiceId: string): void {
    try {
      const recent = this.getRecentVoices();
      const filtered = recent.filter(id => id !== voiceId);
      localStorage.setItem(this.RECENT_VOICES_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to remove from recent voices:', error);
    }
  }

  // Favorites Management
  toggleVoiceFavorite(voiceId: string): void {
    const profile = this.getVoiceProfile(voiceId);
    if (profile) {
      this.updateVoiceProfile(voiceId, { 
        is_favorite: !profile.is_favorite 
      });
    }
  }

  getFavoriteVoices(): StoredVoiceProfile[] {
    return this.getVoiceProfiles().filter(p => p.is_favorite);
  }

  // Usage Tracking
  recordVoiceUsage(voiceId: string): void {
    const profile = this.getVoiceProfile(voiceId);
    if (profile) {
      this.updateVoiceProfile(voiceId, {
        usage_count: (profile.usage_count || 0) + 1,
        last_used: new Date().toISOString()
      });
      
      // Add to recent voices
      this.addToRecentVoices(voiceId);
    }
  }

  // Data Management
  exportVoiceData(): string {
    try {
      const data = {
        profiles: this.getVoiceProfiles(),
        preferences: this.getVoicePreferences(),
        recent: this.getRecentVoices(),
        exported_at: new Date().toISOString()
      };
      
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Failed to export voice data:', error);
      throw new Error('Failed to export voice data');
    }
  }

  importVoiceData(jsonData: string): void {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.profiles && Array.isArray(data.profiles)) {
        localStorage.setItem(this.VOICE_PROFILES_KEY, JSON.stringify(data.profiles));
      }
      
      if (data.preferences) {
        localStorage.setItem(this.VOICE_PREFERENCES_KEY, JSON.stringify(data.preferences));
      }
      
      if (data.recent && Array.isArray(data.recent)) {
        localStorage.setItem(this.RECENT_VOICES_KEY, JSON.stringify(data.recent));
      }
    } catch (error) {
      console.error('Failed to import voice data:', error);
      throw new Error('Invalid voice data format');
    }
  }

  clearAllVoiceData(): void {
    try {
      localStorage.removeItem(this.VOICE_PROFILES_KEY);
      localStorage.removeItem(this.VOICE_PREFERENCES_KEY);
      localStorage.removeItem(this.RECENT_VOICES_KEY);
    } catch (error) {
      console.error('Failed to clear voice data:', error);
    }
  }

  // Storage Info
  getStorageInfo(): { 
    profileCount: number; 
    favoriteCount: number; 
    recentCount: number; 
    storageSize: number 
  } {
    try {
      const profiles = this.getVoiceProfiles();
      const recent = this.getRecentVoices();
      const favorites = profiles.filter(p => p.is_favorite);
      
      // Calculate approximate storage size
      const profilesSize = JSON.stringify(profiles).length;
      const preferencesSize = JSON.stringify(this.getVoicePreferences()).length;
      const recentSize = JSON.stringify(recent).length;
      
      return {
        profileCount: profiles.length,
        favoriteCount: favorites.length,
        recentCount: recent.length,
        storageSize: profilesSize + preferencesSize + recentSize
      };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return {
        profileCount: 0,
        favoriteCount: 0,
        recentCount: 0,
        storageSize: 0
      };
    }
  }
}

// Export singleton instance
export const voiceStorage = new VoiceStorageManager();