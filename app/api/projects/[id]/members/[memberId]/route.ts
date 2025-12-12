import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const UpdateMemberSchema = z.object({
  role: z.enum(['MEMBER', 'CO_LEAD']),
});

// PATCH /api/projects/:id/members/:memberId - Update member role
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const user = await requireAuth();
    const { id: projectId, memberId } = await params;
    const body = await req.json();

    const validated = UpdateMemberSchema.parse(body);

    // Verify user is project owner
    const project = await db.project.findFirst({
      where: {
        id: projectId,
        userId: user.id,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found or you are not the owner' },
        { status: 404 }
      );
    }

    // Update member role
    const member = await db.projectMember.update({
      where: {
        id: memberId,
        projectId,
      },
      data: {
        role: validated.role,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            email: true,
          },
        },
      },
    });

    // Create notification
    await db.notification.create({
      data: {
        userId: member.userId,
        type: 'PROJECT_UPDATE',
        title: 'Role Updated',
        message: `Your role in "${project.title}" has been updated to ${validated.role.replace('_', ' ')}`,
        actionUrl: `/projects/${projectId}`,
        metadata: {
          projectId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      member,
    });
  } catch (error) {
    console.error('[UPDATE_MEMBER]', error);
    return NextResponse.json(
      { error: 'Failed to update member' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/:id/members/:memberId - Remove member from project
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const user = await requireAuth();
    const { id: projectId, memberId } = await params;

    // Get the member
    const member = await db.projectMember.findUnique({
      where: {
        id: memberId,
        projectId,
      },
      include: {
        project: true,
      },
    });

    if (!member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    // Check permissions: owner can remove anyone, member can remove themselves
    const isOwner = member.project.userId === user.id;
    const isSelf = member.userId === user.id;

    if (!isOwner && !isSelf) {
      return NextResponse.json(
        { error: 'You do not have permission to remove this member' },
        { status: 403 }
      );
    }

    // Remove member in a transaction
    await db.$transaction(async (tx) => {
      // Mark member as left (soft delete)
      await tx.projectMember.update({
        where: { id: memberId },
        data: {
          leftAt: new Date(),
        },
      });

      // Update project team size
      await tx.project.update({
        where: { id: projectId },
        data: {
          currentTeamSize: { decrement: 1 },
        },
      });

      // Unassign any tasks assigned to this member
      await tx.task.updateMany({
        where: {
          projectId,
          assignedToId: member.userId,
          completed: false,
        },
        data: {
          assignedToId: null,
          assignedAt: null,
        },
      });

      // Create notification if removed by owner
      if (isOwner && !isSelf) {
        await tx.notification.create({
          data: {
            userId: member.userId,
            type: 'PROJECT_UPDATE',
            title: 'Removed from Project',
            message: `You have been removed from "${member.project.title}"`,
            metadata: {
              projectId,
            },
          },
        });
      }
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('[DELETE_MEMBER]', error);
    return NextResponse.json(
      { error: 'Failed to remove member' },
      { status: 500 }
    );
  }
}
