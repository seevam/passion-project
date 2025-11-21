import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';

// GET /api/ideas/[id] - Get specific idea
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const idea = await db.projectIdea.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!idea) {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      idea,
    });
  } catch (error) {
    console.error('[GET_IDEA]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/ideas/[id] - Update idea status (save, reject, select)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const { status } = body; // 'saved', 'rejected', 'started'
    const { id } = await params;

    const idea = await db.projectIdea.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!idea) {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
    }

    const updatedIdea = await db.projectIdea.update({
      where: { id },
      data: {
        status,
        ...(status === 'started' && { selectedAt: new Date() }),
        ...(status === 'rejected' && { rejectedAt: new Date() }),
      },
    });

    return NextResponse.json({
      success: true,
      idea: updatedIdea,
    });
  } catch (error) {
    console.error('[UPDATE_IDEA]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/ideas/[id] - Delete an idea
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const idea = await db.projectIdea.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!idea) {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
    }

    await db.projectIdea.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Idea deleted',
    });
  } catch (error) {
    console.error('[DELETE_IDEA]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
