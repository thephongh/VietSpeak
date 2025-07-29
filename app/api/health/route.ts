import { NextResponse } from 'next/server';

export async function GET() {
  const healthCheck = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      'google-cloud-tts': checkGoogleCloudConfig(),
      'elevenlabs': checkElevenLabsConfig(),
    },
  };

  const allServicesHealthy = Object.values(healthCheck.services).every(
    service => service.status === 'configured'
  );

  return NextResponse.json(
    healthCheck,
    { status: allServicesHealthy ? 200 : 206 }
  );
}

function checkGoogleCloudConfig() {
  const requiredEnvVars = [
    'GOOGLE_CLOUD_PROJECT_ID',
    'GOOGLE_CLOUD_PRIVATE_KEY_ID',
    'GOOGLE_CLOUD_PRIVATE_KEY',
    'GOOGLE_CLOUD_CLIENT_EMAIL',
    'GOOGLE_CLOUD_CLIENT_ID',
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  return {
    status: missingVars.length === 0 ? 'configured' : 'not_configured',
    missing_env_vars: missingVars,
  };
}

function checkElevenLabsConfig() {
  const hasApiKey = !!process.env.ELEVENLABS_API_KEY;

  return {
    status: hasApiKey ? 'configured' : 'not_configured',
    missing_env_vars: hasApiKey ? [] : ['ELEVENLABS_API_KEY'],
  };
}