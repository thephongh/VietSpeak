import { TextToSpeechClient } from '@google-cloud/text-to-speech';

let ttsClient: TextToSpeechClient | null = null;

export function getGoogleCloudTTSClient(): TextToSpeechClient {
  if (!ttsClient) {
    const credentials = {
      project_id: process.env.GOOGLE_CLOUD_PROJECT_ID,
      private_key_id: process.env.GOOGLE_CLOUD_PRIVATE_KEY_ID,
      private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
      client_id: process.env.GOOGLE_CLOUD_CLIENT_ID,
      client_x509_cert_url: process.env.GOOGLE_CLOUD_CLIENT_X509_CERT_URL,
    };

    ttsClient = new TextToSpeechClient({
      credentials,
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    });
  }
  
  return ttsClient;
}

export interface GoogleTTSRequest {
  text: string;
  language: string;
  voice?: string;
  speed?: number;
  pitch?: number;
}

export interface GoogleTTSResponse {
  audioContent: Buffer;
  audioConfig: {
    audioEncoding: string;
    sampleRateHertz: number;
  };
}

export const VIETNAMESE_VOICES = [
  { id: 'vi-VN-Standard-A', name: 'Vi-VN Standard A (Female)', gender: 'FEMALE', type: 'Standard' },
  { id: 'vi-VN-Standard-B', name: 'Vi-VN Standard B (Male)', gender: 'MALE', type: 'Standard' },
  { id: 'vi-VN-Standard-C', name: 'Vi-VN Standard C (Female)', gender: 'FEMALE', type: 'Standard' },
  { id: 'vi-VN-Standard-D', name: 'Vi-VN Standard D (Male)', gender: 'MALE', type: 'Standard' },
  { id: 'vi-VN-Wavenet-A', name: 'Vi-VN WaveNet A (Female)', gender: 'FEMALE', type: 'WaveNet' },
  { id: 'vi-VN-Wavenet-B', name: 'Vi-VN WaveNet B (Male)', gender: 'MALE', type: 'WaveNet' },
  { id: 'vi-VN-Wavenet-C', name: 'Vi-VN WaveNet C (Female)', gender: 'FEMALE', type: 'WaveNet' },
  { id: 'vi-VN-Wavenet-D', name: 'Vi-VN WaveNet D (Male)', gender: 'MALE', type: 'WaveNet' },
  { id: 'vi-VN-Neural2-A', name: 'Vi-VN Neural2 A (Female)', gender: 'FEMALE', type: 'Neural2' },
  { id: 'vi-VN-Neural2-D', name: 'Vi-VN Neural2 D (Male)', gender: 'MALE', type: 'Neural2' },
];

export const ENGLISH_VOICES = [
  { id: 'en-US-Standard-A', name: 'US English Standard A (Female)', gender: 'FEMALE', type: 'Standard' },
  { id: 'en-US-Standard-B', name: 'US English Standard B (Male)', gender: 'MALE', type: 'Standard' },
  { id: 'en-US-Standard-C', name: 'US English Standard C (Female)', gender: 'FEMALE', type: 'Standard' },
  { id: 'en-US-Standard-D', name: 'US English Standard D (Male)', gender: 'MALE', type: 'Standard' },
  { id: 'en-US-Wavenet-A', name: 'US English WaveNet A (Female)', gender: 'FEMALE', type: 'WaveNet' },
  { id: 'en-US-Wavenet-B', name: 'US English WaveNet B (Male)', gender: 'MALE', type: 'WaveNet' },
  { id: 'en-US-Wavenet-C', name: 'US English WaveNet C (Female)', gender: 'FEMALE', type: 'WaveNet' },
  { id: 'en-US-Wavenet-D', name: 'US English WaveNet D (Male)', gender: 'MALE', type: 'WaveNet' },
  { id: 'en-US-Neural2-A', name: 'US English Neural2 A (Female)', gender: 'FEMALE', type: 'Neural2' },
  { id: 'en-US-Neural2-C', name: 'US English Neural2 C (Female)', gender: 'FEMALE', type: 'Neural2' },
  { id: 'en-US-Neural2-D', name: 'US English Neural2 D (Male)', gender: 'MALE', type: 'Neural2' },
  { id: 'en-US-Neural2-F', name: 'US English Neural2 F (Female)', gender: 'FEMALE', type: 'Neural2' },
];

