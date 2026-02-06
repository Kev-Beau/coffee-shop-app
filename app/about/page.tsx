import Link from "next/link";
import { Search, Star, Users } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-lighter to-primary-light">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 bg-white shadow-sm">
        <Link href="/" className="text-2xl font-bold text-primary-dark flex items-center gap-2">
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M2,21V19H20V21H2M20,8V5H18V8H20M20,3A2,2 0 0,1 22,5V8A2,2 0 0,1 20,10H18V13A4,4 0 0,1 14,17H8A4,4 0 0,1 4,13V3H20M16,5H6V13A2,2 0 0,0 8,15H14A2,2 0 0,0 16,13V5Z" />
          </svg>
          Beany
        </Link>
        <div className="flex gap-6">
          <Link href="/shops" className="text-gray-700 hover:text-primary transition">
            Find Shops
          </Link>
          <Link href="/about" className="text-primary font-semibold">
            About
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white rounded-2xl shadow-lg p-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            About Beany
          </h1>

          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-gray-700 mb-8">
              Beany is a social platform designed to help coffee
              enthusiasts discover and share the best local coffee shops with
              friends.
            </p>

            <div className="bg-primary-lighter p-6 rounded-xl mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-gray-700">
                We believe that great coffee is more than just a beverage – it's
                an experience to be shared. Beany connects you with the
                best coffee spots in your area and helps you discover where your
                friends are enjoying their favorite brews.
              </p>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-4">
                <div className="w-16 h-16 mx-auto mb-3 flex items-center justify-center bg-primary-light rounded-full">
                  <Search className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Discover</h3>
                <p className="text-gray-600 text-sm">
                  Browse coffee shops in your area with detailed info about
                  amenities, atmosphere, and more
                </p>
              </div>
              <div className="text-center p-4">
                <div className="w-16 h-16 mx-auto mb-3 flex items-center justify-center bg-primary-light rounded-full">
                  <Star className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Review</h3>
                <p className="text-gray-600 text-sm">
                  Share your experiences and help others find great spots
                </p>
              </div>
              <div className="text-center p-4">
                <div className="w-16 h-16 mx-auto mb-3 flex items-center justify-center bg-primary-light rounded-full">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Connect</h3>
                <p className="text-gray-600 text-sm">
                  See where friends are going and plan coffee meetups
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Features Coming Soon
            </h2>
            <ul className="space-y-2 text-gray-700 mb-8">
              <li className="flex items-start gap-2">
                <span className="text-accent">✓</span>
                <span>Friend recommendations based on your taste</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent">✓</span>
                <span>Interactive maps with real-time availability</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent">✓</span>
                <span>Social features for planning coffee meetups</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent">✓</span>
                <span>Photo sharing and coffee shop check-ins</span>
              </li>
            </ul>

            <div className="border-t border-gray-200 pt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Built With
              </h2>
              <div className="flex flex-wrap gap-3">
                <span className="px-4 py-2 bg-gray-100 rounded-full text-sm font-medium">
                  Next.js 16
                </span>
                <span className="px-4 py-2 bg-gray-100 rounded-full text-sm font-medium">
                  TypeScript
                </span>
                <span className="px-4 py-2 bg-gray-100 rounded-full text-sm font-medium">
                  Tailwind CSS
                </span>
                <span className="px-4 py-2 bg-gray-100 rounded-full text-sm font-medium">
                  React 19
                </span>
              </div>
            </div>
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
