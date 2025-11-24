# Data Import Directory

This directory is for storing CSV files used to import bulk project data.

## How to Import Projects

### Step 1: Place Your CSV File

Copy your CSV file to this directory and rename it to `projects.csv`:

```bash
cp "your-file.csv" data/projects.csv
```

Or set a custom path with the `CSV_PATH` environment variable.

### Step 2: Run the Import Script

```bash
npm run import:projects
```

### CSV Format

Your CSV should have columns matching your data structure. The import script supports:

**Your Format (ISEF Projects):**
- `title` - Project title (required)
- `year` - Year of completion
- `country` - Student's country
- `abstract` - Project description
- `award` - Awards received

**Also Supported:**
- `description`, `summary` - Alternative description fields
- `student_name`, `author` - Student name
- `email`, `student_email` - Student email
- `category` - Project category (auto-detected from award if not provided)
- `thumbnail`, `image` - Project image URL
- `tags` - Semicolon-separated tags

### What Happens During Import

1. ✅ Parses CSV file and validates data
2. ✅ Creates student user accounts automatically
3. ✅ Imports projects with `COMPLETED` status
4. ✅ Sets `showcaseInGallery: true` for all projects
5. ✅ Processes in batches of 100 for efficiency
6. ✅ Shows detailed progress and results

### Category Auto-Detection

If no category is provided, the script intelligently detects it from the award field:

- Keywords like "art", "creative", "design" → **CREATIVE**
- Keywords like "tech", "engineering", "computer" → **TECHNICAL**
- Keywords like "social", "community", "impact" → **SOCIAL_IMPACT**
- Keywords like "business", "entrepreneur" → **ENTREPRENEURIAL**
- Keywords like "leader" → **LEADERSHIP**
- Default → **RESEARCH**

### Example Output

```
🚀 Starting project import...

📂 Reading CSV from: data/projects.csv
📊 Found 7000 projects in CSV

📋 CSV columns detected: title, year, country, abstract, award
📝 First project: Advanced Robotics System

⏳ Processing batch 1/70 (100 projects)...
  ✅ Batch 1 complete: 100 total imported, 0 skipped

...

═══════════════════════════════════════════
🎉 Import Complete!
═══════════════════════════════════════════
📊 Total projects: 7000
✅ Successfully imported: 6998
⚠️  Skipped: 2

💡 Next steps:
   1. Visit the Gallery to see imported projects
   2. Personalization will automatically match projects to user profiles
═══════════════════════════════════════════
```

### Troubleshooting

**CSV file not found:**
- Make sure your file is at `data/projects.csv`
- Or set `CSV_PATH=/path/to/your/file.csv npm run import:projects`

**Database errors:**
- Ensure `DATABASE_URL` environment variable is set
- Check database connection and permissions

**Import taking too long:**
- Normal for 7K projects (~2-3 minutes)
- Progress shown every 100 projects

### After Import

Once imported, projects will:
- ✨ Appear in the Gallery
- 🎯 Be matched to users based on their profiles
- 🏆 Show match scores (70%+ get badges)
- 📊 Be filterable by category
- 🔍 Be searchable by title and description

### Security Note

**Important:** The `data/` directory is git-ignored (except this README). Your CSV files will NOT be committed to the repository. This is intentional for security and file size reasons.
