import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import GameCard from '@/components/game/GameCard'
import Button from '@/components/ui/Button'

export default async function JoinedGamesPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/dashboard/joined')
  }
  
  const userId = (session.user as any).id
  if (!userId) {
    redirect('/auth/signin?callbackUrl=/dashboard/joined')
  }

  // Get all games user has joined
  const gameSignups = await prisma.gameSignup.findMany({
    where: {
      userId: userId
    },
    include: {
      game: {
        include: {
          organizer: true,
          signups: {
            include: {
              user: true
            }
          },
          _count: {
            select: {
              signups: true
            }
          }
        }
      }
    },
    orderBy: {
      game: {
        date: 'asc'
      }
    }
  })

  // Get user's joined games for conflict checking
  const userJoinedGames = gameSignups.map(signup => signup.game as any)

  const upcomingSignups = gameSignups.filter(signup => new Date(signup.game.date) > new Date())
  const pastSignups = gameSignups.filter(signup => new Date(signup.game.date) <= new Date())

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 text-sm">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Games You've Joined</h1>
          <p className="text-gray-600 mt-2">
            All the games you've signed up for and participated in
          </p>
        </div>
        
        <Link href="/games">
          <Button variant="outline">Find More Games</Button>
        </Link>
      </div>

      {/* Upcoming Games */}
      {upcomingSignups.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Upcoming Games ({upcomingSignups.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingSignups.map((signup) => (
              <GameCard 
                key={signup.id} 
                game={signup.game as any} 
                currentUserId={userId}
                userJoinedGames={userJoinedGames}
              />
            ))}
          </div>
        </div>
      )}

      {/* Past Games */}
      {pastSignups.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Past Games ({pastSignups.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastSignups.map((signup) => (
              <GameCard 
                key={signup.id} 
                game={signup.game as any} 
                currentUserId={userId}
                userJoinedGames={userJoinedGames}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {gameSignups.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🎯</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No games joined yet
          </h3>
          <p className="text-gray-600 mb-6">
            Start joining games and connect with your local football community!
          </p>
          <Link href="/games">
            <Button variant="outline">Browse Available Games</Button>
          </Link>
        </div>
      )}
    </div>
  )
}