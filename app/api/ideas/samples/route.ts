import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { SampleIdeaSelector } from '@/lib/ai/sample-idea-selector';

// GET /api/ideas/samples - Get personalized sample ideas for rating
export async function GET() {
  try {
    const user = await requireAuth();

    // Get user profile
    const profile = await db.userProfile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Please complete your profile first' },
        { status: 400 }
      );
    }

    // Select personalized sample ideas
    const selector = new SampleIdeaSelector();
    const samples = selector.selectPersonalizedSamples(profile, 5);

    return NextResponse.json({
      success: true,
      samples,
    });
  } catch (error) {
    console.error('[GET_SAMPLE_IDEAS]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
