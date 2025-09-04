'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { GameWithDetails } from '@/types';
import GameCard from '@/components/game/GameCard';
import Button from '@/components/ui/Button';

interface GamesPageClientProps {
  games: GameWithDetails[];
  currentUserId?: string;
  userJoinedGames: GameWithDetails[];
}

interface Filters {
  location: string;
  gameType: string;
  skillLevel: string;
}

export default function GamesPageClient({
  games,
  currentUserId,
  userJoinedGames,
}: GamesPageClientProps) {
  const [filters, setFilters] = useState<Filters>({
    location: '',
    gameType: '',
    skillLevel: '',
  });

  // Filter games based on current filter values
  const filteredGames = useMemo(() => {
    return games.filter(game => {
      // Location filter (case-insensitive partial match)
      if (filters.location && !game.location.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }

      // Game type filter
      if (filters.gameType && game.gameType !== filters.gameType) {
        return false;
      }

      // Skill level filter
      if (filters.skillLevel && game.skillLevel !== filters.skillLevel) {
        return false;
      }

      return true;
    });
  }, [games, filters]);

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      location: '',
      gameType: '',
      skillLevel: '',
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <>
      {/* Filters */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Filter Games</h3>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear all filters
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              placeholder="Enter city or area"
              value={filters.location}
              onChange={e => handleFilterChange('location', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Game Type</label>
            <select
              value={filters.gameType}
              onChange={e => handleFilterChange('gameType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              <option value="CASUAL">Casual</option>
              <option value="COMPETITIVE">Competitive</option>
              <option value="PICKUP">Pickup</option>
              <option value="TOURNAMENT">Tournament</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Skill Level</label>
            <select
              value={filters.skillLevel}
              onChange={e => handleFilterChange('skillLevel', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Levels</option>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
              <option value="EXPERT">Expert</option>
            </select>
          </div>
        </div>

        {/* Filter Summary */}
        {hasActiveFilters && (
          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-800">
              Showing {filteredGames.length} of {games.length} games
              {filters.location && ` in "${filters.location}"`}
              {filters.gameType && ` • ${filters.gameType.toLowerCase()} games`}
              {filters.skillLevel && ` • ${filters.skillLevel.toLowerCase()} skill level`}
            </p>
          </div>
        )}
      </div>

      {/* Games Grid */}
      {filteredGames.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">⚽</div>
          {hasActiveFilters ? (
            <>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No games match your filters</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search criteria or clearing the filters to see more games.
              </p>
              <div className="space-x-4">
                <Button variant="outline" onClick={handleClearFilters}>
                  Clear Filters
                </Button>
                <Link href="/games/create">
                  <Button>Create New Game</Button>
                </Link>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No games found</h3>
              <p className="text-gray-600 mb-6">
                Be the first to organize a game in your area!
              </p>
              <Link href="/games/create">
                <Button>Create the First Game</Button>
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.map(game => (
            <GameCard
              key={game.id}
              game={game}
              currentUserId={currentUserId}
              userJoinedGames={userJoinedGames}
            />
          ))}
        </div>
      )}

      {filteredGames.length > 0 && (
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Showing {filteredGames.length} game{filteredGames.length !== 1 ? 's' : ''}
            {hasActiveFilters && ` (filtered from ${games.length} total)`}
          </p>
        </div>
      )}
    </>
  );
}