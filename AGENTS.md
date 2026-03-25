# CLAUDE.md — FuelTrack · Plateforme de suivi de consommation d'essence

## 🎯 Vision du projet

Application web Next.js permettant à l'utilisateur de **suivre sa consommation d'essence** au quotidien, à la semaine et au mois. Deux modes de saisie : via l'**API Google Maps** (calcul automatique de distance) ou **saisie manuelle des km**. Support **multi-véhicules**. Tout est stocké en **localStorage** (aucun backend, aucune auth). L'agent IA repose sur des **règles de calcul fixes** (pas de LLM).

---

## 🏗️ Stack technique

| Couche | Choix |
|---|---|
| Framework | **Next.js 16.1** (App Router) |
| Language | **TypeScript** strict |
| Styling | **Tailwind CSS v3** |
| State global | **Zustand** (persisté dans localStorage via middleware) |
| Formulaires | **React Hook Form** + **Zod** (validation) |
| Cartes / Distance | **Google Maps JavaScript API** + **Distance Matrix API** |
| Charts | **Recharts** |
| Export | **jsPDF** + **csv-stringify** |
| Animations | **Framer Motion** |
| Icons | **Lucide React** |
| Onboarding | Composant wizard maison (multi-step) |

---

## 📁 Structure des dossiers

```
fueltrack/
├── app/
│   ├── layout.tsx              # Root layout + providers
│   ├── page.tsx                # Redirect vers /dashboard ou /onboarding
│   ├── onboarding/
│   │   └── page.tsx            # Wizard d'onboarding (3 étapes)
│   ├── dashboard/
│   │   └── page.tsx            # Dashboard principal
│   ├── vehicles/
│   │   ├── page.tsx            # Liste des véhicules
│   │   └── [id]/page.tsx       # Détail véhicule
│   ├── log/
│   │   └── page.tsx            # Ajout d'une entrée (manuel ou Maps)
│   └── export/
│       └── page.tsx            # Page export CSV / PDF
├── components/
│   ├── ui/                     # Composants atomiques (Button, Input, Card...)
│   ├── onboarding/
│   │   ├── StepWelcome.tsx
│   │   ├── StepVehicle.tsx     # Création premier véhicule
│   │   └── StepFuelPrice.tsx   # Prix du litre actuel
│   ├── dashboard/
│   │   ├── SummaryCards.tsx    # Cartes jour / semaine / mois
│   │   ├── ConsumptionChart.tsx
│   │   └── VehicleSelector.tsx
│   ├── log/
│   │   ├── ManualEntry.tsx     # Saisie km manuels
│   │   └── MapsEntry.tsx       # Saisie via Google Maps
│   └── shared/
│       ├── Navbar.tsx
│       └── ExportMenu.tsx
├── lib/
│   ├── calculations.ts         # Moteur de calcul (consommation, coût)
│   ├── storage.ts              # Helpers localStorage
│   ├── maps.ts                 # Wrapper Google Maps Distance Matrix
│   ├── export/
│   │   ├── exportCSV.ts
│   │   └── exportPDF.ts
│   └── constants.ts            # Valeurs par défaut
├── store/
│   ├── useVehiclesStore.ts     # Zustand : véhicules
│   ├── useLogsStore.ts         # Zustand : entrées journalières
│   └── useSettingsStore.ts     # Zustand : prix carburant, préférences
├── types/
│   └── index.ts                # Types globaux TypeScript
├── hooks/
│   ├── useCalculations.ts      # Hook wrappant lib/calculations
│   └── useMapsDistance.ts      # Hook Google Maps
└── public/
    └── ...
```

---

## 🧩 Types principaux (`types/index.ts`)

```typescript
export type FuelType = 'SP95' | 'SP98' | 'Diesel' | 'E10' | 'GPL'

export interface Vehicle {
  id: string
  name: string           // ex: "Ma Clio"
  brand: string
  model: string
  year: number
  fuelType: FuelType
  consumption: number    // L/100km (consommation constructeur)
  licensePlate?: string
  color?: string         // hex color pour l'avatar
  createdAt: string
}

export interface FuelLog {
  id: string
  vehicleId: string
  date: string           // ISO 8601
  km: number             // distance parcourue ce jour
  liters?: number        // si renseigné manuellement
  fuelPricePerLiter: number
  entryMode: 'manual' | 'maps'
  origin?: string        // adresse départ (mode maps)
  destination?: string   // adresse arrivée (mode maps)
  note?: string
}

export interface Settings {
  defaultFuelPrice: number   // prix/L par défaut (mis à jour manuellement)
  currency: 'EUR'
  distanceUnit: 'km'
  onboardingCompleted: boolean
}
```

---

## ⚙️ Moteur de calcul (`lib/calculations.ts`)

```typescript
// Litres consommés = (km × conso_constructeur) / 100
export function calcLiters(km: number, consumptionPer100: number): number

// Coût = litres × prix_au_litre
export function calcCost(liters: number, pricePerLiter: number): number

// Agrégation : regroupe les logs par période
export function aggregateLogs(
  logs: FuelLog[],
  period: 'day' | 'week' | 'month',
  vehicleId?: string
): AggregatedData

// Tendance : % de variation vs période précédente
export function calcTrend(current: number, previous: number): number
```

---

## 🗺️ Intégration Google Maps (`lib/maps.ts`)

