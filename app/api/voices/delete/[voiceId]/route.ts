import { NextRequest, NextResponse } from 'next/server';
import { deleteVoice } from '@/lib/elevenlabs';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ voiceId: string }> }
) {
  try {
    const { voiceId } = await params;

    if (!voiceId) {
      return NextResponse.json(
        { error: 'Voice ID is required' },
        { status: 400 }
      );
    }

    // For now, we'll assume the voiceId is the ElevenLabs voice ID
    // In a full implementation, you'd look up the ElevenLabs ID from your database
    await deleteVoice(voiceId);

    return NextResponse.json({
      success: true,
      message: 'Voice deleted successfully',
      voice_id: voiceId,
    });

  } catch (error) {
    console.error('Error deleting voice:', error);
    return NextResponse.json(
      { error: 'Failed to delete voice. It may have already been deleted.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use DELETE to delete a voice.' },
    { status: 405 }
  );
}

export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed. Use DELETE to delete a voice.' },
    { status: 405 }
  );
}