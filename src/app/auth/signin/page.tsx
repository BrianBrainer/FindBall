'use client'

import { signIn, getProviders } from 'next-auth/react'
import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card, { CardContent, CardHeader } from '@/components/ui/Card'

export default function SignInPage() {
  const [providers, setProviders] = useState<any>(null)
  const [demoName, setDemoName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  useEffect(() => {
    const setUpProviders = async () => {
      const res = await getProviders()
      setProviders(res)
    }
    setUpProviders()
  }, [])
  
  const handleDemoSignIn = async () => {
    if (!demoName.trim()) return
    
    setIsLoading(true)
    await signIn('demo', { 
      name: demoName,
      callbackUrl: '/dashboard' 
    })
    setIsLoading(false)
  }

  const handleCredentialsAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) return
    
    setIsLoading(true)
    setError('')
    
    try {
      const result = await signIn('credentials', {
        email,
        password,
        isRegistering: isRegistering.toString(),
        callbackUrl: '/dashboard',
        redirect: false
      })

      if (result?.error) {
        setError(isRegistering ? 'Failed to create account. Email may already be in use.' : 'Invalid email or password')
      } else if (result?.ok && result?.url) {
        // Successfully signed in - redirect to the URL provided by NextAuth
        window.location.href = result.url
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Sign in to FindBall
            </h2>
            <p className="mt-2 text-gray-600">
              Join games and connect with local players
            </p>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-6">
            {/* Email/Password Form */}
            <form onSubmit={handleCredentialsAuth} className="space-y-4">
              <div className="space-y-4">
                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={!email.trim() || !password.trim() || isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? 'Please wait...' : (isRegistering ? 'Create Account' : 'Sign In')}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsRegistering(!isRegistering)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {isRegistering ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                </button>
              </div>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Demo Sign In
            <div className="border border-blue-200 bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Demo Mode</h3>
              <p className="text-sm text-blue-800 mb-3">
                Enter any name to sign in as a demo user
              </p>
              <Input
                label="Your Name"
                value={demoName}
                onChange={(e) => setDemoName(e.target.value)}
                placeholder="Enter your name"
                onKeyDown={(e) => e.key === 'Enter' && handleDemoSignIn()}
              />
              <Button
                onClick={handleDemoSignIn}
                disabled={!demoName.trim() || isLoading}
                className="w-full mt-2"
                size="lg"
                variant="outline"
              >
                {isLoading ? 'Signing in...' : 'Sign in as Demo User'}
              </Button>
            </div> */}
            
            {/* Other providers */}
            {providers && Object.values(providers)
              .filter((provider: any) => provider.id !== 'demo' && provider.id !== 'credentials')
              .map((provider: any) => (
                <div key={provider.name}>
                  <Button
                    onClick={() => signIn(provider.id, { callbackUrl: '/dashboard' })}
                    className="w-full"
                    size="lg"
                    variant="outline"
                  >
                    Sign in with {provider.name}
                  </Button>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}