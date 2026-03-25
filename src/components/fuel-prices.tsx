"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Fuel, Droplets, Leaf, Zap, CircleDot, FlameKindling } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { FuelPrices } from "@/app/api/fuel-prices/route";

type FuelConfig = {
  key: keyof Omit<FuelPrices, "stations" | "updatedAt">;
  label: string;
  fullName: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  gradient: string;
  iconColor: string;
};

const FUELS: FuelConfig[] = [
  {
    key: "e10",
    label: "E10",
    fullName: "Sans-plomb 95-E10",
    icon: Leaf,
    gradient: "from-emerald-500/10 to-emerald-500/5",
    iconColor: "text-emerald-600",
  },
  {
    key: "sp95",
    label: "SP95",
    fullName: "Sans-plomb 95",
    icon: Droplets,
    gradient: "from-fuel/10 to-fuel/5",
    iconColor: "text-fuel",
  },
  {
    key: "sp98",
    label: "SP98",
    fullName: "Sans-plomb 98",
    icon: Zap,
    gradient: "from-amber-500/10 to-amber-500/5",
    iconColor: "text-amber-600",
  },
  {
    key: "gazole",
    label: "Gazole",
    fullName: "Diesel",
    icon: Fuel,
    gradient: "from-stone-500/10 to-stone-500/5",
    iconColor: "text-stone-600",
  },
  {
    key: "e85",
    label: "E85",
    fullName: "Superéthanol",
    icon: FlameKindling,
    gradient: "from-green-500/10 to-green-500/5",
    iconColor: "text-green-600",
  },
  {
    key: "gplc",
    label: "GPLc",
    fullName: "GPL carburant",
    icon: CircleDot,
    gradient: "from-sky-500/10 to-sky-500/5",
    iconColor: "text-sky-600",
  },
];

function PriceSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="border-0 bg-muted/50 shadow-none">
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center gap-2">
              <div className="size-8 animate-pulse rounded-lg bg-subtle" />
              <div className="h-3.5 w-10 animate-pulse rounded bg-subtle" />
            </div>
            <div className="h-8 w-24 animate-pulse rounded bg-subtle" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function FuelPricesPanel() {
  const [prices, setPrices] = useState<FuelPrices | null>(null);
  const [error, setError] = useState(false);
  const reducedMotion = useReducedMotion() ?? false;

  useEffect(() => {
    fetch("/api/fuel-prices")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(setPrices)
      .catch(() => setError(true));
  }, []);

  if (error) {
    return (
      <Card className="border-danger/20 bg-danger-light/50 shadow-none">
        <CardContent className="p-4 text-center text-sm text-danger">
          Impossible de charger les prix carburants. Réessayez plus tard.
        </CardContent>
      </Card>
    );
  }

  if (!prices) return <PriceSkeleton />;

  const cheapest = Math.min(
    ...FUELS.map((f) => prices[f.key]).filter((v) => v > 0)
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {FUELS.map((fuel, i) => {
          const price = prices[fuel.key];
          const isCheapest = price === cheapest;
          const Icon = fuel.icon;

          return (
            <motion.div
              key={fuel.key}
              initial={reducedMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.25 }}
            >
              <Card
                className={`group cursor-default border-0 shadow-card transition-shadow duration-200 hover:shadow-elevated ${
                  isCheapest ? "ring-2 ring-emerald-500/20" : ""
                }`}
              >
                <CardContent className="relative overflow-hidden p-4">
                  {/* Gradient blob */}
                  <div
                    className={`absolute -right-6 -top-6 size-20 rounded-full bg-gradient-to-br ${fuel.gradient} opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100`}
                    aria-hidden="true"
                  />

                  <div className="relative flex items-center gap-2">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-muted/80">
                      <Icon className={`size-4 ${fuel.iconColor}`} strokeWidth={1.5} />
                    </div>
                    <span className="text-xs font-semibold tracking-wide text-text-secondary">
                      {fuel.label}
                    </span>
                    {isCheapest && (
                      <Badge className="ml-auto h-4 bg-emerald-500/10 px-1.5 text-[10px] font-semibold text-emerald-600 hover:bg-emerald-500/10">
                        ↓ min
                      </Badge>
                    )}
                  </div>

                  <div className="relative mt-3">
                    <p className="font-mono text-2xl font-semibold tabular-nums tracking-tight text-text-primary">
                      {price.toFixed(3)}
                      <span className="ml-1 text-xs font-normal tracking-normal text-text-muted">
                        €/L
                      </span>
                    </p>
                    <p className="mt-0.5 text-[11px] text-text-muted">{fuel.fullName}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-1.5 text-[11px] text-text-muted">
        <span className="inline-block size-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span>
          Moyenne nationale · <span className="font-mono tabular-nums">{prices.stations.toLocaleString("fr-FR")}</span> stations ·{" "}
          <a
            href="https://data.economie.gouv.fr"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 transition-colors duration-150 hover:text-fuel"
          >
            data.gouv.fr
          </a>
        </span>
      </div>
    </div>
  );
}
