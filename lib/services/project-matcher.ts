import { ProjectCategory } from '@prisma/client';

interface UserProfile {
  gradeLevel: number;
  favoriteSubjects: string[];
  currentActivities: string[];
  skillsConfidence: any;
  workStyle: string;
  impactPreference: string;
  challengeLevel: number;
}

interface Project {
  id: string;
  category: ProjectCategory;
  title: string;
  description: string;
}

// Match score calculator
export function calculateMatchScore(
  project: Project,
  userProfile: UserProfile | null
): number {
  if (!userProfile) return 50; // Default score for no profile

  let score = 0;
  let factors = 0;

  // Category matching based on subjects and activities
  const categoryScores = getCategoryScore(project.category, userProfile);
  score += categoryScores;
  factors++;

  // Challenge level matching
  if (userProfile.challengeLevel) {
    // Higher challenge seekers get complex projects
    const complexityScore = getComplexityScore(project, userProfile.challengeLevel);
    score += complexityScore;
    factors++;
  }

  // Work style matching
  if (userProfile.workStyle) {
    const workStyleScore = getWorkStyleScore(project, userProfile.workStyle);
    score += workStyleScore;
    factors++;
  }

  // Impact preference matching
  if (userProfile.impactPreference) {
    const impactScore = getImpactScore(project, userProfile.impactPreference);
    score += impactScore;
    factors++;
  }

  // Average the scores
  return factors > 0 ? Math.round(score / factors) : 50;
}

// Category matching based on user interests
function getCategoryScore(
  category: ProjectCategory,
  profile: UserProfile
): number {
  const categoryMap: Record<string, ProjectCategory[]> = {
    // STEM subjects
    science: ['RESEARCH', 'TECHNICAL'],
    math: ['TECHNICAL', 'RESEARCH'],
    technology: ['TECHNICAL', 'ENTREPRENEURIAL'],
    engineering: ['TECHNICAL', 'RESEARCH'],
    computer_science: ['TECHNICAL'],

    // Arts & Humanities
    art: ['CREATIVE'],
    music: ['CREATIVE'],
    drama: ['CREATIVE', 'LEADERSHIP'],
    english: ['CREATIVE', 'SOCIAL_IMPACT'],
    writing: ['CREATIVE'],

    // Social Sciences
    history: ['RESEARCH', 'SOCIAL_IMPACT'],
    social_studies: ['SOCIAL_IMPACT', 'LEADERSHIP'],
    psychology: ['RESEARCH', 'SOCIAL_IMPACT'],

    // Business & Leadership
    business: ['ENTREPRENEURIAL', 'LEADERSHIP'],
    economics: ['ENTREPRENEURIAL', 'RESEARCH'],
    leadership: ['LEADERSHIP', 'SOCIAL_IMPACT'],

    // Community & Service
    community_service: ['SOCIAL_IMPACT', 'LEADERSHIP'],
    volunteering: ['SOCIAL_IMPACT'],
    activism: ['SOCIAL_IMPACT', 'LEADERSHIP'],
  };

  const subjects = profile.favoriteSubjects.map(s => s.toLowerCase());
  const activities = profile.currentActivities.map(a => a.toLowerCase());
  const combined = [...subjects, ...activities];

  let matchCount = 0;
  let totalChecks = 0;

  for (const interest of combined) {
    const matchingCategories = categoryMap[interest] || [];
    totalChecks++;
    if (matchingCategories.includes(category)) {
      matchCount++;
    }
  }

  return totalChecks > 0 ? (matchCount / totalChecks) * 100 : 50;
}

// Project complexity scoring
function getComplexityScore(project: Project, challengeLevel: number): number {
  // Estimate complexity from description length and keywords
  const complexityKeywords = [
    'research', 'analysis', 'algorithm', 'machine learning',
    'advanced', 'comprehensive', 'systematic', 'framework',
    'multi-', 'integrat', 'collaborat', 'international'
  ];

  const description = project.description.toLowerCase();
  const keywordCount = complexityKeywords.filter(kw =>
    description.includes(kw)
  ).length;

  const estimatedComplexity = Math.min(10, 3 + keywordCount);

  // Match user's challenge preference
  const diff = Math.abs(challengeLevel - estimatedComplexity);
  return Math.max(0, 100 - (diff * 10));
}

// Work style matching
function getWorkStyleScore(project: Project, workStyle: string): number {
  const description = project.description.toLowerCase();
  const title = project.title.toLowerCase();
  const text = description + ' ' + title;

  const scores: Record<string, number> = {
    solo: 0,
    'small-team': 0,
    'large-team': 0,
  };

  // Solo indicators
  if (text.includes('individual') || text.includes('personal') || text.includes('solo')) {
    scores.solo = 90;
  }

  // Team indicators
  if (text.includes('team') || text.includes('group') || text.includes('collaborat')) {
    scores['small-team'] = 80;
    scores['large-team'] = 90;
  }

  // Organization indicators (large team)
  if (text.includes('organization') || text.includes('community') || text.includes('school-wide')) {
    scores['large-team'] = 95;
  }

  return scores[workStyle] || 50;
}

// Impact preference matching
function getImpactScore(project: Project, impactPreference: string): number {
  const description = project.description.toLowerCase();
  const title = project.title.toLowerCase();
  const text = description + ' ' + title;

  const scores: Record<string, number> = {
    friends: 0,
    school: 0,
    community: 0,
    world: 0,
  };

  // Friends/peers level
  if (text.includes('peer') || text.includes('friend') || text.includes('classmate')) {
    scores.friends = 90;
  }

  // School level
  if (text.includes('school') || text.includes('student') || text.includes('campus')) {
    scores.school = 85;
    scores.friends = 70;
  }

  // Community level
  if (text.includes('community') || text.includes('local') || text.includes('neighborhood')) {
    scores.community = 90;
    scores.school = 70;
  }

  // Global/world level
  if (text.includes('global') || text.includes('world') || text.includes('international') ||
      text.includes('climate') || text.includes('environment')) {
    scores.world = 95;
    scores.community = 75;
  }

  return scores[impactPreference] || 50;
}

// Get recommended projects for a user
export function sortProjectsByRelevance<T extends Project>(
  projects: T[],
  userProfile: UserProfile | null
): T[] {
  if (!userProfile) return projects;

  return projects
    .map(project => ({
      project,
      score: calculateMatchScore(project, userProfile),
    }))
    .sort((a, b) => b.score - a.score)
    .map(item => item.project);
}

// Get match percentage for display
export function getMatchPercentage(
  project: Project,
  userProfile: UserProfile | null
): number {
  return calculateMatchScore(project, userProfile);
}
