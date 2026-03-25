"use client";

import { motion, useReducedMotion } from "motion/react";
import { Fuel, Trash2, Calendar, Gauge } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { Refuel, DailySummary } from "@/lib/refuels";
import { getDailySummaries, formatDate } from "@/lib/refuels";
import type { Vehicle } from "@/lib/vehicles";
import { FUEL_TYPES } from "@/lib/vehicles";

type DailyRefuelsProps = {
  refuels: Refuel[];
  vehicles: Vehicle[];
  onDelete: (id: string) => void;
};

function getVehicleName(vehicles: Vehicle[], id: string) {
  const v = vehicles.find((v) => v.id === id);
  return v ? `${v.brand} ${v.model}` : "Véhicule inconnu";
}

function getFuelLabel(fuelType: string) {
  return FUEL_TYPES.find((f) => f.value === fuelType)?.label ?? fuelType;
}

export function DailyRefuels({ refuels, vehicles, onDelete }: DailyRefuelsProps) {
  const reducedMotion = useReducedMotion() ?? false;
  const summaries = getDailySummaries(refuels);

  if (summaries.length === 0) {
    return (
      <Card className="border-dashed border-border/60 bg-transparent shadow-none">
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
            <Fuel className="size-7 text-text-muted" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-sm font-medium text-text-primary">
              Aucun plein enregistré
            </p>
            <p className="mt-1 text-xs text-text-muted">
              Ajoutez votre premier plein pour voir le suivi ici.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {summaries.map((day, dayIndex) => (
        <motion.div
          key={day.date}
          initial={reducedMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: dayIndex * 0.05, duration: 0.25 }}
        >
          {/* Day header */}
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-text-muted" strokeWidth={1.5} />
              <span className="text-sm font-semibold text-text-primary">
                {formatDate(day.date)}
              </span>
              <Badge
                variant="secondary"
                className="text-[10px] font-semibold"
              >
                {day.entries.length} plein{day.entries.length > 1 ? "s" : ""}
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="font-mono tabular-nums text-text-secondary">
                {day.totalLiters.toFixed(1)} L
              </span>
              <span className="font-mono font-semibold tabular-nums text-fuel">
                {day.totalCost.toFixed(2)} €
              </span>
            </div>
          </div>

          {/* Entries */}
          <div className="space-y-2">
            {day.entries.map((entry, i) => (
              <Card key={entry.id} className="group border-0 shadow-card">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-fuel-light">
                    <Fuel className="size-4 text-fuel" strokeWidth={1.5} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-text-primary">
                        {getVehicleName(vehicles, entry.vehicleId)}
                      </span>
                      <Badge
                        variant="outline"
                        className="shrink-0 text-[10px]"
                      >
                        {getFuelLabel(entry.fuelType)}
                      </Badge>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-text-muted">
                      <span className="font-mono tabular-nums">
                        {entry.liters.toFixed(1)} L × {entry.pricePerLiter.toFixed(3)} €
                      </span>
                      {entry.km > 0 && (
                        <>
                          <Separator orientation="vertical" className="h-3" />
                          <span className="inline-flex items-center gap-1">
                            <Gauge className="size-3" strokeWidth={1.5} />
                            <span className="font-mono tabular-nums">
                              {entry.km.toLocaleString("fr-FR")} km
                            </span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <span className="shrink-0 font-mono text-sm font-semibold tabular-nums text-text-primary">
                    {entry.totalCost.toFixed(2)} €
                  </span>

                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="shrink-0 cursor-pointer text-text-muted opacity-0 transition-opacity duration-150 hover:text-danger group-hover:opacity-100"
                    onClick={() => onDelete(entry.id)}
                  >
                    <Trash2 className="size-3.5" />
                    <span className="sr-only">Supprimer</span>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
