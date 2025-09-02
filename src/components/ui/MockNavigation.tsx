'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { mockSessionAPI, getAuthStatus } from '@/lib/mockAuth'
import { currentUser } from '@/lib/mockData'
import Button from './Button'

export default function MockNavigation() {
  const [isSignedIn, setIsSignedIn] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  
  useEffect(() => {
    // Initialize auth state
    setIsSignedIn(getAuthStatus() === 'authenticated')
  }, [])
  
  const handleSignIn = async () => {
    setIsLoading(true)
    await mockSessionAPI.signIn()
    setIsSignedIn(true)
    setIsLoading(false)
  }
  
  const handleSignOut = async () => {
    setIsLoading(true)
    await mockSessionAPI.signOut()
    setIsSignedIn(false)
    setIsLoading(false)
  }
  
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">⚽ FindBall</span>
            </Link>
            
            <div className="hidden md:ml-8 md:flex md:space-x-4">
              <Link 
                href="/games" 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Find Games
              </Link>
              {isSignedIn && (
                <>
                  <Link 
                    href="/games/create" 
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Create Game
                  </Link>
                  <Link 
                    href="/dashboard" 
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Dashboard
                  </Link>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {isLoading ? (
              <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
            ) : isSignedIn ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-700">
                  Welcome, {currentUser.name}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  disabled={isLoading}
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={handleSignIn}
                disabled={isLoading}
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}