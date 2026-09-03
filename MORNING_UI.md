# Morning UI — Design System

Clarity uses a custom design system called **Morning UI** — a warm stationery aesthetic inspired by physical notebooks, engineering graph paper, and clay-moulded surfaces. Every component is built to feel tactile, personal, and calm.

---

## Palette

| Token | Hex | Role |
|-------|-----|------|
| Espresso | `#24211E` | Primary text, headings |
| Graphite | `#3A3530` | Body text |
| Charcoal | `#524B45` | Labels, secondary headings |
| Stone | `#827A72` | Muted / helper text |
| Muted | `#A39B92` | Placeholders, disabled |
| Terracotta | `#C87467` | Primary accent |
| Rose | `#D98A7E` | Accent gradient start |
| Blush | `#E8B4AC` | Soft accent tint |
| Apricot | `#EEDCCE` | Warm highlight |
| Sand | `#DFD3C6` | Warm border / divider |
| Sage | `#6B8065` | Success / positive state |
| Parchment | `#F6F4EF` | Canvas base |
| Clay 100–500 | `#FAF8F5` → `#CDC5B9` | Layered surface shades |

---

## Typography

| Use | Font |
|-----|------|
| UI / Body | **Plus Jakarta Sans** |
| Headings, Diary, Serif | **Newsreader** |

```css
--font-sans: 'Plus Jakarta Sans', -apple-system, …
--font-serif: 'Newsreader', Georgia, …
```

---

## Core Classes

### Background

```css
.morning-bg
```
Fixed 24×24px engineering graph paper grid on `#F5F2EC` parchment. Applied to full-page layouts and lock screens.

---

### Claymorphic Chassis

```css
.morning-chassis
```
Double-beveled clay rim with vertical ombre and inset highlight — the signature tactile container. Use as a wrapper around `.morning-core`.

**Shade variants:**

| Class | Feel |
|-------|------|
| `.morning-chassis-rose` / `-blush` | Warm rose clay |
| `.morning-chassis-sage` | Eucalyptus green |
| `.morning-chassis-honey` / `-amber` | Warm golden |
| `.morning-chassis-dusk` / `-lavender` | Twilight purple-grey |
| `.morning-chassis-sky` / `-blue` | Crisp airy blue |

```tsx
<div className="morning-chassis morning-chassis-sage overflow-hidden">
  <div className="morning-core p-4">
    {/* content */}
  </div>
</div>
```

---

### Surface Cards

```css
.morning-card           /* standard card — subtle shadow, 20px radius */
.morning-card-elevated  /* modal / prominent card — stronger shadow, 24px radius */
```

**Gradient cards** (fade to tinted footer):

```css
.morning-gradient-rose
.morning-gradient-sage
.morning-gradient-honey
.morning-gradient-dusk
.morning-gradient-sky
```

---

### Notebook Rules

```css
.notebook-ruled
```
Repeating horizontal ruled lines (32px pitch) aligned to the baseline grid. Used in the Diary textarea area.

---

### Inputs

```css
.morning-input
```
Full-width input / textarea field. Warm border, soft inset shadow, terracotta focus ring on `:focus`.

```tsx
<input className="morning-input pl-10 font-medium" />
```

---

### Buttons

```css
.morning-btn-accent   /* terracotta gradient — primary CTA */
.morning-btn-primary  /* graphite dark — secondary action */
```

Both include hover lift (`translateY(-1px)`), active reset, and disabled opacity.

```tsx
<button className="morning-btn-accent">
  <Plus className="w-4 h-4 stroke-[2.2]" /> New Task
</button>
```

---

### Dot Indicators

```css
.dot-terracotta   /* terracotta glow dot */
.dot-sage         /* sage glow dot */
```

---

### Scrollbars

Custom thin scrollbars (6px) with warm clay thumb colour — applied globally.

---

### Page Transition

```css
.page-transition
```
Fade + 3px upward slide in 200ms. Apply to route-level containers.

---

## Colour-State Conventions

| State | Token | Class example |
|-------|-------|---------------|
| Error / alert | Terracotta `#C87467` | `text-[#C87467] bg-[#C87467]/10 border-[#C87467]/20` |
| Success / saved | Sage `#6B8065` | `text-[#6B8065] bg-[#6B8065]/10 border-[#6B8065]/20` |
| Overdue | `#BE1239` on `#FDF2F4` | `text-[#BE1239] bg-[#FDF2F4] border-[#FECDD3]` |
| Selected / active | Clay 100 `#FAF8F5` with border | `bg-[#FAF8F5] border border-black/[0.08] shadow-sm` |
| Hover muted | Espresso at opacity | `hover:bg-black/[0.04]` |

---

## Page Anatomy

Every page follows this structure:

```
.morning-bg (full height, graph paper canvas)
└── Header bar (backdrop-blur, border-b border-[#DDD7CE])
└── Scroll area
    └── .morning-chassis .morning-chassis-{shade}
        └── .morning-core
            └── Content
```

Modal overlays use `morning-card-elevated` on a `bg-black/30 backdrop-blur-xs` scrim.

---

## Files

| Path | Role |
|------|------|
| `desktop/src/styles.css` | All Morning UI CSS — tokens, chassis, cards, buttons, inputs |
| `desktop/src/pages/AuthPage.tsx` | Entry point — graph paper canvas, elevated card |
| `desktop/src/pages/DiaryPage.tsx` | Lock screen + notebook editor |
| `desktop/src/pages/TasksPage.tsx` | Sage chassis task list |
| `desktop/src/pages/ExpensesPage.tsx` | Rose chassis expense tracker |
| `desktop/src/pages/ProjectsPage.tsx` | Kanban board |
| `desktop/src/pages/CalendarPage.tsx` | Calendar grid |
