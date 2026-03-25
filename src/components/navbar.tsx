"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fuel, LayoutDashboard, Car } from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/vehicules", label: "Véhicules", icon: Car },
  { href: "/pleins", label: "Pleins", icon: Fuel },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop nav */}
      <header className="sticky top-0 z-40 hidden border-b border-border/50 bg-base/80 backdrop-blur-md sm:block">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-8 px-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-bold tracking-tight text-text-primary transition-opacity hover:opacity-80"
          >
            <div className="flex size-7 items-center justify-center rounded-lg bg-fuel">
              <Fuel className="size-3.5 text-white" strokeWidth={2} />
            </div>
            FuelTrack
          </Link>

          <nav className="flex items-center gap-1">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex h-8 items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-colors duration-150 ${
                    active
                      ? "bg-fuel-light text-fuel"
                      : "text-text-secondary hover:bg-muted hover:text-text-primary"
                  }`}
                >
                  <Icon className="size-4" strokeWidth={1.5} />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/50 bg-surface/90 backdrop-blur-md sm:hidden">
        <div className="flex h-16 items-center justify-around px-2 pb-safe">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-0.5 rounded-xl px-4 py-1.5 text-[11px] font-medium transition-colors duration-150 ${
                  active
                    ? "text-fuel"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                <Icon className="size-5" strokeWidth={active ? 2 : 1.5} />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
