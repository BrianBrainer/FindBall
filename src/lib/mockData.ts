import { GameWithDetails, User, GameSignup } from '@/types'
import { Decimal } from '@prisma/client/runtime/library'

// Mock Users
export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'John Smith',
    email: 'john@example.com',
    emailVerified: new Date(),
    image: null,
    password: null,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    phone: '+1-555-0123',
    location: 'New York, NY',
    bio: 'Football enthusiast with 10+ years experience. Love organizing local games!',
    skillLevel: 'ADVANCED'
  },
  {
    id: 'user-2',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    emailVerified: new Date(),
    image: null,
    password: null,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
    phone: '+1-555-0124',
    location: 'Brooklyn, NY',
    bio: 'Weekend warrior looking for fun pickup games',
    skillLevel: 'INTERMEDIATE'
  },
  {
    id: 'user-3',
    name: 'Mike Chen',
    email: 'mike@example.com',
    emailVerified: new Date(),
    image: null,
    password: null,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
    phone: '+1-555-0125',
    location: 'Queens, NY',
    bio: 'Former college player, now just playing for fun',
    skillLevel: 'EXPERT'
  },
  {
    id: 'current-user',
    name: 'Alex Demo',
    email: 'demo@example.com',
    emailVerified: new Date(),
    image: null,
    password: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    phone: '+1-555-0100',
    location: 'Manhattan, NY',
    bio: 'Demo user account for testing',
    skillLevel: 'INTERMEDIATE'
  }
]

// Generate future dates for games
const today = new Date()
const tomorrow = new Date(today)
tomorrow.setDate(today.getDate() + 1)
const nextWeek = new Date(today)
nextWeek.setDate(today.getDate() + 7)
const nextMonth = new Date(today)
nextMonth.setMonth(today.getMonth() + 1)

