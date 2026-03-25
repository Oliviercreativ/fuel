"use client";

import { useEffect, useState } from "react";
import { Plus, Fuel, Star, MapPin } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type Vehicle, FUEL_TYPES } from "@/lib/vehicles";
import type { FuelType } from "@/lib/vehicles";
import type { FuelPrices } from "@/app/api/fuel-prices/route";
import { type FavoriteStation, getFavorites, getStationPrice } from "@/lib/favorites";

type AddRefuelDialogProps = {
  vehicles: Vehicle[];
  onAdd: (data: {
    vehicleId: string;
    fuelType: FuelType;
    liters: number;
    km: number;
    pricePerLiter: number;
    date: string;
  }) => void;
};

const FUEL_PRICE_KEYS: Record<FuelType, keyof Omit<FuelPrices, "stations" | "updatedAt">> = {
  e10: "e10",
  sp95: "sp95",
  sp98: "sp98",
  gazole: "gazole",
  e85: "e85",
  gplc: "gplc",
};

type PriceSource = "station" | "average" | "manual";

export function AddRefuelDialog({ vehicles, onAdd }: AddRefuelDialogProps) {
  const [open, setOpen] = useState(false);
  const [vehicleId, setVehicleId] = useState("");
  const [liters, setLiters] = useState("");
  const [km, setKm] = useState("");
  const [pricePerLiter, setPricePerLiter] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [prices, setPrices] = useState<FuelPrices | null>(null);
  const [userEditedPrice, setUserEditedPrice] = useState(false);
  const [favorites, setFavorites] = useState<FavoriteStation[]>([]);
  const [selectedStationId, setSelectedStationId] = useState("");
  const [priceSource, setPriceSource] = useState<PriceSource>("average");

  // Load favorites + average prices on open
  useEffect(() => {
    if (!open) return;
    setFavorites(getFavorites());
    fetch("/api/fuel-prices")
      .then((res) => (res.ok ? res.json() : null))
      .then(setPrices)
      .catch(() => {});
  }, [open]);

  // Auto-select first vehicle on open
  useEffect(() => {
    if (open && vehicles.length > 0 && !vehicleId) {
      setVehicleId(vehicles[0].id);
    }
  }, [open, vehicles, vehicleId]);

  const selectedVehicle = vehicles.find((v) => v.id === vehicleId);
  const fuelType = selectedVehicle?.fuelType ?? "e10";
  const selectedStation = favorites.find((f) => f.id === selectedStationId);

  // Auto-fill price: station favorite > national average
  useEffect(() => {
    if (userEditedPrice) return;

    // Try station price first
    if (selectedStation) {
      const stationPrice = getStationPrice(selectedStation, fuelType);
      if (stationPrice) {
        setPricePerLiter(stationPrice.toFixed(3));
        setPriceSource("station");
        return;
      }
    }

    // Fallback to national average
    if (prices && selectedVehicle) {
      const key = FUEL_PRICE_KEYS[selectedVehicle.fuelType];
      const avgPrice = prices[key];
      if (avgPrice) {
        setPricePerLiter(avgPrice.toFixed(3));
        setPriceSource("average");
      }
    }
  }, [prices, selectedVehicle, selectedStation, fuelType, userEditedPrice]);

  const parsedLiters = parseFloat(liters) || 0;
  const parsedPrice = parseFloat(pricePerLiter) || 0;
  const estimatedCost = Math.round(parsedLiters * parsedPrice * 100) / 100;

  const canSubmit = vehicleId && parsedLiters > 0 && parsedPrice > 0 && date;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    onAdd({
      vehicleId,
      fuelType,
      liters: parsedLiters,
      km: parseInt(km) || 0,
      pricePerLiter: parsedPrice,
      date,
    });

    setLiters("");
    setKm("");
    setPricePerLiter("");
    setUserEditedPrice(false);
    setSelectedStationId("");
    setPriceSource("average");
    setDate(new Date().toISOString().split("T")[0]);
    setOpen(false);
  }

  function handleVehicleChange(id: string | null) {
    if (!id) return;
    setVehicleId(id);
    setUserEditedPrice(false);
    setPricePerLiter("");
  }

  function handleStationChange(id: string | null) {
    setSelectedStationId(id ?? "");
    setUserEditedPrice(false);
    setPricePerLiter("");
  }

  function handlePriceChange(value: string) {
    setPricePerLiter(value);
    setUserEditedPrice(true);
    setPriceSource("manual");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="h-9 cursor-pointer gap-2 rounded-xl bg-fuel px-4 text-sm font-semibold text-white shadow-none transition-all duration-150 hover:bg-fuel-dark focus-visible:ring-2 focus-visible:ring-fuel focus-visible:ring-offset-2 active:scale-[0.97]" />
        }
      >
        <Plus className="size-4" aria-hidden="true" />
        Nouveau plein
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter un plein</DialogTitle>
          <DialogDescription>
            {favorites.length > 0
              ? "Choisissez une station favorite pour un prix précis."
              : "Le prix moyen national est pré-rempli depuis data.gouv."}
          </DialogDescription>
        </DialogHeader>

        {vehicles.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Fuel className="size-8 text-text-muted" strokeWidth={1.5} />
            <p className="text-sm text-text-secondary">
              Ajoutez d&apos;abord un véhicule pour enregistrer un plein.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Vehicle + Date */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Véhicule *</Label>
                <Select value={vehicleId} onValueChange={handleVehicleChange}>
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.brand} {v.model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-10"
                />
              </div>
            </div>

            {/* Fuel type indicator */}
            {selectedVehicle && (
              <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm">
                <Fuel className="size-4 text-fuel" strokeWidth={1.5} />
                <span className="text-text-secondary">
                  Carburant :{" "}
                  <span className="font-semibold text-text-primary">
                    {FUEL_TYPES.find((f) => f.value === selectedVehicle.fuelType)?.label}
                  </span>
                </span>
              </div>
            )}

            {/* Station favorite */}
            {favorites.length > 0 && (
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5">
                  <Star className="size-3 fill-fuel text-fuel" strokeWidth={1.5} />
                  Station favorite
                </Label>
                <Select value={selectedStationId} onValueChange={handleStationChange}>
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue placeholder="Moyenne nationale (data.gouv)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      Moyenne nationale (data.gouv)
                    </SelectItem>
                    {favorites.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.name} — {f.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedStation && (
                  <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
                    <MapPin className="size-3" strokeWidth={1.5} />
                    {selectedStation.address}, {selectedStation.cp} {selectedStation.city}
                  </div>
                )}
              </div>
            )}

            {/* Liters + Price */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="liters">Litres *</Label>
                <Input
                  id="liters"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="35.50"
                  value={liters}
                  onChange={(e) => setLiters(e.target.value)}
                  className="h-10 font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="price">
                  Prix/L (€) *
                  <Badge
                    variant="outline"
                    className="ml-1.5 h-4 border-border/60 px-1.5 text-[9px] font-normal text-text-muted"
                  >
                    {priceSource === "station"
                      ? "station"
                      : priceSource === "average"
                        ? "moy. nat."
                        : "manuel"}
                  </Badge>
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.001"
                  min="0"
                  placeholder="1.899"
                  value={pricePerLiter}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  className="h-10 font-mono"
                />
              </div>
            </div>

            {/* Km */}
            <div className="space-y-1.5">
              <Label htmlFor="km-refuel">Kilométrage au compteur</Label>
              <Input
                id="km-refuel"
                type="number"
                min="0"
                placeholder="45 230"
                value={km}
                onChange={(e) => setKm(e.target.value)}
                className="h-10 font-mono"
              />
            </div>

            {/* Cost preview */}
            {parsedLiters > 0 && parsedPrice > 0 && (
              <div className="flex items-center justify-between rounded-lg border border-fuel/20 bg-fuel-light px-4 py-3">
                <span className="text-sm text-text-secondary">Coût estimé</span>
                <span className="font-mono text-lg font-semibold tabular-nums text-fuel">
                  {estimatedCost.toFixed(2)} €
                </span>
              </div>
            )}

            <DialogFooter>
              <Button
                type="submit"
                disabled={!canSubmit}
                className="h-10 cursor-pointer gap-2 rounded-xl bg-fuel px-6 text-sm font-semibold text-white shadow-none transition-all duration-150 hover:bg-fuel-dark disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Fuel className="size-4" aria-hidden="true" />
                Enregistrer le plein
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
