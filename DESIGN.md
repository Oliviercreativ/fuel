# design.md — FuelTrack · Système de Design

## 🎨 Direction artistique

**Concept** : *Tableau de bord d'atelier* — précis, lisible, utilitaire mais soigné.  
Inspiré des interfaces de diagnostic automobile et des dashboards de flotte pro.  
Pas de fioriture. Chaque élément a une raison d'être.

**Mood** : Minimaliste épuré · Typographie forte · Accents orange fuel · Grille serrée

---

## 🎨 Palette de couleurs

```css
:root {
  /* Backgrounds */
  --bg-base:        #F9F9F8;   /* fond général, quasi-blanc chaud */
  --bg-surface:     #FFFFFF;   /* cartes, modales */
  --bg-muted:       #F2F2F0;   /* zones secondaires, inputs */
  --bg-subtle:      #EAEAE7;   /* hover states, séparateurs */

  /* Textes */
  --text-primary:   #0F0F0E;   /* titres, valeurs importantes */
  --text-secondary: #5C5C57;   /* labels, descriptions */
  --text-muted:     #9E9E97;   /* placeholders, métadonnées */
  --text-inverted:  #FFFFFF;

  /* Accent principal — Orange carburant */
  --accent:         #E8520A;   /* CTA principal, highlights */
  --accent-light:   #FDF1EB;   /* fond badge accent, hover léger */
  --accent-dark:    #C23F00;   /* hover bouton accent */

  /* Sémantique */
  --success:        #1A7F4B;
  --success-light:  #E8F5EE;
  --warning:        #B45309;
  --warning-light:  #FEF3C7;
  --danger:         #C0392B;
  --danger-light:   #FDECEA;

  /* Bordures */
  --border:         #E2E2DE;
  --border-strong:  #C8C8C2;

  /* Ombres — légères uniquement, jamais sur boutons */
  --shadow-card:    0 1px 3px rgba(0,0,0,0.06);
  --shadow-dropdown: 0 4px 16px rgba(0,0,0,0.10);
}
```

---

## ✍️ Typographie

```css
/* Titres — Chiffres et données */
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

--font-display: 'Syne', sans-serif;    /* Titres pages, grands chiffres */
--font-body:    'DM Sans', sans-serif; /* Corps de texte, labels */
--font-mono:    'DM Mono', monospace;  /* Valeurs numériques, km, litres */
```

### Échelle typographique

| Token | Font | Size | Weight | Usage |
|---|---|---|---|---|
| `text-hero` | Syne | 48px | 800 | Valeur principale dashboard |
| `text-title` | Syne | 28px | 700 | Titres de page |
| `text-heading` | Syne | 20px | 600 | Titres de section |
| `text-body` | DM Sans | 15px | 400 | Corps de texte |
| `text-label` | DM Sans | 13px | 500 | Labels, captions |
| `text-small` | DM Sans | 12px | 400 | Métadonnées |
| `text-value` | DM Mono | 24px | 500 | Chiffres clés (litres, €) |
| `text-mono` | DM Mono | 14px | 400 | Plaques, codes |

---

## 📐 Espacements & Layout

```css
/* Grille */
--grid-cols-desktop: 12;
--grid-cols-tablet:  8;
--grid-cols-mobile:  4;
--grid-gap:          24px;
--container-max:     1200px;
--container-px:      24px; /* mobile: 16px */

/* Radius */
--radius-sm:   6px;   /* inputs, badges */
--radius-md:   10px;  /* cards, boutons */
--radius-lg:   16px;  /* modales, panels */
--radius-full: 9999px; /* pills */

/* Spacing scale (multiples de 4) */
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
```

---

## 🧱 Composants UI

### Button

```tsx
// ✅ Autorisé
<Button variant="primary">   // bg accent (#E8520A), texte blanc, pas de shadow
<Button variant="secondary"> // bg blanc, border 1px --border, texte primary
<Button variant="ghost">     // bg transparent, hover bg-muted
<Button variant="danger">    // bg danger, texte blanc

// ❌ INTERDIT
// bg-gradient-*, box-shadow sur bouton, border-radius > 12px sur bouton
```

**Specs bouton primary :**
```css
background: var(--accent);
color: white;
border: none;
border-radius: var(--radius-md);
padding: 10px 20px;
font: 500 14px 'DM Sans';
letter-spacing: 0.01em;
transition: background 150ms ease;

&:hover { background: var(--accent-dark); }
&:active { transform: scale(0.98); }
&:disabled { opacity: 0.4; cursor: not-allowed; }
```

---

### Card

```css
.card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow-card); /* uniquement sur card, pas bouton */
}
```

---

### Input / Select

```css
.input {
  background: var(--bg-muted);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 10px 14px;
  font: 400 15px 'DM Sans';
  color: var(--text-primary);
  transition: border-color 150ms;

  &:focus {
    outline: none;
    border-color: var(--accent);
    background: white;
  }
}
```

---

