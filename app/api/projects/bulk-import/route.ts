import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

interface BulkProjectData {
  title: string;
  description: string;
  category: 'CREATIVE' | 'SOCIAL_IMPACT' | 'ENTREPRENEURIAL' | 'RESEARCH' | 'TECHNICAL' | 'LEADERSHIP';
  studentName: string;
  studentEmail: string;
  completedDate?: string;
  thumbnailUrl?: string;
  tags?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();

    // Admin check - you might want to add a specific admin role check here
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { projects, batchSize = 100 } = body;

    if (!Array.isArray(projects) || projects.length === 0) {
      return NextResponse.json(
        { error: 'Invalid projects array' },
        { status: 400 }
      );
    }

    const results = {
      total: projects.length,
      imported: 0,
      skipped: 0,
      errors: [] as string[],
    };

    // Process in batches to avoid memory issues
    for (let i = 0; i < projects.length; i += batchSize) {
      const batch = projects.slice(i, i + batchSize);

      for (const projectData of batch) {
        try {
          // Find or create user for this student
          let studentUser = await db.user.findUnique({
            where: { email: projectData.studentEmail },
          });

          if (!studentUser) {
            // Create a basic user for the student
            studentUser = await db.user.create({
              data: {
                email: projectData.studentEmail,
                name: projectData.studentName,
                clerkId: `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                xp: 100, // Give them some starter XP
                level: 1,
                publicProfile: true, // Make them visible
              },
            });
          }

          // Create the project
          await db.project.create({
            data: {
              userId: studentUser.id,
              title: projectData.title,
              description: projectData.description,
              category: projectData.category,
              status: 'COMPLETED',
              showcaseInGallery: true,
              completedAt: projectData.completedDate
                ? new Date(projectData.completedDate)
                : new Date(),
              // Add thumbnail as document if provided
              ...(projectData.thumbnailUrl && {
                documents: {
                  create: {
                    type: 'photo',
                    title: 'Project Thumbnail',
                    url: projectData.thumbnailUrl,
                    thumbnailUrl: projectData.thumbnailUrl,
                  },
                },
              }),
            },
          });

          results.imported++;
        } catch (error) {
          results.skipped++;
          results.errors.push(
            `Failed to import project "${projectData.title}": ${error instanceof Error ? error.message : 'Unknown error'}`
          );

          // Only keep the first 100 errors to avoid memory issues
          if (results.errors.length > 100) {
            results.errors = results.errors.slice(0, 100);
            results.errors.push('... (more errors omitted)');
            break;
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Bulk import completed: ${results.imported} imported, ${results.skipped} skipped`,
      results,
    });
  } catch (error) {
    console.error('Bulk Import Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to import projects',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
