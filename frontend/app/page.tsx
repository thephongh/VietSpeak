'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FileUpload } from '@/components/tts/file-upload';
import { AudioPlayer } from '@/components/tts/audio-player';
import { VoiceControls } from '@/components/tts/voice-controls';
import { apiClient, Voice } from '@/lib/api';
import { TextProcessor } from '@/lib/text-processor';

export default function Home() {
  const [text, setText] = useState('');
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  const [error, setError] = useState('');
  const [cleanText, setCleanText] = useState(true);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const [language, setLanguage] = useState('vi');
  const [generationStats, setGenerationStats] = useState<any>(null);

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

  const handleFileUpload = (extractedText: string) => {
    setText(extractedText);
    setShowFileUpload(false);
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
      // Process text if cleaning is enabled
      const processedText = cleanText 
        ? TextProcessor.cleanText(text.trim())
        : text.trim();

      const response = await apiClient.synthesizeText({
        text: processedText,
        language: language,
        speed: speed,
        voice_id: selectedVoice,
        clean_text: cleanText
      });

      const audioUrl = apiClient.getAudioUrl(response.audio_id);
      setAudioUrl(audioUrl);
      setGenerationStats(response.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate speech');
    } finally {
      setIsLoading(false);
    }
  };

  const textStats = text ? TextProcessor.getTextStats(text) : null;
  const hasMarkdown = text ? TextProcessor.hasMarkdownFormatting(text) : false;

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
        
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Text Input - Main Column */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Text Input</CardTitle>
                </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label htmlFor="text-input">Text Input</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFileUpload(!showFileUpload)}
                  >
                    {showFileUpload ? 'Manual Input' : 'Upload File'}
                  </Button>
                </div>
                
                {showFileUpload ? (
                  <FileUpload onTextExtracted={handleFileUpload} />
                ) : (
                  <Textarea
                    id="text-input"
                    placeholder="Enter your text here..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="min-h-32"
                  />
                )}
              </div>

              {/* Text Processing Options */}
              {text && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="clean-text"
                      checked={cleanText}
                      onChange={(e) => setCleanText(e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="clean-text" className="text-sm">
                      Clean text (remove markdown, links, formatting)
                      {hasMarkdown && <span className="text-orange-600 ml-1">• Markdown detected</span>}
                    </Label>
                  </div>
                  
                  {textStats && (
                    <div className="text-sm text-muted-foreground">
                      {textStats.words} words • {textStats.characters} characters • 
                      ~{Math.floor(textStats.estimatedDuration / 60)}:{String(textStats.estimatedDuration % 60).padStart(2, '0')} estimated
                    </div>
                  )}
                </div>
              )}
              
              {/* Voice and Language Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="block text-sm font-medium mb-2">Language</Label>
                  <select 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full p-2 border border-input rounded-md"
                  >
                    <option value="vi">Vietnamese</option>
                    <option value="en">English</option>
                    <option value="fr">French</option>
                    <option value="auto">Auto-detect</option>
                  </select>
                </div>
                
                {voices.length > 0 && (
                  <div>
                    <Label className="block text-sm font-medium mb-2">Voice</Label>
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
              </div>
              
              <div className="flex gap-4">
                <Button 
                  onClick={handleGenerateSpeech}
                  disabled={isLoading || !text.trim()}
                  size="lg"
                >
                  {isLoading ? 'Generating...' : 'Generate Speech'}
                </Button>
              </div>
              
              {error && (
                <div className="text-red-600 p-3 bg-red-50 rounded-md">
                  {error}
                </div>
              )}
              
              {/* Generated Audio Player */}
              {audioUrl && (
                <div className="mt-6">
                  <AudioPlayer
                    audioUrl={audioUrl}
                    title="Generated Speech"
                    onError={(error) => setError(error)}
                  />
                  
                  {/* Generation Statistics */}
                  {generationStats && (
                    <div className="mt-4 p-3 bg-muted rounded-md">
                      <h4 className="text-sm font-medium mb-2">Generation Info</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-muted-foreground">
                        <div>
                          <span className="font-medium">Words:</span> {generationStats.words}
                        </div>
                        <div>
                          <span className="font-medium">Characters:</span> {generationStats.characters}
                        </div>
                        <div>
                          <span className="font-medium">Sentences:</span> {generationStats.sentences}
                        </div>
                        <div>
                          <span className="font-medium">Duration:</span> ~{Math.floor(generationStats.estimated_duration / 60)}:{String(generationStats.estimated_duration % 60).padStart(2, '0')}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Controls Sidebar */}
        <div className="lg:col-span-1">
          <div className="space-y-6">
            {/* Voice Controls */}
            <VoiceControls
              speed={speed}
              onSpeedChange={setSpeed}
              onReset={() => {
                setSpeed(1.0);
              }}
            />
            
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setText('')}
                  disabled={!text}
                >
                  Clear Text
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    const sampleText = language === 'vi' 
                      ? 'Xin chào! Đây là mẫu văn bản tiếng Việt để kiểm tra chức năng chuyển đổi văn bản thành giọng nói.'
                      : language === 'fr'
                      ? 'Bonjour! Ceci est un exemple de texte français pour tester la fonction de synthèse vocale.'
                      : 'Hello! This is a sample English text to test the text-to-speech functionality.';
                    setText(sampleText);
                  }}
                >
                  Load Sample Text
                </Button>
                {audioUrl && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setAudioUrl('');
                      setGenerationStats(null);
                    }}
                  >
                    Clear Audio
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
          </div>
        </div>
      </div>
    </main>
  );
}