import { NextResponse } from 'next/server';
import { getGoogleCloudTTSClient } from '@/lib/google-cloud-tts';

export async function GET() {
  try {
    const client = getGoogleCloudTTSClient();
    
    // List all available voices from Google Cloud
    const [result] = await client.listVoices({});
    
    // Filter for French voices
    const frenchVoices = result.voices?.filter(voice => 
      voice.languageCodes?.some(code => code.startsWith('fr-FR'))
    );
    
    return NextResponse.json({
      totalVoices: result.voices?.length || 0,
      frenchVoices: frenchVoices?.map(voice => ({
        name: voice.name,
        ssmlGender: voice.ssmlGender,
        languageCodes: voice.languageCodes,
        naturalSampleRateHertz: voice.naturalSampleRateHertz,
      })) || [],
      availableFrenchVoiceNames: frenchVoices?.map(v => v.name) || [],
    });
    
  } catch (error) {
    console.error('Error listing voices:', error);
    return NextResponse.json(
      { error: 'Failed to list voices from Google Cloud TTS' },
      { status: 500 }
    );
  }
}