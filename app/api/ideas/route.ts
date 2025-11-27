import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { IdeaGenerator } from '@/lib/ai/idea-generator';

// GET /api/ideas - Get user's saved and generated ideas
export async function GET() {
  try {
    const user = await requireAuth();

    const ideas = await db.projectIdea.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      ideas,
    });
  } catch (error) {
    console.error('[GET_IDEAS]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/ideas - Generate new project ideas
export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json().catch(() => ({})); // Get ratings if provided

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

    // Generate ideas using AI
    const ideaGenerator = new IdeaGenerator();
    const generatedIdeas = await ideaGenerator.generateIdeas(profile, body.ratings);

    // Save generated ideas to database
    const savedIdeas = await Promise.all(
      generatedIdeas.map((idea) =>
        db.projectIdea.create({
          data: {
            userId: user.id,
            title: idea.title,
            description: idea.description,
            category: idea.category,
            feasibilityScore: idea.feasibilityScore,
            matchingPercent: idea.matchingPercent,
            timeEstimate: idea.timeEstimate,
            uniqueness: idea.uniqueness,
            impactMetrics: idea.impactMetrics,
            generationPrompt: 'AI-generated based on user profile',
            profileSnapshot: profile as any,
            status: 'suggested',
          },
        })
      )
    );

    return NextResponse.json(
      {
        success: true,
        ideas: savedIdeas,
        count: savedIdeas.length,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[GENERATE_IDEAS]', error);
    return NextResponse.json(
      { error: 'Failed to generate ideas. Please try again.' },
      { status: 500 }
    );
  }
}
