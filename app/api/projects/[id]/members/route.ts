import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';

// GET /api/projects/:id/members - Get project team members
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id: projectId } = await params;

    // Verify user has access to project
    const project = await db.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { userId: user.id },
          {
            members: {
              some: {
                userId: user.id,
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

    // Get all members
    const members = await db.projectMember.findMany({
      where: {
        projectId,
        leftAt: null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            email: true,
            xp: true,
            level: true,
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
      orderBy: [
        { role: 'asc' }, // OWNER first, then CO_LEAD, then MEMBER
        { joinedAt: 'asc' },
      ],
    });

    // Add project owner if not in members
    const ownerAsMember = members.some((m) => m.userId === project.userId);
    let allMembers = members;

    if (!ownerAsMember) {
      const owner = await db.user.findUnique({
        where: { id: project.userId },
        select: {
          id: true,
          name: true,
          avatar: true,
          email: true,
          xp: true,
          level: true,
          profile: {
            select: {
              gradeLevel: true,
              favoriteSubjects: true,
              skillsConfidence: true,
            },
          },
        },
      });

      if (owner) {
        allMembers = [
          {
            id: 'owner-placeholder',
            projectId,
            userId: owner.id,
            role: 'OWNER' as const,
            tasksCompleted: 0,
            hoursContributed: 0,
            joinedAt: project.createdAt,
            leftAt: null,
            user: owner,
          },
          ...members,
        ];
      }
    }

    return NextResponse.json({
      success: true,
      members: allMembers,
    });
  } catch (error) {
    console.error('[GET_PROJECT_MEMBERS]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
