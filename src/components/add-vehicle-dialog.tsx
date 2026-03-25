"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FUEL_TYPES, VEHICLE_COLORS, type Vehicle, type FuelType } from "@/lib/vehicles";

type AddVehicleDialogProps = {
  onAdd: (data: Omit<Vehicle, "id" | "createdAt">) => void;
};

const currentYear = new Date().getFullYear();

export function AddVehicleDialog({ onAdd }: AddVehicleDialogProps) {
  const [open, setOpen] = useState(false);
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState(String(currentYear));
  const [plate, setPlate] = useState("");
  const [fuelType, setFuelType] = useState<FuelType>("e10");
  const [color, setColor] = useState<string>(VEHICLE_COLORS[0].value);
  const [km, setKm] = useState("");

  const canSubmit = brand.trim() && model.trim();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    onAdd({
      name: `${brand} ${model}`,
      brand: brand.trim(),
      model: model.trim(),
      year: parseInt(year) || currentYear,
      plate: plate.trim().toUpperCase(),
      fuelType,
      color,
      km: parseInt(km) || 0,
    });

    // Reset
    setBrand("");
    setModel("");
    setYear(String(currentYear));
    setPlate("");
    setFuelType("e10");
    setColor(VEHICLE_COLORS[0].value);
    setKm("");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="h-9 cursor-pointer gap-2 rounded-xl bg-fuel px-4 text-sm font-semibold text-white shadow-none transition-all duration-150 hover:bg-fuel-dark focus-visible:ring-2 focus-visible:ring-fuel focus-visible:ring-offset-2 active:scale-[0.97]" />
        }
      >
        <Plus className="size-4" aria-hidden="true" />
        Ajouter
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nouveau véhicule</DialogTitle>
          <DialogDescription>
            Ajoutez un véhicule pour suivre sa consommation.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Brand + Model */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="brand">Marque *</Label>
              <Input
                id="brand"
                placeholder="Peugeot"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="model">Modèle *</Label>
              <Input
                id="model"
                placeholder="308"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="h-10"
              />
            </div>
          </div>

          {/* Year + Plate */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="year">Année</Label>
              <Input
                id="year"
                type="number"
                min={1990}
                max={currentYear + 1}
                placeholder={String(currentYear)}
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="plate">Immatriculation</Label>
              <Input
                id="plate"
                placeholder="AB-123-CD"
                value={plate}
                onChange={(e) => setPlate(e.target.value)}
                className="h-10 font-mono uppercase tracking-wider"
              />
            </div>
          </div>

          {/* Fuel type + Km */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Carburant</Label>
              <Select value={fuelType} onValueChange={(v) => setFuelType(v as FuelType)}>
                <SelectTrigger className="h-10 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FUEL_TYPES.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="km">Kilométrage</Label>
              <Input
                id="km"
                type="number"
                min={0}
                placeholder="45 000"
                value={km}
                onChange={(e) => setKm(e.target.value)}
                className="h-10 font-mono"
              />
            </div>
          </div>

          {/* Color picker */}
          <div className="space-y-1.5">
            <Label>Couleur</Label>
            <div className="flex gap-2">
              {VEHICLE_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  title={c.label}
                  onClick={() => setColor(c.value)}
                  className={`size-8 cursor-pointer rounded-full border-2 transition-all duration-150 ${
                    color === c.value
                      ? "scale-110 border-fuel shadow-md"
                      : "border-transparent hover:scale-105"
                  }`}
                  style={{ backgroundColor: c.value }}
                  aria-label={c.label}
                />
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={!canSubmit}
              className="h-10 cursor-pointer gap-2 rounded-xl bg-fuel px-6 text-sm font-semibold text-white shadow-none transition-all duration-150 hover:bg-fuel-dark disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus className="size-4" aria-hidden="true" />
              Ajouter le véhicule
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
