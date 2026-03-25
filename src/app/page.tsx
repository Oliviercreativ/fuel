"use client";

import {
  Fuel,
  TrendingUp,
  Car,
  Gauge,
  Droplets,
  ArrowRight,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FuelPricesPanel } from "@/components/fuel-prices";
import { Navbar } from "@/components/navbar";

const stats = [
  {
    label: "Litres suivis",
    value: "2 847",
    unit: "L",
    icon: Droplets,
    trend: "+12%",
    trendUp: true,
  },
  {
    label: "Véhicules",
    value: "3",
    unit: "",
    icon: Car,
    trend: null,
    trendUp: false,
  },
  {
    label: "Conso. moyenne",
    value: "6.8",
    unit: "L/100",
    icon: Gauge,
    trend: "-4%",
    trendUp: false,
  },
  {
    label: "Économies",
    value: "340",
    unit: "€",
    icon: TrendingUp,
    trend: "+18%",
    trendUp: true,
  },
];

function StatCard({
  label,
  value,
  unit,
  icon: Icon,
  trend,
  trendUp,
  index,
  reducedMotion,
}: {
  label: string;
  value: string;
  unit: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  trend: string | null;
  trendUp: boolean;
  index: number;
  reducedMotion: boolean;
}) {
  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 + index * 0.06, duration: 0.35, ease: "easeOut" }}
    >
      <Card className="group border-0 shadow-card transition-all duration-200 hover:shadow-elevated hover:-translate-y-0.5">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex size-9 items-center justify-center rounded-lg bg-fuel-light">
              <Icon className="size-[18px] text-fuel" strokeWidth={1.5} />
            </div>
            {trend && (
              <Badge
                className={`h-5 text-[11px] font-semibold ${
                  trendUp
                    ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-50"
                    : "bg-cyan-50 text-cyan-700 hover:bg-cyan-50"
                }`}
              >
                {trend}
              </Badge>
            )}
          </div>
          <div className="mt-4">
            <p className="font-mono text-[28px] font-semibold leading-none tabular-nums tracking-tight text-text-primary">
              {value}
              {unit && (
                <span className="ml-1 text-sm font-normal tracking-normal text-text-muted">
                  {unit}
                </span>
              )}
            </p>
            <p className="mt-1.5 text-[13px] text-text-secondary">{label}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function FuelGauge({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.7, duration: 0.3 }}
    >
      <Card className="mx-auto max-w-sm border-0 shadow-card">
        <CardContent className="flex items-center gap-4 p-4">
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-fuel shadow-fuel-glow"
            aria-hidden="true"
          >
            <Fuel className="size-5 text-white" strokeWidth={1.5} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-secondary">Réservoir simulé</span>
              <span className="font-mono text-sm font-semibold tabular-nums text-text-primary">
                72%
              </span>
            </div>
            <div
              className="mt-2 h-2 w-full overflow-hidden rounded-full bg-subtle"
              role="meter"
              aria-label="Niveau de réservoir simulé"
              aria-valuenow={72}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "72%" }}
                transition={{
                  delay: 0.9,
                  duration: reducedMotion ? 0 : 0.8,
                  ease: "easeOut",
                }}
                className="h-full rounded-full bg-gradient-to-r from-fuel to-fuel-dark"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function Home() {
  const reducedMotion = useReducedMotion() ?? false;

  return (
    <div className="noise-bg flex min-h-dvh flex-col bg-base">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-16 sm:px-6">
        {/* Hero */}
        <div className="flex flex-col items-center pt-16 lg:pt-24">
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Badge className="gap-1.5 border border-fuel/20 bg-fuel-light px-3 py-1 text-xs font-medium text-fuel hover:bg-fuel-light">
              <span className="inline-block size-1.5 animate-pulse rounded-full bg-fuel" />
              Prix en temps réel
            </Badge>
          </motion.div>

          <motion.h1
            initial={reducedMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.4 }}
            className="mt-6 text-center text-[clamp(2.25rem,5vw,3.5rem)] font-bold leading-[1.1] tracking-tight text-text-primary"
          >
            Suivez chaque litre,
            <br />
            <span className="text-fuel">maîtrisez chaque euro.</span>
          </motion.h1>

          <motion.p
            initial={reducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.3 }}
            className="mt-5 max-w-lg text-center text-base leading-relaxed text-text-secondary sm:text-lg"
          >
            FuelTrack centralise vos pleins, compare les prix et optimise votre
            budget carburant. Simple, précis, efficace.
          </motion.p>

          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22, duration: 0.3 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <Link href="/vehicules">
              <Button className="h-11 cursor-pointer gap-2 rounded-xl bg-fuel px-7 text-sm font-semibold text-white shadow-none transition-all duration-150 hover:bg-fuel-dark hover:shadow-elevated focus-visible:ring-2 focus-visible:ring-fuel focus-visible:ring-offset-2 active:scale-[0.97]">
                Commencer gratuitement
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
            </Link>
            <Button
              variant="outline"
              className="h-11 cursor-pointer rounded-xl border-border/60 px-7 text-sm font-medium text-text-primary shadow-none transition-all duration-150 hover:bg-muted hover:border-border focus-visible:ring-2 focus-visible:ring-fuel focus-visible:ring-offset-2"
            >
              Voir la démo
            </Button>
          </motion.div>
        </div>

        {/* Stats */}
        <section
          aria-label="Statistiques clés"
          className="mx-auto mt-20 grid w-full max-w-7xl grid-cols-2 gap-3 lg:grid-cols-4"
        >
          {stats.map((stat, i) => (
            <StatCard
              key={stat.label}
              {...stat}
              index={i}
              reducedMotion={reducedMotion}
            />
          ))}
        </section>

        <Separator className="mx-auto my-16 max-w-7xl bg-border/50" />

        {/* Fuel prices */}
        <section
          aria-label="Prix moyens des carburants"
          className="mx-auto w-full max-w-7xl"
        >
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-text-primary">
                  Prix moyens nationaux
                </h2>
                <p className="mt-0.5 text-sm text-text-muted">
                  Mis à jour en temps réel
                </p>
              </div>
              <Badge
                variant="outline"
                className="gap-1 border-border/60 text-[11px] text-text-muted"
              >
                <span className="text-base leading-none">🇫🇷</span> France
              </Badge>
            </div>
            <FuelPricesPanel />
          </motion.div>
        </section>

        <div className="mt-16">
          <FuelGauge reducedMotion={reducedMotion} />
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 py-6 text-center text-xs text-text-muted">
        FuelTrack &copy; 2026 — Fait avec précision
      </footer>
    </div>
  );
}
