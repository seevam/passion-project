import { UserProfile } from '@prisma/client';

export interface SampleIdea {
  title: string;
  description: string;
  category: 'CREATIVE' | 'SOCIAL_IMPACT' | 'ENTREPRENEURIAL' | 'RESEARCH' | 'TECHNICAL' | 'LEADERSHIP';
  keywords: string[]; // For matching with user interests
}

// Expanded pool of sample ideas covering diverse interests
const SAMPLE_IDEAS_POOL: SampleIdea[] = [
  // RESEARCH
  {
    title: 'Local Environmental Impact Study',
    description: 'Research and document the environmental health of your local community, including air quality, water sources, and green spaces.',
    category: 'RESEARCH',
    keywords: ['environment', 'science', 'data', 'sustainability', 'biology', 'ecology'],
  },
  {
    title: 'Historical Archive Digitization Project',
    description: 'Partner with local historical societies to digitize and preserve historical documents, photos, and oral histories.',
    category: 'RESEARCH',
    keywords: ['history', 'preservation', 'technology', 'community', 'documentation'],
  },
  {
    title: 'Youth Mental Health Survey & Analysis',
    description: 'Conduct a comprehensive survey on teen mental health in your school, analyze the data, and present findings to administrators.',
    category: 'RESEARCH',
    keywords: ['psychology', 'health', 'data', 'statistics', 'mental health', 'wellness'],
  },

  // TECHNICAL
  {
    title: 'Mobile App for Student Mental Health',
    description: 'Build a mobile app that provides mental health resources, mood tracking, and peer support for high school students.',
    category: 'TECHNICAL',
    keywords: ['coding', 'app development', 'mental health', 'technology', 'programming'],
  },
  {
    title: 'Open Source Educational Tools',
    description: 'Develop and release open-source software tools that help students learn difficult subjects like math or science.',
    category: 'TECHNICAL',
    keywords: ['coding', 'education', 'open source', 'programming', 'software'],
  },
  {
    title: 'Smart Home Energy Monitor',
    description: 'Build an IoT device that monitors home energy usage and provides recommendations for reducing consumption.',
    category: 'TECHNICAL',
    keywords: ['engineering', 'sustainability', 'iot', 'electronics', 'environment'],
  },
  {
    title: 'AI-Powered Study Assistant',
    description: 'Create an AI chatbot that helps students with homework questions and exam preparation in your strongest subjects.',
    category: 'TECHNICAL',
    keywords: ['ai', 'machine learning', 'education', 'technology', 'programming'],
  },

  // CREATIVE
  {
    title: 'Community Art Installation Project',
    description: 'Create a collaborative public art installation that brings your community together and addresses a social theme.',
    category: 'CREATIVE',
    keywords: ['art', 'community', 'design', 'visual arts', 'collaboration'],
  },
  {
    title: 'Documentary Film on Local Issues',
    description: 'Produce a short documentary highlighting an important issue in your community, from interviews to final edit.',
    category: 'CREATIVE',
    keywords: ['film', 'media', 'storytelling', 'video', 'journalism', 'social issues'],
  },
  {
    title: 'Youth Voice Podcast Series',
    description: 'Launch a podcast series that amplifies teen perspectives on current events, culture, and social issues.',
    category: 'CREATIVE',
    keywords: ['media', 'storytelling', 'audio', 'journalism', 'communication'],
  },
  {
    title: 'Interactive Museum Exhibit Design',
    description: 'Design and build an interactive exhibit for a local museum that makes learning engaging for younger visitors.',
    category: 'CREATIVE',
    keywords: ['design', 'education', 'art', 'technology', 'innovation'],
  },

  // ENTREPRENEURIAL
  {
    title: 'Youth-Led Social Enterprise',
    description: 'Start a small business or social enterprise that solves a local problem while teaching entrepreneurial skills to peers.',
    category: 'ENTREPRENEURIAL',
    keywords: ['business', 'entrepreneurship', 'leadership', 'innovation', 'social impact'],
  },
  {
    title: 'Sustainable Product Line',
    description: 'Design and launch an eco-friendly product (reusable items, upcycled goods) and donate profits to environmental causes.',
    category: 'ENTREPRENEURIAL',
    keywords: ['business', 'sustainability', 'environment', 'design', 'innovation'],
  },
  {
    title: 'Student Services Marketplace',
    description: 'Create a platform connecting students who need help (tutoring, music lessons) with peers who can provide those services.',
    category: 'ENTREPRENEURIAL',
    keywords: ['business', 'technology', 'education', 'platform', 'innovation'],
  },
  {
    title: 'Local Artisan E-Commerce Platform',
    description: 'Build an online marketplace for local artists and craftspeople to sell their work, supporting the creative economy.',
    category: 'ENTREPRENEURIAL',
    keywords: ['business', 'technology', 'art', 'e-commerce', 'community'],
  },

  // SOCIAL_IMPACT
  {
    title: 'Tutoring Program for Underserved Students',
    description: 'Organize and lead a free tutoring program for younger students in subjects you excel at, focusing on underserved communities.',
    category: 'SOCIAL_IMPACT',
    keywords: ['education', 'tutoring', 'community service', 'mentorship', 'equity'],
  },
  {
    title: 'Food Insecurity Awareness Campaign',
    description: 'Launch a campaign to address food insecurity in your area, including food drives, awareness events, and policy advocacy.',
    category: 'SOCIAL_IMPACT',
    keywords: ['social justice', 'community', 'advocacy', 'health', 'equity'],
  },
  {
    title: 'Senior Citizen Technology Training',
    description: 'Teach elderly community members how to use smartphones, video calls, and other technology to stay connected.',
    category: 'SOCIAL_IMPACT',
    keywords: ['technology', 'community service', 'education', 'intergenerational', 'accessibility'],
  },
  {
    title: 'Youth Climate Action Coalition',
    description: 'Organize a youth-led group that advocates for climate action through education, protests, and local policy engagement.',
    category: 'SOCIAL_IMPACT',
    keywords: ['environment', 'activism', 'leadership', 'climate', 'advocacy'],
  },
  {
    title: 'Diversity & Inclusion Initiative',
    description: 'Create programs that promote diversity, equity, and inclusion in your school through workshops, events, and policy recommendations.',
    category: 'SOCIAL_IMPACT',
    keywords: ['social justice', 'leadership', 'education', 'equity', 'community'],
  },

  // LEADERSHIP
  {
    title: 'Student Leadership Summit',
    description: 'Organize a regional summit bringing together student leaders to share ideas, learn skills, and collaborate on initiatives.',
    category: 'LEADERSHIP',
    keywords: ['leadership', 'organization', 'networking', 'education', 'collaboration'],
  },
  {
    title: 'Peer Mentorship Program',
    description: 'Establish a structured mentorship program pairing upperclassmen with freshmen to ease the high school transition.',
    category: 'LEADERSHIP',
    keywords: ['mentorship', 'education', 'leadership', 'community', 'support'],
  },
  {
    title: 'School Policy Reform Initiative',
    description: 'Lead a student-driven effort to analyze and propose improvements to school policies on issues you care about.',
    category: 'LEADERSHIP',
    keywords: ['advocacy', 'leadership', 'policy', 'education', 'change'],
  },
];

