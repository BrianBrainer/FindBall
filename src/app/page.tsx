import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card, { CardContent } from '@/components/ui/Card';

export default function Home() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="py-20 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Find Your Perfect Football Game</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Connect with local football players, join games in your area, and organize your own
            matches. Pay upfront, secure your spot, and get playing!
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/games">
              <Button size="lg">Find Games</Button>
            </Link>
            <Link href="/games/create">
              <Button variant="outline" size="lg">
                Organize a Game
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="text-center py-8">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold mb-3">Find Games</h3>
                <p className="text-gray-600">
                  Browse local football games by location, skill level, and time. Filter to find the
                  perfect match for you.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="text-center py-8">
                <div className="text-4xl mb-4">💳</div>
                <h3 className="text-xl font-semibold mb-3">Pay & Secure</h3>
                <p className="text-gray-600">
                  Pay upfront to secure your spot. No-shows are minimized, ensuring games actually
                  happen as planned.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="text-center py-8">
                <div className="text-4xl mb-4">⚽</div>
                <h3 className="text-xl font-semibold mb-3">Play & Enjoy</h3>
                <p className="text-gray-600">
                  Show up and play! Meet new players, improve your skills, and enjoy the beautiful
                  game.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-12">Join the Community</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-blue-100">Games Organized</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">1,200+</div>
              <div className="text-blue-100">Active Players</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-blue-100">Cities</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of players who have found their perfect game with FindBall.
          </p>
          <Link href="/games">
            <Button size="lg">Browse Games Now</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
