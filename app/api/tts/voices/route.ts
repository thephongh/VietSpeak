import { NextResponse } from 'next/server';
import { getAllVoices } from '@/lib/google-cloud-tts';

export async function GET() {
  try {
    const voices = getAllVoices();
    
    // Format voices for the frontend
    const formattedVoices = voices.map(voice => ({
      id: voice.id,
      name: voice.name,
      language: voice.language,
      gender: voice.gender.toLowerCase(),
      type: 'google_cloud',
      quality: voice.type === 'Neural2' ? 'high' : voice.type === 'WaveNet' ? 'medium' : 'standard',
      description: `${voice.type} voice - ${voice.gender.toLowerCase() === 'female' ? 'Female' : 'Male'}`,
    }));

    return NextResponse.json({
      voices: formattedVoices,
      count: formattedVoices.length,
    });

  } catch (error) {
    console.error('Error fetching voices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch available voices' },
      { status: 500 }
    );
  }
}

export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed. Use GET to fetch voices.' },
    { status: 405 }
  );
}