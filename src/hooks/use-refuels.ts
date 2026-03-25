"use client";

import { useCallback, useEffect, useState } from "react";
import {
  type Refuel,
  getRefuels,
  addRefuel as addRefuelToStorage,
  deleteRefuel as deleteRefuelFromStorage,
} from "@/lib/refuels";

export function useRefuels() {
  const [refuels, setRefuels] = useState<Refuel[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setRefuels(getRefuels());
    setLoaded(true);
  }, []);

  const addRefuel = useCallback(
    (data: Omit<Refuel, "id" | "createdAt" | "totalCost">) => {
      const refuel = addRefuelToStorage(data);
      setRefuels((prev) => [...prev, refuel]);
      return refuel;
    },
    []
  );

  const removeRefuel = useCallback((id: string) => {
    const updated = deleteRefuelFromStorage(id);
    setRefuels(updated);
  }, []);

  return { refuels, loaded, addRefuel, removeRefuel };
}
