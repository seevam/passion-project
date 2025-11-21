import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { CreateMilestoneSchema } from '@/lib/validations/project';

// POST /api/projects/[id]/milestones - Create milestone
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    // Verify project ownership
    const project = await db.project.findFirst({
      where: {
        id: params.id,
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
    const validated = CreateMilestoneSchema.parse(body);

    // Create milestone
    const milestone = await db.milestone.create({
      data: {
        projectId: params.id,
        title: validated.title,
        description: validated.description || null,
        targetDate: validated.targetDate ? new Date(validated.targetDate) : null,
        orderIndex: validated.orderIndex,
      },
    });

    // Award XP
    await db.user.update({
      where: { id: user.id },
      data: { xp: { increment: 10 } },
    });

    return NextResponse.json(
      {
        success: true,
        milestone,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[CREATE_MILESTONE]', error);
    return NextResponse.json(
      { error: 'Failed to create milestone' },
      { status: 500 }
    );
  }
}
