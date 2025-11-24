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
  // Build description from abstract and award if available
  let description = csvRow.abstract || csvRow.description || csvRow.project_description || csvRow.summary || 'No description provided';

  // Add award info to description if present
  if (csvRow.award) {
    description += `\n\n🏆 Award: ${csvRow.award}`;
  }

  // Add country info if present
  if (csvRow.country) {
    description += `\n📍 Country: ${csvRow.country}`;
  }

  // Generate a unique email based on title if no student email
  const generateEmail = () => {
    const titleSlug = csvRow.title?.toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.+|\.+$/g, '') || 'project';
    const randomId = Math.random().toString(36).substr(2, 6);
    return `${titleSlug}.${randomId}@imported.edu`;
  };

  // Try to determine category from award or default to RESEARCH
  let category = 'RESEARCH';
  if (csvRow.category) {
    category = csvRow.category.toUpperCase();
  } else if (csvRow.award) {
    const awardLower = csvRow.award.toLowerCase();
    if (awardLower.includes('art') || awardLower.includes('creative') || awardLower.includes('design')) {
      category = 'CREATIVE';
    } else if (awardLower.includes('tech') || awardLower.includes('engineering') || awardLower.includes('comput')) {
      category = 'TECHNICAL';
    } else if (awardLower.includes('social') || awardLower.includes('community') || awardLower.includes('impact')) {
      category = 'SOCIAL_IMPACT';
    } else if (awardLower.includes('business') || awardLower.includes('entrepreneur')) {
      category = 'ENTREPRENEURIAL';
    } else if (awardLower.includes('leader')) {
      category = 'LEADERSHIP';
    }
  }

  // Parse year for completed date
  let completedDate: Date | undefined;
  if (csvRow.year) {
    const year = parseInt(csvRow.year);
    if (!isNaN(year) && year > 1900 && year < 2100) {
      completedDate = new Date(year, 5, 1); // Default to June 1st of that year
    }
  }
  if (!completedDate && csvRow.completed_date) {
    completedDate = new Date(csvRow.completed_date);
  }
  if (!completedDate && csvRow.date) {
    completedDate = new Date(csvRow.date);
  }

  return {
    title: csvRow.title || csvRow.project_title || csvRow.name || 'Untitled Project',
    description,
    category,
    studentName: csvRow.student_name || csvRow.student || csvRow.author || 'Anonymous Student',
    studentEmail: csvRow.email || csvRow.student_email || generateEmail(),
    completedDate,
    thumbnailUrl: csvRow.thumbnail || csvRow.image || csvRow.photo,
    tags: csvRow.tags ? csvRow.tags.split(';').map((t: string) => t.trim()) : [],
    country: csvRow.country,
    award: csvRow.award,
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
