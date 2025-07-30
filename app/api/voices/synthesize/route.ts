import { NextRequest, NextResponse } from 'next/server';
import { generateSpeech, getOptimizedVoiceSettings } from '@/lib/elevenlabs';
import { TextProcessor } from '@/lib/text-processor';
import { generateId } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      text, 
      voice_id, 
      elevenlabs_voice_id,
      language = 'vi',
      speed = 1.0,
      stability = 0.5,
      similarity_boost = 0.8,
      style = 0.0,
      clean_text = true 
    } = body;

    // Validation
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required and must be a string' },
        { status: 400 }
      );
    }

    if (!elevenlabs_voice_id) {
      return NextResponse.json(
        { error: 'ElevenLabs voice ID is required for cloned voice synthesis' },
        { status: 400 }
      );
    }

    // Validate ElevenLabs voice ID format
    if (typeof elevenlabs_voice_id !== 'string' || elevenlabs_voice_id.trim() === '') {
      return NextResponse.json(
        { error: 'Invalid ElevenLabs voice ID format' },
        { status: 400 }
      );
    }

    // Validate text content
    const validation = TextProcessor.validateText(text);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Process text if cleaning is enabled
    const processedText = clean_text ? TextProcessor.cleanText(text) : text;
    
    if (!processedText.trim()) {
      return NextResponse.json(
        { error: 'Text is empty after processing' },
        { status: 400 }
      );
    }

    // Generate unique audio ID
    const audioId = generateId();

    // Get text statistics
    const stats = TextProcessor.getTextStats(processedText);

    try {
      // Select appropriate model based on language
      const getModelForLanguage = (lang: string) => {
        switch (lang) {
          case 'vi':
            return 'eleven_multilingual_v2'; // Best for Vietnamese
          case 'fr':
            return 'eleven_multilingual_v2'; // Good for French
          case 'en':
            return 'eleven_turbo_v2'; // Fast and good for English
          default:
            return 'eleven_multilingual_v2';
        }
      };

      // Get optimized settings for the language, but allow user overrides
      const optimizedSettings = getOptimizedVoiceSettings(language);
      const finalSettings = {
        stability: stability !== undefined ? Math.max(0, Math.min(1, stability)) : optimizedSettings.stability,
        similarity_boost: similarity_boost !== undefined ? Math.max(0, Math.min(1, similarity_boost)) : optimizedSettings.similarity_boost,
        style: style !== undefined ? Math.max(0, Math.min(1, style)) : optimizedSettings.style,
        use_speaker_boost: true,
      };

      // Log voice synthesis request for debugging
      console.log(`Synthesizing speech for voice: ${voice_id} (ElevenLabs ID: ${elevenlabs_voice_id})`);
      console.log(`Language: ${language}, Model: ${getModelForLanguage(language)}`);
      console.log(`Final Settings:`, finalSettings);

      // Generate speech using ElevenLabs with voice-specific settings
      const audioBuffer = await generateSpeech({
        text: processedText,
        voice_id: elevenlabs_voice_id.trim(),
        model_id: getModelForLanguage(language),
        voice_settings: finalSettings,
      });

      // Convert audio buffer to base64 for client consumption
      const audioBase64 = audioBuffer.toString('base64');

      return NextResponse.json({
        audio_id: audioId,
        original_text: text,
        processed_text: processedText,
        language: language,
        voice_id: voice_id,
        elevenlabs_voice_id: elevenlabs_voice_id,
        speed: speed, // Note: ElevenLabs handles speed differently, this is for compatibility
        stats: {
          characters: stats.characters,
          words: stats.words,
          sentences: stats.sentences,
          estimated_duration: stats.estimatedDuration,
        },
        audio_data: `data:audio/mp3;base64,${audioBase64}`,
        file_info: {
          format: 'mp3',
          sample_rate: 22050, // ElevenLabs default
        },
        voice_settings: finalSettings,
        provider: 'elevenlabs',
      });

    } catch (error) {
      console.error('ElevenLabs TTS Error:', error);
      return NextResponse.json(
        { error: 'Failed to generate speech with cloned voice. Please try again.' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to synthesize with cloned voice.' },
    { status: 405 }
  );
}