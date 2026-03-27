# AGENTS.md — FuelTrack

## Vision du projet

Application web de suivi de consommation carburant avec prix en temps réel issus de l'open data gouvernemental (data.gouv.fr). Gestion multi-véhicules, enregistrement de pleins, comparaison de stations-service en Île-de-France. Tout est stocké en localStorage (aucun backend, aucune auth, aucune donnée personnelle collectée).

---

## Stack technique

| Couche | Choix |
|---|---|
| Framework | **Next.js 16.2** (App Router, Turbopack) |
| Language | **TypeScript** strict |
| Styling | **Tailwind CSS v4** |
| Composants UI | **shadcn/ui** (base-ui) |
| Animations | **Motion** (ex Framer Motion) |
| Icons | **Lucide React** (stroke 1.5px) |
| Charts | **Recharts** |
| Fonts | **Inter** (corps) + **JetBrains Mono** (valeurs numériques) via next/font |
| Persistance | **localStorage** (véhicules, pleins, favoris) |

---

## Structure du projet

```
src/
├── app/
│   ├── layout.tsx              # Root layout, Inter + JetBrains Mono
│   ├── page.tsx                # Landing page (hero, stats, prix nationaux)
│   ├── icon.svg                # Favicon SVG (pompe orange)
│   ├── api/
│   │   ├── fuel-prices/route.ts    # Prix moyens nationaux (data.economie.gouv.fr)
│   │   └── idf-stations/route.ts   # Stations IDF + facets (data.iledefrance.fr)
│   ├── idf/page.tsx            # Stations IDF avec filtres cascadés
│   ├── vehicules/page.tsx      # Gestion des véhicules
│   └── pleins/page.tsx         # Suivi des pleins + historique
├── components/
│   ├── ui/                     # shadcn/ui (button, card, badge, dialog, input, label, select, separator, tooltip, avatar, scroll-area)
│   ├── navbar.tsx              # Navigation desktop (sticky) + mobile (bottom tabs)
│   ├── fuel-prices.tsx         # Panel prix moyens nationaux (6 carburants)
│   ├── station-card.tsx        # Card station IDF (prix, services, favori, itinéraire)
│   ├── vehicle-card.tsx        # Card véhicule (avatar couleur, infos, suppression)
│   ├── add-vehicle-dialog.tsx  # Dialog ajout véhicule
│   ├── add-refuel-dialog.tsx   # Dialog ajout plein (station favorite ou moy. nationale)
│   └── daily-refuels.tsx       # Historique pleins groupés par jour
├── hooks/
│   ├── use-vehicles.ts         # CRUD véhicules (localStorage)
│   ├── use-refuels.ts          # CRUD pleins (localStorage)
│   └── use-favorites.ts       # CRUD stations favorites (localStorage)
├── lib/
│   ├── utils.ts                # cn() helper (shadcn)
│   ├── vehicles.ts             # Types + storage véhicules
│   ├── refuels.ts              # Types + storage pleins + calculs (conso L/100km, coût)
│   └── favorites.ts            # Types + storage stations favorites
└── public/
    └── fueltrack-presentation.html  # PDF carousel LinkedIn
```

---

## API Routes

### `/api/fuel-prices` (GET)
- Source : `data.economie.gouv.fr` (Opendatasoft v2.1)
- Retourne les moyennes nationales des 6 carburants (Gazole, SP95, SP98, E10, E85, GPLc)
- Cache : `revalidate: 3600` (1h)
- ~9 900 stations agrégées

### `/api/idf-stations` (GET)
- Source : `data.iledefrance.fr` (Opendatasoft v2.1)
- Deux modes via `?action=` :
  - `facets` : départements, villes, enseignes, carburants (filtrage en cascade AND)
  - `stations` (défaut) : liste paginée avec filtres `depcode`, `city`, `brand`, `fuel`
- Cache : `revalidate: 900` (15min)
- 839 stations IDF

---

## Pages

| Route | Description |
|---|---|
| `/` | Landing page : hero animé, 4 stat cards, prix moyens nationaux temps réel, jauge |
| `/idf` | Stations IDF : filtrage cascadé (département → villes multi-select → carburant → enseigne), favoris, itinéraire Google Maps, groupement par ville |
| `/vehicules` | Liste véhicules, ajout via dialog (marque, modèle, année, carburant, km, couleur) |
| `/pleins` | Historique pleins par jour, stats du jour (litres, coût, conso L/100km), ajout avec prix auto-rempli (station favorite ou moyenne nationale) |

---

## Navigation

- Desktop : navbar sticky top avec blur backdrop, logo FuelTrack → `/`
- Mobile : bottom tab bar (Stations IDF, Véhicules, Pleins)
- Ordre : Stations IDF (premier), Véhicules, Pleins

---

## Conventions

### UI
- Accent orange : `#E8520A`
- Pas de shadow sur les boutons, jamais
- Pas de gradients sur les boutons
- Cards : shadow-card léger, border-0, hover shadow-elevated + translate-y
- Inputs : texte `#111827` (gray-900) forcé via style inline
- Container max : `max-w-7xl`
- Animations : max 300ms, respect `prefers-reduced-motion`
- Icônes Lucide : stroke-width 1.5px

### Code
- Composants client : `"use client"` en haut
- Types exportés depuis les route handlers pour réutilisation côté client
- localStorage : clés `fueltrack-vehicles`, `fueltrack-refuels`, `fueltrack-favorite-stations`

---

## Scripts

```bash
npm run dev          # Serveur dev (Turbopack)
npm run build        # Build production
npm run start        # Serveur production
npm run lint         # ESLint
```
