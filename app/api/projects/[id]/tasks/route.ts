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

    // Verify project ownership or membership
    const project = await db.project.findFirst({
      where: {
        id,
        OR: [
          { userId: user.id },
          {
            members: {
              some: {
                userId: user.id,
                leftAt: null,
              },
            },
          },
        ],
      },
      include: {
        members: {
          where: { leftAt: null },
          select: { userId: true },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 }
      );
    }

    // Validate input
    const validated = CreateTaskSchema.parse(body);

    // If assigning to someone, verify they are a member
    if (validated.assignedToId) {
      const isMember =
        validated.assignedToId === project.userId ||
        project.members.some((m) => m.userId === validated.assignedToId);

      if (!isMember) {
        return NextResponse.json(
          { error: 'Cannot assign task to non-member' },
          { status: 400 }
        );
      }
    }

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
        assignedToId: validated.assignedToId || null,
        assignedAt: validated.assignedToId ? new Date() : null,
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    // Send notification if assigned to someone
    if (validated.assignedToId && validated.assignedToId !== user.id) {
      await db.notification.create({
        data: {
          userId: validated.assignedToId,
          type: 'TASK_ASSIGNED',
          title: 'New Task Assigned',
          message: `You've been assigned a task in "${project.title}": ${validated.title}`,
          actionUrl: `/projects/${id}`,
          metadata: {
            projectId: id,
            taskId: task.id,
          },
        },
      });
    }

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
