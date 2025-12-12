# 🚀 Neon Database Migration Guide

Complete guide for applying the Team Collaboration feature to your Neon PostgreSQL database.

## 📊 Quick Overview

This migration adds:
- ✅ 2 new tables (`ProjectMember`, `CollaborationRequest`)
- ✅ 6 new columns to `Project` table
- ✅ 2 new columns to `Task` table
- ✅ 3 new enum types
- ✅ 5 new notification types
- ✅ Multiple indexes for performance
- ✅ Foreign key constraints

**Safe to run:** Yes! All changes use `IF NOT EXISTS` checks and provide default values.

## 🎯 Choose Your Migration Method

### Option 1: Neon SQL Editor (Easiest) ⭐ Recommended

Perfect if you prefer a visual interface.

#### Steps:

1. **Open Neon Console**
   - Go to https://console.neon.tech
   - Select your project
   - Click "SQL Editor"

2. **Copy & Execute**
   ```bash
   # Open the migration file
   cat migrations/add_team_collaboration.sql
   ```
   - Copy the entire contents
   - Paste into Neon SQL Editor
   - Click "Run" (or Ctrl+Enter)

3. **Verify Success**
   ```bash
   # Copy and run this too
   cat migrations/verify_migration.sql
   ```

**Time required:** ~2 minutes

---

### Option 2: Command Line with psql

Perfect if you're comfortable with the terminal.

#### Prerequisites:
```bash
# Install psql if not already installed
# macOS:
brew install postgresql

# Ubuntu/Debian:
sudo apt-get install postgresql-client

# Windows: Download from postgresql.org
```

#### Steps:

1. **Get Connection String**
   - From Neon dashboard, copy your connection string
   - It looks like: `postgresql://user:password@host.neon.tech/dbname`

2. **Run Migration**
   ```bash
   psql "your_connection_string_here" -f migrations/add_team_collaboration.sql
   ```

3. **Verify**
   ```bash
   psql "your_connection_string_here" -f migrations/verify_migration.sql
   ```

**Time required:** ~1 minute

---

### Option 3: Node.js Script (Most Automated)

Perfect for integrating into your deployment pipeline.

#### Prerequisites:
```bash
# Install pg library if not already installed
npm install pg
```

#### Steps:

1. **Set Environment Variable**
   ```bash
   # In your .env file
   DATABASE_URL="postgresql://user:password@host.neon.tech/dbname"
   ```

2. **Run Migration**
   ```bash
   node scripts/run-migration.js
   ```

3. **Verify**
   ```bash
   node scripts/run-migration.js verify
   ```

**Time required:** ~30 seconds

---

## 📋 Complete Step-by-Step (Option 1 - Recommended)

### Step 1: Backup (Optional but Recommended)

Although this migration is safe, you can create a backup:

1. Go to Neon Console → Your Project
2. Click "Branches"
3. Click "Create Branch" from main
4. Name it "backup-before-collaboration-feature"

### Step 2: Run the Migration

1. **Navigate to SQL Editor**
   - Neon Console → SQL Editor

2. **Open the migration file on your computer**
   ```bash
   # View the file
   cat /home/user/passion-project/migrations/add_team_collaboration.sql
   ```

