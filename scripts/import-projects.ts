import { db } from '../lib/db';
import * as fs from 'fs';
import * as path from 'path';

// CSV Parser
function parseCSV(csvText: string): any[] {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));

  return lines.slice(1).map(line => {
    // Handle quoted fields that may contain commas
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
    completedDate: completedDate || new Date(),
    thumbnailUrl: csvRow.thumbnail || csvRow.image || csvRow.photo,
    tags: csvRow.tags ? csvRow.tags.split(';').map((t: string) => t.trim()) : [],
    country: csvRow.country,
    award: csvRow.award,
  };
}

async function importProjects() {
  try {
    console.log('🚀 Starting project import...\n');

    // Read CSV file
    const csvPath = process.env.CSV_PATH || path.join(__dirname, '../data/projects.csv');
    console.log(`📂 Reading CSV from: ${csvPath}`);

    if (!fs.existsSync(csvPath)) {
      throw new Error(`CSV file not found at: ${csvPath}\nPlease place your CSV file at: data/projects.csv`);
    }

    const csvText = fs.readFileSync(csvPath, 'utf-8');
    const csvData = parseCSV(csvText);

    console.log(`📊 Found ${csvData.length} projects in CSV\n`);

    // Show first row structure
    if (csvData.length > 0) {
      console.log('📋 CSV columns detected:', Object.keys(csvData[0]).join(', '));
      console.log('📝 First project:', csvData[0].title || 'Untitled');
      console.log('');
    }

    const results = {
      total: csvData.length,
      imported: 0,
      skipped: 0,
      errors: [] as string[],
    };

    const batchSize = 100;
    const projects = csvData.map(mapCSVProject);

    // Process in batches
    for (let i = 0; i < projects.length; i += batchSize) {
      const batch = projects.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(projects.length / batchSize);

      console.log(`⏳ Processing batch ${batchNum}/${totalBatches} (${batch.length} projects)...`);

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
          results.errors.push(
            `Row ${i + results.imported + results.skipped + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`
          );

          // Only show first 10 errors
          if (results.errors.length <= 10) {
            console.error(`  ⚠️  Error: ${results.errors[results.errors.length - 1]}`);
          }
        }
      }

      console.log(`  ✅ Batch ${batchNum} complete: ${results.imported} total imported, ${results.skipped} skipped\n`);
    }

    console.log('═══════════════════════════════════════════');
    console.log('🎉 Import Complete!');
    console.log('═══════════════════════════════════════════');
    console.log(`📊 Total projects: ${results.total}`);
    console.log(`✅ Successfully imported: ${results.imported}`);
    console.log(`⚠️  Skipped: ${results.skipped}`);

    if (results.errors.length > 10) {
      console.log(`\n⚠️  Total errors: ${results.errors.length} (showing first 10 above)`);
    }

    console.log('\n💡 Next steps:');
    console.log('   1. Visit the Gallery to see imported projects');
    console.log('   2. Personalization will automatically match projects to user profiles');
    console.log('═══════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Import failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Run import
importProjects();
