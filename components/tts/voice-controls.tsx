'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { RotateCcw, Settings } from 'lucide-react';

interface VoiceControlsProps {
  speed: number;
  pitch?: number;
  stability?: number;
  similarityBoost?: number;
  onSpeedChange: (speed: number) => void;
  onPitchChange?: (pitch: number) => void;
  onStabilityChange?: (stability: number) => void;
  onSimilarityBoostChange?: (similarityBoost: number) => void;
  onReset: () => void;
  showAdvanced?: boolean;
  isClonedVoice?: boolean;
}

export function VoiceControls({
  speed,
  pitch = 0,
  stability = 0.5,
  similarityBoost = 0.8,
  onSpeedChange,
  onPitchChange,
  onStabilityChange,
  onSimilarityBoostChange,
  onReset,
  showAdvanced = false,
  isClonedVoice = false,
}: VoiceControlsProps) {
  return (
    <Card className="glass-card border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg text-gray-800">
          <Settings className="h-5 w-5" />
          Voice Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Speed Control */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-gray-700">Speed</Label>
            <span className="text-sm text-gray-600 bg-white/30 px-2 py-1 rounded-md">
              {speed.toFixed(1)}x
            </span>
          </div>
          <Slider
            value={[speed]}
            min={0.25}
            max={2.0}
            step={0.1}
            onValueChange={(values) => onSpeedChange(values[0])}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>0.25x</span>
            <span>1.0x</span>
            <span>2.0x</span>
          </div>
        </div>

        {/* Pitch Control (for Google Cloud TTS) */}
        {!isClonedVoice && onPitchChange && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-gray-700">Pitch</Label>
              <span className="text-sm text-gray-600 bg-white/30 px-2 py-1 rounded-md">
                {pitch > 0 ? '+' : ''}{pitch.toFixed(1)}
              </span>
            </div>
            <Slider
              value={[pitch]}
              min={-10}
              max={10}
              step={0.5}
              onValueChange={(values) => onPitchChange(values[0])}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Lower</span>
              <span>Normal</span>
              <span>Higher</span>
            </div>
          </div>
        )}

        {/* ElevenLabs Cloned Voice Controls */}
        {isClonedVoice && (
          <>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-gray-700">Stability</Label>
                <span className="text-sm text-gray-600 bg-white/30 px-2 py-1 rounded-md">
                  {Math.round(stability * 100)}%
                </span>
              </div>
              <Slider
                value={[stability]}
                min={0}
                max={1}
                step={0.1}
                onValueChange={(values) => onStabilityChange?.(values[0])}
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Higher values make the voice more stable but less expressive
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-gray-700">Similarity</Label>
                <span className="text-sm text-gray-600 bg-white/30 px-2 py-1 rounded-md">
                  {Math.round(similarityBoost * 100)}%
                </span>
              </div>
              <Slider
                value={[similarityBoost]}
                min={0}
                max={1}
                step={0.1}
                onValueChange={(values) => onSimilarityBoostChange?.(values[0])}
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                How closely the voice should match the original sample
              </p>
            </div>
          </>
        )}

        {/* Reset Button */}
        <div className="pt-2">
          <Button
            variant="outline"
            onClick={onReset}
            className="w-full bg-white/20 border-white/30 hover:bg-white/30 transition-all duration-200"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
        </div>

        {/* Info */}
        <div className="text-xs text-gray-500 text-center p-3 bg-white/10 rounded-lg">
          <p>
            {isClonedVoice 
              ? 'Adjust these settings to fine-tune your cloned voice output'
              : 'These controls affect the speech synthesis quality'
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
}