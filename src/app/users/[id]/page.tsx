import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate, formatTime, formatCurrency } from '@/utils/formatters';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

interface UserProfilePageProps {
  params: Promise<{ id: string }>;
}

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const session = await getServerSession(authOptions);
  const resolvedParams = await params;

  // Get user profile data
  const user = await prisma.user.findUnique({
    where: { id: resolvedParams.id },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      // Get user's game history
      gameSignups: {
        where: {
          status: 'CONFIRMED',
        },
        include: {
          game: {
            include: {
              organizer: true,
            },
          },
        },
        orderBy: {
          game: {
            date: 'desc',
          },
        },
        take: 10, // Show last 10 games
      },
      // Get games they organized
      organizedGames: {
        include: {
          _count: {
            select: {
              signups: true,
            },
          },
        },
        orderBy: {
          date: 'desc',
        },
        take: 5, // Show last 5 organized games
      },
    },
  });

  if (!user) {
    notFound();
  }

  // Calculate stats
  const totalGamesPlayed = user.gameSignups.length;
  const totalGamesOrganized = user.organizedGames.length;
  const upcomingGames = user.gameSignups.filter(
    signup => new Date(signup.game.date) > new Date()
  ).length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/games" className="text-blue-600 hover:text-blue-800 text-sm">
          ← Back to Games
        </Link>
      </div>

      {/* Profile Header */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold mr-6">
              {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {user.name || 'Anonymous Player'}
              </h1>
              <p className="text-gray-600 mt-1">Member since {formatDate(user.createdAt)}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalGamesPlayed}</div>
              <div className="text-sm text-gray-600">Games Played</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{totalGamesOrganized}</div>
              <div className="text-sm text-gray-600">Games Organized</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{upcomingGames}</div>
              <div className="text-sm text-gray-600">Upcoming Games</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Games Played */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Recent Games</h2>
          </CardHeader>
          <CardContent>
            {user.gameSignups.length === 0 ? (
              <p className="text-gray-600 text-center py-4">No games played yet</p>
            ) : (
              <div className="space-y-3">
                {user.gameSignups.slice(0, 5).map(signup => (
                  <div key={signup.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900">{signup.game.title}</h3>
                      <Badge
                        variant={new Date(signup.game.date) > new Date() ? 'success' : 'default'}
                      >
                        {new Date(signup.game.date) > new Date() ? 'Upcoming' : 'Completed'}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>
                        📅 {formatDate(signup.game.date)} at {formatTime(signup.game.date)}
                      </div>
                      <div>📍 {signup.game.location}</div>
                      <div>👤 Organized by {signup.game.organizer.name}</div>
                    </div>
                    <div className="mt-2">
                      <Link href={`/games/${signup.game.id}`}>
                        <Button size="sm" variant="outline">
                          View Game
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
                {user.gameSignups.length > 5 && (
                  <p className="text-sm text-gray-500 text-center pt-2">
                    And {user.gameSignups.length - 5} more games...
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Games Organized */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Games Organized</h2>
          </CardHeader>
          <CardContent>
            {user.organizedGames.length === 0 ? (
              <p className="text-gray-600 text-center py-4">No games organized yet</p>
            ) : (
              <div className="space-y-3">
                {user.organizedGames.slice(0, 5).map(game => (
                  <div key={game.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900">{game.title}</h3>
                      <Badge variant={new Date(game.date) > new Date() ? 'success' : 'default'}>
                        {new Date(game.date) > new Date() ? 'Upcoming' : 'Completed'}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>
                        📅 {formatDate(game.date)} at {formatTime(game.date)}
                      </div>
                      <div>📍 {game.location}</div>
                      <div>
                        👥 {game._count.signups}/{game.maxPlayers} players
                      </div>
                      <div>💰 {formatCurrency(Number(game.pricePerPlayer))} per player</div>
                    </div>
                    <div className="mt-2">
                      <Link href={`/games/${game.id}`}>
                        <Button size="sm" variant="outline">
                          View Game
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
                {user.organizedGames.length > 5 && (
                  <p className="text-sm text-gray-500 text-center pt-2">
                    And {user.organizedGames.length - 5} more games...
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
