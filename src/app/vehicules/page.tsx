"use client";

import { useReducedMotion, AnimatePresence } from "motion/react";
import { useVehicles } from "@/hooks/use-vehicles";
import { VehicleCard, EmptyVehicles } from "@/components/vehicle-card";
import { AddVehicleDialog } from "@/components/add-vehicle-dialog";
import { Navbar } from "@/components/navbar";
import { Car } from "lucide-react";

export default function VehiculesPage() {
  const { vehicles, loaded, addVehicle, removeVehicle } = useVehicles();
  const reducedMotion = useReducedMotion() ?? false;

  return (
    <div className="noise-bg flex min-h-dvh flex-col bg-base">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pt-8 pb-16 sm:px-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-fuel-light">
              <Car className="size-5 text-fuel" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-text-primary">
                Véhicules
              </h1>
              <p className="text-sm text-text-muted">
                {loaded
                  ? `${vehicles.length} véhicule${vehicles.length !== 1 ? "s" : ""} enregistré${vehicles.length !== 1 ? "s" : ""}`
                  : "Chargement…"}
              </p>
            </div>
          </div>
          <AddVehicleDialog onAdd={addVehicle} />
        </div>

        {/* Vehicle list */}
        <div className="mt-8">
          {loaded && vehicles.length === 0 ? (
            <EmptyVehicles />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {vehicles.map((v, i) => (
                  <VehicleCard
                    key={v.id}
                    vehicle={v}
                    index={i}
                    reducedMotion={reducedMotion}
                    onDelete={removeVehicle}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
