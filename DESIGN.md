# DESIGN.md — FuelTrack · Système de Design

## Direction artistique

**Concept** : Dashboard utilitaire warm minimal — précis, lisible, ludique mais pro.
Accent orange carburant sur fond quasi-blanc chaud. Données chiffrées en mono, texte en Inter.

**Mood** : Minimaliste chaud · Inter clean · Accents orange fuel · Micro-interactions subtiles

---

## Palette de couleurs

```css
:root {
  /* Backgrounds */
  --bg-base:        #FAFAF9;
  --bg-surface:     #FFFFFF;
  --bg-muted:       #F5F5F4;
  --bg-subtle:      #E7E5E4;

  /* Textes */
  --text-primary:   #1C1917;
  --text-secondary: #57534E;
  --text-muted:     #A8A29E;

  /* Accent — Orange carburant */
  --fuel:           #E8520A;
  --fuel-light:     #FDF1EB;
  --fuel-dark:      #C23F00;
  --fuel-glow:      #E8520A33;

  /* Sémantique */
  --success:        #16A34A;
  --success-light:  #DCFCE7;
  --warning:        #D97706;
  --warning-light:  #FEF3C7;
  --danger:         #DC2626;
  --danger-light:   #FEE2E2;

  /* Bordures */
  --border:         #E7E5E4;
  --border-strong:  #A8A29E;

  /* Ombres — légères, jamais sur boutons */
  --shadow-card:     0 1px 2px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.04);
  --shadow-elevated: 0 4px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04);
  --shadow-dropdown: 0 8px 24px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04);
  --shadow-fuel-glow: 0 0 24px #E8520A20, 0 0 48px #E8520A10;
}
```

---

## Typographie

```
Inter          — Corps de texte, titres, labels (via next/font)
JetBrains Mono — Valeurs numériques, prix, km, litres (via next/font)
```

### Hiérarchie

| Usage | Font | Size | Weight |
|---|---|---|---|
| Hero / gros titre | Inter | clamp(2.25rem, 5vw, 3.5rem) | 800-900 |
| Titre page | Inter | 18-20px | 600-700 |
| Titre section | Inter | 16px | 600 |
| Corps de texte | Inter | 14-15px | 400 |
| Labels | Inter | 12-13px | 500 |
| Métadonnées | Inter | 11-12px | 400 |
| Valeurs chiffrées | JetBrains Mono | 20-28px | 500-600 |
| Prix, compteurs | JetBrains Mono | 14px | 400 |

Toujours `tabular-nums` sur les valeurs numériques.

---

## Composants (shadcn/ui)

### Installés
Button, Card, Badge, Separator, Tooltip, Dialog, Input, Label, Select, Avatar, ScrollArea

### Button
- Accent : `bg-fuel text-white`, hover `bg-fuel-dark`, pas de shadow, `rounded-xl`
- Outline : `border-border/60`, hover `bg-muted`
- Ghost : transparent, hover `bg-muted`
- Toujours `cursor-pointer`, `active:scale-[0.97]`
- Focus : `focus-visible:ring-2 ring-fuel ring-offset-2`

### Card
- `border-0 shadow-card`, hover `shadow-elevated -translate-y-0.5`
- Hauteur égale dans les grids : `h-full`

### Input / Select
- Texte forcé `color: #111827` (gray-900) via style inline
- Hauteur `h-10` dans les formulaires
- Font mono pour les valeurs numériques

### Badge
- Trends positifs : `bg-emerald-50 text-emerald-600`
- Trends négatifs : `bg-cyan-50 text-cyan-700`
- Accent : `bg-fuel-light text-fuel`

---

## Layout

- Container : `max-w-7xl mx-auto px-4 sm:px-6`
- Grids : `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` (stations), `lg:grid-cols-4` (stats, filtres)
- Spacing : multiples de 4px (Tailwind default)
- `min-h-dvh` au lieu de `min-h-screen`

---

## Navigation

### Desktop — Navbar sticky top
```
[ Logo FuelTrack ]  [ Stations IDF ]  [ Véhicules ]  [ Pleins ]
```
- Sticky top, `bg-base/80 backdrop-blur-md`
- Item actif : `bg-fuel-light text-fuel`
- Logo → `/`

### Mobile — Bottom Tab Bar
```
[ Stations IDF ]  [ Véhicules ]  [ Pleins ]
```
- Fixed bottom, `bg-surface/90 backdrop-blur-md`
- Item actif : `text-fuel`, stroke-width 2

---

## Icônes

- **Bibliothèque** : Lucide React
- **Stroke width** : 1.5px (standard), 2px (actif dans nav)
- **Tailles** : 3-3.5 (inline), 4-5 (cards/nav), 5-7 (headers)

---

## Animations (Motion)

- Entrées : `opacity: 0, y: 12-16` → `opacity: 1, y: 0`
- Durée : 250-350ms max
- Stagger entre items : 30-60ms
- Spring pour le logo : `type: "spring", bounce: 0.3`
- Jauge : `easeOut`, 800ms
- `prefers-reduced-motion` : toutes les animations désactivées via `useReducedMotion()`
- Exit faster than enter (~200ms)

---

## Anti-patterns (JAMAIS)

| Interdit | Alternative |
|---|---|
| `bg-gradient-*` sur bouton | `bg-fuel` uni |
| `box-shadow` sur bouton | Aucun shadow bouton |
| Emojis comme icônes | Lucide React SVG |
| `text-white` dans les inputs | `color: #111827` forcé |
| Animations > 400ms | Max 300ms |
| `min-h-screen` | `min-h-dvh` |
| `max-w-3xl` pour les conteneurs | `max-w-7xl` |

---

## Ambiance visuelle

- Texture noise subtile sur le fond (`noise-bg` class)
- Gradient blob au hover sur les cards prix carburant
- Glow orange sur les icônes pompe (`shadow-fuel-glow`)
- Dot pulsant vert pour "données en temps réel"
