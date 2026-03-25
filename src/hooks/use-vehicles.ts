"use client";

import { useCallback, useEffect, useState } from "react";
import {
  type Vehicle,
  getVehicles,
  addVehicle as addVehicleToStorage,
  deleteVehicle as deleteVehicleFromStorage,
} from "@/lib/vehicles";

export function useVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setVehicles(getVehicles());
    setLoaded(true);
  }, []);

  const addVehicle = useCallback(
    (data: Omit<Vehicle, "id" | "createdAt">) => {
      const vehicle = addVehicleToStorage(data);
      setVehicles((prev) => [...prev, vehicle]);
      return vehicle;
    },
    []
  );

  const removeVehicle = useCallback((id: string) => {
    const updated = deleteVehicleFromStorage(id);
    setVehicles(updated);
  }, []);

  return { vehicles, loaded, addVehicle, removeVehicle };
}
