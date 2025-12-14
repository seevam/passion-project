import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { AssignTaskSchema } from '@/lib/validations/project';

// PATCH /api/tasks/:id/assign - Assign or unassign a task
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id: taskId } = await params;
    const body = await req.json();

    const validated = AssignTaskSchema.parse(body);

    // Get the task with project info
    const task = await db.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          include: {
            members: {
              where: { leftAt: null },
              select: { userId: true, role: true },
            },
          },
        },
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Check if user has permission (owner, co-lead, or the assignee)
    const isOwner = task.project.userId === user.id;
    const isCoLead = task.project.members.some(
      (m) => m.userId === user.id && m.role === 'CO_LEAD'
    );
    const isAssignee = task.assignedToId === user.id;

    if (!isOwner && !isCoLead && !isAssignee) {
      return NextResponse.json(
        { error: 'You do not have permission to assign this task' },
        { status: 403 }
      );
    }

    // If assigning to someone, verify they are a member
    if (validated.assignedToId) {
      const isMember =
        validated.assignedToId === task.project.userId ||
        task.project.members.some((m) => m.userId === validated.assignedToId);

      if (!isMember) {
        return NextResponse.json(
          { error: 'Cannot assign task to non-member' },
          { status: 400 }
        );
      }
    }

    // Update task assignment
    const updatedTask = await db.task.update({
      where: { id: taskId },
      data: {
        assignedToId: validated.assignedToId,
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

    // Send notification if assigned to someone new
    if (validated.assignedToId && validated.assignedToId !== user.id) {
      await db.notification.create({
        data: {
          userId: validated.assignedToId,
          type: 'TASK_ASSIGNED',
          title: 'Task Assigned to You',
          message: `You've been assigned "${task.title}" in project "${task.project.title}"`,
          actionUrl: `/projects/${task.projectId}`,
          metadata: {
            projectId: task.projectId,
            taskId: task.id,
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      task: updatedTask,
    });
  } catch (error) {
    console.error('[ASSIGN_TASK]', error);
    return NextResponse.json(
      { error: 'Failed to assign task' },
      { status: 500 }
    );
  }
}
