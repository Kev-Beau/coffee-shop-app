// LocalStorage keys
const VISITS_KEY = 'beany_visits';
const FAVORITES_KEY = 'beany_favorites';

// Types
export interface Visit {
  placeId: string;
  placeName: string;
  address: string;
  timestamp: number;
  date: string; // ISO date string
}

export interface Favorite {
  placeId: string;
  placeName: string;
  address: string;
  timestamp: number;
}

export interface ShopStats {
  totalVisits: number;
  uniqueShops: number;
  favoriteCount: number;
}

// Visit Management
export function getVisits(): Visit[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(VISITS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addVisit(placeId: string, placeName: string, address: string): void {
  if (typeof window === 'undefined') return;

  const visits = getVisits();
  const newVisit: Visit = {
    placeId,
    placeName,
    address,
    timestamp: Date.now(),
    date: new Date().toISOString(),
  };

  visits.push(newVisit);
  localStorage.setItem(VISITS_KEY, JSON.stringify(visits));
}

export function getVisitCount(placeId: string): number {
  const visits = getVisits();
  return visits.filter(v => v.placeId === placeId).length;
}

export function hasVisited(placeId: string): boolean {
  return getVisitCount(placeId) > 0;
}

export function getVisitsForShop(placeId: string): Visit[] {
  const visits = getVisits();
  return visits.filter(v => v.placeId === placeId);
}

export function getUniqueVisitedShops(): string[] {
  const visits = getVisits();
  const uniqueIds = new Set(visits.map(v => v.placeId));
  return Array.from(uniqueIds);
}

export function getRecentVisits(limit: number = 10): Visit[] {
  const visits = getVisits();
  return visits
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
}

// Favorite Management
export function getFavorites(): Favorite[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(FAVORITES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function isFavorite(placeId: string): boolean {
  const favorites = getFavorites();
  return favorites.some(f => f.placeId === placeId);
}

export function toggleFavorite(placeId: string, placeName: string, address: string): boolean {
  if (typeof window === 'undefined') return false;

  const favorites = getFavorites();
  const existingIndex = favorites.findIndex(f => f.placeId === placeId);

  if (existingIndex >= 0) {
    // Remove favorite
    favorites.splice(existingIndex, 1);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    return false; // Now not a favorite
  } else {
    // Add favorite
    const newFavorite: Favorite = {
      placeId,
      placeName,
      address,
      timestamp: Date.now(),
    };
    favorites.push(newFavorite);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    return true; // Now a favorite
  }
}

// Stats
export function getShopStats(): ShopStats {
  const visits = getVisits();
  const favorites = getFavorites();

  return {
    totalVisits: visits.length,
    uniqueShops: getUniqueVisitedShops().length,
    favoriteCount: favorites.length,
  };
}

// Clear all data (for testing)
export function clearAllData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(VISITS_KEY);
  localStorage.removeItem(FAVORITES_KEY);
}
