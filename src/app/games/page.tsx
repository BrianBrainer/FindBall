import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { GameWithDetails } from '@/types'
import GameCard from '@/components/game/GameCard'
import Button from '@/components/ui/Button'

async function getGames(): Promise<GameWithDetails[]> {
  try {
    const games = await prisma.game.findMany({
      where: {
        status: 'OPEN',
        date: {
          gte: new Date()
        }
      },
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
      },
      orderBy: {
        date: 'asc'
      }
    })
    
    return games as GameWithDetails[]
  } catch (error) {
    console.error('Error fetching games:', error)
    return []
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
  const session = await getServerSession(authOptions)
  const games = await getGames()
  
  // Get user's joined games for conflict checking
  let userJoinedGames: GameWithDetails[] = []
  if (session?.user?.id) {
    const userSignups = await prisma.gameSignup.findMany({
      where: {
        userId: session.user.id,
        status: 'CONFIRMED'
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
      }
    })
    
    userJoinedGames = userSignups.map(signup => signup.game as GameWithDetails)
  }
  
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Find Football Games</h1>
          <p className="text-gray-600 mt-2">
            Browse and join local football games in your area
          </p>
        </div>
        
        <Link href="/games/create">
          <Button>Create Game</Button>
        </Link>
      </div>

      {/* Filters - Simple version for now */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
        <h3 className="text-lg font-semibold mb-4">Filter Games</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              placeholder="Enter city or area"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Game Type
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
              <option value="">All Types</option>
              <option value="CASUAL">Casual</option>
              <option value="COMPETITIVE">Competitive</option>
              <option value="PICKUP">Pickup</option>
              <option value="TOURNAMENT">Tournament</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Skill Level
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
              <option value="">All Levels</option>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
              <option value="EXPERT">Expert</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <Button className="w-full">Apply Filters</Button>
          </div>
        </div>
      </div>

      {/* Games Grid */}
      {games.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">⚽</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No games found
          </h3>
          <p className="text-gray-600 mb-6">
            Be the first to organize a game in your area!
          </p>
          <Link href="/games/create">
            <Button>Create the First Game</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <GameCard 
              key={game.id} 
              game={game} 
              currentUserId={session?.user?.id}
              userJoinedGames={userJoinedGames}
            />
          ))}
        </div>
      )}
      
      {games.length > 0 && (
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Showing {games.length} game{games.length !== 1 ? 's' : ''}
          </p>
          {/* Pagination would go here in a real app */}
        </div>
      )}
    </div>
  )
}