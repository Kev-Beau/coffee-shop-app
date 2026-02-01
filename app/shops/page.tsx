import Link from "next/link";
import { CoffeeShop } from "../types";

// Sample coffee shop data
const coffeeShops: CoffeeShop[] = [
  {
    id: "1",
    name: "The Roasted Bean",
    description: "Artisanal coffee with a cozy atmosphere and friendly baristas",
    address: "123 Main Street",
    city: "Downtown",
    rating: 4.7,
    reviewCount: 234,
    priceRange: "$$",
    tags: ["Artisan", "Cozy", "Pet-Friendly"],
    image: "☕",
    hours: "7am - 8pm",
    wifi: true,
    outlets: true,
    quiet: false,
  },
  {
    id: "2",
    name: "Brew & Canvas",
    description: "Coffee meets creativity - local art on every wall",
    address: "456 Arts District",
    city: "Midtown",
    rating: 4.5,
    reviewCount: 189,
    priceRange: "$$",
    tags: ["Art", "Creative", "Events"],
    image: "🎨",
    hours: "8am - 9pm",
    wifi: true,
    outlets: true,
    quiet: false,
  },
  {
    id: "3",
    name: "Quiet Corner Cafe",
    description: "Peaceful spot perfect for work and study",
    address: "789 University Ave",
    city: "University District",
    rating: 4.8,
    reviewCount: 412,
    priceRange: "$",
    tags: ["Quiet", "Work-Friendly", "Study"],
    image: "📚",
    hours: "6am - 10pm",
    wifi: true,
    outlets: true,
    quiet: true,
  },
  {
    id: "4",
    name: "Sunrise Espresso",
    description: "Start your day right with our award-winning espresso",
    address: "321 Sunrise Blvd",
    city: "Eastside",
    rating: 4.6,
    reviewCount: 156,
    priceRange: "$$",
    tags: ["Espresso", "Breakfast", "Quick"],
    image: "🌅",
    hours: "6am - 2pm",
    wifi: false,
    outlets: false,
    quiet: false,
  },
  {
    id: "5",
    name: "The Social Grind",
    description: "Meet new friends at our community-focused coffee house",
    address: "555 Community Lane",
    city: "Suburbs",
    rating: 4.4,
    reviewCount: 98,
    priceRange: "$",
    tags: ["Social", "Community", "Games"],
    image: "🤝",
    hours: "7am - 11pm",
    wifi: true,
    outlets: false,
    quiet: false,
  },
  {
    id: "6",
    name: "Organic Earth Brew",
    description: "100% organic, fair-trade coffee in an eco-friendly space",
    address: "888 Green Way",
    city: "Westside",
    rating: 4.9,
    reviewCount: 267,
    priceRange: "$$$",
    tags: ["Organic", "Sustainable", "Vegan"],
    image: "🌱",
    hours: "7am - 7pm",
    wifi: true,
    outlets: true,
    quiet: true,
  },
];

export default function ShopsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 bg-white shadow-sm">
        <Link href="/" className="text-2xl font-bold text-amber-800">
          ☕ CoffeeConnect
        </Link>
        <div className="flex gap-6">
          <Link href="/shops" className="text-amber-700 font-semibold">
            Find Shops
          </Link>
          <Link href="/about" className="text-gray-700 hover:text-amber-700 transition">
            About
          </Link>
        </div>
      </nav>

      {/* Page Header */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Explore Coffee Shops
          </h1>
          <p className="text-lg text-gray-600">
            Discover the best coffee spots in your area
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          <button className="px-4 py-2 bg-amber-700 text-white rounded-full text-sm font-medium">
            All Shops
          </button>
          <button className="px-4 py-2 bg-white text-gray-700 rounded-full text-sm font-medium hover:bg-amber-50 transition border border-amber-200">
            ☕ WiFi
          </button>
          <button className="px-4 py-2 bg-white text-gray-700 rounded-full text-sm font-medium hover:bg-amber-50 transition border border-amber-200">
            🔌 Outlets
          </button>
          <button className="px-4 py-2 bg-white text-gray-700 rounded-full text-sm font-medium hover:bg-amber-50 transition border border-amber-200">
            🔇 Quiet
          </button>
          <button className="px-4 py-2 bg-white text-gray-700 rounded-full text-sm font-medium hover:bg-amber-50 transition border border-amber-200">
            ⭐ Top Rated
          </button>
        </div>

        {/* Shop Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coffeeShops.map((shop) => (
            <Link
              key={shop.id}
              href={`/shops/${shop.id}`}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition p-6 group"
            >
              {/* Shop Icon */}
              <div className="text-6xl mb-4 group-hover:scale-110 transition">
                {shop.image}
              </div>

              {/* Shop Name */}
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {shop.name}
              </h2>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-amber-600 font-bold">⭐ {shop.rating}</span>
                <span className="text-gray-500 text-sm">
                  ({shop.reviewCount} reviews)
                </span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-3">
                {shop.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Amenities */}
              <div className="flex gap-3 text-sm text-gray-600 mb-3">
                {shop.wifi && <span>☕ WiFi</span>}
                {shop.outlets && <span>🔌 Outlets</span>}
                {shop.quiet && <span>🔇 Quiet</span>}
              </div>

              {/* Price & Location */}
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span className="font-medium">{shop.priceRange}</span>
                <span>{shop.city}</span>
              </div>
            </Link>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-500 text-sm mt-12">
        <p>Built with Next.js, TypeScript, and Tailwind CSS</p>
      </footer>
    </div>
  );
}