export class SampleIdeaSelector {
  selectPersonalizedSamples(profile: UserProfile, count: number = 5): SampleIdea[] {
    const scoredIdeas = SAMPLE_IDEAS_POOL.map(idea => ({
      idea,
      score: this.scoreIdea(idea, profile),
    }));

    // Sort by score (highest first)
    scoredIdeas.sort((a, b) => b.score - a.score);

    // Ensure category diversity - pick top ideas but ensure we have variety
    const selected: SampleIdea[] = [];
    const categoryCounts: Record<string, number> = {};
    const maxPerCategory = Math.ceil(count / 3); // Allow max 2-3 per category for 5 samples

    // First pass: Pick highest scoring ideas with category limits
    for (const { idea } of scoredIdeas) {
      const catCount = categoryCounts[idea.category] || 0;
      if (catCount < maxPerCategory && selected.length < count) {
        selected.push(idea);
        categoryCounts[idea.category] = catCount + 1;
      }
    }

    // Second pass: Fill remaining slots if needed (relax category constraints)
    if (selected.length < count) {
      for (const { idea } of scoredIdeas) {
        if (!selected.includes(idea) && selected.length < count) {
          selected.push(idea);
        }
      }
    }

    return selected;
  }

  private scoreIdea(idea: SampleIdea, profile: UserProfile): number {
    let score = 0;

    // Match keywords with profile data
    const profileText = this.buildProfileText(profile).toLowerCase();
    const keywords = idea.keywords.map(k => k.toLowerCase());

    // Keyword matching (up to 40 points)
    const matchedKeywords = keywords.filter(keyword => profileText.includes(keyword));
    score += matchedKeywords.length * 8;

    // RIASEC alignment (up to 30 points)
    if (profile.riasecScores) {
      const riasecScores = profile.riasecScores as Record<string, number>;

      // Map categories to RIASEC types
      const categoryRiasecMap: Record<string, string[]> = {
        RESEARCH: ['Investigative'],
        TECHNICAL: ['Investigative', 'Realistic'],
        CREATIVE: ['Artistic'],
        ENTREPRENEURIAL: ['Enterprising'],
        SOCIAL_IMPACT: ['Social'],
        LEADERSHIP: ['Enterprising', 'Social'],
      };

      const relevantTypes = categoryRiasecMap[idea.category] || [];
      const riasecScore = relevantTypes.reduce((sum, type) => sum + (riasecScores[type] || 0), 0) / relevantTypes.length;
      score += (riasecScore / 10) * 30; // Normalize to 0-30
    }

    // Impact preference alignment (up to 20 points)
    if (profile.impactPreference) {
      if (idea.category === 'SOCIAL_IMPACT' && profile.impactPreference === 'local_community') {
        score += 20;
      } else if (idea.category === 'RESEARCH' && profile.impactPreference === 'knowledge_contribution') {
        score += 20;
      } else if (idea.category === 'ENTREPRENEURIAL' && profile.impactPreference === 'scalable_solution') {
        score += 20;
      }
    }

    // Work style alignment (up to 10 points)
    if (profile.workStyle) {
      if (profile.workStyle === 'independent' && idea.keywords.includes('self-directed')) {
        score += 10;
      } else if (profile.workStyle === 'collaborative' && idea.keywords.includes('community')) {
        score += 10;
      }
    }

    return score;
  }

  private buildProfileText(profile: UserProfile): string {
    const parts: string[] = [];

    if (Array.isArray(profile.topValues)) {
      parts.push(...profile.topValues);
    }
    if (Array.isArray(profile.problemFocus)) {
      parts.push(...profile.problemFocus);
    }
    if (Array.isArray(profile.currentActivities)) {
      parts.push(...profile.currentActivities);
    }
    if (Array.isArray(profile.favoriteSubjects)) {
      parts.push(...profile.favoriteSubjects);
    }
    if (Array.isArray(profile.careerClusters)) {
      parts.push(...profile.careerClusters);
    }
    if (profile.dreamCareer) {
      parts.push(profile.dreamCareer);
    }

    return parts.join(' ').toLowerCase();
  }
}
