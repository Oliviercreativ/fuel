"use client";

import { motion } from "motion/react";
import {
  MapPin,
  Fuel,
  AlertTriangle,
  Wrench,
  CreditCard,
  Star,
  Navigation,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { IdfStation } from "@/app/api/idf-stations/route";

const FUEL_LABELS: Record<string, string> = {
  Gazole: "Gazole",
  SP95: "SP95",
  SP98: "SP98",
  E10: "E10",
  E85: "E85",
  GPLc: "GPLc",
};

type PriceEntry = {
  label: string;
  price: number | null;
};

function getPrices(station: IdfStation): PriceEntry[] {
  return [
    { label: "Gazole", price: station.price_gazole },
    { label: "SP95", price: station.price_sp95 },
    { label: "SP98", price: station.price_sp98 },
    { label: "E10", price: station.price_e10 },
    { label: "E85", price: station.price_e85 },
    { label: "GPLc", price: station.price_gplc },
  ].filter((p) => p.price !== null);
}

function formatUpdate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffH = Math.floor(diffMs / 3600000);

  if (diffH < 1) return "< 1h";
  if (diffH < 24) return `${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD === 1) return "Hier";
  return `${diffD}j`;
}

type StationCardProps = {
  station: IdfStation;
  index: number;
  reducedMotion: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: (station: IdfStation) => void;
};

export function StationCard({
  station,
  index,
  reducedMotion,
  isFavorite = false,
  onToggleFavorite,
}: StationCardProps) {
  const prices = getPrices(station);
  const hasShortage = station.shortage && station.shortage.length > 0;
  const is24h = station.automate_24_24 === "Oui";

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.25 }}
    >
      <Card
        className={`group h-full border-0 shadow-card transition-all duration-200 hover:shadow-elevated hover:-translate-y-0.5 ${
          isFavorite ? "ring-2 ring-fuel/20" : ""
        }`}
      >
        <CardContent className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-sm font-semibold text-text-primary">
                  {station.name}
                </h3>
                {is24h && (
                  <Badge className="shrink-0 bg-emerald-50 text-[10px] font-semibold text-emerald-600 hover:bg-emerald-50">
                    24/24
                  </Badge>
                )}
              </div>
              {station.brand && (
                <Badge
                  variant="secondary"
                  className="mt-1 text-[10px] font-semibold"
                >
                  {station.brand}
                </Badge>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <span className="text-[11px] text-text-muted">
                {station.update ? formatUpdate(station.update) : ""}
              </span>
              {onToggleFavorite && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="cursor-pointer"
                  onClick={() => onToggleFavorite(station)}
                  aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                >
                  <Star
                    className={`size-4 transition-colors duration-150 ${
                      isFavorite
                        ? "fill-fuel text-fuel"
                        : "text-text-muted hover:text-fuel"
                    }`}
                    strokeWidth={1.5}
                  />
                </Button>
              )}
            </div>
          </div>

          {/* Address */}
          <div className="mt-3 flex items-start gap-1.5 text-xs text-text-secondary">
            <MapPin className="mt-0.5 size-3 shrink-0 text-text-muted" strokeWidth={1.5} />
            <span>
              {station.address}, {station.cp} {station.city}
            </span>
          </div>

          {/* Prices grid */}
          {prices.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
              {prices.map(({ label, price }) => (
                <div
                  key={label}
                  className="rounded-lg bg-muted/60 px-2 py-1.5 text-center"
                >
                  <p className="text-[10px] font-medium text-text-muted">{label}</p>
                  <p className="font-mono text-sm font-semibold tabular-nums text-text-primary">
                    {price!.toFixed(3)}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Shortage */}
          {hasShortage && (
            <div className="mt-3 flex items-center gap-1.5 text-xs text-warning">
              <AlertTriangle className="size-3 shrink-0" strokeWidth={1.5} />
              <span>
                Rupture :{" "}
                {station.shortage
                  .filter((s, i, a) => a.indexOf(s) === i)
                  .map((s) => FUEL_LABELS[s] ?? s)
                  .join(", ")}
              </span>
            </div>
          )}

          {/* Services + Itinéraire */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              {station.services.includes("Automate CB 24") && (
                <span className="inline-flex items-center gap-1 text-[11px] text-text-muted">
                  <CreditCard className="size-3" strokeWidth={1.5} />
                  CB 24/24
                </span>
              )}
              {station.services.some((s) => s.includes("Lavage")) && (
                <span className="inline-flex items-center gap-1 text-[11px] text-text-muted">
                  <Wrench className="size-3" strokeWidth={1.5} />
                  Lavage
                </span>
              )}
              {station.services.includes("Bornes électriques") && (
                <span className="inline-flex items-center gap-1 text-[11px] text-text-muted">
                  <Fuel className="size-3" strokeWidth={1.5} />
                  Bornes EV
                </span>
              )}
              {station.services.length > 3 && (
                <span className="text-[11px] text-text-muted">
                  +{station.services.length - 3} services
                </span>
              )}
            </div>
            {station.geo_point && (
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${station.geo_point.lat},${station.geo_point.lon}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-fuel/10 px-2.5 py-1 text-[11px] font-medium text-fuel transition-colors duration-150 hover:bg-fuel/20"
              >
                <Navigation className="size-3" strokeWidth={1.5} />
                Itinéraire
              </a>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function StationSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="border-0 bg-muted/50 shadow-none">
          <CardContent className="space-y-3 p-5">
            <div className="h-4 w-32 animate-pulse rounded bg-subtle" />
            <div className="h-3 w-48 animate-pulse rounded bg-subtle" />
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="h-10 animate-pulse rounded-lg bg-subtle" />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
