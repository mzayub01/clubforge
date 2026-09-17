# ClubForge — SEO / AEO audit and plan (2026-09-17)

Goal: more club sign-ups from organic search and from AI answer engines
(ChatGPT, Perplexity, Google AI Overviews, Copilot). This file is the source
of truth for that work; tick items off as they ship and re-run the audit
commands in section 5 after each batch.

## 1. Audit findings (live site + code, 2026-09-17)

Measured against https://clubforgehq.com with Googlebot / browser user agents,
Lighthouse 12 (local, mobile simulation; PageSpeed Insights API quota was
exhausted that day), and a read of the marketing routes.

### What is already good
- HTTPS, HSTS, `http://` → 308 → https. Sensible robots.txt; 43-URL sitemap;
  `metadataBase` + canonical on every core page; `google-site-verification`
  meta present (GSC verified).
- Structured data already in place: Organization, WebSite, SoftwareApplication
  + Offers (home and city pages), FAQPage (home, /for/*, city, /faq, blog),
  BreadcrumbList, City, Article (blog posts, with datePublished + author).
- `/llms.txt` exists (~530 words). OG image route exists. Blog: 6 long-form
  posts (the UK guide is ~3,800 words). ~30 programmatic city pages
  (`martial-arts-software-*`, `bjj-gym-software-*`, `gym-management-*`).
- Private areas (admin, dashboard, login, register, professor, salespack) are
  `noindex`.
- Lighthouse (home, mobile sim): SEO 100, Best practices 100, Accessibility 90,
  Performance 71. CLS 0, FCP 1.0 s, TTFB 20 ms from a warm region.

### Problems, most important first

| # | Finding | Evidence | Impact |
|---|---------|----------|--------|
| 1 | **Every marketing page is dynamically rendered** (`private, no-cache, no-store`, Vercel `MISS`). `src/app/page.tsx` and pricing/features/faq/about/blog/for/*/city pages call `createClient()` + `auth.getUser()` server-side only to decide the Navbar's logged-in state. | `.next/prerender-manifest.json`: only /demo and /get-started are static | No CDN cache: TTFB depends on a Supabase round-trip per crawl/visit; wasted crawl budget; LCP 3.8 s on mobile |
| 2 | **Doubled title suffix** `… \| ClubForge \| ClubForge` on /features, /for/*, city pages, /blog, /faq. Page `title` strings include "\| ClubForge" while the root layout template `'%s \| ClubForge'` appends it again. | curl titles | Ugly SERP titles, wasted pixels, Google rewrites titles |
| 3 | **www is not redirected to apex.** Middleware only strips www for custom tenant domains; `https://www.clubforgehq.com/` serves 200 with canonical to apex. | curl | Duplicate host; canonical mitigates but a 301 is the fix |
| 4 | **Organization `sameAs` points at profiles that do not exist**: twitter.com/clubforgehq → 404 (x.com too); capterra listing 403/unknown. LinkedIn OK. Footer links to the dead Twitter profile. | curl | Entity-verification signals for Knowledge Graph / AI engines are broken |
| 5 | **Thin commercial pages**: /features 390 words (1 H2), /blog index 397, /about 438, /for/* ~550, /pricing ~650. Home and city pages are ~1,600. | word counts | These pages should rank for "martial arts software", "gym management software UK"; not enough depth to compete |
| 6 | **No comparison / alternative pages** (Mindbody, Glofox, Gymdesk, Zen Planner, TeamUp, ClubRight, ClubWise). Competitors are only mentioned inside 4 blog posts. | grep | "X alternative", "X vs Y", "X pricing" are the highest-intent B2B SaaS queries and the ones AI engines cite most |
| 7 | **Blog is stale and small**: 6 posts, all dated 2026-05-04 / 2026-06-22; sitemap `lastModified` hard-coded (2026-03-01 / 2026-06-22). | blog/page.tsx, sitemap.ts | Freshness signals flat; nothing new to earn links or AI citations |
| 8 | **WebSite `SearchAction` targets `/faq?q=`** which has no search. | structured-data.tsx | Invalid sitelinks-search markup; remove or implement |
| 9 | **SoftwareApplication schema only on home + city pages**; missing on /pricing, /features, /for/*. No `AggregateRating` (no reviews collected anywhere). | curl | Rich-result eligibility and AI "what does it cost / who is it for" answers |
| 10 | **Pages missing metadata**: /demo has no description/canonical/OG; /events, /privacy, /terms have no canonical/OG; /videos is a public route that only redirects (should not be crawlable). | grep | Each is a duplicate/thin URL in the index |
| 11 | **Performance**: TBT 620 ms, LCP 3.8 s (hero `<h1>`), main-thread 2.3 s, DOM 1,044 nodes, 16 JS requests / ~240 KB; two resources with short cache TTL; bf-cache blocked. | Lighthouse | Core Web Vitals "needs improvement" on mobile |
| 12 | **Accessibility 90**: colour-contrast, heading order, unnamed links. | Lighthouse | Also a ranking tie-breaker and an AEO readability signal |
| 13 | **`llms.txt` is short and has no `llms-full.txt`**; no per-page "answer-first" summaries; FAQ answers are accordion-style rather than direct 40–60-word answers under question headings. | llms.txt route | AI engines prefer concise, quotable, dated, attributed answers |
| 14 | No `manifest`, no Bing Webmaster Tools / IndexNow, no `Product`/`Offer` per plan on pricing, no `HowTo`/`VideoObject`. | probes | Bing/Copilot and Perplexity draw heavily from Bing's index |

## 2. Plan — prioritised

Each item lists effort (S/M/L) and who does it (code = Claude, owner =
Zubair). Ship in order; batches are sized to about one session each.

### Batch A — technical foundation (code, ~1 session)
- [ ] **A1. Static marketing pages.** Move the "who is logged in" check out of
      the server pages into a small client component in the Navbar (reads the
      Supabase session on the client or calls `/api/auth/role`). Remove
      `createClient()`/`getUser()` from page.tsx, pricing, features, faq,
      about, blog, for/*, city pages. Result: prerendered HTML, CDN-cached,
      `revalidate` on blog/city pages. (S–M) Metric: TTFB/LCP, crawl stats.
- [ ] **A2. Fix the title template.** Strip "| ClubForge" from every page-level
      `title`, or use `title: { absolute }` where a page wants its own. (S)
- [ ] **A3. 301 `www.clubforgehq.com` → apex** in `src/middleware.ts` (extend
      the existing custom-domain www branch to the base domain). (S)
- [ ] **A4. Fix `sameAs`**: create the X/Twitter account or remove the link
      (owner decision); confirm Capterra/GetApp/G2 listings and add only live
      URLs; remove the dead Twitter link from the footer. (S, owner + code)
- [ ] **A5. Remove `SearchAction`** (or point it at a real `/search?q=`). (S)
- [ ] **A6. Metadata gaps**: description/canonical/OG on /demo, /events,
      /privacy, /terms; `noindex` the `/videos` redirect. (S)
- [ ] **A7. Sitemap `lastModified` from real data** (blog `publishedAt` /
      `updatedAt`, a build-time date for static pages) with sensible
      `changeFrequency`/`priority`. (S)
- [ ] **A8. Performance pass**: lazy-load below-the-fold client components on
      the home page (dynamic import), trim the hero DOM, `next/font` with
      `display: swap`, long cache headers on static assets, remove bf-cache
      blockers. Target: mobile perf ≥ 90, TBT < 200 ms, LCP < 2.5 s. (M)
- [ ] **A9. Accessibility fixes** from Lighthouse (contrast, heading order,
      link names). (S)
- [ ] **A10. `manifest.ts` + Bing Webmaster Tools (import from GSC) +
      IndexNow key** so Bing/Copilot/Perplexity pick pages up fast. (S, owner
      creates the Bing account)

### Batch B — AEO (answer-engine) layer (code + content, ~1 session)
- [ ] **B1. Answer-first blocks.** On every commercial page add a 40–60-word
      direct answer under the H1 ("ClubForge is … for … from £X/month …"),
      then the detail. Same for each FAQ: question as `<h3>`, answer as plain
      `<p>` in the server HTML (keep the accordion as progressive enhancement).
- [ ] **B2. Expand `llms.txt`** to link every page with a one-line summary and
      add `/llms-full.txt` (concatenated markdown of features, pricing, FAQ,
      comparisons, and the blog). Add a "last updated" line. Reference both
      from robots.txt comments.
- [ ] **B3. Schema completion**: SoftwareApplication + Offers on /pricing,
      /features, /for/*; `Product`/`Offer` per plan on /pricing; `Article`
      with `dateModified` + a real author `Person` on blog; `Organization`
      `foundingDate`, `address`, `contactPoint`, `areaServed: GB`.
- [ ] **B4. Reviews → `AggregateRating`.** Ask the active clubs (HaMeem,
      Border Performance…) for a short testimonial + a Capterra/Google review;
      publish a /customers page with `Review` schema once there are ≥ 3.
      (owner)
- [ ] **B5. One fact sheet** (founded, HQ, price from, plans, disciplines,
      UK-based, Stripe Connect, belt progression) reused on About, llms.txt
      and Organization schema so AI engines see one version of the truth.

### Batch C — content that wins high-intent queries (content, ongoing)
- [ ] **C1. Comparison hub** `/compare` with pages:
      `mindbody-alternative`, `glofox-alternative`, `gymdesk-alternative`,
      `zen-planner-alternative`, `teamup-alternative`, `clubright-alternative`,
      plus `clubforge-vs-<x>` for the top 3. Each: honest feature table,
      pricing table (GBP), who should pick which, migration steps, FAQ schema.
      Seed from the Competitor Landscape table in ROADMAP.md.
- [ ] **C2. Pricing intelligence page** "Martial arts / gym software pricing UK
      2026" (numbers, table, methodology) — the kind of page AI engines cite.
- [ ] **C3. Deepen /features** to ~1,200 words with one H2 per feature linking
      to the sub-pages; deepen each /for/* to ~1,000 words with
      discipline-specific workflows (gradings, stripes, sparring rounds,
      class caps).
- [ ] **C4. Blog cadence**: 2 posts/month, each answering one query cluster
      ("how to run gradings", "GDPR for martial arts clubs", "child membership
      consent UK", "how to reduce gym churn", "Stripe vs GoCardless for
      clubs"). Every post: TL;DR box, FAQ, dated, author, internal links to a
      /for and a /features page.
- [ ] **C5. Programmatic pages QA**: the ~30 city pages share ~1,600 words of
      near-identical copy; add 150–250 words of genuinely local content per
      city (local governing bodies, venues, club density) or prune to the ~10
      cities with real search volume to avoid a "doorway pages" flag.
- [ ] **C6. Free tools as link magnets**: "membership pricing calculator",
      "grading certificate generator", "class timetable template" — each a
      page with `WebApplication` schema and a CTA.

### Batch D — off-site and measurement (owner-led)
- [ ] **D1. Listings**: Capterra, GetApp, G2, Software Advice, Crozdesk,
      Product Hunt, Trustpilot; UK martial-arts directories. Consistent name,
      logo and description (= the fact sheet in B5).
- [ ] **D2. Digital PR**: guest posts / mentions on UK martial-arts media and
      governing-body club-resource pages (BJJ, judo, boxing, karate bodies).
- [ ] **D3. Customer case studies** (HaMeem: multi-site, custom domain).
- [ ] **D4. Measurement**: GSC (done) + Bing WMT + Vercel Analytics/Web Vitals
      + a monthly script that pulls GSC queries/pages into
      `.agent/seo/YYYY-MM.md` so each session starts from data.

## 3. KPIs to track (monthly, from GSC + Vercel)
- Impressions / clicks / average position for: "martial arts software",
  "martial arts club software uk", "bjj gym software", "gym management
  software uk", "<competitor> alternative".
- Indexed pages vs sitemap count; pages "Crawled – currently not indexed".
- Mobile Core Web Vitals pass rate (GSC report).
- AI citations: monthly manual check of ChatGPT / Perplexity / Google AI
  Overviews for "best martial arts club software UK" and "<competitor>
  alternative".
- Sign-ups (`/get-started`) attributed to organic.

## 4. Granting Search Console access (for scripted reads)
Preferred: a Google Cloud service account added as a GSC user.
1. Google Cloud console → create (or pick) a project → APIs & Services →
   Enable "Google Search Console API".
2. IAM & Admin → Service Accounts → Create → name `clubforge-seo` → Keys →
   Add key → JSON. Download the JSON.
3. Search Console → property `clubforgehq.com` → Settings → Users and
   permissions → Add user → paste the service account's email
   (`clubforge-seo@<project>.iam.gserviceaccount.com`) → Permission: Full
   (needed for URL inspection) or Restricted (read-only performance data).
4. Save the JSON in the repo root as `gsc-service-account.json` (git-ignored)
   or set `GSC_SERVICE_ACCOUNT_JSON` in `.env.local`. Never commit it.
5. `scripts/gsc-report.mjs` (to be written) pulls the last 28 days of
   queries / pages / devices and writes `.agent/seo/<month>.md`.

Alternative with no cloud setup: GSC → Performance → Export → CSV, drop the
files in `.agent/seo/exports/` and the same script reads them.

## 5. Re-audit commands
- Titles/canonicals: `curl -s https://clubforgehq.com/<path> | grep -oE '<title>[^<]*</title>|<link rel="canonical"[^>]*>'`
- Static vs dynamic: `node -e "console.log(Object.keys(require('./.next/prerender-manifest.json').routes))"` after `npx next build`
- Lighthouse: `npx lighthouse@12 https://clubforgehq.com/ --form-factor=mobile --screenEmulation.mobile --output=json --output-path=lh.json --chrome-flags="--headless=new"`
- Rich results: https://search.google.com/test/rich-results ; schema: https://validator.schema.org
