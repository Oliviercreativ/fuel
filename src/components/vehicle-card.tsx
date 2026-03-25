"use client";

import { motion } from "motion/react";
import { Car, Fuel, MapPin, Trash2, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { type Vehicle, FUEL_TYPES, getVehicleInitials } from "@/lib/vehicles";
import { useState } from "react";

function getFuelLabel(fuelType: string) {
  return FUEL_TYPES.find((f) => f.value === fuelType)?.label ?? fuelType;
}

type VehicleCardProps = {
  vehicle: Vehicle;
  index: number;
  reducedMotion: boolean;
  onDelete: (id: string) => void;
};

export function VehicleCard({ vehicle, index, reducedMotion, onDelete }: VehicleCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const initials = getVehicleInitials(vehicle);

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reducedMotion ? undefined : { opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      layout={!reducedMotion}
    >
      <Card className="group border-0 shadow-card transition-all duration-200 hover:shadow-elevated hover:-translate-y-0.5">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div
              className="flex size-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold shadow-card"
              style={{
                backgroundColor: vehicle.color,
                color: isLightColor(vehicle.color) ? "#1C1917" : "#FAFAF9",
              }}
              aria-hidden="true"
            >
              {initials}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-sm font-semibold text-text-primary">
                  {vehicle.brand} {vehicle.model}
                </h3>
                <Badge
                  variant="secondary"
                  className="shrink-0 text-[10px] font-semibold"
                >
                  {getFuelLabel(vehicle.fuelType)}
                </Badge>
              </div>

              <p className="mt-0.5 font-mono text-xs tracking-wider text-text-muted">
                {vehicle.plate}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-text-secondary">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="size-3 text-text-muted" strokeWidth={1.5} />
                  {vehicle.year}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3 text-text-muted" strokeWidth={1.5} />
                  <span className="font-mono tabular-nums">
                    {vehicle.km.toLocaleString("fr-FR")}
                  </span>{" "}
                  km
                </span>
              </div>
            </div>

            {/* Delete */}
            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
              <DialogTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="shrink-0 cursor-pointer text-text-muted opacity-0 transition-opacity duration-150 hover:text-danger group-hover:opacity-100"
                  />
                }
              >
                <Trash2 className="size-3.5" />
                <span className="sr-only">Supprimer {vehicle.name}</span>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Supprimer ce véhicule ?</DialogTitle>
                  <DialogDescription>
                    {vehicle.brand} {vehicle.model} ({vehicle.plate}) sera
                    définitivement supprimé. Cette action est irréversible.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="ghost"
                    className="cursor-pointer"
                    onClick={() => setConfirmOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button
                    className="cursor-pointer bg-danger text-white hover:bg-danger/90"
                    onClick={() => {
                      onDelete(vehicle.id);
                      setConfirmOpen(false);
                    }}
                  >
                    Supprimer
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function EmptyVehicles() {
  return (
    <Card className="border-dashed border-border/60 bg-transparent shadow-none">
      <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
          <Car className="size-7 text-text-muted" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-sm font-medium text-text-primary">
            Aucun véhicule enregistré
          </p>
          <p className="mt-1 text-xs text-text-muted">
            Ajoutez votre premier véhicule pour commencer le suivi.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export { EmptyVehicles };

function isLightColor(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 160;
}
