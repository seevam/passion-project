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
  async generateIdeas(profile: UserProfile): Promise<GeneratedIdea[]> {
    const prompt = this.buildPrompt(profile);

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
    return `You are an expert career counselor and project advisor for high school students.

Your role:
- Generate creative, feasible passion project ideas
- Ensure projects are achievable for students aged 14-18
- Prioritize impact and uniqueness
- Consider student's time constraints and skills

Output requirements:
- Return valid JSON only
- Generate 8-10 diverse ideas
- Include detailed feasibility analysis
- Provide specific, measurable impact metrics

CRITICAL: Projects must be:
✓ Achievable within 3-6 months
✓ Aligned with student interests
✓ Meaningful and impactful
✓ Unique (not generic volunteering)
✓ Specific and concrete`;
  }

  private buildPrompt(profile: UserProfile): string {
    const topValues = Array.isArray(profile.topValues) ? profile.topValues.join(', ') : '';
    const problemFocus = Array.isArray(profile.problemFocus) ? profile.problemFocus.join(', ') : '';
    const currentActivities = Array.isArray(profile.currentActivities) ? profile.currentActivities.join(', ') : '';
    const favoriteSubjects = Array.isArray(profile.favoriteSubjects) ? profile.favoriteSubjects.join(', ') : '';

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

Generate ideas that:
1. Match their interests and values
2. Address problems they care about
3. Are realistic for their time commitment
4. Build on their existing skills while stretching them
5. Are unique and memorable
6. Can be completed in 3-6 months
7. Have measurable impact

Return in this JSON format:
{
  "ideas": [
    {
      "id": "idea_1",
      "title": "Concise project title",
      "description": "2-3 sentences explaining the project and its impact",
      "category": "CREATIVE|SOCIAL_IMPACT|ENTREPRENEURIAL|RESEARCH|TECHNICAL|LEADERSHIP",
      "feasibilityScore": 85,
      "matchingPercent": 92,
      "timeEstimate": "4-6 months",
      "uniqueness": "HIGH|MEDIUM|LOW",
      "impactMetrics": ["Specific metric 1", "Specific metric 2", "Specific metric 3"]
    }
  ]
}`;
  }

  private validateAndEnhance(
    ideas: any[],
    profile: UserProfile
  ): GeneratedIdea[] {
    return ideas
      .map((idea, index) => ({
        id: idea.id || `idea_${Date.now()}_${index}`,
        title: idea.title || 'Untitled Project',
        description: idea.description || 'No description provided',
        category: idea.category || 'SOCIAL_IMPACT',
        feasibilityScore: this.calculateFeasibility(idea, profile),
        matchingPercent: idea.matchingPercent || 75,
        timeEstimate: idea.timeEstimate || '4-6 months',
        uniqueness: idea.uniqueness || 'MEDIUM',
        impactMetrics: Array.isArray(idea.impactMetrics)
          ? idea.impactMetrics.slice(0, 3)
          : [],
      }))
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
