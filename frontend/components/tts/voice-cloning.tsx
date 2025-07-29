'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { apiClient } from '@/lib/api';

interface VoiceCloningProps {
  onVoiceCreated?: (voiceId: string) => void;
  onError?: (error: string) => void;
}

export function VoiceCloning({ onVoiceCreated, onError }: VoiceCloningProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [voiceName, setVoiceName] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('vi');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log('File selected:', file);
    
    if (!file) {
      console.log('No file selected');
      return;
    }

    console.log('File details:', {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified
    });

    // Validate file type - include more M4A variants and check by extension as fallback
    const validTypes = [
      'audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/flac', 'audio/m4a', 
      'audio/mp4', 'audio/x-m4a', 'audio/aac', 'audio/x-aac'
    ];
    
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const validExtensions = ['wav', 'mp3', 'flac', 'm4a', 'aac'];
    
    console.log('File type:', file.type);
    console.log('File extension:', fileExtension);
    console.log('Type valid:', validTypes.includes(file.type));
    console.log('Extension valid:', validExtensions.includes(fileExtension || ''));
    
    const isValidType = validTypes.includes(file.type) || validExtensions.includes(fileExtension || '');
    
    if (!isValidType) {
      console.log('Invalid file type:', file.type, 'extension:', fileExtension);
      onError?.(`Please select a valid audio file (WAV, MP3, FLAC, or M4A). Your file type: ${file.type}, extension: ${fileExtension}`);
      return;
    }

    // Validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      console.log('File too large:', file.size);
      onError?.('File too large. Maximum size is 50MB');
      return;
    }

    console.log('File validation passed, setting audio file');
    setAudioFile(file);
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    console.log('Preview URL created:', url);

    // Get audio duration
    const audio = new Audio(url);
    audio.addEventListener('loadedmetadata', () => {
      console.log('Audio metadata loaded, duration:', audio.duration);
      setAudioDuration(audio.duration);
    });

    audio.addEventListener('error', (e) => {
      console.error('Audio loading error:', e);
      onError?.('Failed to load audio file. Please check if the file is a valid audio format.');
      setAudioDuration(null);
    });

    // Auto-generate name from filename if empty
    if (!voiceName) {
      const nameFromFile = file.name.split('.').slice(0, -1).join('.');
      console.log('Auto-generated name:', nameFromFile);
      setVoiceName(nameFromFile);
    }
  };

  const handleUpload = async () => {
    console.log('handleUpload called');
    console.log('audioFile:', audioFile?.name);
    console.log('voiceName:', voiceName);
    console.log('audioDuration:', audioDuration);
    
    if (!audioFile || !voiceName.trim()) {
      onError?.('Please select an audio file and enter a voice name');
      return;
    }

    if (audioDuration && audioDuration < 3) {
      onError?.('Audio sample must be at least 3 seconds long');
      return;
    }

    if (audioDuration && audioDuration > 300) {
      onError?.('Audio sample must be less than 5 minutes long');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('audio_file', audioFile);
      formData.append('name', voiceName.trim());
      formData.append('description', description.trim());
      formData.append('language', language);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const next = prev + Math.random() * 20;
          return next > 90 ? 90 : next;
        });
      }, 500);

      console.log('Uploading to API...');
      const response = await apiClient.uploadVoiceSample(formData);
      console.log('API response:', response);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Reset form
      setAudioFile(null);
      setVoiceName('');
      setDescription('');
      setLanguage('vi');
      setPreviewUrl(null);
      setAudioDuration(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      onVoiceCreated?.(response.voice_id);

    } catch (err) {
      console.error('Upload error:', err);
      const error = err instanceof Error ? err.message : 'Failed to upload voice sample';
      onError?.(error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Custom Voice</CardTitle>
        <p className="text-sm text-muted-foreground">
          Upload a voice sample to create a custom voice for text-to-speech generation.
          The sample should be 3-30 seconds of clear speech.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Upload */}
        <div>
          <Label htmlFor="audio-upload">Audio Sample</Label>
          <div className="mt-2">
            <Input
              ref={fileInputRef}
              id="audio-upload"
              type="file"
              accept="audio/*"
              onChange={handleFileSelect}
              disabled={isUploading}
              className="cursor-pointer"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Supported formats: WAV, MP3, FLAC, M4A (max 50MB)
            </p>
          </div>
        </div>

        {/* Audio Preview */}
        {previewUrl && (
          <div className="space-y-2">
            <Label>Preview</Label>
            <audio 
              controls 
              src={previewUrl} 
              className="w-full"
              style={{ height: '40px' }}
            />
            {audioDuration && (
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Duration: {formatDuration(audioDuration)}</span>
                <span>
                  {audioDuration < 3 ? (
                    <span className="text-red-600">⚠ Too short (min 3s)</span>
                  ) : audioDuration > 300 ? (
                    <span className="text-red-600">⚠ Too long (max 5min)</span>
                  ) : (
                    <span className="text-green-600">✓ Good duration</span>
                  )}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Voice Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="voice-name">Voice Name *</Label>
            <Input
              id="voice-name"
              value={voiceName}
              onChange={(e) => setVoiceName(e.target.value)}
              placeholder="My Custom Voice"
              disabled={isUploading}
              maxLength={50}
            />
          </div>
          
          <div>
            <Label htmlFor="voice-language">Language</Label>
            <select 
              id="voice-language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              disabled={isUploading}
              className="w-full p-2 border border-input rounded-md"
            >
              <option value="vi">Vietnamese</option>
              <option value="en">English</option>
              <option value="fr">French</option>
            </select>
          </div>
        </div>

        <div>
          <Label htmlFor="voice-description">Description (Optional)</Label>
          <Textarea
            id="voice-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the voice characteristics..."
            disabled={isUploading}
            maxLength={200}
            className="h-20"
          />
          <p className="text-xs text-muted-foreground mt-1">
            {description.length}/200 characters
          </p>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uploading and processing...</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <Progress value={uploadProgress} className="w-full" />
          </div>
        )}

        {/* Upload Button */}
        <div className="space-y-2">
          <Button 
            onClick={handleUpload}
            disabled={!audioFile || !voiceName.trim() || isUploading || (audioDuration !== null && (audioDuration < 3 || audioDuration > 300))}
            className="w-full"
            size="lg"
          >
            {isUploading ? 'Creating Voice...' : 'Create Custom Voice'}
          </Button>
          
          {/* Debug information to help user understand button state */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>Debug info:</strong></p>
            <p>• Audio file: {audioFile ? `✓ ${audioFile.name}` : '✗ No file selected'}</p>
            <p>• Voice name: {voiceName.trim() ? `✓ "${voiceName}"` : '✗ No name entered'}</p>
            <p>• Audio duration: {audioDuration !== null ? `${audioDuration.toFixed(1)}s` : 'Loading...'}</p>
            <p>• Duration valid: {audioDuration === null ? 'Checking...' : (audioDuration >= 3 && audioDuration <= 300) ? '✓ Valid' : '✗ Invalid'}</p>
            <p>• Button enabled: {(!audioFile || !voiceName.trim() || isUploading || (audioDuration !== null && (audioDuration < 3 || audioDuration > 300))) ? '✗ Disabled' : '✓ Enabled'}</p>
          </div>
          
          {(!audioFile || !voiceName.trim() || (audioDuration !== null && (audioDuration < 3 || audioDuration > 300))) && (
            <div className="text-xs text-red-600 space-y-1">
              <p><strong>Required actions:</strong></p>
              {!audioFile && <p>• Please select an audio file</p>}
              {!voiceName.trim() && <p>• Please enter a voice name</p>}
              {audioDuration !== null && audioDuration < 3 && <p>• Audio sample too short (minimum 3 seconds)</p>}
              {audioDuration !== null && audioDuration > 300 && <p>• Audio sample too long (maximum 5 minutes)</p>}
            </div>
          )}
        </div>

        {/* Requirements */}
        <div className="text-xs text-muted-foreground space-y-1 p-3 bg-muted rounded-md">
          <p className="font-medium">Voice Sample Requirements:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Clear, high-quality audio recording</li>
            <li>3-30 seconds of speech (longer samples work too, up to 5 minutes)</li>
            <li>Single speaker only</li>
            <li>Minimal background noise</li>
            <li>Natural speaking pace and tone</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}