3. **Copy ALL the content** (it's a long file, make sure you get it all!)

4. **Paste into SQL Editor** and click **"Run"**

5. **Look for success message**:
   ```
   Migration completed successfully!
   ```

### Step 3: Verify the Migration

1. **Still in SQL Editor**, clear it and paste:
   ```bash
   # Copy this file
   cat /home/user/passion-project/migrations/verify_migration.sql
   ```

2. **Click "Run"**

3. **Check results** - you should see multiple tables showing:
   - ✅ New tables exist
   - ✅ New columns added
   - ✅ Enums created
   - ✅ Indexes in place

### Step 4: Update Your App

```bash
# Generate Prisma Client with new schema
npx prisma generate
```

### Step 5: Test It Out! 🎉

1. **Start your app**
   ```bash
   npm run dev
   ```

2. **Create a new project**
   - Go to `/projects/new`
   - You should see 3 steps now (including Team Configuration)

3. **Try collaboration**
   - Mark a project as "Open for Collaboration"
   - Visit `/discover` to see it listed

---

## ✅ Verification Checklist

After migration, verify everything works:

- [ ] App starts without errors
- [ ] Can create new projects
- [ ] See new "Team Configuration" step in project creation
- [ ] Can mark projects as "Open for Collaboration"
- [ ] Can visit `/discover` page
- [ ] Existing projects still work normally
- [ ] Existing tasks still load correctly

---

## 🐛 Troubleshooting

### Issue: "type already exists"

**Solution:** This is normal! The migration is idempotent and safe to re-run.

### Issue: "relation does not exist"

**Solution:** Make sure:
- You're connected to the correct database
- The `Project` and `Task` tables exist
- You've run previous migrations

### Issue: Connection timeout

**Solution:**
- Check your internet connection
- Verify Neon database is running
- Check if your IP needs to be allowlisted in Neon settings

### Issue: Permission denied

**Solution:**
- Verify your database user has CREATE TABLE permissions
- Check connection string has correct credentials

### Issue: App won't start after migration

**Solution:**
```bash
# Regenerate Prisma Client
npx prisma generate

# Clear node_modules if needed
rm -rf node_modules
npm install
```

---

## 🔄 Rolling Back (If Needed)

If you need to undo the migration:

### Using Neon SQL Editor:
1. Open SQL Editor
2. Copy contents of `migrations/rollback_team_collaboration.sql`
3. Paste and run

### Using Command Line:
```bash
psql "your_connection_string" -f migrations/rollback_team_collaboration.sql
```

### Using Node Script:
```bash
node scripts/run-migration.js rollback
```

**⚠️ WARNING:** Rollback will delete all:
- Team members
- Collaboration requests
- Task assignments

---

## 📈 What Changed (Technical Details)

### New Tables:

#### `ProjectMember`
```sql
- id, projectId, userId
- role (OWNER, CO_LEAD, MEMBER)
- tasksCompleted, hoursContributed
- joinedAt, leftAt
```

#### `CollaborationRequest`
```sql
- id, projectId, userId
- status (PENDING, ACCEPTED, REJECTED, CANCELLED)
- message, skills, responseMessage
- createdAt, updatedAt, respondedAt
```

### Updated Tables:

#### `Project` - New Columns:
- `idealTeamSize` (TeamSize enum) - Default: SOLO
- `openForCollaboration` (boolean) - Default: false
- `maxTeamSize` (integer) - Default: 1
- `currentTeamSize` (integer) - Default: 1
- `skillsNeeded` (text array) - Default: []
- `collaborationDesc` (text) - Default: NULL

#### `Task` - New Columns:
- `assignedToId` (text, FK to User) - Default: NULL
- `assignedAt` (timestamp) - Default: NULL

### New Enums:
- `TeamSize`: SOLO, DUO, SMALL_TEAM, LARGE_TEAM
- `CollaborationRequestStatus`: PENDING, ACCEPTED, REJECTED, CANCELLED
- `ProjectMemberRole`: OWNER, CO_LEAD, MEMBER

### New Indexes:
- `Project_openForCollaboration_idx` - Fast collaboration discovery
- `Task_assignedToId_idx` - Fast task assignment queries
- `ProjectMember_projectId_idx` - Fast member lookups
- `ProjectMember_userId_idx` - Fast user project lookups
- `CollaborationRequest_projectId_idx` - Fast request queries
- `CollaborationRequest_userId_idx` - Fast user request lookups
- `CollaborationRequest_status_idx` - Fast status filtering

---

## 📞 Need Help?

If you run into issues:

1. **Check the verification output** - it will tell you what's missing
2. **Review error messages** - they're usually descriptive
3. **Check Neon console logs** - for detailed database errors
4. **Try the rollback** - start fresh if needed

---

## 🎉 Success!

Once migration is complete, you'll have:

✅ Team size selection during project creation
✅ Collaboration discovery system at `/discover`
✅ Team member management
✅ Task assignment capabilities
✅ Collaboration request workflow
✅ Role-based permissions
✅ Contribution tracking

**Next:** Start using the features!

1. Create a project with team size > SOLO
2. Mark it "Open for Collaboration"
3. Add skills you're looking for
4. Other users can discover and request to join
5. Accept requests and assign tasks to team members

---

**Migration Version:** 1.0.0
**Last Updated:** 2025-12-12
**Database:** PostgreSQL (Neon)
**Safe for Production:** ✅ Yes
