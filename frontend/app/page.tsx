'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FileUpload } from '@/components/tts/file-upload';
import { AudioPlayer } from '@/components/tts/audio-player';
import { VoiceControls } from '@/components/tts/voice-controls';
import { VoiceCloning } from '@/components/tts/voice-cloning';
import { VoiceLibrary } from '@/components/tts/voice-library';
import { apiClient, Voice } from '@/lib/api';
import { TextProcessor } from '@/lib/text-processor';
import { voiceStorage } from '@/lib/voice-storage';

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
  const [activeTab, setActiveTab] = useState<'tts' | 'voice-cloning' | 'voice-library'>('tts');

  useEffect(() => {
    loadVoices();
    loadPreferences();
  }, []);

  const loadPreferences = () => {
    try {
      const preferences = voiceStorage.getVoicePreferences();
      setLanguage(preferences.preferred_language);
      setSpeed(preferences.preferred_speed);
      setCleanText(preferences.auto_clean_text);
      
      // Set default voice if available
      if (preferences.default_voice_id) {
        setSelectedVoice(preferences.default_voice_id);
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

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
      
      // Record voice usage
      if (selectedVoice) {
        voiceStorage.recordVoiceUsage(selectedVoice);
      }
      
      // Save preferences
      voiceStorage.updateVoicePreferences({
        preferred_language: language,
        preferred_speed: speed,
        auto_clean_text: cleanText
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate speech');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceCreated = async (voiceId: string) => {
    setError('');
    
    try {
      // Get the voice profile from the API and save to localStorage
      const voiceProfile = await apiClient.getVoiceProfile(voiceId);
      voiceStorage.saveVoiceProfile({
        voice_id: voiceProfile.voice_id,
        name: voiceProfile.name,
        language: voiceProfile.language,
        description: voiceProfile.description,
        created_at: voiceProfile.created_at,
        sample_duration: voiceProfile.sample_duration,
        quality_score: voiceProfile.quality_score
      });
    } catch (error) {
      console.error('Failed to save voice profile to localStorage:', error);
    }
    
    // Reload voices to include the new one
    loadVoices();
    // Switch to TTS tab and select the new voice
    setActiveTab('tts');
    setSelectedVoice(voiceId);
  };

  const handleVoiceSelected = (voiceId: string) => {
    setSelectedVoice(voiceId);
    setActiveTab('tts');
    
    // Save as preferred voice
    voiceStorage.updateVoicePreferences({ default_voice_id: voiceId });
  };

  const handleVoiceDeleted = () => {
    loadVoices();
    // Note: voiceStorage.deleteVoiceProfile is called within the VoiceLibrary component
  };

  const textStats = text ? TextProcessor.getTextStats(text) : null;
  const hasMarkdown = text ? TextProcessor.hasMarkdownFormatting(text) : false;

  return (
    <main className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-red-600 via-amber-600 to-emerald-600 bg-clip-text text-transparent">
            Vietnamese Text-to-Speech
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            AI-powered Vietnamese TTS with voice cloning capabilities. 
            Convert text to natural-sounding speech in Vietnamese, English, and French.
          </p>
        </div>
        
        <div className="max-w-7xl mx-auto">
          {/* Tab Navigation */}
          <div className="mb-8">
            <div className="border-b border-border">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('tts')}
                  className={`py-3 px-6 border-b-2 font-medium text-sm transition-all duration-200 ${
                    activeTab === 'tts'
                      ? 'border-red-500 text-red-600 bg-gradient-to-r from-red-50 to-amber-50'
                      : 'border-transparent text-gray-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50'
                  }`}
                >
                  Text-to-Speech
                </button>
                <button
                  onClick={() => setActiveTab('voice-cloning')}
                  className={`py-3 px-6 border-b-2 font-medium text-sm transition-all duration-200 ${
                    activeTab === 'voice-cloning'
                      ? 'border-red-500 text-red-600 bg-gradient-to-r from-red-50 to-amber-50'
                      : 'border-transparent text-gray-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50'
                  }`}
                >
                  Create Voice
                </button>
                <button
                  onClick={() => setActiveTab('voice-library')}
                  className={`py-3 px-6 border-b-2 font-medium text-sm transition-all duration-200 ${
                    activeTab === 'voice-library'
                      ? 'border-red-500 text-red-600 bg-gradient-to-r from-red-50 to-amber-50'
                      : 'border-transparent text-gray-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50'
                  }`}
                >
                  Voice Library
                </button>
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'tts' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Text Input - Main Column */}
              <div className="lg:col-span-2">
                <Card className="bg-white/80 backdrop-blur-sm border-red-100 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-gray-800">Text Input</CardTitle>
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
                        className="relative bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                      >
                        {isLoading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-red-600 rounded-md">
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                          </div>
                        )}
                        <span className={isLoading ? 'invisible' : ''}>Generate Speech</span>
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
                  <Card className="bg-white/80 backdrop-blur-sm border-red-100 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="text-lg text-gray-800">Quick Actions</CardTitle>
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
                        className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
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
          )}

          {/* Voice Cloning Tab */}
          {activeTab === 'voice-cloning' && (
            <div className="max-w-4xl mx-auto">
              <VoiceCloning
                onVoiceCreated={handleVoiceCreated}
                onError={setError}
              />
            </div>
          )}

          {/* Voice Library Tab */}
          {activeTab === 'voice-library' && (
            <div className="max-w-4xl mx-auto">
              <VoiceLibrary
                onVoiceSelect={handleVoiceSelected}
                onVoiceDeleted={handleVoiceDeleted}
                onError={setError}
              />
            </div>
          )}

          {/* Global Error Display */}
          {error && (
            <div className="fixed bottom-4 right-4 max-w-md">
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                  <div className="ml-auto pl-3">
                    <div className="-mx-1.5 -my-1.5">
                      <button
                        onClick={() => setError('')}
                        className="inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-100"
                      >
                        <span className="sr-only">Dismiss</span>
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}