import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

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
    const sortBy = searchParams.get('sortBy') || 'recent'; // recent, popular, oldest

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
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Build orderBy clause
    let orderBy: any = { createdAt: 'desc' };
    if (sortBy === 'oldest') {
      orderBy = { createdAt: 'asc' };
    } else if (sortBy === 'popular') {
      // TODO: Add view/like count when implemented
      orderBy = { createdAt: 'desc' };
    }

    // Get total count for pagination
    const totalCount = await db.project.count({ where });

    // Get paginated projects
    const projects = await db.project.findMany({
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
      skip: (page - 1) * limit,
      take: limit,
    });

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
    }));

    return NextResponse.json({
      success: true,
      projects: transformedProjects,
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
