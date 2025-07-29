import { NextRequest, NextResponse } from 'next/server';
import { synthesizeText } from '@/lib/google-cloud-tts';
import { TextProcessor } from '@/lib/text-processor';
import { generateId } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, language = 'vi', voice, speed = 1.0, pitch = 0, clean_text = true } = body;

    // Validate input
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required and must be a string' },
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

    // Auto-detect language if needed
    let detectedLanguage = language;
    if (language === 'auto') {
      detectedLanguage = TextProcessor.detectLanguage(processedText);
      if (detectedLanguage === 'unknown') {
        detectedLanguage = 'vi'; // Default to Vietnamese
      }
    }

    // Generate unique audio ID
    const audioId = generateId();

    // Get text statistics
    const stats = TextProcessor.getTextStats(processedText);

    try {
      // Synthesize speech using Google Cloud TTS
      const { audioContent, audioConfig } = await synthesizeText({
        text: processedText,
        language: detectedLanguage,
        voice,
        speed: Math.max(0.25, Math.min(4.0, speed)),
        pitch: Math.max(-20, Math.min(20, pitch)),
      });

      // In a production environment, you would save this to a cloud storage service
      // For now, we'll store it temporarily in memory/cache
      // This is a limitation for Vercel deployment - consider using a database or cloud storage
      
      // Convert audio buffer to base64 for client consumption
      const audioBase64 = audioContent.toString('base64');

      return NextResponse.json({
        audio_id: audioId,
        original_text: text,
        processed_text: processedText,
        language: detectedLanguage,
        voice: voice,
        speed,
        pitch,
        stats: {
          characters: stats.characters,
          words: stats.words,
          sentences: stats.sentences,
          estimated_duration: stats.estimatedDuration,
        },
        audio_data: `data:audio/mp3;base64,${audioBase64}`,
        file_info: {
          format: audioConfig.audioEncoding.toLowerCase(),
          sample_rate: audioConfig.sampleRateHertz,
        },
      });

    } catch (error) {
      console.error('TTS Synthesis Error:', error);
      return NextResponse.json(
        { error: 'Failed to synthesize speech. Please try again.' },
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
    { error: 'Method not allowed. Use POST to synthesize text.' },
    { status: 405 }
  );
}