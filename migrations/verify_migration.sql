-- ============================================================================
-- VERIFICATION: Check Team Collaboration Migration
-- Run this after executing add_team_collaboration.sql
-- ============================================================================

-- Check 1: Verify new tables exist
-- ============================================================================
SELECT
    'Checking new tables...' as step,
    EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'ProjectMember'
    ) as project_member_exists,
    EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'CollaborationRequest'
    ) as collaboration_request_exists;

-- Check 2: Verify new columns on Project table
-- ============================================================================
SELECT
    'Checking Project table columns...' as step,
    EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_name = 'Project' AND column_name = 'idealTeamSize'
    ) as has_ideal_team_size,
    EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_name = 'Project' AND column_name = 'openForCollaboration'
    ) as has_open_for_collaboration,
    EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_name = 'Project' AND column_name = 'maxTeamSize'
    ) as has_max_team_size,
    EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_name = 'Project' AND column_name = 'currentTeamSize'
    ) as has_current_team_size,
    EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_name = 'Project' AND column_name = 'skillsNeeded'
    ) as has_skills_needed;

-- Check 3: Verify new columns on Task table
-- ============================================================================
SELECT
    'Checking Task table columns...' as step,
    EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_name = 'Task' AND column_name = 'assignedToId'
    ) as has_assigned_to_id,
    EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_name = 'Task' AND column_name = 'assignedAt'
    ) as has_assigned_at;

-- Check 4: Verify new enum types exist
-- ============================================================================
SELECT
    'Checking enum types...' as step,
    EXISTS (
        SELECT FROM pg_type
        WHERE typname = 'TeamSize'
    ) as team_size_exists,
    EXISTS (
        SELECT FROM pg_type
        WHERE typname = 'CollaborationRequestStatus'
    ) as collaboration_status_exists,
    EXISTS (
        SELECT FROM pg_type
        WHERE typname = 'ProjectMemberRole'
    ) as member_role_exists;

-- Check 5: Verify enum values
-- ============================================================================
SELECT 'TeamSize enum values:' as info, unnest(enum_range(NULL::TeamSize))::text as value
UNION ALL
SELECT 'CollaborationRequestStatus enum values:', unnest(enum_range(NULL::CollaborationRequestStatus))::text
UNION ALL
SELECT 'ProjectMemberRole enum values:', unnest(enum_range(NULL::ProjectMemberRole))::text;

-- Check 6: Verify indexes were created
-- ============================================================================
SELECT
    'Checking indexes...' as step,
    COUNT(*) as index_count
FROM pg_indexes
WHERE tablename IN ('ProjectMember', 'CollaborationRequest', 'Project', 'Task')
AND indexname LIKE '%collaboration%' OR indexname LIKE '%member%' OR indexname LIKE '%assigned%';

-- Check 7: List all new indexes
-- ============================================================================
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN ('ProjectMember', 'CollaborationRequest')
   OR (tablename = 'Project' AND indexname LIKE '%collaboration%')
   OR (tablename = 'Task' AND indexname LIKE '%assigned%')
ORDER BY tablename, indexname;

-- Check 8: Verify foreign key constraints
-- ============================================================================
SELECT
    'Checking foreign keys...' as step,
    conname as constraint_name,
    conrelid::regclass as table_name,
    confrelid::regclass as referenced_table
FROM pg_constraint
WHERE contype = 'f'
AND (
    conname LIKE '%ProjectMember%'
    OR conname LIKE '%CollaborationRequest%'
    OR conname LIKE '%Task_assignedToId%'
)
ORDER BY conname;

-- Check 9: Verify default values on existing projects
-- ============================================================================
SELECT
    'Checking default values on existing projects...' as step,
    COUNT(*) as total_projects,
    COUNT(*) FILTER (WHERE "idealTeamSize" = 'SOLO') as solo_projects,
    COUNT(*) FILTER (WHERE "openForCollaboration" = false) as closed_projects,
    COUNT(*) FILTER (WHERE "maxTeamSize" = 1) as projects_with_default_max,
    COUNT(*) FILTER (WHERE "currentTeamSize" = 1) as projects_with_default_current
FROM "Project";

-- Check 10: Test data integrity
-- ============================================================================
SELECT
    'Data integrity check...' as step,
    (SELECT COUNT(*) FROM "Project" WHERE "currentTeamSize" > "maxTeamSize") as invalid_team_sizes,
    (SELECT COUNT(*) FROM "Task" WHERE "assignedToId" IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM "User" WHERE id = "Task"."assignedToId")) as orphaned_assignments;

-- Check 11: Summary
-- ============================================================================
SELECT
    '=== MIGRATION VERIFICATION SUMMARY ===' as summary,
    CASE
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ProjectMember')
         AND EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'CollaborationRequest')
         AND EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'Project' AND column_name = 'idealTeamSize')
         AND EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'Task' AND column_name = 'assignedToId')
         AND EXISTS (SELECT FROM pg_type WHERE typname = 'TeamSize')
        THEN '✅ MIGRATION SUCCESSFUL - All components present'
        ELSE '❌ MIGRATION INCOMPLETE - Please review above checks'
    END as status;

-- Check 12: Ready for use
-- ============================================================================
SELECT
    '=== SYSTEM READY ===' as heading,
    'You can now:' as action_1,
    '  1. Run: npx prisma generate' as action_2,
    '  2. Create projects with team sizes' as action_3,
    '  3. Open projects for collaboration' as action_4,
    '  4. Visit /discover to find projects' as action_5,
    '  5. Send and manage collaboration requests' as action_6;
