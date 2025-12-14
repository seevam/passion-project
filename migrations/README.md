# Database Migration: Team Collaboration System

This directory contains SQL migration scripts to add the team collaboration feature to your Neon PostgreSQL database.

## 📋 What's Being Added

- **New Tables:**
  - `ProjectMember` - Track team members and their roles
  - `CollaborationRequest` - Manage join requests

- **New Columns on Existing Tables:**
  - `Project`: `idealTeamSize`, `openForCollaboration`, `maxTeamSize`, `currentTeamSize`, `skillsNeeded`, `collaborationDesc`
  - `Task`: `assignedToId`, `assignedAt`

- **New Enums:**
  - `TeamSize` - SOLO, DUO, SMALL_TEAM, LARGE_TEAM
  - `CollaborationRequestStatus` - PENDING, ACCEPTED, REJECTED, CANCELLED
  - `ProjectMemberRole` - OWNER, CO_LEAD, MEMBER

- **Updated Enums:**
  - `NotificationType` - Added collaboration-related notification types

## 🚀 Running the Migration on Neon

### Option 1: Using Neon SQL Editor (Recommended)

1. **Log into Neon Console:**
   - Go to https://console.neon.tech
   - Select your project

2. **Open SQL Editor:**
   - Click on "SQL Editor" in the left sidebar

3. **Run the Migration:**
   - Copy the entire contents of `add_team_collaboration.sql`
   - Paste it into the SQL Editor
   - Click "Run" or press Ctrl+Enter

4. **Verify Success:**
   - You should see a success message at the bottom
   - The verification query will show the counts of new records

### Option 2: Using psql Command Line

1. **Get your connection string:**
   ```bash
   # From Neon dashboard, copy your connection string
   # It looks like: postgresql://user:password@host/dbname
   ```

2. **Run the migration:**
   ```bash
   psql "your_connection_string_here" -f migrations/add_team_collaboration.sql
   ```

### Option 3: Using Node.js Script

1. **Create a migration runner:**
   ```javascript
   // scripts/run-migration.js
   const { Pool } = require('pg');
   const fs = require('fs');

   const pool = new Pool({
     connectionString: process.env.DATABASE_URL,
     ssl: { rejectUnauthorized: false }
   });

   async function runMigration() {
     const sql = fs.readFileSync('./migrations/add_team_collaboration.sql', 'utf8');
     try {
       await pool.query(sql);
       console.log('✅ Migration completed successfully!');
     } catch (error) {
       console.error('❌ Migration failed:', error);
     } finally {
       await pool.end();
     }
   }

   runMigration();
   ```

2. **Run it:**
   ```bash
   node scripts/run-migration.js
   ```

## ⚠️ Important Notes

### Before Running

- **Backup your database** (though this migration is safe and won't delete data)
- **Test on a development database first** if possible
- The migration uses `IF NOT EXISTS` checks, so it's safe to run multiple times

### After Running

1. **Update Prisma Client:**
   ```bash
   npx prisma generate
   ```

2. **Verify the changes:**
   ```sql
   -- Check new tables exist
   SELECT tablename FROM pg_tables
   WHERE schemaname = 'public'
   AND tablename IN ('ProjectMember', 'CollaborationRequest');

   -- Check new columns on Project
   SELECT column_name, data_type
   FROM information_schema.columns
   WHERE table_name = 'Project'
   AND column_name IN ('idealTeamSize', 'openForCollaboration');
   ```

3. **Optional: Mark existing projects as solo:**
   ```sql
   -- All existing projects will default to SOLO team size
   -- and closed for collaboration (safe defaults)
   -- No action needed, defaults are already set
   ```

## 🔄 Rolling Back

If you need to remove the collaboration features:

```bash
# Using psql
psql "your_connection_string_here" -f migrations/rollback_team_collaboration.sql

# Or use Neon SQL Editor and paste rollback_team_collaboration.sql
```

**⚠️ WARNING:** Rollback will delete all collaboration data (team members and join requests)!

## 🧪 Testing After Migration

1. **Create a test project:**
   - Go to `/projects/new`
   - You should see the new team configuration step

2. **Test collaboration:**
   - Mark a project as open for collaboration
   - Visit `/discover` to see it listed

3. **Verify database:**
   ```sql
   -- Check that indexes were created
   SELECT indexname FROM pg_indexes
   WHERE tablename IN ('ProjectMember', 'CollaborationRequest');

   -- Check enum values
   SELECT unnest(enum_range(NULL::TeamSize));
   SELECT unnest(enum_range(NULL::CollaborationRequestStatus));
   SELECT unnest(enum_range(NULL::ProjectMemberRole));
   ```

## 🐛 Troubleshooting

### Error: "type already exists"
- This is normal if you run the migration multiple times
- The migration script handles this with `IF NOT EXISTS` checks

### Error: "column already exists"
- Same as above - the script is idempotent and safe to re-run

### Error: "relation does not exist"
- Make sure you're running against the correct database
- Check that the `Project` and `Task` tables exist

### Performance Issues
- The migration creates several indexes automatically
- For large databases, the migration might take a few seconds
- All operations are within a single connection, so they're transactional

## 📊 Migration Impact

- **Existing Data:** ✅ No data loss, all existing records preserved
- **Default Values:** ✅ All new columns have safe defaults
- **Performance:** ✅ Indexes created for optimal query performance
- **Backward Compatibility:** ✅ Existing queries will continue to work
- **Downtime:** ✅ Zero downtime - safe to run on production

## 🎯 Next Steps

After successful migration:

1. **Generate Prisma Client:**
   ```bash
   npx prisma generate
   ```

2. **Test the new features:**
   - Create projects with different team sizes
   - Open projects for collaboration
   - Test the discover page at `/discover`

3. **Optional: Seed some test data:**
   ```sql
   -- Mark a test project as open for collaboration
   UPDATE "Project"
   SET "openForCollaboration" = true,
       "idealTeamSize" = 'SMALL_TEAM',
       "maxTeamSize" = 4,
       "skillsNeeded" = ARRAY['Coding', 'Design']
   WHERE id = 'your_test_project_id';
   ```

## 📞 Support

If you encounter any issues:
1. Check the Neon console for detailed error messages
2. Verify your DATABASE_URL is correct
3. Ensure you have write permissions on the database
4. Check that all prerequisite tables (User, Project, Task) exist

---

**Migration Version:** 1.0.0
**Date:** 2025-12-12
**Compatible with:** PostgreSQL 12+, Neon
