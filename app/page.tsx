import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      {/* Navigation - Sticky */}
      <nav className="sticky top-0 z-50 flex items-center justify-between p-6 bg-white shadow-md">
        <div className="text-2xl font-bold text-amber-800">☕ CoffeeConnect</div>
        <div className="flex gap-6">
          <Link href="/shops" className="text-gray-700 hover:text-amber-700 transition">
            Find Shops
          </Link>
          <Link href="/about" className="text-gray-700 hover:text-amber-700 transition">
            About
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            Discover Your Next
            <span className="block text-amber-700">Favorite Coffee Spot</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            Join friends in exploring the best local coffee shops. Share reviews,
            find hidden gems, and connect over your love of great coffee.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/shops"
              className="px-8 py-4 bg-amber-700 text-white rounded-full font-semibold hover:bg-amber-800 transition shadow-lg"
            >
              Explore Coffee Shops
            </Link>
            <Link
              href="/about"
              className="px-8 py-4 bg-white text-amber-700 rounded-full font-semibold hover:bg-amber-50 transition shadow-lg border border-amber-200"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition">
            <div className="text-4xl mb-4">📍</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Discover Local</h3>
            <p className="text-gray-600">
              Find coffee shops near you with detailed maps and directions
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition">
            <div className="text-4xl mb-4">⭐</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Share Reviews</h3>
            <p className="text-gray-600">
              Rate and review shops to help friends find the best spots
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Connect</h3>
            <p className="text-gray-600">
              See where your friends are going and plan coffee meetups
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-500 text-sm">
        <p>Built with Next.js, TypeScript, and Tailwind CSS</p>
      </footer>
    </div>
  );
}
