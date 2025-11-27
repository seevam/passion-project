import { openai } from './index';
import { UserProfile } from '@prisma/client';

export interface GeneratedIdea {
  id: string;
  title: string;
  description: string;
  category: 'CREATIVE' | 'SOCIAL_IMPACT' | 'ENTREPRENEURIAL' | 'RESEARCH' | 'TECHNICAL' | 'LEADERSHIP';
  feasibilityScore: number;
  matchingPercent: number;
  timeEstimate: string;
  uniqueness: 'HIGH' | 'MEDIUM' | 'LOW';
  impactMetrics: string[];
}

export class IdeaGenerator {
  async generateIdeas(profile: UserProfile, ratings?: Record<number, number>): Promise<GeneratedIdea[]> {
    const prompt = this.buildPrompt(profile, ratings);

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt(),
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.9,
        max_tokens: 3000,
        response_format: { type: 'json_object' },
      });

      const responseText = completion.choices[0].message.content;
      if (!responseText) throw new Error('No response from AI');

      const parsed = JSON.parse(responseText);
      return this.validateAndEnhance(parsed.ideas || [], profile);
    } catch (error) {
      console.error('Error generating ideas:', error);
      throw error;
    }
  }

  private getSystemPrompt(): string {
    return `You are an expert career counselor and project advisor for high school students with expertise in developmental psychology and interest development theory.

Your role:
- Generate creative, feasible passion project ideas based on validated psychological assessments
- Use Self-Determination Theory, Grit Research, Growth Mindset, and RIASEC career interests
- Ensure projects are achievable for students aged 14-18
- Prioritize intrinsic motivation, flow states, and sustainable passion development
- Consider student's time constraints, skills, and psychological profile

Output requirements:
- Return valid JSON only
- Generate 8-10 diverse ideas
- Include detailed feasibility analysis
- Provide specific, measurable impact metrics
- Consider autonomy, competence, and relatedness needs (SDT)
- Match projects to RIASEC career interest profiles
- Align with student's growth mindset and challenge-seeking behavior

CRITICAL: Projects must be:
✓ Achievable within 3-6 months
✓ Aligned with student interests and intrinsic motivation
✓ Support harmonious passion development (not obsessive)
✓ Meaningful and impactful
✓ Unique (not generic volunteering)
✓ Specific and concrete
✓ Build perseverance and grit`;
  }

  private buildPrompt(profile: UserProfile, ratings?: Record<number, number>): string {
    const topValues = Array.isArray(profile.topValues) ? profile.topValues.join(', ') : '';
    const problemFocus = Array.isArray(profile.problemFocus) ? profile.problemFocus.join(', ') : '';
    const currentActivities = Array.isArray(profile.currentActivities) ? profile.currentActivities.join(', ') : '';
    const favoriteSubjects = Array.isArray(profile.favoriteSubjects) ? profile.favoriteSubjects.join(', ') : '';
    const careerClusters = Array.isArray(profile.careerClusters) ? profile.careerClusters.join(', ') : '';

    const sampleIdeas = [
      { title: 'Local Environmental Impact Study', category: 'RESEARCH' },
      { title: 'Mobile App for Student Mental Health', category: 'TECHNICAL' },
      { title: 'Community Art Installation Project', category: 'CREATIVE' },
      { title: 'Youth-Led Social Enterprise', category: 'ENTREPRENEURIAL' },
      { title: 'Tutoring Program for Underserved Students', category: 'SOCIAL_IMPACT' },
    ];

    let ratingsSection = '';
    if (ratings && Object.keys(ratings).length > 0) {
      ratingsSection = `\n\nUSER PREFERENCES FROM SAMPLE IDEAS (1-10 scale):
The student rated their interest in sample project ideas:
${Object.entries(ratings).map(([index, rating]) =>
  `- "${sampleIdeas[parseInt(index)].title}" (${sampleIdeas[parseInt(index)].category}): ${rating}/10`
).join('\n')}

Use these ratings to understand their preferences:
- Higher rated ideas (7-10): Generate more ideas similar to these
- Medium rated ideas (4-6): Consider these as backup inspiration
- Lower rated ideas (1-3): Avoid similar concepts

Pay special attention to:
- Which categories they rated highly
- The types of projects that excited them most
- The balance between technical, creative, research, and social impact work`;
    }

    return `Generate 8 personalized project ideas for this high school student:

STUDENT PROFILE:
- Grade: ${profile.gradeLevel}
- Time Available: ${profile.timeCommitment} hours/week
- Challenge Level: ${profile.challengeLevel}/10
- Work Style: ${profile.workStyle}
- Impact Focus: ${profile.impactPreference}

TOP VALUES: ${topValues}
PROBLEM AREAS: ${problemFocus}
CURRENT ACTIVITIES: ${currentActivities}
FAVORITE SUBJECTS: ${favoriteSubjects}

${profile.dreamCareer ? `CAREER ASPIRATION: ${profile.dreamCareer}` : ''}

STRENGTHS (Skills Radar):
${JSON.stringify(profile.strengthsRadar, null, 2)}

INTRINSIC MOTIVATION (Self-Determination Theory):
${profile.autonomyScore ? `- Autonomy (self-direction): ${profile.autonomyScore}/10` : ''}
${profile.competenceScore ? `- Competence (confidence): ${profile.competenceScore}/10` : ''}
${profile.relatednessScore ? `- Relatedness (social connection): ${profile.relatednessScore}/10` : ''}

PASSION & PERSISTENCE:
${profile.passionType ? `- Passion Type: ${profile.passionType}` : ''}
${profile.flowFrequency ? `- Flow State Frequency: ${profile.flowFrequency}/10` : ''}
${profile.gritScore ? `- Grit Score: ${profile.gritScore}/10` : ''}
${profile.perseveranceScore ? `- Perseverance: ${profile.perseveranceScore}/10` : ''}

GROWTH MINDSET:
${profile.growthMindsetScore ? `- Growth Mindset: ${profile.growthMindsetScore}/10` : ''}
${profile.challengeResponse ? `- Challenge Response: ${profile.challengeResponse}` : ''}

CAREER INTERESTS (RIASEC):
${profile.riasecScores ? JSON.stringify(profile.riasecScores, null, 2) : ''}
${careerClusters ? `Career Clusters: ${careerClusters}` : ''}

Generate ideas that:
1. Match their interests, values, and RIASEC career profile
2. Address problems they care about
3. Are realistic for their time commitment
4. Build on their existing skills while stretching them appropriately for their challenge level
5. Support their intrinsic motivation (autonomy, competence, relatedness)
6. Align with their passion type and flow preferences
7. Build perseverance and grit through meaningful challenges
8. Support their growth mindset (embrace challenges vs. avoid)
9. Are unique and memorable
10. Can be completed in 3-6 months
11. Have measurable impact

IMPORTANT CONSIDERATIONS:
- High autonomy scores → suggest self-directed, independent projects
- High relatedness scores → emphasize collaborative and community-focused projects
- High grit/perseverance → suggest more ambitious, longer-term projects
- Growth mindset (embrace challenges) → include stretch goals and learning opportunities
- Harmonious passion type → balanced, sustainable project structures
- RIASEC scores → align with career interest types (Realistic, Investigative, Artistic, Social, Enterprising, Conventional)

Return in this JSON format:
{
  "ideas": [
    {
      "id": "idea_1",
      "title": "Concise project title",
      "description": "2-3 sentences explaining the project and its impact",
      "category": "ONE OF: CREATIVE, SOCIAL_IMPACT, ENTREPRENEURIAL, RESEARCH, TECHNICAL, LEADERSHIP",
      "feasibilityScore": 85,
      "matchingPercent": 92,
      "timeEstimate": "4-6 months",
      "uniqueness": "HIGH, MEDIUM, or LOW",
      "impactMetrics": ["Specific metric 1", "Specific metric 2", "Specific metric 3"]
    }
  ]
}

IMPORTANT: category must be EXACTLY ONE of these values: CREATIVE, SOCIAL_IMPACT, ENTREPRENEURIAL, RESEARCH, TECHNICAL, LEADERSHIP
Do not combine multiple categories - choose the most fitting single category.${ratingsSection}`;
  }

  private validateAndEnhance(
    ideas: any[],
    profile: UserProfile
  ): GeneratedIdea[] {
    const validCategories = ['CREATIVE', 'SOCIAL_IMPACT', 'ENTREPRENEURIAL', 'RESEARCH', 'TECHNICAL', 'LEADERSHIP'];

    return ideas
      .map((idea, index) => {
        // Parse category - handle cases where AI returns multiple categories separated by |
        let category = idea.category || 'SOCIAL_IMPACT';
        if (typeof category === 'string' && category.includes('|')) {
          // Take the first valid category
          const categories = category.split('|').map(c => c.trim());
          category = categories.find(c => validCategories.includes(c)) || 'SOCIAL_IMPACT';
        }
        // Ensure category is valid
        if (!validCategories.includes(category)) {
          category = 'SOCIAL_IMPACT';
        }

        return {
          id: idea.id || `idea_${Date.now()}_${index}`,
          title: idea.title || 'Untitled Project',
          description: idea.description || 'No description provided',
          category: category as 'CREATIVE' | 'SOCIAL_IMPACT' | 'ENTREPRENEURIAL' | 'RESEARCH' | 'TECHNICAL' | 'LEADERSHIP',
          feasibilityScore: this.calculateFeasibility(idea, profile),
          matchingPercent: idea.matchingPercent || 75,
          timeEstimate: idea.timeEstimate || '4-6 months',
          uniqueness: idea.uniqueness || 'MEDIUM',
          impactMetrics: Array.isArray(idea.impactMetrics)
            ? idea.impactMetrics.slice(0, 3)
            : [],
        };
      })
      .slice(0, 10);
  }

  private calculateFeasibility(idea: any, profile: UserProfile): number {
    let score = idea.feasibilityScore || 70;

    // Adjust based on time commitment
    if (profile.timeCommitment < 4 && idea.timeEstimate?.includes('6+')) {
      score -= 15;
    }

    // Adjust based on challenge level
    if (profile.challengeLevel < 5 && idea.uniqueness === 'HIGH') {
      score -= 10;
    }

    return Math.max(Math.min(score, 100), 20);
  }
}
