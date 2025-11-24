import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

// CSV to JSON parser
function parseCSV(csvText: string): any[] {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());

  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    const obj: any = {};

    headers.forEach((header, index) => {
      obj[header] = values[index] || '';
    });

    return obj;
  });
}

// Map CSV columns to our schema
function mapCSVProject(csvRow: any): any {
  return {
    title: csvRow.title || csvRow.project_title || csvRow.name,
    description: csvRow.description || csvRow.project_description || csvRow.summary,
    category: (csvRow.category || 'CREATIVE').toUpperCase(),
    studentName: csvRow.student_name || csvRow.student || csvRow.author,
    studentEmail: csvRow.email || csvRow.student_email || `${csvRow.student_name?.toLowerCase().replace(/\s+/g, '.')}@imported.edu`,
    completedDate: csvRow.completed_date || csvRow.date || csvRow.completion_date,
    thumbnailUrl: csvRow.thumbnail || csvRow.image || csvRow.photo,
    tags: csvRow.tags ? csvRow.tags.split(';').map((t: string) => t.trim()) : [],
  };
}

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const batchSize = parseInt(formData.get('batchSize') as string) || 100;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Read CSV file
    const csvText = await file.text();
    const csvData = parseCSV(csvText);

    // Map to our format
    const projects = csvData.map(mapCSVProject);

    const results = {
      total: projects.length,
      imported: 0,
      skipped: 0,
      errors: [] as string[],
    };

    // Process in batches
    for (let i = 0; i < projects.length; i += batchSize) {
      const batch = projects.slice(i, i + batchSize);

      for (const projectData of batch) {
        try {
          // Find or create user
          let studentUser = await db.user.findUnique({
            where: { email: projectData.studentEmail },
          });

          if (!studentUser) {
            studentUser = await db.user.create({
              data: {
                email: projectData.studentEmail,
                name: projectData.studentName,
                clerkId: `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                xp: 100,
                level: 1,
                publicProfile: true,
              },
            });
          }

          // Create project
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
            `Row ${i + results.imported + results.skipped}: ${error instanceof Error ? error.message : 'Unknown error'}`
          );

          if (results.errors.length > 50) {
            results.errors = results.errors.slice(0, 50);
            results.errors.push('... (additional errors omitted)');
            break;
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `CSV import completed: ${results.imported} imported, ${results.skipped} skipped`,
      results,
    });
  } catch (error) {
    console.error('CSV Import Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to import CSV',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
