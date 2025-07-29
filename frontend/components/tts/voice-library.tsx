'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiClient, VoiceProfile } from '@/lib/api';
import { voiceStorage } from '@/lib/voice-storage';

interface VoiceLibraryProps {
  onVoiceSelect?: (voiceId: string) => void;
  onVoiceDeleted?: () => void;
  onError?: (error: string) => void;
}

export function VoiceLibrary({ onVoiceSelect, onVoiceDeleted, onError }: VoiceLibraryProps) {
  const [voices, setVoices] = useState<VoiceProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);

  useEffect(() => {
    loadVoices();
  }, []);

  const loadVoices = async () => {
    try {
      setLoading(true);
      const profiles = await apiClient.getVoiceProfiles();
      setVoices(profiles);
    } catch (err) {
      onError?.('Failed to load voice profiles');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (voiceId: string) => {
    if (!confirm('Are you sure you want to delete this voice? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(voiceId);
      await apiClient.deleteVoiceProfile(voiceId);
      
      // Remove from localStorage
      voiceStorage.deleteVoiceProfile(voiceId);
      
      setVoices(voices.filter(v => v.voice_id !== voiceId));
      if (selectedVoice === voiceId) {
        setSelectedVoice(null);
      }
      onVoiceDeleted?.();
    } catch (err) {
      onError?.('Failed to delete voice profile');
    } finally {
      setDeleting(null);
    }
  };

  const handleSelect = (voiceId: string) => {
    setSelectedVoice(voiceId);
    onVoiceSelect?.(voiceId);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Unknown';
    }
  };

  const getLanguageDisplay = (lang: string) => {
    const languages = {
      'vi': 'Vietnamese',
      'en': 'English',
      'fr': 'French'
    };
    return languages[lang as keyof typeof languages] || lang;
  };

  const getQualityBadge = (score?: number) => {
    if (!score) return null;
    
    if (score >= 0.8) {
      return <Badge variant="default" className="bg-green-500">High Quality</Badge>;
    } else if (score >= 0.6) {
      return <Badge variant="secondary">Good Quality</Badge>;
    } else {
      return <Badge variant="destructive">Fair Quality</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Voice Library</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Loading voices...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Voice Library</CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={loadVoices}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Manage your custom voice profiles
        </p>
      </CardHeader>
      <CardContent>
        {voices.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-muted-foreground mb-2">
              <svg 
                className="mx-auto h-12 w-12 mb-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="1" 
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" 
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">No custom voices yet</h3>
            <p className="text-sm text-muted-foreground">
              Create your first custom voice by uploading a voice sample above.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {voices.map((voice) => (
              <div 
                key={voice.voice_id}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedVoice === voice.voice_id 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => handleSelect(voice.voice_id)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium">{voice.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {getLanguageDisplay(voice.language)} • Created {formatDate(voice.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getQualityBadge(voice.quality_score)}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(voice.voice_id);
                      }}
                      disabled={deleting === voice.voice_id}
                      className="text-red-600 hover:text-red-700"
                    >
                      {deleting === voice.voice_id ? 'Deleting...' : 'Delete'}
                    </Button>
                  </div>
                </div>

                {voice.description && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {voice.description}
                  </p>
                )}

                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>ID: {voice.voice_id.slice(0, 8)}...</span>
                  {voice.sample_duration && (
                    <span>
                      Sample: {Math.round(voice.sample_duration)}s
                    </span>
                  )}
                </div>

                {selectedVoice === voice.voice_id && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Download sample audio
                          const url = apiClient.getVoiceSampleUrl(voice.voice_id);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `${voice.name}_sample.wav`;
                          a.click();
                        }}
                      >
                        Download Sample
                      </Button>
                      <Button 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onVoiceSelect?.(voice.voice_id);
                        }}
                      >
                        Use This Voice
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}