import { openai } from './index';

export interface GeneratedMilestone {
  title: string;
  description: string;
  orderIndex: number;
  estimatedDays: number;
  tasks: GeneratedTask[];
}

export interface GeneratedTask {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  estimatedHours: number;
  orderIndex: number;
}

interface ProjectContext {
  title: string;
  description: string;
  category: string;
  timeCommitment?: number; // hours per week from user profile
  challengeLevel?: number; // 1-10 from user profile
  studentGrade?: number;
}

export class MilestoneGenerator {
  async generateMilestonesAndTasks(
    projectContext: ProjectContext
  ): Promise<GeneratedMilestone[]> {
    const prompt = this.buildPrompt(projectContext);

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
        temperature: 0.7,
        max_tokens: 3000,
        response_format: { type: 'json_object' },
      });

      const responseText = completion.choices[0].message.content;
      if (!responseText) throw new Error('No response from AI');

      const parsed = JSON.parse(responseText);
      return this.validateAndEnhance(parsed.milestones || []);
    } catch (error) {
      console.error('Error generating milestones:', error);
      throw error;
    }
  }

  private getSystemPrompt(): string {
    return `You are an expert project management advisor for high school students working on passion projects.

Your role:
- Break down projects into clear, achievable milestones
- Create specific, actionable tasks for each milestone
- Ensure milestones follow a logical progression
- Consider the student's time constraints and skill level
- Make tasks concrete and measurable

Output requirements:
- Return valid JSON only
- Generate 3-6 milestones (depending on project complexity)
- Each milestone should have 3-8 specific tasks
- Use clear, action-oriented language
- Provide realistic time estimates

CRITICAL Guidelines:
✓ Milestones should be sequential and build on each other
✓ First milestone should be "Planning & Research"
✓ Last milestone should be "Launch & Reflection"
✓ Tasks should be specific enough to check off
✓ Include both learning tasks and execution tasks
✓ Consider testing/feedback loops
✓ Tasks should take 1-4 hours each for high school students`;
  }

  private buildPrompt(context: ProjectContext): string {
    const timeInfo = context.timeCommitment
      ? `The student has ${context.timeCommitment} hours per week to dedicate to this project.`
      : '';

    const challengeInfo = context.challengeLevel
      ? `Challenge level preference: ${context.challengeLevel}/10 (higher = more ambitious)`
      : '';

    return `Generate a project plan with milestones and tasks for this student project:

PROJECT DETAILS:
Title: ${context.title}
Description: ${context.description}
Category: ${context.category}
${timeInfo}
${challengeInfo}

Generate a comprehensive project plan that:
1. Breaks the project into 3-6 major milestones
2. Each milestone should represent a significant phase of the project
3. Provide 3-8 specific, actionable tasks for each milestone
4. Tasks should be concrete and measurable (e.g., "Research 3 competitor apps" not "Do research")
5. Include time estimates that are realistic for a high school student
6. Consider that students are learning as they go

IMPORTANT:
- First milestone should focus on planning, research, and skill-building
- Middle milestones should focus on building/creating core components
- Final milestone should include testing, launch, and reflection
- Tasks within each milestone should flow logically and be numbered sequentially
- Prioritize tasks (high = critical path, medium = important, low = nice-to-have)
- Order tasks so foundational work comes first, then building, then finishing touches

Return in this JSON format:
{
  "milestones": [
    {
      "title": "Phase 1: Planning & Research",
      "description": "Clear description of what this milestone achieves",
      "orderIndex": 1,
      "estimatedDays": 14,
      "tasks": [
        {
          "title": "Specific, action-oriented task title",
          "description": "More details about what to do and how to approach it",
          "priority": "high",
          "estimatedHours": 2,
          "orderIndex": 1
        }
      ]
    }
  ]
}`;
  }

  private validateAndEnhance(milestones: any[]): GeneratedMilestone[] {
    return milestones
      .map((milestone, index) => ({
        title: milestone.title || `Milestone ${index + 1}`,
        description: milestone.description || '',
        orderIndex: milestone.orderIndex || index + 1,
        estimatedDays: Math.max(
          1,
          Math.min(milestone.estimatedDays || 14, 90)
        ),
        tasks: (milestone.tasks || [])
          .map((task: any, taskIndex: number) => ({
            title: task.title || 'Untitled Task',
            description: task.description || '',
            priority: ['low', 'medium', 'high'].includes(task.priority)
              ? task.priority
              : 'medium',
            estimatedHours: Math.max(
              0.5,
              Math.min(task.estimatedHours || 2, 20)
            ),
            orderIndex: task.orderIndex || taskIndex + 1,
          }))
          .slice(0, 8),
      }))
      .slice(0, 6);
  }
}
