"use client";

import { useCallback, useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import { MapPin, Search, X, Building2, Tag, Star, Fuel } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Navbar } from "@/components/navbar";
import { StationCard, StationSkeleton } from "@/components/station-card";
import { useFavorites } from "@/hooks/use-favorites";
import type { IdfStation, IdfFacets } from "@/app/api/idf-stations/route";

function groupByCity(stations: IdfStation[]): [string, IdfStation[]][] {
  const map = new Map<string, IdfStation[]>();
  for (const s of stations) {
    const city = s.city || "Inconnu";
    const list = map.get(city) ?? [];
    list.push(s);
    map.set(city, list);
  }
  return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
}

export default function IdfPage() {
  const reducedMotion = useReducedMotion() ?? false;
  const { favorites, addFavorite, removeFavorite, isFavorite } = useFavorites();

  const [facets, setFacets] = useState<IdfFacets | null>(null);

  // Filters — null = no filter
  const [depcode, setDepcode] = useState<string | null>(null);
  const [cities, setCities] = useState<string[]>([]);
  const [brand, setBrand] = useState<string | null>(null);
  const [fuelFilter, setFuelFilter] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const [stations, setStations] = useState<IdfStation[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const LIMIT = 20;

  // Facets reload on every filter change (cascading AND)
  useEffect(() => {
    const params = new URLSearchParams({ action: "facets" });
    if (depcode) params.set("depcode", depcode);
    if (cities.length === 1) params.set("city", cities[0]);
    if (brand) params.set("brand", brand);
    if (fuelFilter) params.set("fuel", fuelFilter);
    fetch(`/api/idf-stations?${params}`)
      .then((res) => res.json())
      .then(setFacets)
      .catch(() => {});
  }, [depcode, cities, brand, fuelFilter]);

  // Reset downstream filters when department changes
  useEffect(() => {
    setCities([]);
  }, [depcode]);

  // Fetch stations
  const fetchStations = useCallback(
    (newOffset = 0) => {
      setLoading(true);

      if (cities.length > 1) {
        const fetches = cities.map((c) => {
          const params = new URLSearchParams({ limit: "100", offset: "0" });
          if (depcode) params.set("depcode", depcode);
          params.set("city", c);
          if (brand) params.set("brand", brand);
          if (fuelFilter) params.set("fuel", fuelFilter);
          return fetch(`/api/idf-stations?${params}`).then((res) => res.json());
        });

        Promise.all(fetches)
          .then((results) => {
            const all = results.flatMap((r) => r.stations as IdfStation[]);
            const unique = Array.from(new Map(all.map((s) => [s.id, s])).values());
            unique.sort((a, b) => (b.update ?? "").localeCompare(a.update ?? ""));
            setStations(unique);
            setTotalCount(unique.length);
            setOffset(0);
          })
          .catch(() => {})
          .finally(() => setLoading(false));
        return;
      }

      const params = new URLSearchParams({
        limit: String(LIMIT),
        offset: String(newOffset),
      });
      if (depcode) params.set("depcode", depcode);
      if (cities.length === 1) params.set("city", cities[0]);
      if (brand) params.set("brand", brand);
      if (fuelFilter) params.set("fuel", fuelFilter);

      fetch(`/api/idf-stations?${params}`)
        .then((res) => res.json())
        .then((data) => {
          if (newOffset === 0) {
            setStations(data.stations);
          } else {
            setStations((prev) => [...prev, ...data.stations]);
          }
          setTotalCount(data.total_count);
          setOffset(newOffset);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    },
    [depcode, cities, brand, fuelFilter]
  );

  useEffect(() => {
    fetchStations(0);
  }, [fetchStations]);

  function clearFilters() {
    setDepcode(null);
    setCities([]);
    setBrand(null);
    setFuelFilter(null);
  }

  function addCity(city: string | null) {
    if (!city) return;
    if (city === "__reset_cities__") {
      setCities([]);
      return;
    }
    if (!cities.includes(city)) {
      setCities((prev) => [...prev, city]);
    }
  }

  function removeCity(city: string) {
    setCities((prev) => prev.filter((c) => c !== city));
  }

  const hasFilters = depcode || cities.length > 0 || brand || fuelFilter;
  const hasMore = cities.length <= 1 && stations.length < totalCount;
  const depName = facets?.departments.find((d) => d.depcode === depcode)?.depname;

  function toggleFavorite(station: IdfStation) {
    if (isFavorite(station.id)) {
      removeFavorite(station.id);
    } else {
      addFavorite({
        id: station.id,
        name: station.name,
        brand: station.brand,
        address: station.address,
        city: station.city,
        cp: station.cp,
        price_gazole: station.price_gazole,
        price_sp95: station.price_sp95,
        price_sp98: station.price_sp98,
        price_e10: station.price_e10,
        price_e85: station.price_e85,
        price_gplc: station.price_gplc,
      });
    }
  }

  const availableCities = facets?.cities.filter((c) => !cities.includes(c.city)) ?? [];

  const displayedStations: IdfStation[] = showFavoritesOnly
    ? favorites.map((f) => ({
        id: f.id,
        name: f.name,
        brand: f.brand,
        address: f.address,
        city: f.city,
        cp: f.cp,
        depname: "",
        depcode: "",
        fuel: [],
        shortage: [],
        services: [],
        automate_24_24: null,
        update: f.addedAt,
        geo_point: null,
        price_gazole: f.price_gazole,
        price_sp95: f.price_sp95,
        price_sp98: f.price_sp98,
        price_e10: f.price_e10,
        price_e85: f.price_e85,
        price_gplc: f.price_gplc,
      }))
    : stations;

  return (
    <div className="noise-bg flex min-h-dvh flex-col bg-base">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pt-8 pb-20 sm:px-6 sm:pb-16">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-fuel-light">
              <MapPin className="size-5 text-fuel" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-text-primary">
                Stations Île-de-France
              </h1>
              <p className="text-sm text-text-muted">
                {totalCount} station{totalCount !== 1 ? "s" : ""}{" "}
                {depName ? `· ${depName}` : "· Tous les départements"}
                {cities.length > 0 &&
                  ` · ${cities.length} ville${cities.length > 1 ? "s" : ""}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasFilters && (
              <Button
                variant="ghost"
                className="cursor-pointer gap-1.5 text-sm text-text-muted hover:text-text-primary"
                onClick={clearFilters}
              >
                <X className="size-3.5" />
                Réinitialiser
              </Button>
            )}
            <Button
              variant={showFavoritesOnly ? "default" : "outline"}
              className={`cursor-pointer gap-1.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                showFavoritesOnly
                  ? "bg-fuel text-white hover:bg-fuel-dark"
                  : "border-border/60"
              }`}
              onClick={() => setShowFavoritesOnly((v) => !v)}
            >
              <Star
                className={`size-3.5 ${showFavoritesOnly ? "fill-white" : ""}`}
                strokeWidth={1.5}
              />
              Favoris
              {favorites.length > 0 && (
                <Badge
                  className={`ml-0.5 h-4 px-1.5 text-[10px] font-semibold ${
                    showFavoritesOnly
                      ? "bg-white/20 text-white hover:bg-white/20"
                      : "bg-fuel/10 text-fuel hover:bg-fuel/10"
                  }`}
                >
                  {favorites.length}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Tip */}
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-fuel-light px-4 py-2.5 text-xs text-fuel">
          <Star className="size-3.5 shrink-0" strokeWidth={1.5} />
          Ajoutez en favoris une station service pour calculer le prix du plein
        </div>

        {/* Filters */}
        <Card className="mt-4 border-0 shadow-card">
          <CardContent className="p-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {/* Department */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-medium text-text-secondary">
                  <Building2 className="size-3" strokeWidth={1.5} />
                  Département
                </label>
                <Select value={depcode} onValueChange={setDepcode}>
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue placeholder="Tous les départements" />
                  </SelectTrigger>
                  <SelectContent>
                    {facets?.departments.map((d) => (
                      <SelectItem key={d.depcode} value={d.depcode}>
                        {d.depcode} — {d.depname}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* City (multi-select) */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-medium text-text-secondary">
                  <MapPin className="size-3" strokeWidth={1.5} />
                  Villes
                  {cities.length > 0 && (
                    <span className="text-[10px] text-text-muted">
                      ({cities.length})
                    </span>
                  )}
                </label>
                <Select value={null} onValueChange={addCity} disabled={!depcode}>
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue
                      placeholder={
                        !depcode
                          ? "Choisir un département"
                          : cities.length > 0
                            ? `${cities.length} ville${cities.length > 1 ? "s" : ""} · Ajouter…`
                            : "Toutes les villes"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.length > 0 && (
                      <SelectItem
                        value="__reset_cities__"
                        className="text-text-muted"
                      >
                        Toutes les villes (réinitialiser)
                      </SelectItem>
                    )}
                    {availableCities.map((c) => (
                      <SelectItem key={c.city} value={c.city}>
                        {c.city} ({c.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Fuel type */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-medium text-text-secondary">
                  <Fuel className="size-3" strokeWidth={1.5} />
                  Carburant
                </label>
                <Select value={fuelFilter} onValueChange={setFuelFilter}>
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue placeholder="Tous les carburants" />
                  </SelectTrigger>
                  <SelectContent>
                    {facets?.fuels.map((f) => (
                      <SelectItem key={f.fuel} value={f.fuel}>
                        {f.fuel} ({f.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Brand */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-medium text-text-secondary">
                  <Tag className="size-3" strokeWidth={1.5} />
                  Enseigne
                </label>
                <Select value={brand} onValueChange={setBrand}>
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue placeholder="Toutes les enseignes" />
                  </SelectTrigger>
                  <SelectContent>
                    {facets?.brands.map((b) => (
                      <SelectItem key={b.brand} value={b.brand}>
                        {b.brand} ({b.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active filters badges */}
            {hasFilters && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {depName && (
                  <Badge
                    variant="secondary"
                    className="cursor-pointer gap-1 text-xs"
                    onClick={() => setDepcode(null)}
                  >
                    {depName}
                    <X className="size-3" />
                  </Badge>
                )}
                {cities.map((c) => (
                  <Badge
                    key={c}
                    variant="secondary"
                    className="cursor-pointer gap-1 text-xs"
                    onClick={() => removeCity(c)}
                  >
                    <MapPin className="size-2.5" />
                    {c}
                    <X className="size-3" />
                  </Badge>
                ))}
                {fuelFilter && (
                  <Badge
                    variant="secondary"
                    className="cursor-pointer gap-1 text-xs"
                    onClick={() => setFuelFilter(null)}
                  >
                    <Fuel className="size-2.5" />
                    {fuelFilter}
                    <X className="size-3" />
                  </Badge>
                )}
                {brand && (
                  <Badge
                    variant="secondary"
                    className="cursor-pointer gap-1 text-xs"
                    onClick={() => setBrand(null)}
                  >
                    {brand}
                    <X className="size-3" />
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results grouped by city */}
        <div className="mt-6">
          {loading && stations.length === 0 ? (
            <StationSkeleton />
          ) : displayedStations.length === 0 ? (
            <Card className="border-dashed border-border/60 bg-transparent shadow-none">
              <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
                  <Search className="size-7 text-text-muted" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    Aucune station trouvée
                  </p>
                  <p className="mt-1 text-xs text-text-muted">
                    Essayez d&apos;élargir vos critères de recherche.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {groupByCity(displayedStations).map(([cityName, cityStations]) => (
                <div key={cityName} className="mb-8 last:mb-0">
                  <div className="mb-3 flex items-center gap-2">
                    <MapPin className="size-4 text-fuel" strokeWidth={1.5} />
                    <h3 className="text-sm font-semibold text-text-primary">
                      {cityName}
                    </h3>
                    <Badge variant="secondary" className="text-[10px] font-semibold">
                      {cityStations.length} station{cityStations.length > 1 ? "s" : ""}
                    </Badge>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {cityStations.map((station, i) => (
                      <StationCard
                        key={`${station.id}-${i}`}
                        station={station}
                        index={i}
                        reducedMotion={reducedMotion}
                        isFavorite={isFavorite(station.id)}
                        onToggleFavorite={toggleFavorite}
                      />
                    ))}
                  </div>
                </div>
              ))}

              {hasMore && (
                <div className="mt-6 text-center">
                  <Button
                    variant="outline"
                    className="cursor-pointer rounded-xl border-border/60 px-8 text-sm font-medium"
                    onClick={() => fetchStations(offset + LIMIT)}
                    disabled={loading}
                  >
                    {loading
                      ? "Chargement…"
                      : `Voir plus (${totalCount - stations.length} restantes)`}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
