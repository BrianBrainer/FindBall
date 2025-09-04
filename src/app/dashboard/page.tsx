import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Card, { CardContent, CardHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import GameCard from '@/components/game/GameCard'

async function getUserDashboardData(userId: string) {
  try {
    const [organizedGames, gameSignups, user] = await Promise.all([
      prisma.game.findMany({
        where: {
          organizerId: userId
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
      }),
      
      prisma.gameSignup.findMany({
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
      }),
      
      prisma.user.findUnique({
        where: {
          id: userId
        }
      })
    ])
    
    return { organizedGames, gameSignups, user }
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return { organizedGames: [], gameSignups: [], user: null }
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/dashboard')
  }
  
  const userId = (session.user as any).id
  if (!userId) {
    redirect('/auth/signin?callbackUrl=/dashboard')
  }
  
  const { organizedGames, gameSignups, user } = await getUserDashboardData(userId)
  
  const upcomingOrganizedGames = organizedGames.filter(game => new Date(game.date) > new Date())
  const upcomingSignedUpGames = gameSignups.filter(signup => new Date(signup.game.date) > new Date())
  
  let userJoinedGames: any[] = []
  if (userId) {
    const userSignups = await prisma.gameSignup.findMany({
      where: {
        userId: userId,
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
    
    userJoinedGames = userSignups.map(signup => signup.game as any)
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name || 'Player'}!
        </h1>
        <p className="text-gray-600 mt-2">
          Manage your games and track your football activities
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6 md:gap-10 lg:gap-16 mb-8">
        <div className="aspect-square">
          <Card className="w-full h-full shadow-md">
            <CardContent className="h-full justify-center items-center text-center p-4">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {upcomingOrganizedGames.length}
              </div>
              <div className="text-sm text-gray-600 leading-tight">Games Organized</div>
            </CardContent>
          </Card>
        </div>
        
        <div className="aspect-square">
          <Card className="w-full h-full">
            <CardContent className="h-full justify-center items-center text-center p-4">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {upcomingSignedUpGames.length}
              </div>
              <div className="text-sm text-gray-600 leading-tight">Games Joined</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 md:gap-10 lg:gap-16">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Games Organized</h2>
          </div>
          
          {upcomingOrganizedGames.length === 0 ? (
            <div className="aspect-square">
              <Card className="w-full h-full">
                <CardContent className="h-full justify-center items-center text-center p-8">
                  <p className="text-lg text-gray-600 mb-6">
                    No upcoming games organized
                  </p>
                  <Link href="/games/create">
                    <Button size="lg">Create First Game</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              {upcomingOrganizedGames.slice(0, 4).map((game) => (
                <GameCard 
                  key={game.id} 
                  game={game as any} 
                  currentUserId={userId}
                  userJoinedGames={userJoinedGames}
                />
              ))}
              
              {upcomingOrganizedGames.length > 4 && (
                <div className="col-span-full text-center pt-4">
                  <Link href="/dashboard/organized">
                    <Button variant="outline">
                      View All ({upcomingOrganizedGames.length})
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Games Joined</h2>
          </div>
          
          {upcomingSignedUpGames.length === 0 ? (
            <div className="aspect-square">
              <Card className="w-full h-full">
                <CardContent className="h-full flex flex-col justify-center items-center text-center p-8">
                  <div className="text-5xl mb-4">🎯</div>
                  <p className="text-lg text-gray-600 mb-6">
                    No upcoming games joined
                  </p>
                  <Link href="/games">
                    <Button variant="outline" size="lg">Browse Games</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              {upcomingSignedUpGames.slice(0, 4).map((signup) => (
                <GameCard 
                  key={signup.id} 
                  game={signup.game as any} 
                  currentUserId={userId}
                  userJoinedGames={userJoinedGames}
                />
              ))}
              
              {upcomingSignedUpGames.length > 4 && (
                <div className="col-span-full text-center pt-4">
                  <Link href="/dashboard/joined">
                    <Button variant="outline">
                      View All ({upcomingSignedUpGames.length})
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <h2 className="text-xl font-semibold">Quick Actions</h2>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/games/create">
              <Button className="w-full h-16 text-left justify-start">
                <div>
                  <div className="font-semibold">Organize a Game</div>
                  <div className="text-sm opacity-75">Create and manage your own game</div>
                </div>
              </Button>
            </Link>
            
            <Link href="/games">
              <Button variant="outline" className="w-full h-16 text-left justify-start">
                <div>
                  <div className="font-semibold">Find Games</div>
                  <div className="text-sm opacity-75">Browse and join local games</div>
                </div>
              </Button>
            </Link>
            
            <Link href="/profile">
              <Button variant="outline" className="w-full h-16 text-left justify-start">
                <div>
                  <div className="font-semibold">Update Profile</div>
                  <div className="text-sm opacity-75">Manage your player information</div>
                </div>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}