"use client";

import { useCallback, useEffect, useState } from "react";
import {
  type FavoriteStation,
  getFavorites,
  addFavorite as addFav,
  removeFavorite as removeFav,
} from "@/lib/favorites";

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteStation[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setFavorites(getFavorites());
    setLoaded(true);
  }, []);

  const addFavorite = useCallback((station: Omit<FavoriteStation, "addedAt">) => {
    const fav = addFav(station);
    setFavorites(getFavorites());
    return fav;
  }, []);

  const removeFavorite = useCallback((id: string) => {
    removeFav(id);
    setFavorites(getFavorites());
  }, []);

  const isFavorite = useCallback(
    (id: string) => favorites.some((f) => f.id === id),
    [favorites]
  );

  return { favorites, loaded, addFavorite, removeFavorite, isFavorite };
}
