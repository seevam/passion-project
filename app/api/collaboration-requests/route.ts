import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const CreateRequestSchema = z.object({
  projectId: z.string().cuid(),
  message: z.string().max(1000).optional(),
  skills: z.array(z.string()).default([]),
});

// POST /api/collaboration-requests - Create a collaboration request
export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const validated = CreateRequestSchema.parse(body);

    // Check if project exists and is open for collaboration
    const project = await db.project.findFirst({
      where: {
        id: validated.projectId,
        openForCollaboration: true,
        archivedAt: null,
      },
      include: {
        members: true,
        collaborationRequests: {
          where: {
            userId: user.id,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found or not open for collaboration' },
        { status: 404 }
      );
    }

    // Check if user is already owner
    if (project.userId === user.id) {
      return NextResponse.json(
        { error: 'You are the owner of this project' },
        { status: 400 }
      );
    }

    // Check if user is already a member
    const isMember = project.members.some((m) => m.userId === user.id);
    if (isMember) {
      return NextResponse.json(
        { error: 'You are already a member of this project' },
        { status: 400 }
      );
    }

    // Check if user already has a pending request
    if (project.collaborationRequests.length > 0) {
      return NextResponse.json(
        { error: 'You already have a pending request for this project' },
        { status: 400 }
      );
    }

    // Check if project has reached max team size
    if (project.currentTeamSize >= project.maxTeamSize) {
      return NextResponse.json(
        { error: 'Project has reached maximum team size' },
        { status: 400 }
      );
    }

    // Create collaboration request
    const request = await db.collaborationRequest.create({
      data: {
        projectId: validated.projectId,
        userId: user.id,
        message: validated.message,
        skills: validated.skills,
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
        project: {
          select: {
            id: true,
            title: true,
            userId: true,
          },
        },
      },
    });

    // Create notification for project owner
    await db.notification.create({
      data: {
        userId: project.userId,
        type: 'COLLABORATION_REQUEST',
        title: 'New Collaboration Request',
        message: `${user.name} wants to join your project "${project.title}"`,
        actionUrl: `/projects/${project.id}?tab=team`,
        metadata: {
          requestId: request.id,
          projectId: project.id,
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        request,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[CREATE_COLLABORATION_REQUEST]', error);
    return NextResponse.json(
      { error: 'Failed to create collaboration request' },
      { status: 500 }
    );
  }
}
