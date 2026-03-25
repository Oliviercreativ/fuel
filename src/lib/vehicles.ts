export const FUEL_TYPES = [
  { value: "e10", label: "E10" },
  { value: "sp95", label: "SP95" },
  { value: "sp98", label: "SP98" },
  { value: "gazole", label: "Gazole" },
  { value: "e85", label: "E85" },
  { value: "gplc", label: "GPLc" },
] as const;

export type FuelType = (typeof FUEL_TYPES)[number]["value"];

export const VEHICLE_COLORS = [
  { value: "#1C1917", label: "Noir" },
  { value: "#57534E", label: "Gris" },
  { value: "#FAFAF9", label: "Blanc" },
  { value: "#DC2626", label: "Rouge" },
  { value: "#2563EB", label: "Bleu" },
  { value: "#16A34A", label: "Vert" },
  { value: "#D97706", label: "Orange" },
  { value: "#7C3AED", label: "Violet" },
] as const;

export type Vehicle = {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  plate: string;
  fuelType: FuelType;
  color: string;
  km: number;
  createdAt: string;
};

const STORAGE_KEY = "fueltrack-vehicles";

export function getVehicles(): Vehicle[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveVehicles(vehicles: Vehicle[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicles));
}

export function addVehicle(vehicle: Omit<Vehicle, "id" | "createdAt">): Vehicle {
  const vehicles = getVehicles();
  const newVehicle: Vehicle = {
    ...vehicle,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  vehicles.push(newVehicle);
  saveVehicles(vehicles);
  return newVehicle;
}

export function deleteVehicle(id: string) {
  const vehicles = getVehicles().filter((v) => v.id !== id);
  saveVehicles(vehicles);
  return vehicles;
}

export function getVehicleInitials(vehicle: Vehicle): string {
  return (vehicle.brand[0] + vehicle.model[0]).toUpperCase();
}
