-- ============================================================================
-- MIGRATION: Add Team Collaboration System
-- Database: PostgreSQL (Neon)
-- Safe to run: Yes (includes IF NOT EXISTS checks and default values)
-- ============================================================================

-- Step 1: Add new enum types
-- ============================================================================

-- Add TeamSize enum
DO $$ BEGIN
    CREATE TYPE "TeamSize" AS ENUM ('SOLO', 'DUO', 'SMALL_TEAM', 'LARGE_TEAM');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add CollaborationRequestStatus enum
DO $$ BEGIN
    CREATE TYPE "CollaborationRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add ProjectMemberRole enum
DO $$ BEGIN
    CREATE TYPE "ProjectMemberRole" AS ENUM ('OWNER', 'CO_LEAD', 'MEMBER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add new notification types to existing enum
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'COLLABORATION_REQUEST';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'COLLABORATION_ACCEPTED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'COLLABORATION_REJECTED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'TEAM_MEMBER_JOINED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'TASK_ASSIGNED';

-- Step 2: Add new columns to Project table
-- ============================================================================

-- Add team collaboration fields to Project
ALTER TABLE "Project"
ADD COLUMN IF NOT EXISTS "idealTeamSize" "TeamSize" NOT NULL DEFAULT 'SOLO',
ADD COLUMN IF NOT EXISTS "openForCollaboration" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "maxTeamSize" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS "currentTeamSize" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS "skillsNeeded" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS "collaborationDesc" TEXT;

-- Create index for collaboration discovery
CREATE INDEX IF NOT EXISTS "Project_openForCollaboration_idx" ON "Project"("openForCollaboration");

-- Step 3: Add new columns to Task table
-- ============================================================================

-- Add task assignment fields
ALTER TABLE "Task"
ADD COLUMN IF NOT EXISTS "assignedToId" TEXT,
ADD COLUMN IF NOT EXISTS "assignedAt" TIMESTAMP(3);

-- Add foreign key constraint for assignedTo
DO $$ BEGIN
    ALTER TABLE "Task" ADD CONSTRAINT "Task_assignedToId_fkey"
    FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create index for task assignments
CREATE INDEX IF NOT EXISTS "Task_assignedToId_idx" ON "Task"("assignedToId");

-- Step 4: Create ProjectMember table
-- ============================================================================

CREATE TABLE IF NOT EXISTS "ProjectMember" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "ProjectMemberRole" NOT NULL DEFAULT 'MEMBER',
    "tasksCompleted" INTEGER NOT NULL DEFAULT 0,
    "hoursContributed" INTEGER NOT NULL DEFAULT 0,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),

    CONSTRAINT "ProjectMember_pkey" PRIMARY KEY ("id")
);

-- Add unique constraint for project-user combination
DO $$ BEGIN
    ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_projectId_userId_key"
    UNIQUE ("projectId", "userId");
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add foreign key constraints
DO $$ BEGIN
    ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create indexes for ProjectMember
CREATE INDEX IF NOT EXISTS "ProjectMember_projectId_idx" ON "ProjectMember"("projectId");
CREATE INDEX IF NOT EXISTS "ProjectMember_userId_idx" ON "ProjectMember"("userId");

-- Step 5: Create CollaborationRequest table
-- ============================================================================

CREATE TABLE IF NOT EXISTS "CollaborationRequest" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "CollaborationRequestStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "skills" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "responseMessage" TEXT,
    "respondedAt" TIMESTAMP(3),
    "respondedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CollaborationRequest_pkey" PRIMARY KEY ("id")
);

-- Add unique constraint for project-user combination
DO $$ BEGIN
    ALTER TABLE "CollaborationRequest" ADD CONSTRAINT "CollaborationRequest_projectId_userId_key"
    UNIQUE ("projectId", "userId");
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add foreign key constraints
DO $$ BEGIN
    ALTER TABLE "CollaborationRequest" ADD CONSTRAINT "CollaborationRequest_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "CollaborationRequest" ADD CONSTRAINT "CollaborationRequest_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create indexes for CollaborationRequest
CREATE INDEX IF NOT EXISTS "CollaborationRequest_projectId_idx" ON "CollaborationRequest"("projectId");
CREATE INDEX IF NOT EXISTS "CollaborationRequest_userId_idx" ON "CollaborationRequest"("userId");
CREATE INDEX IF NOT EXISTS "CollaborationRequest_status_idx" ON "CollaborationRequest"("status");

-- Step 6: Create trigger for updating updatedAt
-- ============================================================================

-- Function to update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to CollaborationRequest
DROP TRIGGER IF EXISTS update_collaboration_request_updated_at ON "CollaborationRequest";
CREATE TRIGGER update_collaboration_request_updated_at
    BEFORE UPDATE ON "CollaborationRequest"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Verify the changes
SELECT
    'Migration completed successfully!' as status,
    (SELECT COUNT(*) FROM "ProjectMember") as project_members_count,
    (SELECT COUNT(*) FROM "CollaborationRequest") as collaboration_requests_count,
    (SELECT COUNT(*) FROM "Project" WHERE "openForCollaboration" = true) as open_projects_count;
