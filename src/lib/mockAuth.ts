import { currentUser } from './mockData'

// Mock session state
let mockSession = {
  user: currentUser,
  expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
}

let isSignedIn = true

export const mockSessionAPI = {
  getSession: () => {
    return isSignedIn ? mockSession : null
  },
  
  signIn: async (provider?: string) => {
    // Simulate sign in delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    isSignedIn = true
    return { ok: true, error: null }
  },
  
  signOut: async () => {
    // Simulate sign out delay
    await new Promise(resolve => setTimeout(resolve, 500))
    isSignedIn = false
    return { ok: true }
  },
  
  getProviders: () => ({
    google: {
      id: 'google',
      name: 'Google',
      type: 'oauth',
      signinUrl: '/api/auth/signin/google',
      callbackUrl: '/api/auth/callback/google'
    }
  })
}

// Status helper
export const getAuthStatus = () => isSignedIn ? 'authenticated' : 'unauthenticated'