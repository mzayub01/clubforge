---
description: How to build and run the ClubForge project
---

## Development

// turbo-all

1. Start the dev server:
```
cd c:\Users\user\dev\dojohub
npm run dev
```

2. Run a production build (verify changes compile):
```
cd c:\Users\user\dev\dojohub
Remove-Item .next -Recurse -Force -ErrorAction SilentlyContinue
npx next build
```

3. Clean build (if stale cache issues):
```
cd c:\Users\user\dev\dojohub
Remove-Item .next -Recurse -Force -ErrorAction SilentlyContinue
npx next build 2>&1 | Out-File -FilePath build_output.txt -Encoding utf8
Get-Content build_output.txt -Tail 60
```

## Key Context Files

Before starting work, review these reference docs:

- `.agent/ARCHITECTURE.md` — Full project context, tech stack, tenancy model
- `.agent/DECISIONS.md` — All design decisions, principles, conventions
- `.agent/ROADMAP.md` — Phase progress, plans, TODOs

## Database Migrations

Migrations are in `supabase/migrations/` and should be run on Supabase SQL Editor:

| Order | File | Purpose |
|-------|------|---------|
| 1 | `001_multi_tenancy.sql` | Core tenancy schema |
| 2 | `002_tenant_resolution_fallback.sql` | Resolution helpers |
| 3 | `003_tenant_gap_fix.sql` | Gap fixes |
| 4 | `004_onboarding_schema.sql` | Tier rename + onboarding columns |
