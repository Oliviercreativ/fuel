"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";

export function Footer() {
  const [visitCount, setVisitCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/visits", { method: "POST" })
      .then((r) => r.json())
      .then((d) => setVisitCount(d.count ?? null))
      .catch(() => {});
  }, []);

  return (
    <footer className="relative z-10 border-t border-border/50 py-6 text-center text-xs text-text-muted">
      FuelTrack &copy; 2026 - Réalisé par Olivier Démontant - Aucune donnée n&apos;est stockée sur nos serveurs
      {visitCount !== null && (
        <span className="ml-3 inline-flex items-center gap-1 font-medium text-text-secondary">
          <Users className="size-3" strokeWidth={1.5} />
          {visitCount.toLocaleString("fr-FR")} visite{visitCount > 1 ? "s" : ""}
        </span>
      )}
    </footer>
  );
}
