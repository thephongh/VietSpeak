import { NextResponse } from 'next/server';
import { getVoices } from '@/lib/elevenlabs';

export async function GET() {
  try {
    const elevenLabsVoices = await getVoices();
    
    // Filter for custom/cloned voices only
    const clonedVoices = elevenLabsVoices
      .filter((voice: any) => 
        voice.labels?.created_by === 'tts-vietnam-app' || 
        !voice.available_for_tiers?.includes('free') // Custom voices are typically not in free tier
      )
      .map((voice: any) => ({
        id: voice.id,
        name: voice.name,
        description: voice.description,
        language: voice.labels?.language || 'vi',
        type: 'cloned',
        provider: 'elevenlabs',
        preview_url: voice.preview_url,
        settings: voice.settings,
        labels: voice.labels,
        created_at: new Date().toISOString(), // We don't have creation date from ElevenLabs API
      }));

    return NextResponse.json({
      voices: clonedVoices,
      count: clonedVoices.length,
    });

  } catch (error) {
    console.error('Error fetching cloned voices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cloned voices' },
      { status: 500 }
    );
  }
}

export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed. Use GET to fetch cloned voices.' },
    { status: 405 }
  );
}