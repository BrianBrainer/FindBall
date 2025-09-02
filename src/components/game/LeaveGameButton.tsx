'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'

interface LeaveGameButtonProps {
  gameId: string
  gameTitle: string
  className?: string
}

export default function LeaveGameButton({ gameId, gameTitle, className }: LeaveGameButtonProps) {
  const router = useRouter()
  const [isLeaving, setIsLeaving] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleLeaveGame = async () => {
    setIsLeaving(true)
    
    try {
      const response = await fetch(`/api/games/${gameId}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error('Failed to leave game')
      }

      // Force a hard refresh to ensure state is updated
      window.location.reload()
      
    } catch (error) {
      console.error('Error leaving game:', error)
      alert('Failed to leave the game. Please try again.')
    } finally {
      setIsLeaving(false)
      setShowConfirm(false)
    }
  }

  const handleCancel = () => {
    setShowConfirm(false)
  }

  if (showConfirm) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md mx-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Leave Game?
          </h3>
          <p className="text-gray-600 mb-6">
            Are you sure you want to leave "{gameTitle}"? This action cannot be undone.
          </p>
          <div className="flex space-x-3">
            <Button
              onClick={handleCancel}
              variant="outline"
              className="flex-1"
              disabled={isLeaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleLeaveGame}
              variant="outline"
              className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
              disabled={isLeaving}
            >
              {isLeaving ? 'Leaving...' : 'Leave Game'}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Button
      onClick={() => setShowConfirm(true)}
      variant="outline"
      className={`text-red-600 border-red-600 hover:bg-red-50 ${className}`}
      disabled={isLeaving}
    >
      Leave Game
    </Button>
  )
}