import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
// import { mockGames } from '@/lib/mockData'
import { formatDate, formatTime, formatCurrency, formatGameType, formatSkillLevel } from '@/utils/formatters'
import Card, { CardContent, CardHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import LeaveGameButton from '@/components/game/LeaveGameButton'

interface GameDetailPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function GameDetailPage({ params, searchParams }: GameDetailPageProps) {
  const session = await getServerSession(authOptions)
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  let game
  
  try {
    game = await prisma.game.findUnique({
      where: { id: resolvedParams.id },
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
    })
  } catch (error) {
    console.error('Error fetching game:', error)
    game = null
  }

  // MOCK DATA FALLBACK (commented out - uncomment if database issues)
  // // Simulate API delay
  // await new Promise(resolve => setTimeout(resolve, 300))
  // 
  // // Find game by ID (in real app, this would be a database query)
  // const game = mockGames.find(g => g.id === params.id)
  
  if (!game) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Game Not Found</h1>
        <p className="text-gray-600 mb-6">The game you're looking for doesn't exist or has been removed.</p>
        <Link href="/games">
          <Button>Browse Other Games</Button>
        </Link>
      </div>
    )
  }
  
  const spotsLeft = game.maxPlayers - game.currentPlayers
  const isFull = spotsLeft === 0
  
  // Check user status
  const currentUserId = session?.user?.id
  const userSignup = currentUserId ? game.signups?.find(signup => signup.userId === currentUserId) : null
  const hasJoined = !!userSignup
  const isOrganizer = currentUserId === game.organizerId
  
  // Get message from search params
  const message = resolvedSearchParams?.message as string
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/games" className="text-blue-600 hover:text-blue-800 text-sm">
          ← Back to Games
        </Link>
      </div>
      
      {/* Success/Error Messages */}
      {message === 'joined-successfully' && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-green-600 mr-2">✅</span>
            <p className="text-green-800">Successfully joined the game! You'll receive confirmation details soon.</p>
          </div>
        </div>
      )}
      
      {message === 'already-joined' && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-yellow-600 mr-2">ℹ️</span>
            <p className="text-yellow-800">You have already joined this game.</p>
          </div>
        </div>
      )}
      
      {message === 'game-full' && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-red-600 mr-2">❌</span>
            <p className="text-red-800">This game is currently full. Check back later for cancellations.</p>
          </div>
        </div>
      )}
      
      <div className="max-w-4xl">
        <Card>
          <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{game.title}</h1>
              <p className="text-gray-600">Organized by {game.organizer.name}</p>
            </div>
            <div className="flex gap-2">
              <Badge variant={game.status === 'OPEN' && !isFull ? 'success' : 'danger'}>
                {isFull ? 'Full' : game.status}
              </Badge>
              <Badge variant="info">{formatGameType(game.gameType)}</Badge>
              <Badge variant="default">{formatSkillLevel(game.skillLevel)}</Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {game.description && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-600">{game.description}</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Game Details</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="mr-3">📅</span>
                  <div>
                    <div className="font-medium">{formatDate(game.date)}</div>
                    <div className="text-sm text-gray-600">{formatTime(game.date)}</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <span className="mr-3">⏱️</span>
                  <span>{game.duration} minutes</span>
                </div>
                
                <div className="flex items-center">
                  <span className="mr-3">📍</span>
                  <span>{game.location}</span>
                </div>
                
                <div className="flex items-center">
                  <span className="mr-3">💰</span>
                  <span>{formatCurrency(Number(game.pricePerPlayer))} per player</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Availability</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="mr-3">👥</span>
                  <span>{game.currentPlayers}/{game.maxPlayers} players joined</span>
                </div>
                
                <div className="flex items-center">
                  <span className="mr-3">🎯</span>
                  <span className={isFull ? 'text-red-600' : 'text-green-600'}>
                    {isFull ? 'Game is full' : `${spotsLeft} spots remaining`}
                  </span>
                </div>
                
                <div className="flex items-center">
                  <span className="mr-3">⭐</span>
                  <span>Skill level: {formatSkillLevel(game.skillLevel)}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Players List - Only visible to organizer */}
          {isOrganizer && game.signups && game.signups.length > 0 && (
            <div className="border-t pt-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Players Joined ({game.signups.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {game.signups.map((signup) => (
                  <div key={signup.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
                        {signup.user.name?.charAt(0) || signup.user.email?.charAt(0) || 'U'}
                      </div>
                      <div className="font-medium text-gray-900">
                        {signup.user.name || 'Anonymous Player'}
                      </div>
                    </div>
                    <Link href={`/users/${signup.user.id}`}>
                      <Button size="sm" variant="outline">
                        View Profile
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="border-t pt-6">
            {/* Show different buttons based on user status */}
            {!currentUserId ? (
              // Not logged in
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Please sign in to join this game
                </p>
                <Link href={`/auth/signin?callbackUrl=/games/${game.id}`}>
                  <Button size="lg">Sign In to Join</Button>
                </Link>
              </div>
            ) : hasJoined ? (
              // User has joined
              <div className="flex space-x-4">
                <div className="flex-1">
                  <p className="text-green-600 mb-2 text-center font-medium">
                    {isOrganizer ? "You're organizing this game" : "You've joined this game"}
                  </p>
                  <LeaveGameButton 
                    gameId={game.id}
                    gameTitle={game.title}
                    className="w-full"
                  />
                </div>
              </div>
            ) : game.status === 'OPEN' && !isFull ? (
              // User can join
              <div className="flex space-x-4">
                <Link href={`/games/${game.id}/join`} className="flex-1">
                  <Button size="lg" className="w-full">
                    Join Game - {formatCurrency(Number(game.pricePerPlayer))}
                  </Button>
                </Link>
              </div>
            ) : (
              // Game is full or closed
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  {isFull ? 'This game is currently full.' : 'This game is no longer accepting players.'}
                </p>
                <Button variant="outline">Join Waitlist</Button>
              </div>
            )}
          </div>
          
          {/* Demo Notice */}
          {/* <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Demo Mode:</strong> This is a demonstration. In the full application, you would be able to join games, make payments, and receive confirmations.
            </p>
          </div> */}
        </CardContent>
      </Card>
      </div>
    </div>
  )
}