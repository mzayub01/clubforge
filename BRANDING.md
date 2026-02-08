# ClubForge — Brand Guidelines

> The operating system for clubs. Build, run, and grow your gym, dojo, or academy with one powerful platform.

---

## Logo — E2 Twin Cubes

Two isometric cubes interlocking:
- **Navy cube** (back) — represents the *club*: structure, system, foundation
- **Gold cube** (front) — represents the *forge*: creation, value, active building

Together they communicate two elements being forged into one unified system.

### Logo Files

| File | Purpose | Background |
|------|---------|------------|
| `public/logo-clubforge-final.svg` | Primary logo with wordmark | Light ☀️ |
| `public/logo-clubforge-final-dark.svg` | Dark variant with wordmark | Dark 🌙 |
| `public/logo-clubforge-icon.svg` | Icon mark only (no text) | Any |
| `public/logo-clubforge-mono.svg` | Monochrome (greyscale) | Print / watermarks |
| `public/logo-final-preview.html` | Visual preview of all variants | N/A |

### Usage Rules

- **Navbar / Headers** → `logo-clubforge-final.svg`
- **Dark footers / Dark pages** → `logo-clubforge-final-dark.svg`
- **Favicon / App icon / Social avatar** → `logo-clubforge-icon.svg`
- **Print / Single-colour / Watermark** → `logo-clubforge-mono.svg`
- **Email templates** → hosted at `https://clubforgehq.com/logo-clubforge-final.svg`
- Never use the gold as a full background colour
- Maintain clear space around the logo equal to the height of one cube face
- Minimum display size: 32px height for icon, 120px width for full logo

---

## Colour Palette

| Swatch | Name | Hex | Usage |
|--------|------|-----|-------|
| 🟫 | Deep Navy | `#0F172A` | Primary text, dark backgrounds, navy cube |
| 🟫 | Navy Mid | `#1E293B` | Cube highlight face, secondary dark |
| 🟫 | Navy Light | `#162033` | Cube shadow face |
| 🟨 | Gold | `#C5A456` | Primary accent, CTAs, gold cube main face |
| 🟨 | Gold Light | `#D4B86A` | Cube top face, hover states |
| 🟫 | Gold Dark | `#B8943D` | Cube shadow face, pressed states |
| ⬜ | White | `#FFFFFF` | Backgrounds, dark-mode text |
| ⬜ | Slate 100 | `#F1F5F9` | Page backgrounds |
| ⬜ | Slate 200 | `#E2E8F0` | Borders, dividers |
| ⬛ | Slate 400 | `#94A3B8` | Secondary text |
| ⬛ | Slate 500 | `#64748B` | Tertiary text |

### Gradients

- **Gold CTA**: `linear-gradient(135deg, #D4B86A, #A88B3D)`
- **Dark hero**: `linear-gradient(160deg, #0F172A 0%, #1E293B 40%, #0F172A 100%)`
- **Gold text**: `linear-gradient(135deg, #ffd700, #c5a456)`

---

## Typography

| Role | Font | Weight | CSS Variable |
|------|------|--------|-------------|
| Display / Headings | **Outfit** | 700–800 | `var(--font-outfit)` |
| Body / UI | **Inter** | 400–600 | `var(--font-inter)` |

### Wordmark

The logo wordmark renders **"Club"** in Deep Navy and **"Forge"** in Gold using Inter 800.

---

## Tone of Voice

| Attribute | Description |
|-----------|-------------|
| **Professional** | Enterprise-grade, not startup-casual |
| **Confident** | Direct, clear, authoritative |
| **Structured** | Organised, systematic — like the product itself |
| **Approachable** | Helpful, not cold — clubs are communities |

### Avoid

- Overly sporty/gym-bro language
- Cartoonish or playful imagery
- Complex or decorative design elements
- Referring to ClubForge as just "an app" — it's a *platform*

---

## Brand Elements in Code

### CSS Variables (from `globals.css`)

```css
--color-gold: #C5A456;
--color-gold-gradient: linear-gradient(135deg, #D4B86A, #A88B3D);
```

### Theme Colour (PWA / Mobile)

```
#C5A456
```

### OpenGraph / SEO

- **Title pattern**: `ClubForge | [Page Name]`
- **Description**: Focus on "all-in-one SaaS platform for martial arts gyms and fitness centers"
- **Image**: Use primary logo SVG
