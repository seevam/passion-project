import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { sortProjectsByRelevance, getMatchPercentage } from '@/lib/services/project-matcher';

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'recommended';
    const showAll = searchParams.get('showAll') === 'true';

    // Get current user profile for personalization
    const dbUser = await db.user.findUnique({
      where: { clerkId: user.id },
      include: {
        profile: true,
      },
    });

    const userProfile = dbUser?.profile;

    // Build where clause
    const where: any = {
      showcaseInGallery: true,
      status: 'COMPLETED',
    };

    if (category && category !== 'all') {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    // For personalized view, limit to preferred categories
    if (!showAll && userProfile && sortBy === 'recommended') {
      const preferredCategories = getPreferredCategories(userProfile);
      if (preferredCategories.length > 0 && !category) {
        where.category = { in: preferredCategories };
      }
    }

    // Get total count
    const totalCount = await db.project.count({ where });

    // Fetch more projects for sorting by relevance
    const fetchLimit = sortBy === 'recommended' ? limit * 3 : limit;

    // Build orderBy clause
    let orderBy: any = { createdAt: 'desc' };
    if (sortBy === 'oldest') {
      orderBy = { createdAt: 'asc' };
    }

    // Get projects
    let projects = await db.project.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        documents: {
          where: {
            type: 'photo',
          },
          select: {
            url: true,
            thumbnailUrl: true,
          },
          take: 1,
        },
      },
      orderBy,
      skip: sortBy === 'recommended' ? 0 : (page - 1) * limit,
      take: fetchLimit,
    });

    // Sort by relevance if recommended
    if (sortBy === 'recommended' && userProfile) {
      projects = sortProjectsByRelevance(projects, userProfile);
      projects = projects.slice((page - 1) * limit, page * limit);
    }

    // Transform data for frontend
    const transformedProjects = projects.map((project) => ({
      id: project.id,
      title: project.title,
      description: project.description,
      category: project.category,
      thumbnail: project.documents[0]?.thumbnailUrl || project.documents[0]?.url || null,
      author: {
        id: project.user.id,
        name: project.user.name,
        avatar: project.user.avatar,
      },
      completedAt: project.completedAt,
      createdAt: project.createdAt,
      matchScore: userProfile ? getMatchPercentage(project, userProfile) : null,
    }));

    return NextResponse.json({
      success: true,
      projects: transformedProjects,
      isPersonalized: sortBy === 'recommended' && !!userProfile,
      hasProfile: !!userProfile,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Gallery API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gallery' },
      { status: 500 }
    );
  }
}

function getPreferredCategories(profile: any): string[] {
  const categories: string[] = [];
  const subjects = profile.favoriteSubjects || [];
  const activities = profile.currentActivities || [];
  const all = [...subjects, ...activities].map((s: string) => s.toLowerCase());

  if (all.some((s: string) => ['science', 'math', 'technology', 'engineering', 'computer'].some(kw => s.includes(kw)))) {
    categories.push('TECHNICAL', 'RESEARCH');
  }

  if (all.some((s: string) => ['art', 'music', 'drama', 'creative', 'design'].some(kw => s.includes(kw)))) {
    categories.push('CREATIVE');
  }

  if (all.some((s: string) => ['business', 'economics', 'entrepreneur', 'startup'].some(kw => s.includes(kw)))) {
    categories.push('ENTREPRENEURIAL');
  }

  if (all.some((s: string) => ['social', 'community', 'volunteer', 'service', 'activism'].some(kw => s.includes(kw)))) {
    categories.push('SOCIAL_IMPACT');
  }

  if (all.some((s: string) => ['leadership', 'president', 'captain', 'mentor'].some(kw => s.includes(kw)))) {
    categories.push('LEADERSHIP');
  }

  return categories.length > 0 ? categories : ['CREATIVE', 'SOCIAL_IMPACT', 'ENTREPRENEURIAL', 'RESEARCH', 'TECHNICAL', 'LEADERSHIP'];
}
