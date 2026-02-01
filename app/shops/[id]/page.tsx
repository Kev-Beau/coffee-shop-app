import Link from "next/link";
import { CoffeeShop, Review } from "../../types";

// Detailed shop data
const shopDetails: Record<string, CoffeeShop> = {
  "1": {
    id: "1",
    name: "The Roasted Bean",
    description: "Artisanal coffee with a cozy atmosphere and friendly baristas. Our beans are roasted daily in-house, ensuring the freshest cup every time.",
    address: "123 Main Street",
    city: "Downtown",
    rating: 4.7,
    reviewCount: 234,
    priceRange: "$$",
    tags: ["Artisan", "Cozy", "Pet-Friendly", "Local Roaster"],
    image: "☕",
    hours: "7am - 8pm Daily",
    wifi: true,
    outlets: true,
    quiet: false,
  },
  "2": {
    id: "2",
    name: "Brew & Canvas",
    description: "Coffee meets creativity - local art on every wall. We host weekly art shows and provide a space for local artists to display their work.",
    address: "456 Arts District",
    city: "Midtown",
    rating: 4.5,
    reviewCount: 189,
    priceRange: "$$",
    tags: ["Art", "Creative", "Events", "Gallery"],
    image: "🎨",
    hours: "8am - 9pm Daily",
    wifi: true,
    outlets: true,
    quiet: false,
  },
  "3": {
    id: "3",
    name: "Quiet Corner Cafe",
    description: "Peaceful spot perfect for work and study. Our dedicated workspace areas feature comfortable seating and minimal distractions.",
    address: "789 University Ave",
    city: "University District",
    rating: 4.8,
    reviewCount: 412,
    priceRange: "$",
    tags: ["Quiet", "Work-Friendly", "Study", "Focus"],
    image: "📚",
    hours: "6am - 10pm Daily",
    wifi: true,
    outlets: true,
    quiet: true,
  },
  "4": {
    id: "4",
    name: "Sunrise Espresso",
    description: "Start your day right with our award-winning espresso. Quick service for morning commuters who demand quality.",
    address: "321 Sunrise Blvd",
    city: "Eastside",
    rating: 4.6,
    reviewCount: 156,
    priceRange: "$$",
    tags: ["Espresso", "Breakfast", "Quick", "Award-Winning"],
    image: "🌅",
    hours: "6am - 2pm Daily",
    wifi: false,
    outlets: false,
    quiet: false,
  },
  "5": {
    id: "5",
    name: "The Social Grind",
    description: "Meet new friends at our community-focused coffee house. Weekly game nights, open mic nights, and book clubs.",
    address: "555 Community Lane",
    city: "Suburbs",
    rating: 4.4,
    reviewCount: 98,
    priceRange: "$",
    tags: ["Social", "Community", "Games", "Events"],
    image: "🤝",
    hours: "7am - 11pm Daily",
    wifi: true,
    outlets: false,
    quiet: false,
  },
  "6": {
    id: "6",
    name: "Organic Earth Brew",
    description: "100% organic, fair-trade coffee in an eco-friendly space. Our cups are compostable and we donate to environmental causes.",
    address: "888 Green Way",
    city: "Westside",
    rating: 4.9,
    reviewCount: 267,
    priceRange: "$$$",
    tags: ["Organic", "Sustainable", "Vegan", "Eco-Friendly"],
    image: "🌱",
    hours: "7am - 7pm Daily",
    wifi: true,
    outlets: true,
    quiet: true,
  },
};

// Sample reviews
const reviews: Review[] = [
  {
    id: "1",
    shopId: "1",
    author: "Sarah M.",
    rating: 5,
    text: "Best coffee in town! The baristas are so friendly and the atmosphere is perfect for catching up with friends.",
    date: "2 days ago",
    helpful: 24,
  },
  {
    id: "2",
    shopId: "1",
    author: "James K.",
    rating: 4,
    text: "Great coffee and good WiFi for working. Can get busy on weekends though.",
    date: "1 week ago",
    helpful: 18,
  },
  {
    id: "3",
    shopId: "1",
    author: "Emily R.",
    rating: 5,
    text: "Their pour-over is amazing! And I love that they source beans locally.",
    date: "2 weeks ago",
    helpful: 15,
  },
];

interface ShopPageProps {
  params: Promise<{ id: string }>;
}

export default async function ShopPage({ params }: ShopPageProps) {
  const { id } = await params;
  const shop = shopDetails[id];

  if (!shop) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Shop Not Found</h1>
          <Link href="/shops" className="text-amber-700 hover:underline">
            Back to Shops
          </Link>
        </div>
      </div>
    );
  }

  const shopReviews = reviews.filter((r) => r.shopId === id);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 bg-white shadow-sm">
        <Link href="/" className="text-2xl font-bold text-amber-800">
          ☕ CoffeeConnect
        </Link>
        <div className="flex gap-6">
          <Link href="/shops" className="text-gray-700 hover:text-amber-700 transition">
            Find Shops
          </Link>
          <Link href="/about" className="text-gray-700 hover:text-amber-700 transition">
            About
          </Link>
        </div>
      </nav>

      {/* Back Button */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <Link
          href="/shops"
          className="inline-flex items-center text-amber-700 hover:underline mb-6"
        >
          ← Back to Shops
        </Link>

        {/* Shop Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{shop.name}</h1>
              <p className="text-gray-600">{shop.address}</p>
            </div>
            <div className="text-7xl">{shop.image}</div>
          </div>

          {/* Rating & Reviews */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-amber-600">
                ⭐ {shop.rating}
              </span>
              <span className="text-gray-500">({shop.reviewCount} reviews)</span>
            </div>
            <span className="text-2xl">{shop.priceRange}</span>
          </div>

          {/* Description */}
          <p className="text-gray-700 text-lg mb-6">{shop.description}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {shop.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Amenities */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-amber-50 rounded-xl">
            <div className="text-center">
              <div className="text-2xl mb-1">{shop.wifi ? "☕" : "❌"}</div>
              <div className="text-sm font-medium">WiFi</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">{shop.outlets ? "🔌" : "❌"}</div>
              <div className="text-sm font-medium">Outlets</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">{shop.quiet ? "🔇" : "🔊"}</div>
              <div className="text-sm font-medium">Quiet</div>
            </div>
          </div>

          {/* Hours */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-2 text-gray-700">
              <span className="font-semibold">🕐 Hours:</span>
              <span>{shop.hours}</span>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Reviews</h2>

          <div className="space-y-6">
            {shopReviews.map((review) => (
              <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-200 rounded-full flex items-center justify-center text-amber-800 font-bold">
                      {review.author[0]}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{review.author}</div>
                      <div className="text-sm text-gray-500">{review.date}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-amber-600 font-bold">
                    ⭐ {review.rating}
                  </div>
                </div>
                <p className="text-gray-700 mb-3">{review.text}</p>
                <button className="text-sm text-gray-500 hover:text-amber-700 transition">
                  👍 Helpful ({review.helpful})
                </button>
              </div>
            ))}
          </div>

          {/* Write Review Button */}
          <button className="w-full mt-6 py-3 bg-amber-700 text-white rounded-xl font-semibold hover:bg-amber-800 transition">
            Write a Review
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-500 text-sm mt-12">
        <p>Built with Next.js, TypeScript, and Tailwind CSS</p>
      </footer>
    </div>
  );
}
