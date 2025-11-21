import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { CreateTaskSchema } from '@/lib/validations/project';

// POST /api/projects/[id]/tasks - Create task
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
    const validated = CreateTaskSchema.parse(body);

    // Create task
    const task = await db.task.create({
      data: {
        projectId: id,
        title: validated.title,
        description: validated.description || null,
        estimatedHours: validated.estimatedHours || null,
        priority: validated.priority || 'medium',
      },
    });

    // Award XP
    await db.user.update({
      where: { id: user.id },
      data: { xp: { increment: 5 } },
    });

    return NextResponse.json(
      {
        success: true,
        task,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[CREATE_TASK]', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}
