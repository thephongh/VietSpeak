'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { RotateCcw, Volume2, Gauge } from 'lucide-react';

interface VoiceControlsProps {
  speed: number;
  pitch?: number;
  volume?: number;
  onSpeedChange: (speed: number) => void;
  onPitchChange?: (pitch: number) => void;
  onVolumeChange?: (volume: number) => void;
  onReset?: () => void;
  className?: string;
}

export function VoiceControls({
  speed,
  pitch = 0,
  volume = 1,
  onSpeedChange,
  onPitchChange,
  onVolumeChange,
  onReset,
  className = ""
}: VoiceControlsProps) {
  const [previewSpeed, setPreviewSpeed] = useState(speed);
  const [previewPitch, setPreviewPitch] = useState(pitch);
  const [previewVolume, setPreviewVolume] = useState(volume);

  const handleSpeedChange = (value: number[]) => {
    const newSpeed = value[0];
    setPreviewSpeed(newSpeed);
    onSpeedChange(newSpeed);
  };

  const handlePitchChange = (value: number[]) => {
    if (onPitchChange) {
      const newPitch = value[0];
      setPreviewPitch(newPitch);
      onPitchChange(newPitch);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    if (onVolumeChange) {
      const newVolume = value[0];
      setPreviewVolume(newVolume);
      onVolumeChange(newVolume);
    }
  };

  const handleReset = () => {
    setPreviewSpeed(1.0);
    setPreviewPitch(0);
    setPreviewVolume(1.0);
    onSpeedChange(1.0);
    onPitchChange?.(0);
    onVolumeChange?.(1.0);
    onReset?.();
  };

  const getSpeedLabel = (speed: number): string => {
    if (speed < 0.8) return 'Very Slow';
    if (speed < 0.9) return 'Slow';
    if (speed < 1.1) return 'Normal';
    if (speed < 1.3) return 'Fast';
    return 'Very Fast';
  };

  const getPitchLabel = (pitch: number): string => {
    if (pitch < -5) return 'Very Low';
    if (pitch < -2) return 'Low';
    if (pitch > 5) return 'Very High';
    if (pitch > 2) return 'High';
    return 'Normal';
  };

  return (
    <Card className={`bg-white/80 backdrop-blur-sm border-red-100 shadow-lg hover:shadow-xl transition-all duration-300 ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center space-x-2 text-gray-800">
            <Gauge className="h-5 w-5 text-red-600" />
            <span>Voice Controls</span>
          </CardTitle>
          <Button 
            size="sm" 
            onClick={handleReset}
            className="text-xs bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Speech Speed Control */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Speech Speed</Label>
            <div className="text-xs text-muted-foreground">
              {previewSpeed.toFixed(1)}x • {getSpeedLabel(previewSpeed)}
            </div>
          </div>
          <Slider
            value={[previewSpeed]}
            onValueChange={handleSpeedChange}
            min={0.5}
            max={2.0}
            step={0.1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0.5x (Slow)</span>
            <span>1.0x (Normal)</span>
            <span>2.0x (Fast)</span>
          </div>
        </div>

        {/* Pitch Control (if supported) */}
        {onPitchChange && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Pitch</Label>
              <div className="text-xs text-muted-foreground">
                {previewPitch > 0 ? '+' : ''}{previewPitch} • {getPitchLabel(previewPitch)}
              </div>
            </div>
            <Slider
              value={[previewPitch]}
              onValueChange={handlePitchChange}
              min={-12}
              max={12}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>-12 (Very Low)</span>
              <span>0 (Normal)</span>
              <span>+12 (Very High)</span>
            </div>
          </div>
        )}

        {/* Volume Control (if supported) */}
        {onVolumeChange && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium flex items-center space-x-1">
                <Volume2 className="h-3 w-3" />
                <span>Volume</span>
              </Label>
              <div className="text-xs text-muted-foreground">
                {Math.round(previewVolume * 100)}%
              </div>
            </div>
            <Slider
              value={[previewVolume]}
              onValueChange={handleVolumeChange}
              min={0}
              max={1}
              step={0.05}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0% (Mute)</span>
              <span>50%</span>
              <span>100% (Max)</span>
            </div>
          </div>
        )}

        {/* Quick Presets */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Quick Presets</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onSpeedChange(0.8);
                setPreviewSpeed(0.8);
                onPitchChange?.(0);
                setPreviewPitch(0);
              }}
              className="text-xs"
            >
              Slow & Clear
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onSpeedChange(1.0);
                setPreviewSpeed(1.0);
                onPitchChange?.(0);
                setPreviewPitch(0);
              }}
              className="text-xs"
            >
              Natural
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onSpeedChange(1.3);
                setPreviewSpeed(1.3);
                onPitchChange?.(-1);
                setPreviewPitch(-1);
              }}
              className="text-xs"
            >
              Fast & Deep
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onSpeedChange(0.9);
                setPreviewSpeed(0.9);
                onPitchChange?.(2);
                setPreviewPitch(2);
              }}
              className="text-xs"
            >
              Gentle
            </Button>
          </div>
        </div>

        {/* Usage Tips */}
        <div className="bg-muted p-3 rounded-md">
          <h4 className="text-xs font-medium mb-2">💡 Tips</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Use slower speeds for better pronunciation</li>
            <li>• Lower pitch can sound more authoritative</li>
            <li>• Higher pitch may sound more energetic</li>
            <li>• Reset to defaults if speech sounds unnatural</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}