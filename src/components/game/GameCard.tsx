import Link from 'next/link'
import { GameWithDetails } from '@/types'
import { formatDate, formatTime, formatCurrency, formatSkillLevel, formatGameType } from '@/utils/formatters'
import { checkGameTimeConflict } from '@/utils/gameConflicts'
import Card, { CardContent, CardFooter } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import LeaveGameButton from './LeaveGameButton'

interface GameCardProps {
  game: GameWithDetails
  currentUserId?: string
  userJoinedGames?: GameWithDetails[]
}

export default function GameCard({ game, currentUserId, userJoinedGames = [] }: GameCardProps) {
  const spotsLeft = game.maxPlayers - game.currentPlayers
  const isAlmostFull = spotsLeft <= 3 && spotsLeft > 0
  const isFull = spotsLeft === 0
  
  // Check if current user has joined this game
  const userSignup = currentUserId ? game.signups?.find(signup => signup.userId === currentUserId) : null
  const hasJoined = !!userSignup
  const isOrganizer = currentUserId === game.organizerId
  
  // Check for time conflicts
  const timeConflict = currentUserId && !hasJoined ? checkGameTimeConflict(game, userJoinedGames) : { hasConflict: false }
  
  
  return (
    <Card className="h-full">
      <CardContent>
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {game.title}
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            Organized by {game.organizer.name}
          </p>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-2">📅</span>
            {formatDate(game.date)} at {formatTime(game.date)}
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-2">📍</span>
            {game.location}
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-2">👥</span>
            {game.currentPlayers}/{game.maxPlayers} players
            {isFull && <span className="ml-1 text-red-600">(Full)</span>}
            {isAlmostFull && !isFull && <span className="ml-1 text-yellow-600">(Almost Full)</span>}
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-2">💰</span>
            {formatCurrency(Number(game.pricePerPlayer))} per player
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="info">
            {formatGameType(game.gameType)}
          </Badge>
          <Badge variant="default">
            {formatSkillLevel(game.skillLevel)}
          </Badge>
          {game.status === 'OPEN' && !isFull && (
            <Badge variant="success">Open</Badge>
          )}
          {isFull && (
            <Badge variant="danger">Full</Badge>
          )}
        </div>
        
        {game.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {game.description}
          </p>
        )}
        
        {/* Time Conflict Warning */}
        {timeConflict.hasConflict && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <div className="flex items-start">
              <span className="text-yellow-600 mr-2 text-sm">⚠️</span>
              <div>
                <p className="text-yellow-800 text-sm font-medium">Time Conflict</p>
                <p className="text-yellow-700 text-xs mt-1">
                  {timeConflict.message}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <div className="flex w-full space-x-2">
          <Link href={`/games/${game.id}`} className="flex-1">
            <Button className="w-full" variant="outline">
              View Details
            </Button>
          </Link>
          
          {/* Show different buttons based on user status */}
          {currentUserId && hasJoined ? (
            // User has joined - show leave button
            <LeaveGameButton 
              gameId={game.id} 
              gameTitle={game.title}
              className="flex-1" 
            />
          ) : (
            // User hasn't joined - show join button (if conditions met)
            !isFull && game.status === 'OPEN' && currentUserId && (
              timeConflict.hasConflict ? (
                <Button className="flex-1" disabled>
                  Time Conflict
                </Button>
              ) : (
                <Link href={`/games/${game.id}/join`} className="flex-1">
                  <Button className="w-full">
                    Join Game
                  </Button>
                </Link>
              )
            )
          )}
        </div>
      </CardFooter>
    </Card>
  )
}