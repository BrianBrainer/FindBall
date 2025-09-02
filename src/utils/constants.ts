export const SKILL_LEVELS = [
  { value: 'BEGINNER', label: 'Beginner' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'ADVANCED', label: 'Advanced' },
  { value: 'EXPERT', label: 'Expert' },
] as const

export const GAME_TYPES = [
  { value: 'CASUAL', label: 'Casual' },
  { value: 'COMPETITIVE', label: 'Competitive' },
  { value: 'PICKUP', label: 'Pickup' },
  { value: 'TOURNAMENT', label: 'Tournament' },
] as const

export const GAME_STATUS = [
  { value: 'OPEN', label: 'Open' },
  { value: 'FULL', label: 'Full' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'COMPLETED', label: 'Completed' },
] as const

export const DEFAULT_GAME_DURATION = 90 // minutes
export const MAX_GAME_DURATION = 240 // 4 hours
export const MIN_GAME_DURATION = 30 // 30 minutes