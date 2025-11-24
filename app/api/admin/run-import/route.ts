import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import * as fs from 'fs';
import * as path from 'path';

// Set a longer timeout for this endpoint (5 minutes - max for hobby plan)
export const maxDuration = 300;

// CSV Parser
function parseCSV(csvText: string): any[] {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));

  return lines.slice(1).map(line => {
    const values: string[] = [];
    let currentValue = '';
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        values.push(currentValue.trim().replace(/^"|"$/g, ''));
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    values.push(currentValue.trim().replace(/^"|"$/g, ''));

    const obj: any = {};
    headers.forEach((header, index) => {
      obj[header] = values[index] || '';
    });
    return obj;
  });
}

// Map CSV columns to our schema
function mapCSVProject(csvRow: any): any {
  let description = csvRow.abstract || csvRow.description || 'No description provided';

  if (csvRow.award) {
    description += `\n\n🏆 Award: ${csvRow.award}`;
  }
  if (csvRow.country) {
    description += `\n📍 Country: ${csvRow.country}`;
  }

  const generateEmail = () => {
    const titleSlug = csvRow.title?.toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.+|\.+$/g, '') || 'project';
    const randomId = Math.random().toString(36).substr(2, 6);
    return `${titleSlug}.${randomId}@imported.edu`;
  };

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

  let completedDate: Date | undefined;
  if (csvRow.year) {
    const year = parseInt(csvRow.year);
    if (!isNaN(year) && year > 1900 && year < 2100) {
      completedDate = new Date(year, 5, 1);
    }
  }
  if (!completedDate) completedDate = new Date();

  return {
    title: csvRow.title || 'Untitled Project',
    description,
    category,
    studentName: csvRow.student_name || csvRow.student || csvRow.author || 'Anonymous Student',
    studentEmail: csvRow.email || csvRow.student_email || generateEmail(),
    completedDate,
    country: csvRow.country,
    award: csvRow.award,
  };
}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        // Security: Check for admin token
        const authHeader = request.headers.get('authorization');
        const token = authHeader?.replace('Bearer ', '');
        const adminToken = process.env.ADMIN_IMPORT_TOKEN;

        if (!adminToken) {
          send({ error: 'ADMIN_IMPORT_TOKEN not configured in environment variables' });
          controller.close();
          return;
        }

        if (!token || token !== adminToken) {
          send({ error: 'Unauthorized: Invalid or missing admin token' });
          controller.close();
          return;
        }

        send({ message: '🚀 Starting project import...', type: 'info' });

        // Read CSV file
        const csvPath = path.join(process.cwd(), 'data/projects.csv');
        send({ message: `📂 Reading CSV from: ${csvPath}`, type: 'info' });

        if (!fs.existsSync(csvPath)) {
          send({ error: `CSV file not found at: ${csvPath}`, type: 'error' });
          controller.close();
          return;
        }

        const csvText = fs.readFileSync(csvPath, 'utf-8');
        const csvData = parseCSV(csvText);

        send({ message: `📊 Found ${csvData.length} projects in CSV`, type: 'info' });
        send({ message: `📋 CSV columns: ${Object.keys(csvData[0] || {}).join(', ')}`, type: 'info' });

        const results = {
          total: csvData.length,
          imported: 0,
          skipped: 0,
          errors: [] as string[],
        };

        const batchSize = 100;
        const projects = csvData.map(mapCSVProject);
        const totalBatches = Math.ceil(projects.length / batchSize);

        // Process in batches
        for (let i = 0; i < projects.length; i += batchSize) {
          const batch = projects.slice(i, i + batchSize);
          const batchNum = Math.floor(i / batchSize) + 1;

          send({
            message: `⏳ Processing batch ${batchNum}/${totalBatches} (${batch.length} projects)...`,
            type: 'progress',
            progress: { current: batchNum, total: totalBatches }
          });

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
                  completedAt: projectData.completedDate,
                },
              });

              results.imported++;
            } catch (error) {
              results.skipped++;
              const errorMsg = error instanceof Error ? error.message : 'Unknown error';
              results.errors.push(`Row ${i + results.imported + results.skipped + 1}: ${errorMsg}`);
            }
          }

          send({
            message: `✅ Batch ${batchNum} complete: ${results.imported} total imported, ${results.skipped} skipped`,
            type: 'progress',
            stats: { imported: results.imported, skipped: results.skipped }
          });
        }

        // Send final results
        send({
          message: '🎉 Import Complete!',
          type: 'complete',
          results: {
            total: results.total,
            imported: results.imported,
            skipped: results.skipped,
            errorCount: results.errors.length,
            errors: results.errors.slice(0, 10) // Only send first 10 errors
          }
        });

        controller.close();
      } catch (error) {
        send({
          error: error instanceof Error ? error.message : 'Unknown error',
          type: 'error'
        });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
