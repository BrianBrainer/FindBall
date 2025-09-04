import { GameWithDetails, SerializedGameWithDetails } from '@/types';

export interface TimeConflict {
  hasConflict: boolean;
  conflictingGame?: SerializedGameWithDetails;
  message?: string;
}

/**
 * Check if a game conflicts with any games the user has already joined
 * @param targetGame - The game to check for conflicts
 * @param userJoinedGames - Games the user has already joined
 * @returns TimeConflict object with conflict information
 */
export function checkGameTimeConflict(
  targetGame: SerializedGameWithDetails,
  userJoinedGames: SerializedGameWithDetails[]
): TimeConflict {
  const targetStart = new Date(targetGame.date);
  const targetEnd = new Date(targetStart.getTime() + targetGame.duration * 60 * 1000);

  // 30 minute buffer between games
  const bufferTime = 30 * 60 * 1000;
  const targetBufferedStart = new Date(targetStart.getTime() - bufferTime);
  const targetBufferedEnd = new Date(targetEnd.getTime() + bufferTime);

  for (const joinedGame of userJoinedGames) {
    const joinedStart = new Date(joinedGame.date);
    const joinedEnd = new Date(joinedStart.getTime() + joinedGame.duration * 60 * 1000);
    const joinedBufferedStart = new Date(joinedStart.getTime() - bufferTime);
    const joinedBufferedEnd = new Date(joinedEnd.getTime() + bufferTime);

    // Check if games overlap (including buffer time)
    const hasOverlap =
      targetBufferedStart < joinedBufferedEnd && targetBufferedEnd > joinedBufferedStart;

    if (hasOverlap) {
      return {
        hasConflict: true,
        conflictingGame: joinedGame,
        message: `Conflicts with "${joinedGame.title}" on ${joinedStart.toLocaleDateString()} at ${joinedStart.toLocaleTimeString()}`,
      };
    }
  }

  return { hasConflict: false };
}

/**
 * Format a time conflict message for display
 */
export function formatConflictMessage(conflict: TimeConflict): string {
  if (!conflict.hasConflict || !conflict.conflictingGame) {
    return '';
  }

  const conflictGame = conflict.conflictingGame;
  const conflictStart = new Date(conflictGame.date);

  return `Time conflict with "${conflictGame.title}" (${conflictStart.toLocaleDateString()} at ${conflictStart.toLocaleTimeString()}). Games must have at least 30 minutes between them.`;
}
