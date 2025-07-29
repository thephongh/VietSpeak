'use client';

import { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { FileUpload } from './file-upload';
import { Mic, MicOff, Upload, User, Info, CheckCircle, AlertCircle, Square } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceCloningProps {
  onVoiceCreated: (voiceId: string, voiceData: any) => void;
  onError: (error: string) => void;
}

type CloneStep = 'upload' | 'details' | 'processing' | 'complete';

export function VoiceCloning({ onVoiceCreated, onError }: VoiceCloningProps) {
  const [currentStep, setCurrentStep] = useState<CloneStep>('upload');
  const [audioFiles, setAudioFiles] = useState<File[]>([]);
  const [voiceName, setVoiceName] = useState('');
  const [voiceDescription, setVoiceDescription] = useState('');
  const [language, setLanguage] = useState('vi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [createdVoice, setCreatedVoice] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedAudios, setRecordedAudios] = useState<File[]>([]);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleFilesSelect = (files: File[]) => {
    setAudioFiles(files);
    if (files.length > 0 && currentStep === 'upload') {
      setCurrentStep('details');
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const wavBlob = await convertWebMToWav(audioBlob);
        const recordingIndex = recordedAudios.length + 1;
        const file = new File([wavBlob], `recording-${recordingIndex}.wav`, { type: 'audio/wav' });
        
        setRecordedAudios(prev => [...prev, file]);
        setAudioFiles(prev => [...prev, file]);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start recording timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Failed to start recording:', error);
      onError('Failed to access microphone. Please check your permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (recordingTime < 5) {
        onError('Please record at least 5 seconds of audio for better voice cloning quality.');
        return;
      }
      
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  const convertWebMToWav = async (webmBlob: Blob): Promise<Blob> => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const arrayBuffer = await webmBlob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    const wavBuffer = audioBufferToWav(audioBuffer);
    return new Blob([wavBuffer], { type: 'audio/wav' });
  };

  const audioBufferToWav = (buffer: AudioBuffer): ArrayBuffer => {
    const length = buffer.length * buffer.numberOfChannels * 2 + 44;
    const arrayBuffer = new ArrayBuffer(length);
    const view = new DataView(arrayBuffer);
    const channels: Float32Array[] = [];
    let offset = 0;
    let pos = 0;
    
    // Write WAV header
    const setUint16 = (data: number) => {
      view.setUint16(pos, data, true);
      pos += 2;
    };
    
    const setUint32 = (data: number) => {
      view.setUint32(pos, data, true);
      pos += 4;
    };
    
    // RIFF identifier
    setUint32(0x46464952);
    // file length minus RIFF identifier length and file description length
    setUint32(length - 8);
    // RIFF type
    setUint32(0x45564157);
    // format chunk identifier
    setUint32(0x20746d66);
    // format chunk length
    setUint32(16);
    // sample format (raw)
    setUint16(1);
    // channel count
    setUint16(buffer.numberOfChannels);
    // sample rate
    setUint32(buffer.sampleRate);
    // byte rate (sample rate * block align)
    setUint32(buffer.sampleRate * buffer.numberOfChannels * 2);
    // block align (channel count * bytes per sample)
    setUint16(buffer.numberOfChannels * 2);
    // bits per sample
    setUint16(16);
    // data chunk identifier
    setUint32(0x61746164);
    // data chunk length
    setUint32(length - pos - 4);
    
    // Extract audio data
    for (let i = 0; i < buffer.numberOfChannels; i++) {
      channels.push(buffer.getChannelData(i));
    }
    
    // Write interleaved data
    while (pos < length) {
      for (let i = 0; i < buffer.numberOfChannels; i++) {
        let sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = (sample < 0 ? sample * 0x8000 : sample * 0x7FFF) | 0;
        view.setInt16(pos, sample, true);
        pos += 2;
      }
      offset++;
    }
    
    return arrayBuffer;
  };

  const formatRecordingTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCreateVoice = async () => {
    if (!voiceName.trim()) {
      onError('Please enter a voice name');
      return;
    }

    if (audioFiles.length === 0) {
      onError('Please upload at least one audio file');
      return;
    }

    setIsProcessing(true);
    setCurrentStep('processing');
    setProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 20;
        });
      }, 500);

      const formData = new FormData();
      formData.append('name', voiceName.trim());
      formData.append('description', voiceDescription.trim());
      formData.append('language', language);
      
      audioFiles.forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch('/api/voices/clone', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Voice cloning failed');
      }

      const voiceData = await response.json();
      setCreatedVoice(voiceData);
      setCurrentStep('complete');
      
      // Notify parent component
      onVoiceCreated(voiceData.voice_id, voiceData);

    } catch (error) {
      console.error('Voice cloning error:', error);
      onError(error instanceof Error ? error.message : 'Voice cloning failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setCurrentStep('upload');
    setAudioFiles([]);
    setRecordedAudios([]);
    setVoiceName('');
    setVoiceDescription('');
    setLanguage('vi');
    setProgress(0);
    setCreatedVoice(null);
    setRecordingTime(0);
    setIsRecording(false);
  };

  const steps = [
    { id: 'upload', title: 'Upload Audio', icon: Upload },
    { id: 'details', title: 'Voice Details', icon: User },
    { id: 'processing', title: 'Processing', icon: Mic },
    { id: 'complete', title: 'Complete', icon: CheckCircle },
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Steps */}
      <Card className="glass-card border-white/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = index < currentStepIndex;
              const isUpcoming = index > currentStepIndex;

              return (
                <div key={step.id} className="flex items-center">
                  <div
                    className={cn(
                      'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300',
                      isActive && 'bg-red-500 border-red-500 text-white shadow-lg',
                      isCompleted && 'bg-green-500 border-green-500 text-white',
                      isUpcoming && 'border-gray-300 text-gray-400'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <p className={cn(
                      'text-sm font-medium',
                      isActive && 'text-red-600',
                      isCompleted && 'text-green-600',
                      isUpcoming && 'text-gray-400'
                    )}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={cn(
                      'mx-4 h-0.5 w-12 transition-colors duration-300',
                      index < currentStepIndex ? 'bg-green-500' : 'bg-gray-300'
                    )} />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      {currentStep === 'upload' && (
        <Card className="glass-card border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <Upload className="h-5 w-5" />
              Upload Audio Samples
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <h4 className="font-medium text-blue-800 mb-2">Tips for best results:</h4>
                  <ul className="text-blue-700 space-y-1">
                    <li>• Upload 1-5 high-quality audio files (WAV, MP3, FLAC)</li>
                    <li>• Each file should be 10 seconds to 5 minutes long</li>
                    <li>• Use clear speech without background noise</li>
                    <li>• Vietnamese samples work best for Vietnamese output</li>
                    <li>• Include varied emotions and speaking styles</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Record from Microphone Section */}
            <Card className="glass-card border-2 border-red-200 bg-red-50/30">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-800 flex items-center gap-2">
                      <Mic className="h-5 w-5 text-red-500" />
                      Record from Microphone
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Record multiple samples directly from your microphone
                    </p>
                  </div>
                  
                  {!isRecording ? (
                    <Button
                      variant="vietnam"
                      onClick={startRecording}
                      disabled={audioFiles.length >= 5}
                      className="btn-apple"
                    >
                      <Mic className="h-4 w-4 mr-2" />
                      Start Recording
                    </Button>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-sm font-medium text-gray-700">
                          Recording {formatRecordingTime(recordingTime)}
                        </span>
                        {recordingTime < 5 && (
                          <span className="text-xs text-gray-500">
                            (min 5s)
                          </span>
                        )}
                      </div>
                      <Button
                        variant="destructive"
                        onClick={stopRecording}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        <Square className="h-4 w-4 mr-2" />
                        Stop
                      </Button>
                    </div>
                  )}
                </div>

                {recordedAudios.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">
                      Recorded Samples ({recordedAudios.length})
                    </p>
                    <div className="space-y-2">
                      {recordedAudios.map((audio, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-white/70 rounded-lg border border-red-200"
                        >
                          <div className="flex items-center gap-3">
                            <Mic className="h-4 w-4 text-red-500" />
                            <span className="text-sm font-medium text-gray-700">
                              {audio.name}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setRecordedAudios(prev => prev.filter((_, i) => i !== index));
                              setAudioFiles(prev => prev.filter(f => f !== audio));
                            }}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 text-gray-500">or upload files</span>
              </div>
            </div>

            <FileUpload
              onFilesSelect={handleFilesSelect}
              accept="audio/*"
              multiple={true}
              maxFiles={5}
              maxSize={25 * 1024 * 1024}
              description="Upload audio samples for voice cloning"
            />

            {audioFiles.length > 0 && (
              <div className="flex justify-end">
                <Button
                  variant="vietnam"
                  onClick={() => setCurrentStep('details')}
                  className="btn-apple"
                >
                  Continue to Details
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {currentStep === 'details' && (
        <Card className="glass-card border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <User className="h-5 w-5" />
              Voice Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="voice-name">Voice Name *</Label>
                <Input
                  id="voice-name"
                  value={voiceName}
                  onChange={(e) => setVoiceName(e.target.value)}
                  placeholder="e.g., My Voice"
                  className="glass bg-white/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <select
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full h-10 px-3 py-2 rounded-md border border-input bg-white/50 text-sm"
                >
                  <option value="vi">Vietnamese</option>
                  <option value="en">English</option>
                  <option value="fr">French</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="voice-description">Description (Optional)</Label>
              <Textarea
                id="voice-description"
                value={voiceDescription}
                onChange={(e) => setVoiceDescription(e.target.value)}
                placeholder="Describe the voice characteristics..."
                className="glass bg-white/50 min-h-20"
              />
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-2">Voice Summary</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>• Total audio files: {audioFiles.length}</p>
                <p>• Recorded samples: {recordedAudios.length}</p>
                <p>• Uploaded files: {audioFiles.length - recordedAudios.length}</p>
                <p>• Total size: {(audioFiles.reduce((sum, file) => sum + file.size, 0) / (1024 * 1024)).toFixed(1)} MB</p>
                <p>• Language: {language === 'vi' ? 'Vietnamese' : language === 'en' ? 'English' : 'French'}</p>
              </div>
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep('upload')}
                className="bg-white/20"
              >
                Back to Upload
              </Button>
              <Button
                variant="vietnam"
                onClick={handleCreateVoice}
                disabled={!voiceName.trim()}
                className="btn-apple"
              >
                Create Voice
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 'processing' && (
        <Card className="glass-card border-white/20">
          <CardContent className="p-8 text-center space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <Mic className="h-16 w-16 text-red-500" />
                <div className="absolute inset-0 animate-ping">
                  <Mic className="h-16 w-16 text-red-300" />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Creating Your Voice Clone
              </h3>
              <p className="text-gray-600">
                Processing your audio samples and training the voice model...
              </p>
            </div>

            <div className="max-w-md mx-auto space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-gray-500">
                {progress < 30 && 'Analyzing audio samples...'}
                {progress >= 30 && progress < 60 && 'Extracting voice characteristics...'}
                {progress >= 60 && progress < 90 && 'Training voice model...'}
                {progress >= 90 && 'Finalizing...'}
              </p>
            </div>

            <div className="text-sm text-gray-500">
              This may take a few minutes. Please don't close this page.
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 'complete' && createdVoice && (
        <Card className="glass-card border-white/20">
          <CardContent className="p-8 text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Voice Clone Created Successfully!
              </h3>
              <p className="text-gray-600">
                Your voice "{createdVoice.name}" is ready to use.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 max-w-md mx-auto">
              <div className="text-sm text-gray-600 space-y-2">
                <div className="flex justify-between">
                  <span>Name:</span>
                  <span className="font-medium">{createdVoice.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Language:</span>
                  <span className="font-medium">{createdVoice.language}</span>
                </div>
                <div className="flex justify-between">
                  <span>Quality Score:</span>
                  <span className="font-medium">{Math.round(createdVoice.quality_score * 100)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Files Used:</span>
                  <span className="font-medium">{createdVoice.file_count}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <Button
                variant="vietnam"
                onClick={() => onVoiceCreated(createdVoice.voice_id, createdVoice)}
                className="btn-apple"
              >
                Use This Voice
              </Button>
              <Button
                variant="outline"
                onClick={resetForm}
                className="bg-white/20"
              >
                Create Another
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}