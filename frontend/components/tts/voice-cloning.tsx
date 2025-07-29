'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { apiClient } from '@/lib/api';
import { Mic, MicOff, Upload, FileAudio, Trash2 } from 'lucide-react';

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
  
  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Audio conversion function
  const convertWebMToWav = async (webmBlob: Blob): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const reader = new FileReader();
      
      reader.onload = async () => {
        try {
          const arrayBuffer = reader.result as ArrayBuffer;
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          
          // Convert to WAV format
          const wavBuffer = audioBufferToWav(audioBuffer);
          const wavBlob = new Blob([wavBuffer], { type: 'audio/wav' });
          
          resolve(wavBlob);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read audio file'));
      reader.readAsArrayBuffer(webmBlob);
    });
  };

  // Convert AudioBuffer to WAV format
  const audioBufferToWav = (buffer: AudioBuffer): ArrayBuffer => {
    const length = buffer.length;
    const sampleRate = buffer.sampleRate;
    const numChannels = buffer.numberOfChannels;
    
    const arrayBuffer = new ArrayBuffer(44 + length * numChannels * 2);
    const view = new DataView(arrayBuffer);
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * numChannels * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * 2, true);
    view.setUint16(32, numChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * numChannels * 2, true);
    
    // Convert audio data
    let offset = 44;
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
      }
    }
    
    return arrayBuffer;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log('File selected:', file);
    
    if (!file) {
      console.log('No file selected');
      return;
    }

    processAudioFile(file);
  };

  const processAudioFile = (file: File) => {
    console.log('Processing file:', {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified
    });

    // Validate file type - include more M4A variants and check by extension as fallback
    const validTypes = [
      'audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/flac', 'audio/m4a', 
      'audio/mp4', 'audio/x-m4a', 'audio/aac', 'audio/x-aac', 'audio/ogg', 'audio/webm'
    ];
    
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const validExtensions = ['wav', 'mp3', 'flac', 'm4a', 'aac', 'ogg', 'webm'];
    
    const isValidType = validTypes.includes(file.type) || validExtensions.includes(fileExtension || '');
    
    if (!isValidType) {
      console.log('Invalid file type:', file.type, 'extension:', fileExtension);
      onError?.(`Please select a valid audio file (WAV, MP3, FLAC, M4A, etc.). Your file type: ${file.type}, extension: ${fileExtension}`);
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
    
    // Clear any previous recording
    setRecordedBlob(null);
    
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

  const handleChooseFile = useCallback(() => {
    console.log('Choose file button clicked');
    console.log('File input ref:', fileInputRef.current);
    
    if (fileInputRef.current) {
      // Reset the input value to ensure onChange fires even for the same file
      fileInputRef.current.value = '';
      fileInputRef.current.click();
      console.log('File input clicked');
    } else {
      console.error('File input ref is null');
      onError?.('File input not available. Please refresh the page.');
    }
  }, [onError]);

  const startRecording = async () => {
    try {
      console.log('Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        } 
      });
      
      // Try WAV format first, fallback to WebM if not supported
      let mimeType = 'audio/wav';
      if (!MediaRecorder.isTypeSupported('audio/wav')) {
        mimeType = 'audio/webm;codecs=opus';
      }
      
      const recorder = new MediaRecorder(stream, { mimeType });
      
      const chunks: BlobPart[] = [];
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: mimeType });
        setRecordedBlob(blob);
        
        // Convert to WAV if necessary
        let finalBlob = blob;
        let fileName = `recording_${Date.now()}`;
        let fileType = 'audio/wav';
        
        if (mimeType.startsWith('audio/webm')) {
          try {
            console.log('Converting WebM to WAV...');
            finalBlob = await convertWebMToWav(blob);
            fileName += '.wav';
            fileType = 'audio/wav';
          } catch (error) {
            console.error('Conversion failed, using original format:', error);
            fileName += '.webm';
            fileType = 'audio/webm';
            finalBlob = blob;
          }
        } else {
          fileName += '.wav';
        }
        
        // Create a File object from the processed blob
        const file = new File([finalBlob], fileName, { type: fileType });
        
        processAudioFile(file);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };
      
      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      console.log('Recording started with format:', mimeType);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      onError?.('Could not access microphone. Please check permissions and try again.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      
      console.log('Recording stopped');
    }
  };

  const clearAudio = () => {
    setAudioFile(null);
    setRecordedBlob(null);
    setPreviewUrl(null);
    setAudioDuration(null);
    setRecordingTime(0);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
      clearAudio();
      setVoiceName('');
      setDescription('');
      setLanguage('vi');

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

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Custom Voice</CardTitle>
        <p className="text-sm text-muted-foreground">
          Upload a voice sample or record directly using your microphone to create a custom voice for text-to-speech generation.
          The sample should be 3-30 seconds of clear speech.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Audio Input Options */}
        <div>
          <Label>Audio Sample</Label>
          <div className="mt-2 space-y-4">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileSelect}
              disabled={isUploading || isRecording}
              style={{ display: 'none' }}
            />
            
            {/* Input Options */}
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleChooseFile}
                disabled={isUploading || isRecording}
                className="flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Choose Audio File</span>
              </Button>
              
              {!isRecording ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={startRecording}
                  disabled={isUploading}
                  className="flex items-center space-x-2"
                >
                  <Mic className="w-4 h-4" />
                  <span>Record Sample</span>
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={stopRecording}
                  className="flex items-center space-x-2"
                >
                  <MicOff className="w-4 h-4" />
                  <span>Stop Recording ({formatRecordingTime(recordingTime)})</span>
                </Button>
              )}
              
              {(audioFile || recordedBlob) && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={clearAudio}
                  disabled={isUploading || isRecording}
                  className="flex items-center space-x-2 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear</span>
                </Button>
              )}
            </div>
            
            {/* Recording Status */}
            {isRecording && (
              <div className="flex items-center space-x-2 text-red-600">
                <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">
                  Recording... {formatRecordingTime(recordingTime)}
                </span>
              </div>
            )}
            
            {/* File Info */}
            {audioFile && (
              <div className="flex items-center space-x-3 p-3 bg-muted rounded-md">
                <FileAudio className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{audioFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(audioFile.size / (1024 * 1024)).toFixed(1)} MB
                    {recordedBlob && ' • Recorded'}
                  </p>
                </div>
              </div>
            )}
            
            <p className="text-xs text-muted-foreground">
              Supported formats: WAV, MP3, FLAC, M4A, WebM (max 50MB)
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
              disabled={isUploading || isRecording}
              maxLength={50}
            />
          </div>
          
          <div>
            <Label htmlFor="voice-language">Language</Label>
            <select 
              id="voice-language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              disabled={isUploading || isRecording}
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
            disabled={isUploading || isRecording}
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
            disabled={!audioFile || !voiceName.trim() || isUploading || isRecording || (audioDuration !== null && (audioDuration < 3 || audioDuration > 300))}
            className="w-full"
            size="lg"
          >
            {isUploading ? 'Creating Voice...' : 'Create Custom Voice'}
          </Button>
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
            <li>For recordings: speak clearly into your microphone</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}