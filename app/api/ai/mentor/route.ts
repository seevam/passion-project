import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { openai } from '@/lib/ai';

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const { message, sessionId, conversationHistory } = body;

    // Get user profile for context
    const profile = await db.userProfile.findUnique({
      where: { userId: user.id },
    });

    // Get user's recent projects for context
    const projects = await db.project.findMany({
      where: {
        userId: user.id,
        archivedAt: null,
      },
      take: 3,
      orderBy: { updatedAt: 'desc' },
      select: {
        title: true,
        description: true,
        status: true,
        category: true,
      },
    });

    // Build conversation context
    const messages = [
      {
        role: 'system',
        content: `You are an encouraging and knowledgeable AI mentor for high school students working on passion projects. Your role is to:

1. Provide guidance and support for their projects
2. Help them brainstorm ideas and solve problems
3. Offer encouragement and keep them motivated
4. Break down complex tasks into manageable steps
5. Share relevant advice and resources
6. Help them reflect on their progress and learning

User Context:
- Name: ${user.name}
- Grade Level: ${profile?.gradeLevel || 'Unknown'}
- Work Style: ${profile?.workStyle || 'Unknown'}
- Top Values: ${profile?.topValues?.join(', ') || 'Not specified'}

Current Projects:
${projects.map((p) => `- ${p.title} (${p.status}): ${p.description}`).join('\n')}

Guidelines:
- Be warm, supportive, and encouraging
- Keep responses concise (2-4 paragraphs max)
- Provide actionable advice when possible
- Ask clarifying questions when needed
- Celebrate their progress and efforts
- Be honest if you don't know something
- Encourage them to think critically and creatively`,
      },
      // Add conversation history for context
      ...(conversationHistory || []).map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      {
        role: 'user',
        content: message,
      },
    ];

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages as any,
      temperature: 0.8,
      max_tokens: 500,
    });

    const responseMessage = completion.choices[0].message.content ||
      "I'm here to help! Could you tell me more about what you're working on?";

    // Save the conversation to database
    await db.conversationMessage.createMany({
      data: [
        {
          userId: user.id,
          sessionId,
          role: 'user',
          content: message,
          model: null,
          tokens: null,
        },
        {
          userId: user.id,
          sessionId,
          role: 'assistant',
          content: responseMessage,
          model: 'gpt-4o-mini',
          tokens: completion.usage?.total_tokens || null,
          latencyMs: null,
        },
      ],
    });

    return NextResponse.json({
      success: true,
      message: responseMessage,
    });
  } catch (error) {
    console.error('[AI_MENTOR]', error);
    return NextResponse.json(
      { error: 'Failed to get mentor response' },
      { status: 500 }
    );
  }
}
