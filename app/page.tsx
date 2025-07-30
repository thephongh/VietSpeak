'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUpload } from '@/components/tts/file-upload';  
import { AudioPlayer } from '@/components/tts/audio-player';
import { VoiceControls } from '@/components/tts/voice-controls';
import { VoiceCloning } from '@/components/tts/voice-cloning';
import { VoiceLibrary } from '@/components/tts/voice-library';
import { apiClient } from '@/lib/api-client';
import { TextProcessor } from '@/lib/text-processor';
import { storage } from '@/lib/storage';
import { Mic, Type, Library, Upload, Sparkles, AlertCircle, Check, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Voice {
  id: string;
  name: string;
  language: string;
  type: string;
  quality?: string;
  description?: string;
  elevenlabs_voice_id?: string;
}

export default function Home() {
  const [text, setText] = useState('');
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  const [error, setError] = useState('');
  const [cleanText, setCleanText] = useState(true);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(0);
  const [stability, setStability] = useState(0.5);
  const [similarityBoost, setSimilarityBoost] = useState(0.8);
  const [language, setLanguage] = useState('vi');
  const [generationStats, setGenerationStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('tts');

  useEffect(() => {
    loadVoices();
    loadPreferences();
  }, []);

  const loadPreferences = () => {
    try {
      const preferences = storage.getVoicePreferences();
      setLanguage(preferences.preferred_language);
      setSpeed(preferences.preferred_speed);
      setPitch(preferences.preferred_pitch || 0);
      setCleanText(preferences.auto_clean_text);
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  const loadVoices = async () => {
    try {
      // Load Google Cloud voices
      const googleVoicesResponse = await apiClient.getVoices();
      
      // Load cloned voices
      const clonedVoicesResponse = await apiClient.getClonedVoices();
      
      // Combine all voices
      const allVoices = [
        ...googleVoicesResponse.voices,
        ...clonedVoicesResponse.voices,
      ];

      setVoices(allVoices);
      
      // Set default voice
      if (allVoices.length > 0) {
        const preferences = storage.getVoicePreferences();
        const defaultVoice = allVoices.find(v => v.id === preferences.default_voice_id) || allVoices[0];
        setSelectedVoice(defaultVoice);
      }
    } catch (err) {
      console.error('Failed to load voices:', err);
      setError('Failed to load voices');
    }
  };

  const handleFileUpload = (files: File[]) => {
    // Handle file upload for text extraction
    if (files.length > 0 && files[0].type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const extractedText = e.target?.result as string;
        setText(extractedText);
        setShowFileUpload(false);
      };
      reader.readAsText(files[0]);
    }
  };

  const handleTextExtracted = (extractedText: string) => {
    setText(extractedText);
    setShowFileUpload(false);
  };

  const handleGenerateSpeech = async () => {
    if (!text.trim()) {
      setError('Please enter some text');
      return;
    }

    if (!selectedVoice) {
      setError('Please select a voice');
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

      let response;

      if (selectedVoice.type === 'cloned') {
        // Use ElevenLabs for cloned voices
        response = await apiClient.synthesizeWithClonedVoice({
          text: processedText,
          voice_id: selectedVoice.id,
          elevenlabs_voice_id: selectedVoice.elevenlabs_voice_id || selectedVoice.id,
          language: language,
          speed: speed,  
          stability: stability,
          similarity_boost: similarityBoost,
          clean_text: cleanText,
        });
      } else {
        // Use Google Cloud TTS for standard voices
        response = await apiClient.synthesizeText({
          text: processedText,
          language: language,
          voice: selectedVoice.id,
          speed: speed,
          pitch: pitch,
          clean_text: cleanText,
        });
      }

      const audioDataUrl = apiClient.createAudioUrl(response.audio_data);
      setAudioUrl(audioDataUrl);
      setGenerationStats(response.stats);
      
      // Record voice usage
      storage.recordVoiceUsage(selectedVoice.id);
      
      // Save preferences
      storage.updateVoicePreferences({
        preferred_language: language,
        preferred_speed: speed,
        preferred_pitch: pitch,
        auto_clean_text: cleanText,
        default_voice_id: selectedVoice.id,
      });

      // Save to audio history (without audio_data to save space)
      try {
        storage.saveAudioHistory({
          id: response.audio_id,
          text: text.substring(0, 200), // Limit text length
          language: language,
          voice_id: selectedVoice.id,
          created_at: new Date().toISOString(),
          audio_data: '', // Don't store actual audio data
          stats: response.stats,
        });
      } catch (historyError) {
        console.error('Failed to save audio history:', historyError);
        // Try to clean up storage if quota exceeded
        if (historyError instanceof DOMException && historyError.name === 'QuotaExceededError') {
          storage.cleanupStorage();
        }
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate speech');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceCreated = async (voiceId: string, voiceData: any) => {
    setError('');
    
    try {
      // Save voice profile to local storage
      storage.saveVoiceProfile({
        voice_id: voiceData.voice_id,
        name: voiceData.name,
        language: voiceData.language,
        description: voiceData.description,
        created_at: voiceData.created_at,
        sample_duration: voiceData.sample_duration,
        quality_score: voiceData.quality_score,
        elevenlabs_voice_id: voiceData.elevenlabs_voice_id,
      });
    } catch (error) {
      console.error('Failed to save voice profile to localStorage:', error);
    }
    
    // Reload voices to include the new one
    await loadVoices();
    
    // Switch to TTS tab and select the new voice
    setActiveTab('tts');
    const newVoice = voices.find(v => v.id === voiceId);
    if (newVoice) {
      setSelectedVoice(newVoice);
    }
  };

  const handleVoiceSelected = (voiceId: string, voiceData: any) => {
    const voice = voices.find(v => v.id === voiceId) || voiceData;
    setSelectedVoice(voice);
    setActiveTab('tts');
    
    // Save as preferred voice
    storage.updateVoicePreferences({ 
      default_voice_id: voiceId 
    });
  };

  const handleVoiceDeleted = async () => {
    await loadVoices();
  };

  const resetVoiceControls = () => {
    setSpeed(1.0);
    setPitch(0);
    setStability(0.5);
    setSimilarityBoost(0.8);
  };

  const textStats = text ? TextProcessor.getTextStats(text) : null;
  const hasMarkdown = text ? TextProcessor.hasMarkdownFormatting(text) : false;
  const isClonedVoice = selectedVoice?.type === 'cloned';

  const handleClearStorage = () => {
    if (confirm('This will clear all saved data including audio history, voice preferences, and usage statistics. Are you sure?')) {
      try {
        // Clear all storage data
        storage.clearAllData();
        setError('');
        alert('All storage cleared successfully!');
        
        // Reload the page to reset the UI state
        window.location.reload();
      } catch (err) {
        setError('Failed to clear storage');
        console.error('Error clearing storage:', err);
      }
    }
  };

  return (
    <main className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header with Apple Liquid Glass styling */}
        <div className="text-center mb-12 animate-float relative">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-20 h-20 liquid-glass-card rounded-2xl flex items-center justify-center shadow-lg p-2">
              <Sparkles className="h-10 w-10 text-blue-600" />
            </div>
            <h1 className="hero-text">
              TeraVoice
            </h1>
          </div>
          <p className="h2-text max-w-3xl mx-auto leading-relaxed">
            🎤  Tự nhiên, Sắc nét, Chuẩn cảm xúc.
            <br />
            <span className="body-text">Hỗ trợ phát âm tiếng Việt, Anh, Pháp.</span>
          </p>
          
          {/* Clear Storage Button */}
          <div className="absolute top-0 right-0">
            <button
              onClick={handleClearStorage}
              className="liquid-glass-button text-sm px-3 py-2 text-gray-600 hover:text-red-600"
              title="Clear all saved data"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear Storage
            </button>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto">
          {/* Apple Liquid Glass Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 liquid-glass-navigation mb-8 p-3 min-h-[60px]">
              <TabsTrigger value="tts" className="flex items-center gap-2 transition-all">
                <Type className="h-4 w-4" />
                <span className="hidden sm:inline">Text-to-Speech</span>
                <span className="sm:hidden">TTS</span>
              </TabsTrigger>
              <TabsTrigger value="voice-cloning" className="flex items-center gap-2 transition-all">
                <Mic className="h-4 w-4" />
                <span className="hidden sm:inline">Create Voice</span>
                <span className="sm:hidden">Create</span>
              </TabsTrigger>
              <TabsTrigger value="voice-library" className="flex items-center gap-2 transition-all">
                <Library className="h-4 w-4" />
                <span className="hidden sm:inline">Voice Library</span>
                <span className="sm:hidden">Library</span>
              </TabsTrigger>
            </TabsList>

            {/* Text-to-Speech Tab */}
            <TabsContent value="tts" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Text Input with Apple Liquid Glass */}
                  <Card className="liquid-glass-card">
                    <CardHeader>
                      <CardTitle className="h2-text">✨ Text Input</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <Label htmlFor="text-input">Enter your text</Label>
                          <button
                            className="liquid-glass-button text-sm px-4 py-2"
                            onClick={() => setShowFileUpload(!showFileUpload)}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            {showFileUpload ? 'Manual Input' : 'Upload File'}
                          </button>
                        </div>
                        
                        {showFileUpload ? (
                          <FileUpload 
                            onFilesSelect={handleFileUpload}
                            onTextExtracted={handleTextExtracted}
                            accept=".txt"
                            multiple={false}
                            description="Upload a text file to extract content"
                          />
                        ) : (
                          <textarea
                            id="text-input"
                            placeholder="Enter your Vietnamese, English, or French text here..."
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className="min-h-32 w-full liquid-glass-input resize-none"
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
                            <Label htmlFor="clean-text" className="text-sm flex items-center gap-2">
                              Clean text (remove markdown, links, formatting)
                              {hasMarkdown && (
                                <span className="text-orange-600 flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3" />
                                  Markdown detected
                                </span>
                              )}
                            </Label>
                          </div>
                          
                          {textStats && (
                            <div className="text-sm text-gray-600 bg-white/20 p-3 rounded-lg">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                <span>{textStats.words} words</span>
                                <span>{textStats.characters} characters</span>
                                <span>{textStats.sentences} sentences</span>
                                <span>~{Math.floor(textStats.estimatedDuration / 60)}:{String(textStats.estimatedDuration % 60).padStart(2, '0')} duration</span>
                              </div>
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
                            className="w-full liquid-glass-input"
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
                              value={selectedVoice?.id || ''}
                              onChange={(e) => {
                                const voice = voices.find(v => v.id === e.target.value);
                                setSelectedVoice(voice || null);
                              }}
                              className="w-full liquid-glass-input"
                            >
                              {voices.map((voice) => (
                                <option key={voice.id} value={voice.id}>
                                  {voice.name} ({voice.language}) {voice.type === 'cloned' ? '🎤' : '☁️'}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                      
                      {/* Generate Button */}
                      <div className="flex gap-4">
                        <button
                          onClick={handleGenerateSpeech}
                          disabled={isLoading || !text.trim() || !selectedVoice}
                          className="liquid-glass-button flex-1 relative disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-blue-600/20 rounded-xl backdrop-blur-sm">
                              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
                            </div>
                          )}
                          <span className={isLoading ? 'invisible' : 'flex items-center gap-2'}>
                            <Sparkles className="h-4 w-4" />
                            Generate Speech
                          </span>
                        </button>
                      </div>
                      
                      {/* Error Display */}
                      {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
                          <AlertCircle className="h-4 w-4 flex-shrink-0" />
                          <p className="text-sm">{error}</p>
                        </div>
                      )}
                      
                      {/* Generated Audio Player */}
                      {audioUrl && (
                        <div className="space-y-4">
                          <AudioPlayer
                            audioUrl={audioUrl}
                            title="Generated Speech"
                            onError={(error) => setError(error)}
                          />
                          
                          {/* Generation Statistics */}
                          {generationStats && (
                            <div className="bg-white/20 p-4 rounded-lg">
                              <div className="flex items-center gap-2 mb-3">
                                <Check className="h-4 w-4 text-green-600" />
                                <h4 className="text-sm font-medium text-gray-800">Generation Complete</h4>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-600">
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
                      pitch={pitch}
                      stability={stability}
                      similarityBoost={similarityBoost}
                      onSpeedChange={setSpeed}
                      onPitchChange={setPitch}
                      onStabilityChange={setStability}
                      onSimilarityBoostChange={setSimilarityBoost}
                      onReset={resetVoiceControls}
                      isClonedVoice={isClonedVoice}
                    />
                    
                    {/* Quick Actions */}
                    <div className="liquid-glass-card">
                      <div className="mb-4">
                        <h3 className="h2-text text-lg">⚡ Quick Actions</h3>
                      </div>
                      <div className="space-y-3">
                        <button
                          className="liquid-glass-button w-full"
                          onClick={() => {
                            console.log('Clear Text clicked, current text:', text);
                            setText('');
                          }}
                          disabled={!text}
                        >
                          🗑️ Clear Text
                        </button>
                        <button
                          className="liquid-glass-button w-full"
                          onClick={() => {
                            const sampleText = language === 'vi' 
                              ? 'Xin chào! Đây là mẫu văn bản tiếng Việt để kiểm tra chức năng chuyển đổi văn bản thành giọng nói.'
                              : language === 'fr'
                              ? 'Bonjour! Ceci est un exemple de texte français pour tester la fonction de synthèse vocale.'
                              : 'Hello! This is a sample English text to test the text-to-speech functionality.';
                            setText(sampleText);
                          }}
                        >
                          📝 Load Sample Text
                        </button>
                        {audioUrl && (
                          <button
                            className="liquid-glass-button w-full"
                            onClick={() => {
                              console.log('Clear Audio clicked, current audioUrl:', audioUrl);
                              setAudioUrl('');
                              setGenerationStats(null);
                            }}
                          >
                            🔇 Clear Audio
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Voice Cloning Tab */}
            <TabsContent value="voice-cloning">
              <VoiceCloning
                onVoiceCreated={handleVoiceCreated}
                onError={setError}
              />
            </TabsContent>

            {/* Voice Library Tab */}
            <TabsContent value="voice-library">
              <VoiceLibrary
                onVoiceSelect={handleVoiceSelected}
                onVoiceDeleted={handleVoiceDeleted}
                onError={setError}
              />
            </TabsContent>
          </Tabs>

          {/* Global Error Toast */}
          {error && (
            <div className="fixed bottom-4 right-4 max-w-md z-50">
              <div className="glass-card border-red-200 p-4 animate-fade-in">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                  <button
                    onClick={() => setError('')}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <span className="sr-only">Dismiss</span>
                    ×
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}