### Badge / Tag

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: var(--radius-full);
  font: 500 12px 'DM Sans';
}
.badge-accent   { background: var(--accent-light);   color: var(--accent); }
.badge-success  { background: var(--success-light);  color: var(--success); }
.badge-warning  { background: var(--warning-light);  color: var(--warning); }
.badge-danger   { background: var(--danger-light);   color: var(--danger); }
```

---

### Metric Card (Dashboard)

```
┌──────────────────────────────┐
│  🔥 Aujourd'hui              │  ← label DM Sans 13px muted
│                              │
│  12.4 L                      │  ← DM Mono 36px primary
│  ≈ 24,80 €                   │  ← DM Mono 16px secondary
│                              │
│  ↑ +8% vs hier    [badge]    │  ← trend indicator
└──────────────────────────────┘
```

---

## 🖼️ Icônes & Illustrations

- **Bibliothèque** : Lucide React (stroke, pas filled — style cohérent)
- **Taille standard** : 18px (inline), 22px (navigation), 32px (hero)
- **Stroke width** : 1.5px toujours
- **Avatar véhicule** : Carré arrondi coloré (couleur choisie par l'utilisateur) + initiales

---

## 📱 Responsive

| Breakpoint | Token | Largeur |
|---|---|---|
| Mobile | `sm` | < 640px |
| Tablet | `md` | 640–1024px |
| Desktop | `lg` | > 1024px |

**Règles :**
- Mobile-first (Tailwind default)
- Navbar : sidebar desktop → bottom tabs mobile
- Dashboard cards : 1 colonne mobile, 2 tablette, 3 desktop
- Charts : height réduite sur mobile (200px vs 320px)

---

## 🧭 Navigation

### Desktop — Sidebar (240px)
```
┌─────────────┐
│  ⛽ FuelTrack │  logo + nom
├─────────────┤
│  Dashboard  │  ← actif = border-left 3px accent
│  Ajouter    │
│  Véhicules  │
│  Export     │
├─────────────┤
│  ⚙ Réglages │
└─────────────┘
```

### Mobile — Bottom Tab Bar
```
[ Dashboard ] [ + Ajouter ] [ Véhicules ] [ Export ]
```

---

## 🧙 Onboarding — Style

- Fond `--bg-base`
- Wizard centré, max-width 480px
- Progress bar fine (2px) couleur accent en haut
- Chaque étape : illustration SVG simple + formulaire
- Bouton "Suivant" : primary, pleine largeur
- Animations : slide + fade entre étapes (Framer Motion)

---

## 📊 Charts (Recharts)

```tsx
// Palette charts
const CHART_COLORS = {
  primary: '#E8520A',   // litres / principal
  secondary: '#0F0F0E', // coût
  grid: '#E2E2DE',
  tooltip_bg: '#FFFFFF',
  tooltip_border: '#E2E2DE',
}

// Style axes
<XAxis stroke="#9E9E97" fontSize={12} fontFamily="DM Mono" />
<YAxis stroke="#9E9E97" fontSize={12} fontFamily="DM Mono" />
<CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />

// Pas de box-shadow sur le tooltip
<Tooltip
  contentStyle={{
    background: '#fff',
    border: '1px solid #E2E2DE',
    borderRadius: '8px',
    boxShadow: 'none',  // ← règle respectée
    fontFamily: 'DM Sans',
  }}
/>
```

---

## ✏️ Micro-interactions & Animations

```tsx
// Framer Motion — Transitions de page
const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.15 } },
}

// Cards dashboard — apparition décalée
transition={{ delay: index * 0.06 }}

// Boutons — scale au click uniquement (pas d'effet 3D)
whileTap={{ scale: 0.97 }}

// Onboarding — slide entre étapes
const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
}
```

---

## 🚫 Anti-patterns (JAMAIS dans ce projet)

| ❌ Interdit | ✅ Alternative |
|---|---|
| `bg-gradient-to-r from-... to-...` sur bouton | `bg-[--accent]` uni |
| `shadow-xl` ou `shadow-2xl` sur bouton | Aucun shadow bouton |
| `font-family: Inter, Arial, system-ui` | Syne + DM Sans + DM Mono |
| Cartes sans bordure (juste shadow) | `border + shadow-card léger` |
| Animations > 400ms | Max 300ms, préférer 200ms |
| Purple / violet comme accent | Orange `#E8520A` uniquement |
| Rounded-full sur boutons CTA | `rounded-[10px]` max |

---

## 🗂️ Tailwind Config (extrait)

```js
// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      colors: {
        accent:   '#E8520A',
        'accent-light': '#FDF1EB',
        'accent-dark':  '#C23F00',
        base:     '#F9F9F8',
        surface:  '#FFFFFF',
        muted:    '#F2F2F0',
        subtle:   '#EAEAE7',
        border:   '#E2E2DE',
        'text-primary':   '#0F0F0E',
        'text-secondary': '#5C5C57',
        'text-muted':     '#9E9E97',
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body:    ['DM Sans', 'sans-serif'],
        mono:    ['DM Mono', 'monospace'],
      },
      borderRadius: {
        sm: '6px', md: '10px', lg: '16px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06)',
        dropdown: '0 4px 16px rgba(0,0,0,0.10)',
      },
    },
  },
}
```