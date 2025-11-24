# Leaderboard Seed Script

This script populates your database with test users and completed projects to make the leaderboard more interesting during development.

## What It Creates

- **15 test users** with varying stats:
  - XP ranging from 800 to 8,500
  - Levels from 1 to 9
  - Current streaks from 1 to 45 days
  - Completed projects from 1 to 12

- **Realistic project data**:
  - Various project categories (Social Impact, Technical, Entrepreneurial, etc.)
  - Completed dates within the last 90 days
  - Different project types with descriptions

## How to Run

```bash
npm run seed:leaderboard
```

## What Happens

1. Creates/updates 15 test users with the `test_*` prefix in their clerkId
2. Sets their `publicProfile` to `true` so they appear on the leaderboard
3. Creates completed projects for each user based on their stats
4. If a user already exists (by email), it updates their stats instead

## Test Users

The script includes diverse names and realistic stats:
- **Alex Chen** - Top performer (8,500 XP, 45-day streak, 12 projects)
- **Sophia Rodriguez** - Second place (7,200 XP, 30-day streak, 10 projects)
- **Marcus Johnson** - Third place (6,800 XP, 28-day streak, 8 projects)
- ... and 12 more users with varying levels

## After Running

Visit `/leaderboard` to see:
- Beautiful podium display with top 3 users
- Full rankings table with all participants
- Your actual user alongside the test users
- Real-time updates every 30 seconds

## Cleanup

To remove test users:

```bash
npx prisma studio
```

Then manually delete users with email addresses ending in `@test.com`.

## Notes

- Test users have `clerkId` starting with `test_` prefix
- All test users are visible on the leaderboard (`publicProfile: true`)
- The script is idempotent - you can run it multiple times safely
- Existing test users will have their stats updated instead of being duplicated
