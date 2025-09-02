import { format } from 'date-fns'

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

export function formatDate(date: Date | string, formatStr = 'PPP'): string {
  return format(new Date(date), formatStr)
}

export function formatTime(date: Date | string): string {
  return format(new Date(date), 'p')
}

export function formatGameDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (hours === 0) {
    return `${mins}min`
  }
  
  if (mins === 0) {
    return `${hours}h`
  }
  
  return `${hours}h ${mins}min`
}

export function formatSkillLevel(level: string): string {
  return level.charAt(0).toUpperCase() + level.slice(1).toLowerCase()
}

export function formatGameType(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()
}