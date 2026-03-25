"use client";

import { Fuel, TrendingUp, Droplets, Receipt } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/navbar";
import { AddRefuelDialog } from "@/components/add-refuel-dialog";
import { DailyRefuels } from "@/components/daily-refuels";
import { useVehicles } from "@/hooks/use-vehicles";
import { useRefuels } from "@/hooks/use-refuels";
import { getTodayRefuels, getConsumption } from "@/lib/refuels";

export default function PleinsPage() {
  const { vehicles, loaded: vehiclesLoaded } = useVehicles();
  const { refuels, loaded: refuelsLoaded, addRefuel, removeRefuel } = useRefuels();

  const loaded = vehiclesLoaded && refuelsLoaded;
  const todayRefuels = getTodayRefuels(refuels);
  const todayLiters = todayRefuels.reduce((sum, r) => sum + r.liters, 0);
  const todayCost = todayRefuels.reduce((sum, r) => sum + r.totalCost, 0);
  const consumption = getConsumption(refuels);

  return (
    <div className="noise-bg flex min-h-dvh flex-col bg-base">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pt-8 pb-20 sm:px-6 sm:pb-16">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-fuel-light">
              <Fuel className="size-5 text-fuel" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-text-primary">
                Pleins
              </h1>
              <p className="text-sm text-text-muted">
                {loaded
                  ? `${refuels.length} plein${refuels.length !== 1 ? "s" : ""} enregistré${refuels.length !== 1 ? "s" : ""}`
                  : "Chargement…"}
              </p>
            </div>
          </div>
          <AddRefuelDialog vehicles={vehicles} onAdd={addRefuel} />
        </div>

        {/* Today stats */}
        {loaded && (
          <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Card className="border-0 shadow-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Droplets className="size-4 text-fuel" strokeWidth={1.5} />
                  <span className="text-xs font-medium text-text-secondary">Aujourd&apos;hui</span>
                </div>
                <p className="mt-2 font-mono text-xl font-semibold tabular-nums text-text-primary">
                  {todayLiters.toFixed(1)}
                  <span className="ml-1 text-xs font-normal text-text-muted">L</span>
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Receipt className="size-4 text-fuel" strokeWidth={1.5} />
                  <span className="text-xs font-medium text-text-secondary">Coût du jour</span>
                </div>
                <p className="mt-2 font-mono text-xl font-semibold tabular-nums text-fuel">
                  {todayCost.toFixed(2)}
                  <span className="ml-1 text-xs font-normal text-text-muted">€</span>
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="size-4 text-fuel" strokeWidth={1.5} />
                  <span className="text-xs font-medium text-text-secondary">Conso. moyenne</span>
                </div>
                <p className="mt-2 font-mono text-xl font-semibold tabular-nums text-text-primary">
                  {consumption !== null ? consumption.toFixed(1) : "—"}
                  <span className="ml-1 text-xs font-normal text-text-muted">L/100km</span>
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Fuel className="size-4 text-fuel" strokeWidth={1.5} />
                  <span className="text-xs font-medium text-text-secondary">Total pleins</span>
                </div>
                <p className="mt-2 font-mono text-xl font-semibold tabular-nums text-text-primary">
                  {refuels.reduce((sum, r) => sum + r.liters, 0).toFixed(0)}
                  <span className="ml-1 text-xs font-normal text-text-muted">L</span>
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Daily entries */}
        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-primary">Historique</h2>
            {refuels.length > 0 && (
              <Badge variant="outline" className="text-[10px] text-text-muted">
                {refuels.length} entrée{refuels.length > 1 ? "s" : ""}
              </Badge>
            )}
          </div>
          {loaded && (
            <DailyRefuels
              refuels={refuels}
              vehicles={vehicles}
              onDelete={removeRefuel}
            />
          )}
        </div>
      </main>
    </div>
  );
}
