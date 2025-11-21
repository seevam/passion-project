import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { ProjectCheckInSchema } from '@/lib/validations/project';

// POST /api/projects/[id]/check-ins - Create check-in
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const { id } = await params;

    // Verify project ownership
    const project = await db.project.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Validate input
    const validated = ProjectCheckInSchema.parse(body);

    // Create check-in
    const checkIn = await db.projectCheckIn.create({
      data: {
        projectId: id,
        accomplishments: validated.accomplishments,
        challenges: validated.challenges || null,
        learnings: validated.learnings || null,
        nextSteps: validated.nextSteps || null,
        hoursLogged: validated.hoursLogged || null,
        moodRating: validated.moodRating || null,
        energyLevel: validated.energyLevel || null,
      },
    });

    // Update project stats
    const hoursToAdd = validated.hoursLogged || 0;
    await db.project.update({
      where: { id },
      data: {
        hoursLogged: { increment: hoursToAdd },
        lastWorkedAt: new Date(),
      },
    });

    // Award XP for check-in
    const xpAward = 20 + (hoursToAdd * 2); // Base 20 + 2 per hour
    await db.user.update({
      where: { id: user.id },
      data: {
        xp: { increment: xpAward },
        lastActiveAt: new Date(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        checkIn,
        xpAwarded: xpAward,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[CREATE_CHECKIN]', error);
    return NextResponse.json(
      { error: 'Failed to create check-in' },
      { status: 500 }
    );
  }
}
