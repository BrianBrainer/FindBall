'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GameFormData } from '@/types';
import { SKILL_LEVELS, GAME_TYPES } from '@/utils/constants';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';

export default function GameForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<GameFormData>({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: 90,
    location: '',
    maxPlayers: 22,
    pricePerPlayer: 10,
    gameType: 'CASUAL',
    skillLevel: 'INTERMEDIATE',
    isPublic: true,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : type === 'number'
            ? Number(value)
            : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.time) newErrors.time = 'Time is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (formData.maxPlayers < 2) newErrors.maxPlayers = 'At least 2 players required';
    if (formData.maxPlayers > 50) newErrors.maxPlayers = 'Maximum 50 players allowed';
    if (formData.pricePerPlayer < 0) newErrors.pricePerPlayer = 'Price cannot be negative';
    if (formData.duration < 30) newErrors.duration = 'Minimum 30 minutes required';
    if (formData.duration > 240) newErrors.duration = 'Maximum 4 hours allowed';

    // Validate date is in future
    const gameDateTime = new Date(`${formData.date}T${formData.time}`);
    if (gameDateTime <= new Date()) {
      newErrors.date = 'Game must be scheduled for the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create game');
      }

      const game = await response.json();
      router.push(`/games/${game.id}`);
    } catch (error) {
      console.error('Error creating game:', error);
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to create game' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <h2 className="text-2xl font-bold text-gray-900">Create New Game</h2>
        <p className="text-gray-600">Organize a football game and connect with local players</p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Game Title *"
            name="title"
            value={formData.title}
            onChange={handleChange}
            error={errors.title}
            placeholder="e.g., Sunday Morning Kickabout"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Tell players what to expect..."
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Date *"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              error={errors.date}
            />

            <Input
              label="Time *"
              name="time"
              type="time"
              value={formData.time}
              onChange={handleChange}
              error={errors.time}
            />
          </div>

          <Input
            label="Duration (minutes) *"
            name="duration"
            type="number"
            value={formData.duration}
            onChange={handleChange}
            error={errors.duration}
            min="30"
            max="240"
            step="15"
          />

          <Input
            label="Location *"
            name="location"
            value={formData.location}
            onChange={handleChange}
            error={errors.location}
            placeholder="e.g., Central Park Soccer Field"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Max Players *"
              name="maxPlayers"
              type="number"
              value={formData.maxPlayers}
              onChange={handleChange}
              error={errors.maxPlayers}
              min="2"
              max="50"
            />

            <Input
              label="Price per Player ($) *"
              name="pricePerPlayer"
              type="number"
              value={formData.pricePerPlayer}
              onChange={handleChange}
              error={errors.pricePerPlayer}
              min="0"
              step="0.01"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Game Type *</label>
              <select
                name="gameType"
                value={formData.gameType}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {GAME_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Skill Level *</label>
              <select
                name="skillLevel"
                value={formData.skillLevel}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {SKILL_LEVELS.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="isPublic"
              checked={formData.isPublic}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Make this game public (visible to all users)
            </label>
          </div>

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          <div className="flex space-x-3">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Creating...' : 'Create Game'}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
