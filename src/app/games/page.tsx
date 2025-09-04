import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { GameWithDetails } from '@/types';
import GamesPageClient from '@/components/games/GamesPageClient';
import Button from '@/components/ui/Button';

async function getGames(): Promise<GameWithDetails[]> {
  try {
    const games = await prisma.game.findMany({
      where: {
        status: 'OPEN',
        date: {
          gte: new Date(),
        },
      },
      include: {
        organizer: true,
        signups: {
          include: {
            user: true,
          },
        },
        _count: {
          select: {
            signups: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    return games as GameWithDetails[];
  } catch (error) {
    console.error('Error fetching games:', error);
    return [];
  }

  // MOCK DATA FALLBACK (commented out - uncomment if database issues)
  // // Simulate API delay
  // await new Promise(resolve => setTimeout(resolve, 500))
  //
  // // Filter for open games in the future
  // const now = new Date()
  // return mockGames.filter(game =>
  //   game.status === 'OPEN' && new Date(game.date) > now
  // ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

export default async function GamesPage() {
  const session = await getServerSession(authOptions);
  const games = await getGames();

  // Get user's joined games for conflict checking
  let userJoinedGames: GameWithDetails[] = [];
  if (session?.user?.id) {
    const userSignups = await prisma.gameSignup.findMany({
      where: {
        userId: session.user.id,
        status: 'CONFIRMED',
      },
      include: {
        game: {
          include: {
            organizer: true,
            signups: {
              include: {
                user: true,
              },
            },
            _count: {
              select: {
                signups: true,
              },
            },
          },
        },
      },
    });

    userJoinedGames = userSignups.map(signup => signup.game as GameWithDetails);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Find Football Games</h1>
          <p className="text-gray-600 mt-2">Browse and join local football games in your area</p>
        </div>

        <Link href="/games/create">
          <Button>Create Game</Button>
        </Link>
      </div>

      <GamesPageClient 
        games={games}
        currentUserId={session?.user?.id}
        userJoinedGames={userJoinedGames}
      />
    </div>
  );
}
