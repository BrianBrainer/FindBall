import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import GameForm from '@/components/forms/GameForm'
// import { getAuthStatus } from '@/lib/mockAuth'

export default async function CreateGamePage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin?callbackUrl=/games/create')
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Game</h1>
          <p className="text-gray-600 mt-2">
            Organize a football game and build your local community
          </p>
        </div>
      </div>

      <div className="max-w-4xl">
        <GameForm />
      </div>
    </div>
  )

  // MOCK AUTH FALLBACK (commented out - uncomment if auth issues)
  // // Mock authentication check
  // const isAuthenticated = getAuthStatus() === 'authenticated'
  // 
  // if (!isAuthenticated) {
  //   return (
  //     <div className="max-w-2xl mx-auto px-4 py-8 text-center">
  //       <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
  //       <p className="text-gray-600 mb-6">Please sign in to create a game.</p>
  //       <p className="text-sm text-blue-600">In this demo, click "Sign In" in the navigation to continue.</p>
  //     </div>
  //   )
  // }
  // 
  // return (
  //   <div className="max-w-4xl mx-auto px-4 py-8">
  //     <GameForm />
  //   </div>
  // )
}