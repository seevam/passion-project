import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';

// GET /api/discover - Discover projects open for collaboration
export async function GET(req: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);

    const category = searchParams.get('category');
    const teamSize = searchParams.get('teamSize');
    const skills = searchParams.get('skills');

    // Build where clause
    const where: any = {
      openForCollaboration: true,
      archivedAt: null,
      status: {
        in: ['PLANNING', 'IN_PROGRESS'],
      },
      // Exclude projects user owns or is already member of
      AND: [
        { userId: { not: user.id } },
        {
          members: {
            none: {
              userId: user.id,
              leftAt: null,
            },
          },
        },
        // Project still has space
        {
          currentTeamSize: {
            lt: db.project.fields.maxTeamSize,
          },
        },
      ],
    };

    // Apply filters
    if (category) {
      where.category = category;
    }

    if (teamSize) {
      where.idealTeamSize = teamSize;
    }

    if (skills) {
      const skillArray = skills.split(',').map((s) => s.trim());
      where.skillsNeeded = {
        hasSome: skillArray,
      };
    }

    // Get projects
    const projects = await db.project.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            level: true,
          },
        },
        members: {
          where: {
            leftAt: null,
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
        _count: {
          select: {
            tasks: true,
            milestones: true,
          },
        },
      },
      orderBy: [
        { createdAt: 'desc' },
      ],
      take: 50,
    });

    // Get user's profile for match scoring
    const userProfile = await db.userProfile.findUnique({
      where: { userId: user.id },
    });

    // Calculate match scores for each project
    const projectsWithScores = projects.map((project) => {
      let matchScore = 50; // Base score

      if (userProfile) {
        // Category match
        const categoryMatch = userProfile.favoriteSubjects.some((subject: string) =>
          project.category.toLowerCase().includes(subject.toLowerCase())
        );
        if (categoryMatch) matchScore += 20;

        // Work style match
        const workStyleMatch =
          (userProfile.workStyle === 'solo' && project.idealTeamSize === 'SOLO') ||
          (userProfile.workStyle === 'small-team' &&
            (project.idealTeamSize === 'DUO' || project.idealTeamSize === 'SMALL_TEAM')) ||
          (userProfile.workStyle === 'large-team' && project.idealTeamSize === 'LARGE_TEAM');
        if (workStyleMatch) matchScore += 15;

        // Skills match
        if (project.skillsNeeded.length > 0 && userProfile.skillsConfidence) {
          const userSkills = Object.keys(userProfile.skillsConfidence);
          const matchingSkills = project.skillsNeeded.filter((skill) =>
            userSkills.some((userSkill) =>
              userSkill.toLowerCase().includes(skill.toLowerCase())
            )
          );
          matchScore += Math.min(15, matchingSkills.length * 5);
        }
      }

      return {
        ...project,
        matchScore: Math.min(100, matchScore),
      };
    });

    // Sort by match score
    projectsWithScores.sort((a, b) => b.matchScore - a.matchScore);

    return NextResponse.json({
      success: true,
      projects: projectsWithScores,
    });
  } catch (error) {
    console.error('[GET_DISCOVER]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
