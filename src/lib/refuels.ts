import type { FuelType } from "./vehicles";

export type Refuel = {
  id: string;
  vehicleId: string;
  fuelType: FuelType;
  liters: number;
  km: number;
  pricePerLiter: number;
  totalCost: number;
  date: string; // ISO date string YYYY-MM-DD
  createdAt: string;
};

export type DailySummary = {
  date: string;
  totalLiters: number;
  totalCost: number;
  entries: Refuel[];
};

const STORAGE_KEY = "fueltrack-refuels";

export function getRefuels(): Refuel[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveRefuels(refuels: Refuel[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(refuels));
}

export function addRefuel(data: Omit<Refuel, "id" | "createdAt" | "totalCost">): Refuel {
  const refuels = getRefuels();
  const newRefuel: Refuel = {
    ...data,
    id: crypto.randomUUID(),
    totalCost: Math.round(data.liters * data.pricePerLiter * 100) / 100,
    createdAt: new Date().toISOString(),
  };
  refuels.push(newRefuel);
  saveRefuels(refuels);
  return newRefuel;
}

export function deleteRefuel(id: string) {
  const refuels = getRefuels().filter((r) => r.id !== id);
  saveRefuels(refuels);
  return refuels;
}

export function getTodayRefuels(refuels: Refuel[]): Refuel[] {
  const today = new Date().toISOString().split("T")[0];
  return refuels.filter((r) => r.date === today);
}

export function getDailySummaries(refuels: Refuel[]): DailySummary[] {
  const grouped = new Map<string, Refuel[]>();

  for (const r of refuels) {
    const existing = grouped.get(r.date) ?? [];
    existing.push(r);
    grouped.set(r.date, existing);
  }

  return Array.from(grouped.entries())
    .map(([date, entries]) => ({
      date,
      totalLiters: Math.round(entries.reduce((sum, e) => sum + e.liters, 0) * 100) / 100,
      totalCost: Math.round(entries.reduce((sum, e) => sum + e.totalCost, 0) * 100) / 100,
      entries,
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getConsumption(refuels: Refuel[]): number | null {
  if (refuels.length < 2) return null;
  const sorted = [...refuels].sort((a, b) => a.km - b.km);
  const kmDiff = sorted[sorted.length - 1].km - sorted[0].km;
  if (kmDiff <= 0) return null;
  const totalLiters = sorted.slice(1).reduce((sum, r) => sum + r.liters, 0);
  return Math.round((totalLiters / kmDiff) * 100 * 100) / 100;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (dateStr === today.toISOString().split("T")[0]) return "Aujourd'hui";
  if (dateStr === yesterday.toISOString().split("T")[0]) return "Hier";

  return date.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}