export const FRENCH_VOICES = [
  { id: 'fr-FR-Standard-A', name: 'French Standard A (Female)', gender: 'FEMALE', type: 'Standard' },
  { id: 'fr-FR-Standard-B', name: 'French Standard B (Male)', gender: 'MALE', type: 'Standard' },
  { id: 'fr-FR-Standard-C', name: 'French Standard C (Female)', gender: 'FEMALE', type: 'Standard' },
  { id: 'fr-FR-Standard-D', name: 'French Standard D (Male)', gender: 'MALE', type: 'Standard' },
  { id: 'fr-FR-Wavenet-A', name: 'French WaveNet A (Female)', gender: 'FEMALE', type: 'WaveNet' },
  { id: 'fr-FR-Wavenet-B', name: 'French WaveNet B (Male)', gender: 'MALE', type: 'WaveNet' },
  { id: 'fr-FR-Wavenet-C', name: 'French WaveNet C (Female)', gender: 'FEMALE', type: 'WaveNet' },
  { id: 'fr-FR-Wavenet-D', name: 'French WaveNet D (Male)', gender: 'MALE', type: 'WaveNet' },
  { id: 'fr-FR-Neural2-A', name: 'French Neural2 A (Female)', gender: 'FEMALE', type: 'Neural2' },
  { id: 'fr-FR-Neural2-B', name: 'French Neural2 B (Male)', gender: 'MALE', type: 'Neural2' },
  { id: 'fr-FR-Neural2-C', name: 'French Neural2 C (Female)', gender: 'FEMALE', type: 'Neural2' },
  { id: 'fr-FR-Neural2-D', name: 'French Neural2 D (Male)', gender: 'MALE', type: 'Neural2' },
];

export async function synthesizeText({
  text,
  language,
  voice,
  speed = 1.0,
  pitch = 0,
}: GoogleTTSRequest): Promise<GoogleTTSResponse> {
  const client = getGoogleCloudTTSClient();

  // Map language codes to voice names
  const getDefaultVoice = (lang: string) => {
    switch (lang) {
      case 'vi':
        return voice || 'vi-VN-Neural2-A';
      case 'en':
        return voice || 'en-US-Neural2-C';
      case 'fr':
        return voice || 'fr-FR-Neural2-A';
      default:
        return voice || 'en-US-Neural2-C';
    }
  };

  const getLanguageCode = (lang: string) => {
    switch (lang) {
      case 'vi':
        return 'vi-VN';
      case 'en':
        return 'en-US';
      case 'fr':
        return 'fr-FR';
      default:
        return 'en-US';
    }
  };

  const selectedVoice = getDefaultVoice(language);
  const languageCode = getLanguageCode(language);

  const request = {
    input: { text },
    voice: {
      languageCode,
      name: selectedVoice,
    },
    audioConfig: {
      audioEncoding: 'MP3' as const,
      sampleRateHertz: 22050,
      speakingRate: Math.max(0.25, Math.min(4.0, speed)),
      pitch: Math.max(-20.0, Math.min(20.0, pitch)),
    },
  };

  try {
    const [response] = await client.synthesizeSpeech(request);
    
    if (!response.audioContent) {
      throw new Error('No audio content received from Google Cloud TTS');
    }

    return {
      audioContent: Buffer.from(response.audioContent),
      audioConfig: {
        audioEncoding: 'MP3',
        sampleRateHertz: 22050,
      },
    };
  } catch (error) {
    console.error('Google Cloud TTS Error:', error);
    throw new Error(`TTS synthesis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function getAllVoices() {
  return [
    ...VIETNAMESE_VOICES.map(v => ({ ...v, language: 'vi' })),
    ...ENGLISH_VOICES.map(v => ({ ...v, language: 'en' })),
    ...FRENCH_VOICES.map(v => ({ ...v, language: 'fr' })),
  ];
}