- Utiliser la **Distance Matrix API** pour calculer la distance entre deux adresses
- Clé API stockée dans `.env.local` → `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- Activer dans Google Cloud Console : **Maps JavaScript API** + **Distance Matrix API** + **Places API** (pour l'autocomplete des adresses)
- Le composant `MapsEntry.tsx` utilise `@react-google-maps/api` pour l'autocomplete

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=ta_cle_ici
```

---

## 💾 Persistance localStorage (Zustand)

```typescript
// store/useVehiclesStore.ts
import { persist } from 'zustand/middleware'

// Clés localStorage utilisées :
// fueltrack_vehicles
// fueltrack_logs
// fueltrack_settings
```

Toutes les données sont **purement client-side**. Aucune requête vers un serveur propriétaire.

---

## 📤 Export

### CSV
- Bibliothèque : `csv-stringify` (browser build)
- Colonnes : `date, véhicule, km, litres, coût (€), mode, note`
- Nom de fichier : `fueltrack_export_YYYY-MM.csv`

### PDF
- Bibliothèque : `jsPDF` + `jspdf-autotable`
- Format : A4, tableau récapitulatif + graphique (canvas to base64)
- Nom de fichier : `fueltrack_rapport_YYYY-MM.pdf`

---

## 🧭 Onboarding (3 étapes)

1. **Bienvenue** — Présentation de l'app, proposition de créer son premier profil
2. **Ajouter un véhicule** — Formulaire : marque, modèle, année, carburant, conso L/100km
3. **Prix du carburant** — Saisie du prix actuel au litre (modifiable à tout moment)

Déclenché si `settings.onboardingCompleted === false` (ou absent du localStorage).

---

## 📊 Dashboard — Métriques affichées

| Métrique | Calcul |
|---|---|
| Litres aujourd'hui | Somme logs du jour × conso |
| Litres cette semaine | Somme logs lun→dim |
| Litres ce mois | Somme logs du mois en cours |
| Coût aujourd'hui | Litres × prix/L |
| Coût semaine | Idem |
| Coût mois | Idem |
| Tendance | % vs période précédente |

---

## 🚫 Contraintes UI (règles non négociables)

- ❌ Pas de boutons avec dégradé (`bg-gradient-*`)
- ❌ Pas de `box-shadow` lourds sur les boutons
- ✅ Boutons : fond uni, bordure nette, hover via opacity ou légère teinte
- ✅ Cards : fond blanc ou gris très clair, bordure 1px, radius modéré
- ✅ Typographie : hiérarchie claire, poids contrastés

---

## 🔧 Scripts npm

```bash
npm run dev          # Développement local
npm run build        # Build production
npm run lint         # ESLint
npm run type-check   # tsc --noEmit
```

---

## ⚠️ Points spécifiques Next.js 16 (breaking changes à connaître)

### 1. Async Request APIs — OBLIGATOIRE
Dans Next.js 16, l'accès synchrone aux APIs de requête est définitivement supprimé. `params`, `cookies()`, `headers()` et `searchParams` ne peuvent être accédés que de manière asynchrone.

```typescript
// ✅ Correct en Next.js 16
export default async function Page(props: PageProps<'/vehicles/[id]'>) {
  const { id } = await props.params
  return <VehicleDetail id={id} />
}

// ❌ Erreur en Next.js 16 (synchrone)
export default function Page({ params }: { params: { id: string } }) {
  const { id } = params // CRASH
}
```

> **Tip** : Lance `npx next typegen` pour générer automatiquement les types `PageProps` et migrer en toute sécurité.

### 2. Turbopack par défaut
Turbopack est stable et utilisé par défaut avec `next dev` et `next build` — plus besoin du flag `--turbopack`.

```json
// package.json — scripts simplifiés
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  }
}
```

> ⚠️ Si tu as une config webpack custom (ex: plugin svg), elle cassera le build. Utilise `next build --webpack` pour conserver webpack, ou migre vers Turbopack.

### 3. `middleware.ts` → `proxy.ts`
`proxy.ts` remplace `middleware.ts` et rend explicite la frontière réseau de l'app. `proxy.ts` s'exécute sur le runtime Node.js.

Pour ce projet, on n'a pas besoin de middleware/proxy (pas d'auth), donc ce point est sans impact.

### 4. React Compiler (optionnel mais recommandé)
Le support natif du React Compiler est stable dans Next.js 16. Il mémoïse automatiquement les composants, réduisant les re-renders inutiles sans modifier le code.

```typescript
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactCompiler: true, // stable en v16, optionnel
  experimental: {
    turbopackFileSystemCacheForDev: true, // cache disque = démarrage ultra-rapide
  },
}

export default nextConfig
```

### 5. Commande de création du projet

```bash
# Crée le projet avec Next.js 16 (latest)
npx create-next-app@latest fueltrack \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*"
```

---

## 📋 Ordre de développement recommandé

1. Setup Next.js + Tailwind + Zustand + types
2. Stores localStorage (vehicles, logs, settings)
3. Moteur de calcul + tests unitaires
4. Onboarding wizard
5. Page Log (manuel en premier, Maps ensuite)
6. Dashboard + charts
7. Page Véhicules (CRUD)
8. Export CSV puis PDF
9. Polish UI + animations Framer Motion