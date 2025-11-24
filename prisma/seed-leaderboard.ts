import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Test users with varying stats for interesting leaderboard
const TEST_USERS = [
  {
    name: 'Alex Chen',
    email: 'alex.chen@test.com',
    clerkId: 'test_alex_chen_001',
    xp: 8500,
    level: 9,
    currentStreak: 45,
    longestStreak: 52,
    projectsCompleted: 12,
  },
  {
    name: 'Sophia Rodriguez',
    email: 'sophia.r@test.com',
    clerkId: 'test_sophia_002',
    xp: 7200,
    level: 8,
    currentStreak: 30,
    longestStreak: 35,
    projectsCompleted: 10,
  },
  {
    name: 'Marcus Johnson',
    email: 'marcus.j@test.com',
    clerkId: 'test_marcus_003',
    xp: 6800,
    level: 7,
    currentStreak: 28,
    longestStreak: 40,
    projectsCompleted: 8,
  },
  {
    name: 'Emma Davis',
    email: 'emma.d@test.com',
    clerkId: 'test_emma_004',
    xp: 5900,
    level: 6,
    currentStreak: 21,
    longestStreak: 25,
    projectsCompleted: 7,
  },
  {
    name: 'Liam Patel',
    email: 'liam.p@test.com',
    clerkId: 'test_liam_005',
    xp: 5400,
    level: 6,
    currentStreak: 15,
    longestStreak: 22,
    projectsCompleted: 6,
  },
  {
    name: 'Olivia Kim',
    email: 'olivia.k@test.com',
    clerkId: 'test_olivia_006',
    xp: 4800,
    level: 5,
    currentStreak: 12,
    longestStreak: 18,
    projectsCompleted: 5,
  },
  {
    name: 'Noah Martinez',
    email: 'noah.m@test.com',
    clerkId: 'test_noah_007',
    xp: 4200,
    level: 5,
    currentStreak: 10,
    longestStreak: 15,
    projectsCompleted: 5,
  },
  {
    name: 'Ava Thompson',
    email: 'ava.t@test.com',
    clerkId: 'test_ava_008',
    xp: 3600,
    level: 4,
    currentStreak: 8,
    longestStreak: 12,
    projectsCompleted: 4,
  },
  {
    name: 'Ethan Wilson',
    email: 'ethan.w@test.com',
    clerkId: 'test_ethan_009',
    xp: 3100,
    level: 4,
    currentStreak: 7,
    longestStreak: 10,
    projectsCompleted: 3,
  },
  {
    name: 'Isabella Garcia',
    email: 'isabella.g@test.com',
    clerkId: 'test_isabella_010',
    xp: 2800,
    level: 3,
    currentStreak: 5,
    longestStreak: 8,
    projectsCompleted: 3,
  },
  {
    name: 'James Lee',
    email: 'james.l@test.com',
    clerkId: 'test_james_011',
    xp: 2400,
    level: 3,
    currentStreak: 4,
    longestStreak: 6,
    projectsCompleted: 2,
  },
  {
    name: 'Mia Anderson',
    email: 'mia.a@test.com',
    clerkId: 'test_mia_012',
    xp: 1900,
    level: 2,
    currentStreak: 3,
    longestStreak: 5,
    projectsCompleted: 2,
  },
  {
    name: 'Benjamin Taylor',
    email: 'ben.t@test.com',
    clerkId: 'test_ben_013',
    xp: 1500,
    level: 2,
    currentStreak: 2,
    longestStreak: 4,
    projectsCompleted: 1,
  },
  {
    name: 'Charlotte Moore',
    email: 'charlotte.m@test.com',
    clerkId: 'test_charlotte_014',
    xp: 1200,
    level: 2,
    currentStreak: 1,
    longestStreak: 3,
    projectsCompleted: 1,
  },
  {
    name: 'Lucas Jackson',
    email: 'lucas.j@test.com',
    clerkId: 'test_lucas_015',
    xp: 800,
    level: 1,
    currentStreak: 1,
    longestStreak: 2,
    projectsCompleted: 1,
  },
];

const PROJECT_TEMPLATES = [
  {
    title: 'Community Garden Initiative',
    description: 'Created a sustainable community garden to promote environmental awareness and provide fresh produce to local families.',
    category: 'SOCIAL_IMPACT' as const,
  },
  {
    title: 'Youth Coding Bootcamp',
    description: 'Organized and taught a free coding bootcamp for middle school students in underserved communities.',
    category: 'TECHNICAL' as const,
  },
  {
    title: 'Mental Health Awareness Campaign',
    description: 'Led a school-wide campaign to reduce stigma around mental health and increase access to resources.',
    category: 'SOCIAL_IMPACT' as const,
  },
  {
    title: 'Sustainable Fashion Startup',
    description: 'Launched an online marketplace for upcycled and eco-friendly clothing made from recycled materials.',
    category: 'ENTREPRENEURIAL' as const,
  },
  {
    title: 'Student Tutoring Platform',
    description: 'Built a web app connecting high-achieving students with peers who need academic support.',
    category: 'TECHNICAL' as const,
  },
  {
    title: 'Climate Change Research Project',
    description: 'Conducted original research on local climate patterns and presented findings at regional science fair.',
    category: 'RESEARCH' as const,
  },
  {
    title: 'Art Therapy for Seniors',
    description: 'Organized weekly art therapy sessions at local senior center to combat isolation and promote creativity.',
    category: 'CREATIVE' as const,
  },
  {
    title: 'STEM Diversity Initiative',
    description: 'Created mentorship program to encourage underrepresented minorities to pursue STEM careers.',
    category: 'LEADERSHIP' as const,
  },
];

async function main() {
  console.log('🌱 Starting leaderboard seed...\n');

  // Create test users and their projects
  for (const userData of TEST_USERS) {
    console.log(`Creating user: ${userData.name}`);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      console.log(`  ⚠️  User already exists, updating stats...`);
      await prisma.user.update({
        where: { email: userData.email },
        data: {
          xp: userData.xp,
          level: userData.level,
          currentStreak: userData.currentStreak,
          longestStreak: userData.longestStreak,
          publicProfile: true, // Make them visible on leaderboard
        },
      });
    } else {
      const user = await prisma.user.create({
        data: {
          name: userData.name,
          email: userData.email,
          clerkId: userData.clerkId,
          xp: userData.xp,
          level: userData.level,
          currentStreak: userData.currentStreak,
          longestStreak: userData.longestStreak,
          publicProfile: true, // Make them visible on leaderboard
        },
      });

      // Create completed projects for this user
      const projectCount = userData.projectsCompleted;
      for (let i = 0; i < projectCount; i++) {
        const template = PROJECT_TEMPLATES[i % PROJECT_TEMPLATES.length];
        await prisma.project.create({
          data: {
            userId: user.id,
            title: template.title,
            description: template.description,
            category: template.category,
            status: 'COMPLETED',
            completedAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000), // Random date in last 90 days
            hoursLogged: Math.floor(Math.random() * 50) + 10,
          },
        });
      }

      console.log(`  ✅ Created with ${projectCount} completed projects`);
    }
  }

  console.log('\n✨ Leaderboard seed completed!\n');
  console.log('📊 Created:');
  console.log(`   - ${TEST_USERS.length} test users`);
  console.log(`   - ${TEST_USERS.reduce((sum, u) => sum + u.projectsCompleted, 0)} completed projects`);
  console.log('\n🏆 Visit /leaderboard to see the rankings!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding leaderboard:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
