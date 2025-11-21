import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { CreateProjectSchema } from '@/lib/validations/project';

// GET /api/projects - List user's projects
export async function GET() {
  try {
    const user = await requireAuth();

    const projects = await db.project.findMany({
      where: {
        userId: user.id,
        archivedAt: null,
      },
      include: {
        milestones: {
          orderBy: { orderIndex: 'asc' },
        },
        tasks: {
          where: { completed: false },
          take: 5,
        },
        _count: {
          select: {
            checkIns: true,
            documents: true,
            milestones: true,
            tasks: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      projects,
    });
  } catch (error) {
    console.error('[GET_PROJECTS]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create new project
export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    // Validate input
    const validated = CreateProjectSchema.parse(body);

    // If creating from idea, fetch the idea
    let ideaData = null;
    if (validated.ideaSourceId) {
      const idea = await db.projectIdea.findFirst({
        where: {
          id: validated.ideaSourceId,
          userId: user.id,
        },
      });

      if (idea) {
        ideaData = idea;
        // Update idea status to 'started'
        await db.projectIdea.update({
          where: { id: idea.id },
          data: { status: 'started', selectedAt: new Date() },
        });
      }
    }

    // Create project
    const project = await db.project.create({
      data: {
        userId: user.id,
        title: validated.title,
        description: validated.description,
        category: validated.category,
        status: 'PLANNING',
        ideaSourceId: validated.ideaSourceId || null,
        feasibilityScore: ideaData?.feasibilityScore || null,
        matchingPercent: ideaData?.matchingPercent || null,
      },
      include: {
        milestones: true,
        tasks: true,
      },
    });

    // Award XP for creating a project
    await db.user.update({
      where: { id: user.id },
      data: {
        xp: { increment: 50 }, // 50 XP for creating a project
      },
    });

    return NextResponse.json(
      {
        success: true,
        project,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[CREATE_PROJECT]', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
