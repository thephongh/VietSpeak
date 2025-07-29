'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Trash2, Play, Search, Star, Clock, User, Mic } from 'lucide-react';
import { cn, formatDuration } from '@/lib/utils';

interface Voice {
  id: string;
  name: string;
  description?: string;
  language: string;
  type: 'google_cloud' | 'cloned';
  provider?: string;
  quality_score?: number;
  created_at?: string;
  sample_duration?: number;
  preview_url?: string;
  usage_count?: number;
  last_used?: string;
}

interface VoiceLibraryProps {
  onVoiceSelect: (voiceId: string, voice: Voice) => void;
  onVoiceDeleted: (voiceId: string) => void;
  onError: (error: string) => void;
}

export function VoiceLibrary({ onVoiceSelect, onVoiceDeleted, onError }: VoiceLibraryProps) {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [filteredVoices, setFilteredVoices] = useState<Voice[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);

  useEffect(() => {
    loadVoices();
  }, []);

  useEffect(() => {
    filterVoices();
  }, [voices, searchQuery, selectedLanguage, selectedType]);

  const loadVoices = async () => {
    setIsLoading(true);
    try {
      // Load Google Cloud voices
      const googleVoicesResponse = await fetch('/api/tts/voices');
      const googleVoicesData = await googleVoicesResponse.json();
      
      // Load cloned voices from ElevenLabs
      const clonedVoicesResponse = await fetch('/api/voices/list');
      const clonedVoicesData = await clonedVoicesResponse.json();
      
      // Load local voice preferences and usage data
      const localVoices = getLocalVoiceData();
      
      // Combine all voices
      const allVoices = [
        ...googleVoicesData.voices.map((voice: any) => ({
          ...voice,
          type: 'google_cloud' as const,
          usage_count: localVoices[voice.id]?.usage_count || 0,
          last_used: localVoices[voice.id]?.last_used,
        })),
        ...clonedVoicesData.voices.map((voice: any) => ({
          ...voice,
          type: 'cloned' as const,
          usage_count: localVoices[voice.id]?.usage_count || 0,
          last_used: localVoices[voice.id]?.last_used,
        })),
      ];

      setVoices(allVoices);
    } catch (error) {
      console.error('Error loading voices:', error);
      onError('Failed to load voice library');
    } finally {
      setIsLoading(false);
    }
  };

  const filterVoices = () => {
    let filtered = voices;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(voice =>
        voice.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        voice.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by language
    if (selectedLanguage !== 'all') {
      filtered = filtered.filter(voice => voice.language === selectedLanguage);
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(voice => voice.type === selectedType);
    }

    // Sort by usage count and last used
    filtered.sort((a, b) => {
      if (a.usage_count !== b.usage_count) {
        return (b.usage_count || 0) - (a.usage_count || 0);
      }
      if (a.last_used && b.last_used) {
        return new Date(b.last_used).getTime() - new Date(a.last_used).getTime();
      }
      return a.name.localeCompare(b.name);
    });

    setFilteredVoices(filtered);
  };

  const getLocalVoiceData = () => {
    try {
      const data = localStorage.getItem('voice-usage-data');
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  };

  const updateLocalVoiceData = (voiceId: string, updates: any) => {
    try {
      const data = getLocalVoiceData();
      data[voiceId] = { ...data[voiceId], ...updates };
      localStorage.setItem('voice-usage-data', JSON.stringify(data));
    } catch (error) {
      console.error('Error updating local voice data:', error);
    }
  };

  const handleVoiceSelect = (voice: Voice) => {
    // Update usage statistics
    const newUsageCount = (voice.usage_count || 0) + 1;
    const now = new Date().toISOString();
    
    updateLocalVoiceData(voice.id, {
      usage_count: newUsageCount,
      last_used: now,
    });

    // Update local state
    setVoices(prevVoices =>
      prevVoices.map(v =>
        v.id === voice.id
          ? { ...v, usage_count: newUsageCount, last_used: now }
          : v
      )
    );

    onVoiceSelect(voice.id, voice);
  };

  const handleDeleteVoice = async (voice: Voice) => {
    if (voice.type !== 'cloned') {
      onError('Only cloned voices can be deleted');
      return;
    }

    if (!confirm(`Are you sure you want to delete "${voice.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/voices/delete/${voice.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete voice');
      }

      // Remove from local state
      setVoices(prevVoices => prevVoices.filter(v => v.id !== voice.id));
      
      // Remove from local storage
      const localData = getLocalVoiceData();
      delete localData[voice.id];
      localStorage.setItem('voice-usage-data', JSON.stringify(localData));

      onVoiceDeleted(voice.id);
    } catch (error) {
      console.error('Error deleting voice:', error);
      onError('Failed to delete voice');
    }
  };

  const handlePlayPreview = async (voice: Voice) => {
    if (playingVoice === voice.id) {
      setPlayingVoice(null);
      return;
    }

    if (!voice.preview_url) {
      onError('No preview available for this voice');
      return;
    }

    try {
      setPlayingVoice(voice.id);
      const audio = new Audio(voice.preview_url);
      audio.onended = () => setPlayingVoice(null);
      audio.onerror = () => {
        setPlayingVoice(null);
        onError('Failed to play preview');
      };
      await audio.play();
    } catch (error) {
      setPlayingVoice(null);
      onError('Failed to play preview');
    }
  };

  const getLanguageName = (code: string) => {
    const names: Record<string, string> = {
      'vi': 'Vietnamese',
      'en': 'English',
      'fr': 'French',
    };
    return names[code] || code;
  };

  const uniqueLanguages = [...new Set(voices.map(v => v.language))];

  if (isLoading) {
    return (
      <Card className="glass-card border-white/20">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-red-500 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Loading voice library...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <Card className="glass-card border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <User className="h-5 w-5" />
            Voice Library ({filteredVoices.length} voices)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search voices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 glass bg-white/50"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full h-10 px-3 py-2 rounded-md border border-input bg-white/50 text-sm"
              >
                <option value="all">All Languages</option>
                {uniqueLanguages.map(lang => (
                  <option key={lang} value={lang}>{getLanguageName(lang)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full h-10 px-3 py-2 rounded-md border border-input bg-white/50 text-sm"
              >
                <option value="all">All Types</option>
                <option value="google_cloud">Google Cloud</option>
                <option value="cloned">Cloned Voices</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Voice Grid */}
      {filteredVoices.length === 0 ? (
        <Card className="glass-card border-white/20">
          <CardContent className="p-8 text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">No voices found</h3>
            <p className="text-gray-600">
              {searchQuery || selectedLanguage !== 'all' || selectedType !== 'all'
                ? 'Try adjusting your search filters'
                : 'Create your first cloned voice to get started'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVoices.map((voice) => (
            <Card
              key={voice.id}
              className="glass-card border-white/20 hover:shadow-lg transition-all duration-200 cursor-pointer group"
              onClick={() => handleVoiceSelect(voice)}
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-800 truncate">
                        {voice.name}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">
                        {voice.description || 'No description'}
                      </p>
                    </div>
                    {voice.usage_count && voice.usage_count > 0 && (
                      <Badge variant="secondary" className="bg-white/50 text-xs">
                        <Star className="h-3 w-3 mr-1" />
                        {voice.usage_count}
                      </Badge>
                    )}
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge 
                      variant="outline" 
                      className={cn(
                        'text-xs',
                        voice.type === 'cloned' 
                          ? 'bg-purple-50 text-purple-700 border-purple-200' 
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      )}
                    >
                      {voice.type === 'cloned' ? (
                        <><Mic className="h-3 w-3 mr-1" />Cloned</>
                      ) : (
                        'Google Cloud'
                      )}
                    </Badge>
                    <Badge variant="outline" className="text-xs bg-gray-50">
                      {getLanguageName(voice.language)}
                    </Badge>
                    {voice.quality_score && (
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                        {Math.round(voice.quality_score * 100)}% Quality
                      </Badge>
                    )}
                  </div>

                  {/* Stats */}
                  {(voice.sample_duration || voice.last_used) && (
                    <div className="text-xs text-gray-500 space-y-1">
                      {voice.sample_duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDuration(Math.floor(voice.sample_duration))}
                        </div>
                      )}
                      {voice.last_used && (
                        <div>
                          Last used: {new Date(voice.last_used).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/20">
                    <div className="flex items-center gap-2">
                      {voice.preview_url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlayPreview(voice);
                          }}
                          className="h-8 px-2 hover:bg-white/20"
                        >
                          <Play className={cn(
                            'h-3 w-3',
                            playingVoice === voice.id && 'animate-pulse'
                          )} />
                        </Button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {voice.type === 'cloned' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteVoice(voice);
                          }}
                          className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}