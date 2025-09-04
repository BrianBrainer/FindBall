'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SerializedGameWithDetails } from '@/types';
import { formatDate, formatTime, formatCurrency } from '@/utils/formatters';
import { checkGameTimeConflict } from '@/utils/gameConflicts';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

interface JoinGameFormProps {
  game: SerializedGameWithDetails;
  userId: string;
  spotsLeft: number;
  userJoinedGames?: SerializedGameWithDetails[];
}

export default function JoinGameForm({
  game,
  userId,
  spotsLeft,
  userJoinedGames = [],
}: JoinGameFormProps) {
  const router = useRouter();
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');

  // Check for time conflicts
  const timeConflict = checkGameTimeConflict(game, userJoinedGames);

  const handleJoinGame = async () => {
    setIsJoining(true);
    setError('');

    try {
      const response = await fetch(`/api/games/${game.id}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to join game');
      }

      const result = await response.json();

      // Redirect to game details with success message
      router.push(`/games/${game.id}?message=joined-successfully`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsJoining(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Join Game</h1>
        <p className="text-gray-600 mt-2">Review the game details and confirm your participation</p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">{game.title}</h2>
          <p className="text-gray-600">Organized by {game.organizer.name}</p>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Game Details</h3>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <span className="mr-2">📅</span>
                    {formatDate(game.date)} at {formatTime(game.date)}
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="mr-2">📍</span>
                    {game.location}
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="mr-2">⏱️</span>
                    {game.duration} minutes
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Game Info</h3>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <span className="mr-2">👥</span>
                    {game.currentPlayers}/{game.maxPlayers} players ({spotsLeft} spots left)
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="mr-2">💰</span>
                    {formatCurrency(Number(game.pricePerPlayer))} per player
                  </div>
                  <div className="flex items-center text-sm gap-2">
                    <Badge variant="info">{game.gameType}</Badge>
                    <Badge variant="default">{game.skillLevel}</Badge>
                  </div>
                </div>
              </div>
            </div>

            {game.description && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 text-sm">{game.description}</p>
              </div>
            )}

            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-2">Payment Information</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-800 text-sm">
                  <strong>Total Cost:</strong> {formatCurrency(Number(game.pricePerPlayer))}
                </p>
                <p className="text-blue-700 text-sm mt-1">
                  Payment is required to confirm your spot. You'll be charged immediately upon
                  joining.
                </p>
              </div>
            </div>

            {/* Time Conflict Warning */}
            {timeConflict.hasConflict && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start">
                  <span className="text-yellow-600 mr-2">⚠️</span>
                  <div>
                    <p className="text-yellow-800 text-sm font-medium">Time Conflict</p>
                    <p className="text-yellow-700 text-sm mt-1">{timeConflict.message}</p>
                    <p className="text-yellow-700 text-sm mt-1">
                      You cannot join games that overlap or are within 30 minutes of each other.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <Button
                onClick={handleCancel}
                variant="outline"
                className="flex-1"
                disabled={isJoining}
              >
                Cancel
              </Button>
              <Button
                onClick={handleJoinGame}
                className="flex-1"
                disabled={isJoining || timeConflict.hasConflict}
              >
                {isJoining
                  ? 'Joining...'
                  : timeConflict.hasConflict
                    ? 'Cannot Join - Time Conflict'
                    : `Join Game (${formatCurrency(Number(game.pricePerPlayer))})`}
              </Button>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                By joining this game, you agree to the terms and conditions and authorize payment of{' '}
                {formatCurrency(Number(game.pricePerPlayer))}.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
