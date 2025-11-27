import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { MilestoneGenerator } from '@/lib/ai/milestone-generator';

// POST /api/projects/[id]/generate-plan - Generate AI milestones and tasks
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id: projectId } = await params;

    // Get the project
    const project = await db.project.findUnique({
      where: {
        id: projectId,
        userId: user.id, // Ensure user owns this project
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Get user profile for additional context
    const profile = await db.userProfile.findUnique({
      where: { userId: user.id },
    });

    // Generate milestones and tasks using AI
    const generator = new MilestoneGenerator();
    const generatedMilestones = await generator.generateMilestonesAndTasks({
      title: project.title,
      description: project.description,
      category: project.category,
      timeCommitment: profile?.timeCommitment || undefined,
      challengeLevel: profile?.challengeLevel || undefined,
      studentGrade: profile?.gradeLevel || undefined,
    });

    // Create milestones and tasks in database
    const createdMilestones = [];

    for (const milestone of generatedMilestones) {
      // Create the milestone
      const createdMilestone = await db.milestone.create({
        data: {
          projectId: project.id,
          title: milestone.title,
          description: milestone.description,
          orderIndex: milestone.orderIndex,
          status: 'NOT_STARTED',
        },
      });

      // Create tasks for this milestone
      const createdTasks = [];
      for (const task of milestone.tasks) {
        const createdTask = await db.task.create({
          data: {
            projectId: project.id,
            milestoneId: createdMilestone.id,
            title: task.title,
            description: task.description,
            priority: task.priority,
            estimatedHours: Math.round(task.estimatedHours),
            orderIndex: task.orderIndex,
            completed: false,
          },
        });
        createdTasks.push(createdTask);
      }

      createdMilestones.push({
        ...createdMilestone,
        tasks: createdTasks,
      });
    }

    return NextResponse.json({
      success: true,
      milestonesCreated: createdMilestones.length,
      tasksCreated: createdMilestones.reduce(
        (sum, m) => sum + m.tasks.length,
        0
      ),
      milestones: createdMilestones,
    });
  } catch (error) {
    console.error('[GENERATE_PLAN]', error);
    return NextResponse.json(
      { error: 'Failed to generate project plan' },
      { status: 500 }
    );
  }
}
