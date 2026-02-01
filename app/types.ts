export interface CoffeeShop {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  rating: number;
  reviewCount: number;
  priceRange: "$" | "$$" | "$$$" | "$$$$";
  tags: string[];
  image: string;
  hours: string;
  wifi: boolean;
  outlets: boolean;
  quiet: boolean;
}

export interface Review {
  id: string;
  shopId: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  helpful: number;
}
