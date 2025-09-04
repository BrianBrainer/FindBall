import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const userId = session.user.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the game
    const game = await prisma.game.findUnique({
      where: { id: resolvedParams.id },
      include: {
        _count: {
          select: {
            signups: true,
          },
        },
      },
    });

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    // Check if user has signed up for this game
    const existingSignup = await prisma.gameSignup.findUnique({
      where: {
        userId_gameId: {
          userId,
          gameId: resolvedParams.id,
        },
      },
    });

    if (!existingSignup) {
      return NextResponse.json({ error: 'You are not signed up for this game' }, { status: 400 });
    }

    // Remove the signup and update game player count in a transaction
    const result = await prisma.$transaction(async tx => {
      // Delete the signup
      await tx.gameSignup.delete({
        where: {
          id: existingSignup.id,
        },
      });

      // Update the game's current player count
      const updatedGame = await tx.game.update({
        where: { id: resolvedParams.id },
        data: {
          currentPlayers: {
            decrement: 1,
          },
        },
      });

      return { game: updatedGame };
    });

    return NextResponse.json({
      success: true,
      message: 'Successfully left the game',
    });
  } catch (error) {
    console.error('Error leaving game:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
