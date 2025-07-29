import { NextRequest, NextResponse } from 'next/server';
import { cloneVoice, validateAudioFile, estimateVoiceQuality } from '@/lib/elevenlabs';
import { generateId } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const language = formData.get('language') as string || 'vi';
    
    // Get uploaded files
    const files: File[] = [];
    const fileEntries = formData.getAll('files');
    
    for (const entry of fileEntries) {
      if (entry instanceof File) {
        files.push(entry);
      }
    }

    // Validation
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Voice name is required' },
        { status: 400 }
      );
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'At least one audio file is required' },
        { status: 400 }
      );
    }

    if (files.length > 5) {
      return NextResponse.json(
        { error: 'Maximum 5 audio files allowed' },
        { status: 400 }
      );
    }

    // Validate each file
    for (const file of files) {
      const validation = validateAudioFile(file);
      if (!validation.isValid) {
        return NextResponse.json(
          { error: `File ${file.name}: ${validation.error}` },
          { status: 400 }
        );
      }
    }

    // Estimate quality score
    const qualityScore = estimateVoiceQuality(files);

    try {
      // Clone voice using ElevenLabs
      const voiceCloneResult = await cloneVoice({
        name: name.trim(),
        description: description?.trim() || `Vietnamese cloned voice: ${name}`,
        labels: {
          language: language,
          accent: 'vietnamese',
          created_by: 'tts-vietnam-app',
        },
        files,
      });

      // Generate a local voice ID for our system
      const localVoiceId = generateId();

      return NextResponse.json({
        voice_id: localVoiceId,
        elevenlabs_voice_id: voiceCloneResult.voice_id,
        name: voiceCloneResult.name,
        description: voiceCloneResult.description,
        language: language,
        created_at: voiceCloneResult.created_at,
        quality_score: qualityScore,
        preview_url: voiceCloneResult.preview_url,
        sample_duration: files.reduce((total, file) => {
          // Rough estimate: 1MB ≈ 8 seconds of audio at 128kbps
          return total + (file.size / (128 * 1024)) * 8;
        }, 0),
        file_count: files.length,
        type: 'cloned',
        provider: 'elevenlabs',
      });

    } catch (error) {
      console.error('Voice cloning error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Check for specific ElevenLabs errors
      if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        return NextResponse.json(
          { error: 'ElevenLabs API key is invalid or missing. Please check your configuration.' },
          { status: 401 }
        );
      }
      
      if (errorMessage.includes('402') || errorMessage.includes('quota')) {
        return NextResponse.json(
          { error: 'ElevenLabs quota exceeded. Please check your subscription.' },
          { status: 402 }
        );
      }
      
      return NextResponse.json(
        { error: `Voice cloning failed: ${errorMessage}` },
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
    { error: 'Method not allowed. Use POST to clone a voice.' },
    { status: 405 }
  );
}