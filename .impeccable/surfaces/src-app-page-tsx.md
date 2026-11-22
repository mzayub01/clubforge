---
version: 1
slug: "src-app-page-tsx"
primary_target: "src/app/page.tsx"
related_targets: ["src/components/Navbar.tsx","src/components/Footer.tsx"]
---

# Homepage (`/`) surface brief

**Scope:** `src/app/page.tsx`, `src/components/home/*`, plus the shared `Navbar` and `Footer`.
**Visitor mode:** Persuade.

**Audience and job:** a martial arts club owner deciding whether ClubForge can replace spreadsheets, WhatsApp and a separate payment tool. Action: start the 14-day trial at `/get-started`; secondary: jump to the product tour, or book a demo.

**Proof on hand:** illustrated versions of the real admin and member screens (sample data, labelled); real pricing; the origin story. No testimonials, logos or statistics yet (see PRODUCT.md) and none may be invented.

**Constraints:** statically prerendered (no `cookies()` / `getUser()` in the page); claims limited to what PRODUCT.md confirms; keep the FAQPage and SoftwareApplication schema; keep sitewide links to `/features/*`, `/for/*` and the city pages.

**Source of the layout:** a mockup from the club's marketing consultant, supplied by the owner on 2026-11-22. Followed section for section. Agreed deviations: accurate trial wording (card is taken at signup), no invented logos or quotes, no links to pages that do not exist (compare, case studies), no "book" or "build your own belt system" claims, section kickers removed, "Recommended" instead of "Most popular" on Pro (Pro is not the most-chosen plan among active clubs), and no "API access and webhooks" on Elite (the app has neither).

## Direction contract

THESIS: The product is the pitch. A visitor clicks through the real screens (dashboard, members, classes, belts, payments, member app) before reading claims about them. Refuses the category default of a claims wall of identical icon cards under a stock dashboard hero.

OWN-WORLD: The incumbent ClubForge marketing world. Paper-white and deep navy (#0F172A) fields alternating at section scale, one gold (#C5A456) action colour with navy label, Outfit display at heavy weight and tight tracking, Inter body, 12 to 16px radii, hairline slate borders, product screens inside dark-chrome browser and phone frames. Pill tabs, ruled feature index, cream switching banner.

STORY: Understands within seconds that this is club software for martial arts; believes it by seeing members, classes, belts and payments at work; starts the trial or opens the tour.

FIRST VIEWPORT: Two columns from 1024px. Left: H1 "Run your whole club from one place." at display scale, the descriptor "Club management software for martial arts." directly beneath, a two-line summary, gold "Start your free trial" and outline "See it in action", then the trial terms. Right: the admin dashboard in a navy browser frame with a member phone overlapping its lower corner, labelled sample data. Below 1024px: one column, copy first, product visual after the buttons.

FORM: Brief-pinned, so no concept roll was run and there is no seed key. The waiver is the owner's own instruction of 2026-11-22: "the changes proposed are attached in the mockup, please can you review and align to the mockup unless there are aspects you recommend doing alternatively". A user-pinned direction beats the roll. Code-led (no image generation available). Signature interaction: the six-tab product tour. Motion grammar: one cross-fade with a short rise on tab change, exponential ease-out, off under reduced motion.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved

- Real club logos and signed-off quotes (drafts in `src/components/home/social-proof.ts`).
- Whether signup moves to a no-card trial (would allow "No card required").
- Member import: `/pricing` claims CSV import; the app has none.
