'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { apiClient, Voice } from '@/lib/api';

export default function Home() {
  const [text, setText] = useState('');
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadVoices();
  }, []);

  const loadVoices = async () => {
    try {
      const voiceList = await apiClient.getVoices();
      setVoices(voiceList);
      if (voiceList.length > 0) {
        setSelectedVoice(voiceList[0].id);
      }
    } catch (err) {
      setError('Failed to load voices');
    }
  };

  const handleGenerateSpeech = async () => {
    if (!text.trim()) {
      setError('Please enter some text');
      return;
    }

    setIsLoading(true);
    setError('');
    setAudioUrl('');

    try {
      const response = await apiClient.synthesizeText({
        text: text.trim(),
        language: 'vi',
        speed: 1.0,
        voice_id: selectedVoice
      });

      const audioUrl = apiClient.getAudioUrl(response.audio_id);
      setAudioUrl(audioUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate speech');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Vietnamese Text-to-Speech
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            AI-powered Vietnamese TTS with voice cloning capabilities. 
            Convert text to natural-sounding speech in Vietnamese, English, and French.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Text Input</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Textarea
                placeholder="Enter your text here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-32"
              />
              
              {voices.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-2">Voice</label>
                  <select 
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                    className="w-full p-2 border border-input rounded-md"
                  >
                    {voices.map((voice) => (
                      <option key={voice.id} value={voice.id}>
                        {voice.name} ({voice.language})
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="flex gap-4">
                <Button 
                  onClick={handleGenerateSpeech}
                  disabled={isLoading || !text.trim()}
                >
                  {isLoading ? 'Generating...' : 'Generate Speech'}
                </Button>
              </div>
              
              {error && (
                <div className="text-red-600 p-3 bg-red-50 rounded-md">
                  {error}
                </div>
              )}
              
              {audioUrl && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">Generated Audio</h3>
                  <audio controls className="w-full">
                    <source src={audioUrl} type="audio/wav" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}