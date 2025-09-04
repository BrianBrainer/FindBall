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
    const { userId } = await request.json();

    // Verify the user ID matches the session
    if (userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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

    // Check if game is still open
    if (game.status !== 'OPEN') {
      return NextResponse.json({ error: 'Game is not available for joining' }, { status: 400 });
    }

    // Check if game is full
    if (game.currentPlayers >= game.maxPlayers) {
      return NextResponse.json({ error: 'Game is full' }, { status: 400 });
    }

    // Check if user already signed up
    const existingSignup = await prisma.gameSignup.findUnique({
      where: {
        userId_gameId: {
          userId,
          gameId: resolvedParams.id,
        },
      },
    });

    if (existingSignup) {
      return NextResponse.json({ error: 'You have already joined this game' }, { status: 400 });
    }

    // Check for time conflicts with other games the user has joined
    const gameStartTime = game.date;
    const gameEndTime = new Date(game.date.getTime() + game.duration * 60 * 1000);

    const conflictingGames = await prisma.gameSignup.findMany({
      where: {
        userId,
        status: 'CONFIRMED',
        game: {
          date: {
            gte: new Date(gameStartTime.getTime() - 180 * 60 * 1000), // 3 hours before
            lte: new Date(gameEndTime.getTime() + 180 * 60 * 1000), // 3 hours after
          },
        },
      },
      include: {
        game: true,
      },
    });

    // Check for actual time overlaps (more precise than the database filter)
    const hasTimeConflict = conflictingGames.some(signup => {
      const otherGameStart = signup.game.date;
      const otherGameEnd = new Date(otherGameStart.getTime() + signup.game.duration * 60 * 1000);

      // Check if games overlap (including buffer time)
      const bufferTime = 30 * 60 * 1000; // 30 minutes buffer
      const thisGameBufferedStart = new Date(gameStartTime.getTime() - bufferTime);
      const thisGameBufferedEnd = new Date(gameEndTime.getTime() + bufferTime);
      const otherGameBufferedStart = new Date(otherGameStart.getTime() - bufferTime);
      const otherGameBufferedEnd = new Date(otherGameEnd.getTime() + bufferTime);

      return (
        thisGameBufferedStart < otherGameBufferedEnd && thisGameBufferedEnd > otherGameBufferedStart
      );
    });

    if (hasTimeConflict) {
      const conflictGame = conflictingGames[0].game;
      return NextResponse.json(
        {
          error: `You already have a game scheduled around this time: "${conflictGame.title}" on ${conflictGame.date.toLocaleDateString()} at ${conflictGame.date.toLocaleTimeString()}. Games must have at least 30 minutes between them.`,
        },
        { status: 400 }
      );
    }

    // Create the signup and update game player count in a transaction
    const result = await prisma.$transaction(async tx => {
      // Create the signup
      const signup = await tx.gameSignup.create({
        data: {
          userId,
          gameId: resolvedParams.id,
          status: 'CONFIRMED', // For now, skip payment flow
        },
      });

      // Update the game's current player count
      const updatedGame = await tx.game.update({
        where: { id: resolvedParams.id },
        data: {
          currentPlayers: {
            increment: 1,
          },
        },
      });

      return { signup, game: updatedGame };
    });

    return NextResponse.json({
      success: true,
      message: 'Successfully joined the game',
      signup: result.signup,
    });
  } catch (error) {
    console.error('Error joining game:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
