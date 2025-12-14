import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const UpdateRequestSchema = z.object({
  action: z.enum(['accept', 'reject', 'cancel']),
  responseMessage: z.string().max(500).optional(),
});

// PATCH /api/collaboration-requests/:id - Accept, reject, or cancel a request
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id: requestId } = await params;
    const body = await req.json();

    const validated = UpdateRequestSchema.parse(body);

    // Get the request
    const request = await db.collaborationRequest.findUnique({
      where: { id: requestId },
      include: {
        project: {
          include: {
            members: true,
          },
        },
        user: true,
      },
    });

    if (!request) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    // Check permissions
    const isOwner = request.project.userId === user.id;
    const isRequester = request.userId === user.id;
    const isCoLead = request.project.members.some(
      (m) => m.userId === user.id && m.role === 'CO_LEAD'
    );

    if (validated.action === 'cancel') {
      // Only requester can cancel
      if (!isRequester) {
        return NextResponse.json(
          { error: 'Only the requester can cancel' },
          { status: 403 }
        );
      }
    } else {
      // Only owner or co-lead can accept/reject
      if (!isOwner && !isCoLead) {
        return NextResponse.json(
          { error: 'Only project owner or co-lead can accept/reject requests' },
          { status: 403 }
        );
      }
    }

    // Check if request is still pending
    if (request.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Request has already been processed' },
        { status: 400 }
      );
    }

    // Handle the action
    if (validated.action === 'accept') {
      // Check if project has space
      if (request.project.currentTeamSize >= request.project.maxTeamSize) {
        return NextResponse.json(
          { error: 'Project has reached maximum team size' },
          { status: 400 }
        );
      }

      // Accept the request in a transaction
      await db.$transaction(async (tx) => {
        // Update request status
        await tx.collaborationRequest.update({
          where: { id: requestId },
          data: {
            status: 'ACCEPTED',
            responseMessage: validated.responseMessage,
            respondedAt: new Date(),
            respondedBy: user.id,
          },
        });

        // Add user as project member
        await tx.projectMember.create({
          data: {
            projectId: request.projectId,
            userId: request.userId,
            role: 'MEMBER',
          },
        });

        // Update project team size
        await tx.project.update({
          where: { id: request.projectId },
          data: {
            currentTeamSize: { increment: 1 },
          },
        });

        // Create notification for requester
        await tx.notification.create({
          data: {
            userId: request.userId,
            type: 'COLLABORATION_ACCEPTED',
            title: 'Collaboration Request Accepted!',
            message: `Your request to join "${request.project.title}" has been accepted`,
            actionUrl: `/projects/${request.projectId}`,
            metadata: {
              projectId: request.projectId,
            },
          },
        });

        // Award XP for joining a project
        await tx.user.update({
          where: { id: request.userId },
          data: {
            xp: { increment: 30 },
          },
        });
      });
    } else if (validated.action === 'reject') {
      // Reject the request
      await db.$transaction(async (tx) => {
        await tx.collaborationRequest.update({
          where: { id: requestId },
          data: {
            status: 'REJECTED',
            responseMessage: validated.responseMessage,
            respondedAt: new Date(),
            respondedBy: user.id,
          },
        });

        // Create notification for requester
        await tx.notification.create({
          data: {
            userId: request.userId,
            type: 'COLLABORATION_REJECTED',
            title: 'Collaboration Request Not Accepted',
            message: `Your request to join "${request.project.title}" was not accepted`,
            actionUrl: `/discover`,
            metadata: {
              projectId: request.projectId,
            },
          },
        });
      });
    } else if (validated.action === 'cancel') {
      // Cancel the request
      await db.collaborationRequest.update({
        where: { id: requestId },
        data: {
          status: 'CANCELLED',
        },
      });
    }

    // Get updated request
    const updatedRequest = await db.collaborationRequest.findUnique({
      where: { id: requestId },
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

    return NextResponse.json({
      success: true,
      request: updatedRequest,
    });
  } catch (error) {
    console.error('[UPDATE_COLLABORATION_REQUEST]', error);
    return NextResponse.json(
      { error: 'Failed to update request' },
      { status: 500 }
    );
  }
}

// DELETE /api/collaboration-requests/:id - Delete a request (alternative to cancel)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id: requestId } = await params;

    const request = await db.collaborationRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    // Only requester can delete
    if (request.userId !== user.id) {
      return NextResponse.json(
        { error: 'Only the requester can delete' },
        { status: 403 }
      );
    }

    await db.collaborationRequest.delete({
      where: { id: requestId },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('[DELETE_COLLABORATION_REQUEST]', error);
    return NextResponse.json(
      { error: 'Failed to delete request' },
      { status: 500 }
    );
  }
}
