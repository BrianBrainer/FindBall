import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import GameCard from '@/components/game/GameCard';
import Button from '@/components/ui/Button';

export default async function OrganizedGamesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/dashboard/organized');
  }

  const userId = (session.user as any).id;
  if (!userId) {
    redirect('/auth/signin?callbackUrl=/dashboard/organized');
  }

  // Get all games organized by user
  const organizedGames = await prisma.game.findMany({
    where: {
      organizerId: userId,
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

  // Get user's joined games for conflict checking
  const userSignups = await prisma.gameSignup.findMany({
    where: {
      userId: userId,
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

  const userJoinedGames = userSignups.map(signup => signup.game as any);

  const upcomingGames = organizedGames.filter(game => new Date(game.date) > new Date());
  const pastGames = organizedGames.filter(game => new Date(game.date) <= new Date());

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 text-sm">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Games You've Organized</h1>
          <p className="text-gray-600 mt-2">Manage all the games you've created and organized</p>
        </div>

        <Link href="/games/create">
          <Button>Create New Game</Button>
        </Link>
      </div>

      {/* Upcoming Games */}
      {upcomingGames.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Upcoming Games ({upcomingGames.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingGames.map(game => (
              <GameCard
                key={game.id}
                game={game as any}
                currentUserId={userId}
                userJoinedGames={userJoinedGames}
              />
            ))}
          </div>
        </div>
      )}

      {/* Past Games */}
      {pastGames.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Past Games ({pastGames.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastGames.map(game => (
              <GameCard
                key={game.id}
                game={game as any}
                currentUserId={userId}
                userJoinedGames={userJoinedGames}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {organizedGames.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">⚽</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No games organized yet</h3>
          <p className="text-gray-600 mb-6">
            Start organizing games and building your local football community!
          </p>
          <Link href="/games/create">
            <Button>Create Your First Game</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
