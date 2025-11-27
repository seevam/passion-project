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

    // Get the current max orderIndex for tasks in this project
    const maxOrderTask = await db.task.findFirst({
      where: { projectId: id },
      orderBy: { orderIndex: 'desc' },
      select: { orderIndex: true },
    });
    const nextOrderIndex = (maxOrderTask?.orderIndex ?? 0) + 1;

    // Create task
    const task = await db.task.create({
      data: {
        projectId: id,
        title: validated.title,
        description: validated.description || null,
        estimatedHours: validated.estimatedHours || null,
        priority: validated.priority || 'medium',
        orderIndex: nextOrderIndex,
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
