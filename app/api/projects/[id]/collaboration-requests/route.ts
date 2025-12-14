import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';

// GET /api/projects/:id/collaboration-requests - Get collaboration requests for a project
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id: projectId } = await params;

    // Verify user is project owner or member
    const project = await db.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { userId: user.id },
          {
            members: {
              some: {
                userId: user.id,
                role: { in: ['OWNER', 'CO_LEAD'] },
              },
            },
          },
        ],
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 }
      );
    }

    // Get all pending requests
    const requests = await db.collaborationRequest.findMany({
      where: {
        projectId,
        status: 'PENDING',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            email: true,
            profile: {
              select: {
                gradeLevel: true,
                favoriteSubjects: true,
                skillsConfidence: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      requests,
    });
  } catch (error) {
    console.error('[GET_COLLABORATION_REQUESTS]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