// Mock Games
export const mockGames: GameWithDetails[] = [
  {
    id: 'game-1',
    title: 'Sunday Morning Kickabout',
    description: 'Casual game for all skill levels. Great way to start the weekend! We have goals, cones, and plenty of water. Just bring yourself and good vibes.',
    date: tomorrow,
    duration: 90,
    location: 'Central Park Soccer Field A',
    latitude: 40.7829,
    longitude: -73.9654,
    maxPlayers: 20,
    currentPlayers: 12,
    pricePerPlayer: new Decimal(15.00),
    gameType: 'CASUAL',
    skillLevel: 'INTERMEDIATE',
    isPublic: true,
    organizerId: 'user-1',
    status: 'OPEN',
    createdAt: new Date('2024-08-10'),
    updatedAt: new Date('2024-08-10'),
    organizer: mockUsers[0],
    signups: [],
    _count: { signups: 12 }
  },
  {
    id: 'game-2',
    title: 'Competitive 11v11 Match',
    description: 'Serious game for experienced players. Full pitch, referees provided. This is a competitive match so please come prepared for intense gameplay.',
    date: nextWeek,
    duration: 120,
    location: 'Randalls Island Field 3',
    latitude: 40.7947,
    longitude: -73.9249,
    maxPlayers: 22,
    currentPlayers: 18,
    pricePerPlayer: new Decimal(25.00),
    gameType: 'COMPETITIVE',
    skillLevel: 'ADVANCED',
    isPublic: true,
    organizerId: 'user-2',
    status: 'OPEN',
    createdAt: new Date('2024-08-08'),
    updatedAt: new Date('2024-08-08'),
    organizer: mockUsers[1],
    signups: [],
    _count: { signups: 18 }
  },
  {
    id: 'game-3',
    title: 'Thursday Evening Pickup',
    description: 'Quick game after work. Bring your energy and let\'s have some fun! Perfect for unwinding after a long day.',
    date: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    duration: 75,
    location: 'Brooklyn Bridge Park Field',
    latitude: 40.7009,
    longitude: -73.9969,
    maxPlayers: 16,
    currentPlayers: 16,
    pricePerPlayer: new Decimal(12.00),
    gameType: 'PICKUP',
    skillLevel: 'BEGINNER',
    isPublic: true,
    organizerId: 'user-3',
    status: 'FULL',
    createdAt: new Date('2024-08-09'),
    updatedAt: new Date('2024-08-09'),
    organizer: mockUsers[2],
    signups: [],
    _count: { signups: 16 }
  },
  {
    id: 'game-4',
    title: 'Weekend Tournament Prep',
    description: 'Training session for upcoming tournament. Focus on tactics and teamwork. Serious players only!',
    date: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    duration: 100,
    location: 'Queens Soccer Complex',
    latitude: 40.7282,
    longitude: -73.7949,
    maxPlayers: 18,
    currentPlayers: 8,
    pricePerPlayer: new Decimal(20.00),
    gameType: 'TOURNAMENT',
    skillLevel: 'EXPERT',
    isPublic: true,
    organizerId: 'user-1',
    status: 'OPEN',
    createdAt: new Date('2024-08-11'),
    updatedAt: new Date('2024-08-11'),
    organizer: mockUsers[0],
    signups: [],
    _count: { signups: 8 }
  },
  {
    id: 'game-5',
    title: 'Beginner Friendly Game',
    description: 'Perfect for newcomers to the sport! We\'ll focus on basics and having fun. No pressure, just enjoyment.',
    date: new Date(today.getTime() + 8 * 24 * 60 * 60 * 1000), // 8 days from now
    duration: 60,
    location: 'Prospect Park Meadow',
    latitude: 40.6602,
    longitude: -73.9690,
    maxPlayers: 14,
    currentPlayers: 6,
    pricePerPlayer: new Decimal(10.00),
    gameType: 'CASUAL',
    skillLevel: 'BEGINNER',
    isPublic: true,
    organizerId: 'user-2',
    status: 'OPEN',
    createdAt: new Date('2024-08-12'),
    updatedAt: new Date('2024-08-12'),
    organizer: mockUsers[1],
    signups: [],
    _count: { signups: 6 }
  },
  {
    id: 'current-user-game-1',
    title: 'My Organized Game',
    description: 'Game organized by the current demo user for testing dashboard functionality.',
    date: new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000),
    duration: 90,
    location: 'Demo Field Location',
    latitude: 40.7589,
    longitude: -73.9851,
    maxPlayers: 20,
    currentPlayers: 5,
    pricePerPlayer: new Decimal(15.00),
    gameType: 'CASUAL',
    skillLevel: 'INTERMEDIATE',
    isPublic: true,
    organizerId: 'current-user',
    status: 'OPEN',
    createdAt: new Date('2024-08-12'),
    updatedAt: new Date('2024-08-12'),
    organizer: mockUsers[3],
    signups: [],
    _count: { signups: 5 }
  }
]

// Mock Game Signups
export const mockGameSignups: GameSignup[] = [
  {
    id: 'signup-1',
    userId: 'current-user',
    gameId: 'game-1',
    status: 'CONFIRMED',
    position: null,
    createdAt: new Date('2024-08-11'),
    updatedAt: new Date('2024-08-11')
  },
  {
    id: 'signup-2',
    userId: 'current-user',
    gameId: 'game-2',
    status: 'PENDING_PAYMENT',
    position: null,
    createdAt: new Date('2024-08-12'),
    updatedAt: new Date('2024-08-12')
  },
  {
    id: 'signup-3',
    userId: 'current-user',
    gameId: 'game-4',
    status: 'WAITLISTED',
    position: 1,
    createdAt: new Date('2024-08-12'),
    updatedAt: new Date('2024-08-12')
  }
]

// Helper function to get games with signup details for dashboard
export const getGamesWithSignupsForUser = (userId: string) => {
  return mockGameSignups
    .filter(signup => signup.userId === userId)
    .map(signup => ({
      ...signup,
      game: mockGames.find(game => game.id === signup.gameId)!
    }))
}

// Helper function to get organized games for user
export const getOrganizedGamesForUser = (userId: string) => {
  return mockGames.filter(game => game.organizerId === userId)
}

// Current user for demo
export const currentUser = mockUsers[3] // Alex Demo