-- ============================================================================
-- ROLLBACK: Remove Team Collaboration System
-- Database: PostgreSQL (Neon)
-- WARNING: This will delete all collaboration data!
-- ============================================================================

-- Step 1: Drop triggers
-- ============================================================================
DROP TRIGGER IF EXISTS update_collaboration_request_updated_at ON "CollaborationRequest";

-- Step 2: Drop tables (cascades will handle foreign keys)
-- ============================================================================
DROP TABLE IF EXISTS "CollaborationRequest" CASCADE;
DROP TABLE IF EXISTS "ProjectMember" CASCADE;

-- Step 3: Remove columns from Task table
-- ============================================================================
ALTER TABLE "Task"
DROP COLUMN IF EXISTS "assignedToId" CASCADE,
DROP COLUMN IF EXISTS "assignedAt";

-- Step 4: Remove columns from Project table
-- ============================================================================
ALTER TABLE "Project"
DROP COLUMN IF EXISTS "idealTeamSize",
DROP COLUMN IF EXISTS "openForCollaboration",
DROP COLUMN IF EXISTS "maxTeamSize",
DROP COLUMN IF EXISTS "currentTeamSize",
DROP COLUMN IF EXISTS "skillsNeeded",
DROP COLUMN IF EXISTS "collaborationDesc";

-- Step 5: Drop enum types
-- ============================================================================
-- Note: Cannot remove values from existing enums, so we drop and recreate NotificationType
-- This is safe because notifications are temporary data

-- Save existing notification types
CREATE TEMP TABLE temp_notifications AS
SELECT * FROM "Notification"
WHERE "type" NOT IN (
    'COLLABORATION_REQUEST',
    'COLLABORATION_ACCEPTED',
    'COLLABORATION_REJECTED',
    'TEAM_MEMBER_JOINED',
    'TASK_ASSIGNED'
);

-- Drop and recreate the Notification table without collaboration types
ALTER TABLE "Notification" DROP CONSTRAINT IF EXISTS "Notification_type_check";
ALTER TABLE "Notification" ALTER COLUMN "type" TYPE TEXT;

DELETE FROM "Notification"
WHERE "type" IN (
    'COLLABORATION_REQUEST',
    'COLLABORATION_ACCEPTED',
    'COLLABORATION_REJECTED',
    'TEAM_MEMBER_JOINED',
    'TASK_ASSIGNED'
);

-- Drop new enum types
DROP TYPE IF EXISTS "ProjectMemberRole" CASCADE;
DROP TYPE IF EXISTS "CollaborationRequestStatus" CASCADE;
DROP TYPE IF EXISTS "TeamSize" CASCADE;

-- ============================================================================
-- ROLLBACK COMPLETE
-- ============================================================================

SELECT 'Rollback completed successfully!' as status;
