import { Game, GameSignup, GameType, SkillLevel, User, GameStatus } from '@prisma/client'

// Re-export Prisma types
export type {
  User,
  Game,
  GameSignup,
  Payment,
  SkillLevel,
  GameType,
  GameStatus,
  SignupStatus,
  PaymentStatus,
} from '@prisma/client'

// Custom types for the application
export interface GameWithDetails extends Game {
  organizer: User
  signups: (GameSignup & { user: User })[]
  _count: {
    signups: number
  }
}

export interface UserProfile extends User {
  _count: {
    organizedGames: number
    gameSignups: number
  }
}

export interface GameFormData {
  title: string
  description?: string
  date: string
  time: string
  duration: number
  location: string
  maxPlayers: number
  pricePerPlayer: number
  gameType: GameType
  skillLevel: SkillLevel
  isPublic: boolean
}

export interface SignupFormData {
  gameId: string
  userId: string
}

export interface PaymentFormData {
  gameId: string
  amount: number
  currency: string
}

// Serialized types for client components
export interface SerializedUser {
  id: string
  name: string | null
  email: string
  emailVerified: string | null
  image: string | null
  password: string | null
  createdAt: string
  updatedAt: string
  phone: string | null
  location: string | null
  bio: string | null
  skillLevel: SkillLevel
}

export interface SerializedGameWithDetails {
  id: string
  title: string
  description: string | null
  date: string
  duration: number
  location: string
  latitude: number | null
  longitude: number | null
  maxPlayers: number
  currentPlayers: number
  pricePerPlayer: number
  gameType: GameType
  skillLevel: SkillLevel
  isPublic: boolean
  organizerId: string
  status: GameStatus
  createdAt: string
  updatedAt: string
  organizer: SerializedUser
  signups: (GameSignup & { user: SerializedUser, createdAt: string, updatedAt: string })[]
  _count: {
    signups: number
  }
}