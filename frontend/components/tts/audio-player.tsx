'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { 
  Play, 
  Pause, 
  Square, 
  Volume2, 
  VolumeX,
  Download,
  RotateCcw,
  SkipBack,
  SkipForward 
} from 'lucide-react';

interface AudioPlayerProps {
  audioUrl: string;
  title?: string;
  onEnded?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

export function AudioPlayer({ 
  audioUrl, 
  title = "Generated Audio",
  onEnded,
  onError,
  className = ""
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [error, setError] = useState('');

  // Reset state when audioUrl changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setIsLoading(true);
    setError('');
  }, [audioUrl]);

  // Setup audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      onEnded?.();
    };

    const handleError = () => {
      const errorMsg = 'Failed to load audio file';
      setError(errorMsg);
      setIsLoading(false);
      onError?.(errorMsg);
    };

    const handleLoadStart = () => {
      setIsLoading(true);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [audioUrl, onEnded, onError]);

  // Update audio volume when volume state changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Update audio playback rate when rate state changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const handlePlayPause = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || isLoading) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        await audio.play();
        setIsPlaying(true);
      }
    } catch (err) {
      const errorMsg = 'Failed to play audio';
      setError(errorMsg);
      onError?.(errorMsg);
    }
  }, [isPlaying, isLoading, onError]);

  const handleStop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);

  const handleSeek = useCallback((newTime: number) => {
    const audio = audioRef.current;
    if (!audio || isLoading) return;

    audio.currentTime = newTime;
    setCurrentTime(newTime);
  }, [isLoading]);

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || isLoading || duration === 0) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickRatio = clickX / rect.width;
    const newTime = clickRatio * duration;
    
    handleSeek(newTime);
  }, [duration, isLoading, handleSeek]);

  const handleVolumeToggle = useCallback(() => {
    setIsMuted(!isMuted);
  }, [isMuted]);

  const handleDownload = useCallback(() => {
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [audioUrl, title]);

  const handleSkipBack = useCallback(() => {
    handleSeek(Math.max(0, currentTime - 10));
  }, [currentTime, handleSeek]);

  const handleSkipForward = useCallback(() => {
    handleSeek(Math.min(duration, currentTime + 10));
  }, [currentTime, duration, handleSeek]);

  const handleRestart = useCallback(() => {
    handleSeek(0);
  }, [handleSeek]);

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3 text-red-600">
            <VolumeX className="h-6 w-6" />
            <span className="text-sm">{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <audio ref={audioRef} src={audioUrl} preload="metadata" />
        
        {/* Title */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold truncate">{title}</h3>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div 
            className="relative w-full h-2 bg-gray-200 rounded-full cursor-pointer hover:bg-gray-300 transition-colors"
            onClick={handleProgressClick}
          >
            <div 
              className="absolute left-0 top-0 h-full bg-primary rounded-full transition-all duration-100 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Main Controls */}
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRestart}
            disabled={isLoading}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSkipBack}
            disabled={isLoading}
          >
            <SkipBack className="h-4 w-4" />
          </Button>

          <Button
            onClick={handlePlayPause}
            disabled={isLoading}
            size="lg"
            className="w-16 h-16 rounded-full"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
            ) : isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6 ml-1" />
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleStop}
            disabled={isLoading}
          >
            <Square className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSkipForward}
            disabled={isLoading}
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        {/* Secondary Controls */}
        <div className="flex items-center justify-between space-x-4">
          {/* Volume Control */}
          <div className="flex items-center space-x-2 flex-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleVolumeToggle}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume * 100]}
              onValueChange={([value]) => {
                const newVolume = value / 100;
                setVolume(newVolume);
                if (newVolume > 0) setIsMuted(false);
              }}
              max={100}
              step={1}
              className="w-20"
            />
          </div>

          {/* Playback Speed */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-muted-foreground">Speed:</span>
            <select
              value={playbackRate}
              onChange={(e) => setPlaybackRate(Number(e.target.value))}
              className="text-xs border border-input rounded px-1 py-0.5"
            >
              <option value={0.5}>0.5x</option>
              <option value={0.75}>0.75x</option>
              <option value={1}>1x</option>
              <option value={1.25}>1.25x</option>
              <option value={1.5}>1.5x</option>
              <option value={2}>2x</option>
            </select>
          </div>

          {/* Download Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}