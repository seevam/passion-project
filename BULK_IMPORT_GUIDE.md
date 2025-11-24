# Bulk Import Guide - 70K Projects

This guide explains how to import your 70,000 high school student projects into the gallery.

## 📊 Gallery Features

- **Pagination**: Efficiently displays 12 projects per page
- **Search**: Full-text search across titles and descriptions
- **Category Filters**: 6 project categories (Creative, Social Impact, etc.)
- **View Modes**: Grid and list views
- **Stats Dashboard**: Total projects, students, and timeline
- **Responsive Design**: Works on all devices

## 🚀 How to Import Your Projects

### Option 1: API Endpoint (Recommended)

**Step 1: Prepare your data in JSON format**

Your data should be an array of objects with this structure:

```json
{
  "projects": [
    {
      "title": "Community Garden Initiative",
      "description": "Created a sustainable community garden...",
      "category": "SOCIAL_IMPACT",
      "studentName": "Alex Chen",
      "studentEmail": "alex@example.com",
      "completedDate": "2024-05-15",
      "thumbnailUrl": "https://example.com/image.jpg",
      "tags": ["environment", "community"]
    }
  ],
  "batchSize": 100
}
```

**Categories**: `CREATIVE`, `SOCIAL_IMPACT`, `ENTREPRENEURIAL`, `RESEARCH`, `TECHNICAL`, `LEADERSHIP`

**Step 2: Make a POST request**

Using curl:
```bash
curl -X POST https://your-app.com/api/projects/bulk-import \
  -H "Content-Type: application/json" \
  -H "Cookie: your-auth-cookie" \
  -d @projects.json
```

Using JavaScript (in browser console while logged in):
```javascript
const projects = [...]; // Your project array

const response = await fetch('/api/projects/bulk-import', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    projects: projects,
    batchSize: 100  // Process 100 at a time
  }),
});

const result = await response.json();
console.log(result);
```

**Step 3: Monitor the response**

The API will return:
```json
{
  "success": true,
  "message": "Bulk import completed: 69500 imported, 500 skipped",
  "results": {
    "total": 70000,
    "imported": 69500,
    "skipped": 500,
    "errors": ["...list of errors..."]
  }
}
```

### Option 2: Split into Multiple Batches

For 70K projects, split your data into chunks to avoid timeouts:

```javascript
// Split into batches of 1000 projects
const batchSize = 1000;
const allProjects = [...]; // Your 70K projects

for (let i = 0; i < allProjects.length; i += batchSize) {
  const batch = allProjects.slice(i, i + batchSize);

  console.log(`Importing batch ${i/batchSize + 1}...`);

  const response = await fetch('/api/projects/bulk-import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projects: batch, batchSize: 100 }),
  });

  const result = await response.json();
  console.log(`Batch result:`, result);

  // Wait 2 seconds between batches to avoid overwhelming the server
  await new Promise(resolve => setTimeout(resolve, 2000));
}
```

## 📋 Data Format Examples

### Minimal Required Fields:
```json
{
  "title": "Project Title",
  "description": "Project description...",
  "category": "TECHNICAL",
  "studentName": "Student Name",
  "studentEmail": "student@school.edu"
}
```

### Full Example with Optional Fields:
```json
{
  "title": "AI-Powered Study Assistant",
  "description": "Built a machine learning app that helps students organize their study schedules based on learning patterns.",
  "category": "TECHNICAL",
  "studentName": "Sarah Johnson",
  "studentEmail": "sarah.j@highschool.edu",
  "completedDate": "2024-06-01",
  "thumbnailUrl": "https://cdn.example.com/projects/ai-study.jpg",
  "tags": ["AI", "education", "machine-learning"]
}
```

## 🔄 What Happens During Import

1. **User Creation**: For each project, the system:
   - Checks if a user exists with that email
   - If not, creates a new user account
   - Sets `publicProfile: true` so they appear in gallery
   - Assigns starter XP (100) and level (1)

2. **Project Creation**:
   - Creates project with status `COMPLETED`
   - Sets `showcaseInGallery: true`
   - Adds thumbnail as a document if provided
   - Links to the student's user account

3. **Error Handling**:
   - Skips duplicates or invalid data
   - Continues processing even if some fail
   - Returns detailed error report

## 🎯 After Import

Visit `/gallery` to see:
- All imported projects with pagination
- Search and filter functionality
- Category badges and thumbnails
- Student attribution

## 📊 Performance Notes

- **Batch Processing**: Processes 100 projects at a time internally
- **Recommended Batch Size**: Send 500-1000 projects per API call
- **Estimated Time**: ~1-2 seconds per 100 projects
- **For 70K projects**: About 20-30 minutes total with batching

## 🔒 Security

- **Authentication Required**: Must be logged in
- **Admin Access**: Consider adding admin role check in production
- **Rate Limiting**: Add if needed for public deployments

## 🐛 Troubleshooting

**"Unauthorized" Error**:
- Make sure you're logged into the app
- Include authentication cookies in the request

**Timeout Errors**:
- Reduce batch size (try 500 instead of 1000)
- Add delays between batches

**Missing Thumbnails**:
- Ensure URLs are publicly accessible
- Check image URL format

**Category Errors**:
- Use exact category names (case-sensitive)
- Valid: `TECHNICAL`, `CREATIVE`, etc.

## 💡 Tips

1. **Test First**: Import 10-20 projects first to verify format
2. **Backup Data**: Keep original data safe
3. **Monitor Progress**: Log each batch result
4. **Check Gallery**: Verify projects appear correctly
5. **Clean Data**: Remove duplicates before importing

## 📝 Converting from CSV

If you have CSV data, convert to JSON first:

```javascript
// Example CSV to JSON conversion
const csvData = `...`; // Your CSV string
const lines = csvData.split('\n');
const headers = lines[0].split(',');

const projects = lines.slice(1).map(line => {
  const values = line.split(',');
  return {
    title: values[0],
    description: values[1],
    category: values[2],
    studentName: values[3],
    studentEmail: values[4],
  };
});

console.log(JSON.stringify({ projects }, null, 2));
```

## 🎉 You're Ready!

Once imported, all 70K projects will be:
- ✅ Searchable in the gallery
- ✅ Filterable by category
- ✅ Attributed to student creators
- ✅ Visible with thumbnails (if provided)
- ✅ Paginated for performance
