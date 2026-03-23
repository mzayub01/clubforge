# UK Martial Arts Club Scraper 🥋

Scrapes Google Maps for martial arts clubs across the UK, then visits each club's website to extract email addresses and phone numbers.

## Setup

```bash
# 1. Install Python dependencies
pip install -r requirements.txt

# 2. Install Playwright browsers (one-time setup)
playwright install chromium
```

## Usage

### Test Mode (recommended first run)
Scrapes just BJJ clubs in London to verify everything works:
```bash
python scraper.py --test
```

### Full Scrape
Scrapes all 8 disciplines across 100+ UK cities. Takes several hours:
```bash
python scraper.py
```

### Single Discipline or City
```bash
python scraper.py --discipline BJJ
python scraper.py --city Manchester
python scraper.py --discipline Judo --city Leeds
```

### Resume from Checkpoint
If interrupted, resume where you left off:
```bash
python scraper.py --resume
```

### Enrich Only
Skip Google Maps search, just visit websites for existing data:
```bash
python scraper.py --enrich-only
```

### Headed Mode (see the browser)
Watch Playwright do its thing:
```bash
python scraper.py --test --headed
```

## Disciplines
| Key | Search Term |
|-----|------------|
| BJJ | Brazilian Jiu Jitsu |
| MMA | Mixed Martial Arts MMA |
| Judo | Judo |
| Karate | Karate |
| Taekwondo | Taekwondo |
| Kickboxing | Kickboxing |
| Muay Thai | Muay Thai / Thai Boxing |
| Martial Arts | Martial Arts (general) |

## Output

Results are saved to the `output/` folder:
- `uk_martial_arts_clubs.csv` — Excel-friendly CSV
- `uk_martial_arts_clubs.json` — Structured JSON
- `checkpoint.json` — Progress checkpoint for resuming

### CSV Fields
`name`, `discipline`, `address`, `city`, `postcode`, `phone`, `email`, `website`, `rating`, `reviews_count`, `source`, `scraped_at`

## Tips
- The **test mode** run takes ~2-3 minutes. Use it first to verify setup.
- A **full scrape** will take 4-8 hours due to rate limiting delays. Run it overnight.
- **Checkpoint support** means you can safely Ctrl+C and resume later with `--resume`.
- Use `--no-enrich` to skip the website phase if you only need Google Maps data.
