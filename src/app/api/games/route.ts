import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { GameFormData } from '@/types';
// import { currentUser } from '@/lib/mockData'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data: GameFormData = await request.json();

    // Combine date and time
    const gameDateTime = new Date(`${data.date}T${data.time}`);

    // Validate future date
    if (gameDateTime <= new Date()) {
      return NextResponse.json({ error: 'Game date must be in the future' }, { status: 400 });
    }

    const game = await prisma.game.create({
      data: {
        title: data.title,
        description: data.description,
        date: gameDateTime,
        duration: data.duration,
        location: data.location,
        maxPlayers: data.maxPlayers,
        pricePerPlayer: data.pricePerPlayer,
        gameType: data.gameType,
        skillLevel: data.skillLevel,
        isPublic: data.isPublic,
        organizerId: session.user.id,
      },
      include: {
        organizer: true,
        _count: {
          select: {
            signups: true,
          },
        },
      },
    });

    return NextResponse.json(game);
  } catch (error) {
    console.error('Error creating game:', error);
    return NextResponse.json({ error: 'Failed to create game' }, { status: 500 });
  }

  // MOCK DATA FALLBACK (commented out - uncomment if database/auth issues)
  // try {
  //   // Simulate authentication check
  //   const isAuthenticated = true // Mock authentication
  //
  //   if (!isAuthenticated) {
  //     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  //   }
  //
  //   const data: GameFormData = await request.json()
  //
  //   // Combine date and time
  //   const gameDateTime = new Date(`${data.date}T${data.time}`)
  //
  //   // Validate future date
  //   if (gameDateTime <= new Date()) {
  //     return NextResponse.json(
  //       { error: 'Game date must be in the future' },
  //       { status: 400 }
  //     )
  //   }
  //
  //   // Simulate API delay
  //   await new Promise(resolve => setTimeout(resolve, 1000))
  //
  //   // Create mock game object
  //   const newGame = {
  //     id: `game-${Date.now()}`,
  //     title: data.title,
  //     description: data.description,
  //     date: gameDateTime,
  //     duration: data.duration,
  //     location: data.location,
  //     latitude: null,
  //     longitude: null,
  //     maxPlayers: data.maxPlayers,
  //     currentPlayers: 0,
  //     pricePerPlayer: data.pricePerPlayer,
  //     gameType: data.gameType,
  //     skillLevel: data.skillLevel,
  //     isPublic: data.isPublic,
  //     organizerId: currentUser.id,
  //     status: 'OPEN' as const,
  //     createdAt: new Date(),
  //     updatedAt: new Date(),
  //     organizer: currentUser,
  //     signups: [],
  //     _count: { signups: 0 }
  //   }
  //
  //   return NextResponse.json(newGame)
  // } catch (error) {
  //   console.error('Error creating game:', error)
  //   return NextResponse.json(
  //     { error: 'Failed to create game' },
  //     { status: 500 }
  //   )
  // }
}
