export type FavoriteStation = {
  id: string;
  name: string;
  brand: string | null;
  address: string;
  city: string;
  cp: string;
  price_gazole: number | null;
  price_sp95: number | null;
  price_sp98: number | null;
  price_e10: number | null;
  price_e85: number | null;
  price_gplc: number | null;
  addedAt: string;
};

const STORAGE_KEY = "fueltrack-favorite-stations";

export function getFavorites(): FavoriteStation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveFavorites(favorites: FavoriteStation[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
}

export function addFavorite(station: Omit<FavoriteStation, "addedAt">): FavoriteStation {
  const favorites = getFavorites();
  if (favorites.some((f) => f.id === station.id)) return station as FavoriteStation;
  const fav: FavoriteStation = { ...station, addedAt: new Date().toISOString() };
  favorites.push(fav);
  saveFavorites(favorites);
  return fav;
}

export function removeFavorite(id: string) {
  const favorites = getFavorites().filter((f) => f.id !== id);
  saveFavorites(favorites);
  return favorites;
}

export function isFavorite(id: string): boolean {
  return getFavorites().some((f) => f.id === id);
}

export function getStationPrice(station: FavoriteStation, fuelType: string): number | null {
  const map: Record<string, number | null> = {
    gazole: station.price_gazole,
    sp95: station.price_sp95,
    sp98: station.price_sp98,
    e10: station.price_e10,
    e85: station.price_e85,
    gplc: station.price_gplc,
  };
  return map[fuelType] ?? null;
}
