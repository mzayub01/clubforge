"""
Martial Arts / Combat Sports Club Scraper
==========================================
Scrapes Google Maps for clubs across a configured region,
then visits each club's website to extract email/phone contacts.

Usage:
    python scraper.py                              # Full scrape (UK default)
    python scraper.py --region uae                 # Full scrape (UAE)
    python scraper.py --region uae --test          # Test mode (1 discipline, 1 city)
    python scraper.py --discipline BJJ             # Single discipline
    python scraper.py --city London                # Single city
    python scraper.py --resume                     # Resume from checkpoint
    python scraper.py --enrich-only                # Skip Maps, only enrich existing data
"""

import argparse
import csv
import json
import os
import random
import re
import sys
import time
from datetime import datetime, timezone

from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout

# Config is loaded dynamically based on --region flag (see main())
# These module-level variables are populated before use
DISCIPLINES = {}
CITIES = []
COUNTRY_SUFFIX = ""
MIN_DELAY = 2
MAX_DELAY = 5
PAGE_LOAD_WAIT = 3
SCROLL_PAUSE = 2
MAX_SCROLLS = 15
OUTPUT_DIR = "output"
CHECKPOINT_FILE = ""
CSV_OUTPUT = ""
JSON_OUTPUT = ""
CSV_HEADERS = []
REGION = "uk"

from extractors import extract_location_code, scrape_website_contacts


def ensure_output_dir():
    """Create output directory if it doesn't exist."""
    os.makedirs(OUTPUT_DIR, exist_ok=True)


def random_delay(min_s=MIN_DELAY, max_s=MAX_DELAY):
    """Sleep for a random duration to avoid being rate-limited."""
    delay = random.uniform(min_s, max_s)
    time.sleep(delay)


def load_checkpoint():
    """Load progress checkpoint."""
    if os.path.exists(CHECKPOINT_FILE):
        with open(CHECKPOINT_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {"completed_searches": [], "clubs": []}


def save_checkpoint(data):
    """Save progress checkpoint."""
    ensure_output_dir()
    with open(CHECKPOINT_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def search_key(discipline, city):
    """Generate a unique key for a discipline+city search."""
    return f"{discipline}|{city}"


def scrape_google_maps(page, discipline_key, discipline_term, city):
    """
    Search Google Maps for a martial art in a specific city.
    Returns a list of club dicts extracted from the results.
    """
    clubs = []
    query = f"{discipline_term} near {city}{COUNTRY_SUFFIX}"
    maps_url = f"https://www.google.com/maps/search/{query.replace(' ', '+')}"

    print(f"  🔍 Searching: {query}")

    try:
        page.goto(maps_url, wait_until="domcontentloaded", timeout=30000)
        time.sleep(PAGE_LOAD_WAIT)

        # Accept cookies if the consent dialog appears
        try:
            consent_btn = page.locator('button:has-text("Accept all")').first
            if consent_btn.is_visible(timeout=3000):
                consent_btn.click()
                time.sleep(1)
        except Exception:
            pass

        # Wait for results to load
        time.sleep(PAGE_LOAD_WAIT)

        # Check if we have a results panel (the left sidebar with listings)
        results_panel = page.locator('div[role="feed"]').first
        try:
            results_panel.wait_for(state="visible", timeout=10000)
        except PlaywrightTimeout:
            # Might be a single result or no results
            print(f"    ℹ No results panel found for {query}")
            # Try to extract from a single business view
            single_club = extract_single_business(page, discipline_key, city)
            if single_club:
                clubs.append(single_club)
            return clubs

        # Scroll through the results panel to load more
        for scroll_num in range(MAX_SCROLLS):
            try:
                results_panel.evaluate('(el) => el.scrollTop = el.scrollHeight')
                time.sleep(SCROLL_PAUSE)

                # Check for "end of list" indicator
                end_marker = page.locator('span.HlvSq:has-text("end of list")').first
                try:
                    if end_marker.is_visible(timeout=500):
                        print(f"    ✓ Reached end of results (scroll {scroll_num + 1})")
                        break
                except Exception:
                    pass

                # Also check the "You've reached the end" text
                try:
                    end_text = page.locator('p.fontBodyMedium:has-text("reached the end")').first
                    if end_text.is_visible(timeout=500):
                        print(f"    ✓ Reached end of results (scroll {scroll_num + 1})")
                        break
                except Exception:
                    pass

            except Exception:
                break

        # Extract all listing entries
        listings = page.locator('div[role="feed"] > div > div > a[href*="/maps/place/"]').all()
        print(f"    📋 Found {len(listings)} listings")

        for listing in listings:
            try:
                club = extract_listing_data(listing, page, discipline_key, city)
                if club and club.get('name'):
                    clubs.append(club)
            except Exception as e:
                continue

    except PlaywrightTimeout:
        print(f"    ⚠ Timeout searching for {query}")
    except Exception as e:
        print(f"    ⚠ Error searching {query}: {e}")

    return clubs


def extract_listing_data(listing, page, discipline_key, city):
    """
    Extract club data from a Google Maps listing element.
    """
    club = {
        'name': '',
        'discipline': discipline_key,
        'address': '',
        'city': city,
        'area': '',
        'phone': '',
        'email': '',
        'website': '',
        'rating': '',
        'reviews_count': '',
        'source': 'google_maps',
        'scraped_at': datetime.now(timezone.utc).isoformat()
    }

    try:
        # Get the aria-label which usually contains the name
        aria = listing.get_attribute('aria-label') or ''
        club['name'] = aria.strip()

        # Get the href which contains the place info
        href = listing.get_attribute('href') or ''

        # Click to get details from the side panel
        listing.click()
        time.sleep(1.5)

        # Extract details from the opened panel
        try:
            # Address
            address_el = page.locator('button[data-item-id="address"] div.fontBodyMedium').first
            if address_el.is_visible(timeout=2000):
                club['address'] = address_el.inner_text().strip()
                club['area'] = extract_location_code(club['address'], REGION)
        except Exception:
            pass

        try:
            # Phone
            phone_el = page.locator('button[data-item-id*="phone:tel:"] div.fontBodyMedium').first
            if phone_el.is_visible(timeout=1000):
                club['phone'] = phone_el.inner_text().strip()
        except Exception:
            pass

        try:
            # Website
            website_el = page.locator('a[data-item-id="authority"]').first
            if website_el.is_visible(timeout=1000):
                club['website'] = website_el.get_attribute('href') or ''
        except Exception:
            pass

        try:
            # Rating
            rating_el = page.locator('div.fontDisplayLarge').first
            if rating_el.is_visible(timeout=1000):
                club['rating'] = rating_el.inner_text().strip()
        except Exception:
            pass

        try:
            # Review count
            reviews_el = page.locator('button[jsaction*="reviewChart"] span').first
            if reviews_el.is_visible(timeout=1000):
                reviews_text = reviews_el.inner_text().strip()
                # Extract number from text like "(123)"
                num_match = re.search(r'(\d[\d,]*)', reviews_text)
                if num_match:
                    club['reviews_count'] = num_match.group(1).replace(',', '')
        except Exception:
            pass

        # Click back to return to results list
        try:
            back_btn = page.locator('button[aria-label="Back"]').first
            if back_btn.is_visible(timeout=1000):
                back_btn.click()
                time.sleep(1)
        except Exception:
            pass

    except Exception as e:
        pass

    return club


def extract_single_business(page, discipline_key, city):
    """
    Extract data when Google Maps shows a single business instead of a list.
    """
    club = {
        'name': '',
        'discipline': discipline_key,
        'address': '',
        'city': city,
        'area': '',
        'phone': '',
        'email': '',
        'website': '',
        'rating': '',
        'reviews_count': '',
        'source': 'google_maps',
        'scraped_at': datetime.now(timezone.utc).isoformat()
    }

    try:
        # Name from the title
        title = page.locator('h1.DUwDvf').first
        if title.is_visible(timeout=3000):
            club['name'] = title.inner_text().strip()
        else:
            return None

        # Address
        try:
            addr = page.locator('button[data-item-id="address"] div.fontBodyMedium').first
            if addr.is_visible(timeout=2000):
                club['address'] = addr.inner_text().strip()
                club['area'] = extract_location_code(club['address'], REGION)
        except Exception:
            pass

        # Phone
        try:
            phone = page.locator('button[data-item-id*="phone:tel:"] div.fontBodyMedium').first
            if phone.is_visible(timeout=1000):
                club['phone'] = phone.inner_text().strip()
        except Exception:
            pass

        # Website
        try:
            website = page.locator('a[data-item-id="authority"]').first
            if website.is_visible(timeout=1000):
                club['website'] = website.get_attribute('href') or ''
        except Exception:
            pass

    except Exception:
        return None

    return club if club['name'] else None


def deduplicate_clubs(clubs):
    """
    Remove duplicate clubs based on name + postcode (or name + city if no postcode).
    """
    seen = {}
    unique = []

    for club in clubs:
        name_clean = re.sub(r'[^a-z0-9]', '', club.get('name', '').lower())
        area = club.get('area', '').replace(' ', '').lower()
        city = club.get('city', '').lower()

        key = f"{name_clean}|{area or city}"

        if key not in seen:
            seen[key] = club
            unique.append(club)
        else:
            # Merge: keep the entry with more data
            existing = seen[key]
            for field in ['phone', 'email', 'website', 'address', 'rating']:
                if not existing.get(field) and club.get(field):
                    existing[field] = club[field]
            # Merge discipline info
            existing_disc = existing.get('discipline', '')
            new_disc = club.get('discipline', '')
            if new_disc and new_disc not in existing_disc:
                existing['discipline'] = f"{existing_disc}, {new_disc}"

    return unique


def enrich_with_website_data(clubs, start_idx=0):
    """
    Visit each club's website to extract email and phone numbers.
    """
    total = len(clubs)
    enriched_count = 0

    for i, club in enumerate(clubs):
        if i < start_idx:
            continue

        website = club.get('website', '')
        if not website:
            continue

        print(f"  🌐 [{i+1}/{total}] Enriching: {club['name']}")

        contacts = scrape_website_contacts(website, region=REGION)

        if contacts['emails']:
            club['email'] = '; '.join(contacts['emails'][:3])  # Keep up to 3 emails
            enriched_count += 1

        if contacts['phones'] and not club.get('phone'):
            club['phone'] = contacts['phones'][0]

        random_delay(1, 3)

        # Save checkpoint every 50 clubs
        if (i + 1) % 50 == 0:
            print(f"    💾 Checkpoint saved ({i + 1}/{total} enriched)")

    print(f"  ✅ Enriched {enriched_count} clubs with website contact data")
    return clubs


def export_csv(clubs, filepath=None):
    """Export clubs to CSV file."""
    filepath = filepath or CSV_OUTPUT
    ensure_output_dir()
    with open(filepath, 'w', newline='', encoding='utf-8-sig') as f:
        writer = csv.DictWriter(f, fieldnames=CSV_HEADERS, extrasaction='ignore')
        writer.writeheader()
        writer.writerows(clubs)
    print(f"  📁 CSV exported: {filepath} ({len(clubs)} clubs)")


def export_json(clubs, filepath=None):
    """Export clubs to JSON file."""
    filepath = filepath or JSON_OUTPUT
    ensure_output_dir()
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(clubs, f, indent=2, ensure_ascii=False)
    print(f"  📁 JSON exported: {filepath} ({len(clubs)} clubs)")


def print_summary(clubs):
    """Print a summary of the scraped data."""
    print("\n" + "=" * 60)
    print("📊 SCRAPE SUMMARY")
    print("=" * 60)
    print(f"  Total clubs found:    {len(clubs)}")

    # Count by discipline
    disc_counts = {}
    for c in clubs:
        for d in c.get('discipline', 'Unknown').split(', '):
            disc_counts[d] = disc_counts.get(d, 0) + 1

    print("\n  By Discipline:")
    for disc, count in sorted(disc_counts.items(), key=lambda x: -x[1]):
        print(f"    {disc:20s} {count:5d}")

    # Count contacts
    with_email = sum(1 for c in clubs if c.get('email'))
    with_phone = sum(1 for c in clubs if c.get('phone'))
    with_website = sum(1 for c in clubs if c.get('website'))

    print(f"\n  With email:           {with_email} ({100*with_email/max(len(clubs),1):.1f}%)")
    print(f"  With phone:           {with_phone} ({100*with_phone/max(len(clubs),1):.1f}%)")
    print(f"  With website:         {with_website} ({100*with_website/max(len(clubs),1):.1f}%)")
    print("=" * 60)


def load_region_config(region):
    """Load configuration for the specified region."""
    global DISCIPLINES, CITIES, COUNTRY_SUFFIX
    global MIN_DELAY, MAX_DELAY, PAGE_LOAD_WAIT, SCROLL_PAUSE, MAX_SCROLLS
    global OUTPUT_DIR, CHECKPOINT_FILE, CSV_OUTPUT, JSON_OUTPUT, CSV_HEADERS
    global REGION

    REGION = region

    if region == 'uae':
        import config_uae as cfg
        CITIES = cfg.UAE_CITIES
        COUNTRY_SUFFIX = cfg.COUNTRY_SUFFIX
    else:
        import config as cfg
        CITIES = cfg.UK_CITIES
        COUNTRY_SUFFIX = ", UK"

    DISCIPLINES = cfg.DISCIPLINES
    MIN_DELAY = cfg.MIN_DELAY
    MAX_DELAY = cfg.MAX_DELAY
    PAGE_LOAD_WAIT = cfg.PAGE_LOAD_WAIT
    SCROLL_PAUSE = cfg.SCROLL_PAUSE
    MAX_SCROLLS = cfg.MAX_SCROLLS
    OUTPUT_DIR = cfg.OUTPUT_DIR
    CHECKPOINT_FILE = cfg.CHECKPOINT_FILE
    CSV_OUTPUT = cfg.CSV_OUTPUT
    JSON_OUTPUT = cfg.JSON_OUTPUT
    CSV_HEADERS = cfg.CSV_HEADERS


def main():
    parser = argparse.ArgumentParser(description='Martial Arts / Combat Sports Club Scraper')
    parser.add_argument('--region', type=str, default='uk', choices=['uk', 'uae'],
                        help='Region to scrape: uk (default) or uae')
    parser.add_argument('--test', action='store_true', help='Test mode: 1 discipline, 1 city')
    parser.add_argument('--discipline', type=str, help='Scrape a single discipline (e.g. BJJ, Judo)')
    parser.add_argument('--city', type=str, help='Scrape a single city (e.g. London, Dubai)')
    parser.add_argument('--resume', action='store_true', help='Resume from checkpoint')
    parser.add_argument('--enrich-only', action='store_true', help='Skip Maps search, only enrich existing data')
    parser.add_argument('--no-enrich', action='store_true', help='Skip website enrichment step')
    parser.add_argument('--headed', action='store_true', help='Run browser in headed mode (visible)')
    args = parser.parse_args()

    # Load region-specific configuration
    load_region_config(args.region)
    ensure_output_dir()

    region_label = 'UAE COMBAT SPORTS' if args.region == 'uae' else 'UK MARTIAL ARTS'
    test_city = 'Dubai' if args.region == 'uae' else 'London'

    print("=" * 60)
    print(f"🥋 {region_label} CLUB SCRAPER")
    print("=" * 60)

    # Determine what to scrape
    if args.test:
        disciplines = {"BJJ": DISCIPLINES["BJJ"]}
        cities = [test_city]
        print(f"  ⚡ TEST MODE: BJJ in {test_city} only")
    else:
        disciplines = dict(DISCIPLINES)
        cities = list(CITIES)

        if args.discipline:
            key = args.discipline
            if key in DISCIPLINES:
                disciplines = {key: DISCIPLINES[key]}
            else:
                print(f"  ❌ Unknown discipline: {key}")
                print(f"  Available: {', '.join(DISCIPLINES.keys())}")
                sys.exit(1)

        if args.city:
            if args.city in CITIES:
                cities = [args.city]
            else:
                cities = [args.city]  # Allow custom city even if not in config
                print(f"  ℹ Custom city: {args.city}")

    total_searches = len(disciplines) * len(cities)
    print(f"  📋 Disciplines: {len(disciplines)} | Cities: {len(cities)} | Total searches: {total_searches}")
    print()

    # Load checkpoint
    checkpoint = load_checkpoint()
    completed = set(checkpoint.get('completed_searches', []))
    all_clubs = checkpoint.get('clubs', []) if args.resume else []

    if args.resume and all_clubs:
        print(f"  ♻ Resuming from checkpoint: {len(all_clubs)} clubs, {len(completed)} searches done")

    # Phase 1: Google Maps scraping
    if not args.enrich_only:
        print("━" * 60)
        print("📍 PHASE 1: Google Maps Search")
        print("━" * 60)

        with sync_playwright() as p:
            browser = p.chromium.launch(
                headless=not args.headed,
                args=[
                    '--disable-blink-features=AutomationControlled',
                    '--disable-features=IsolateOrigins,site-per-process',
                ]
            )

            locale = 'en-AE' if args.region == 'uae' else 'en-GB'
            tz = 'Asia/Dubai' if args.region == 'uae' else 'Europe/London'

            context = browser.new_context(
                viewport={'width': 1280, 'height': 900},
                locale=locale,
                timezone_id=tz,
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            )

            page = context.new_page()

            search_count = 0
            for disc_key, disc_term in disciplines.items():
                for city in cities:
                    skey = search_key(disc_key, city)

                    if skey in completed:
                        search_count += 1
                        continue

                    search_count += 1
                    print(f"\n[{search_count}/{total_searches}] {disc_key} in {city}")

                    clubs = scrape_google_maps(page, disc_key, disc_term, city)

                    if clubs:
                        all_clubs.extend(clubs)
                        print(f"    ✅ Found {len(clubs)} clubs")
                    else:
                        print(f"    ℹ No clubs found")

                    # Update checkpoint
                    completed.add(skey)
                    checkpoint['completed_searches'] = list(completed)
                    checkpoint['clubs'] = all_clubs
                    save_checkpoint(checkpoint)

                    random_delay()

            browser.close()

        # Deduplicate
        print(f"\n  🔄 Deduplicating {len(all_clubs)} raw entries...")
        all_clubs = deduplicate_clubs(all_clubs)
        print(f"  ✅ {len(all_clubs)} unique clubs after deduplication")

        # Save checkpoint with deduplicated data
        checkpoint['clubs'] = all_clubs
        save_checkpoint(checkpoint)

    else:
        # Enrich-only mode: load existing data
        if all_clubs:
            print(f"  📂 Loaded {len(all_clubs)} clubs from checkpoint")
        else:
            print("  ❌ No checkpoint data found. Run a Maps search first.")
            sys.exit(1)

    # Phase 2: Website enrichment
    if not args.no_enrich:
        print("\n" + "━" * 60)
        print("🌐 PHASE 2: Website Contact Enrichment")
        print("━" * 60)

        clubs_with_sites = sum(1 for c in all_clubs if c.get('website'))
        print(f"  📋 {clubs_with_sites} clubs have websites to check")

        all_clubs = enrich_with_website_data(all_clubs)

        # Save updated checkpoint
        checkpoint['clubs'] = all_clubs
        save_checkpoint(checkpoint)

    # Phase 3: Export
    print("\n" + "━" * 60)
    print("📦 PHASE 3: Export")
    print("━" * 60)

    export_csv(all_clubs)
    export_json(all_clubs)

    print_summary(all_clubs)

    print("\n✅ Done! Files saved to:")
    print(f"   📄 {CSV_OUTPUT}")
    print(f"   📄 {JSON_OUTPUT}")


if __name__ == '__main__':
    main()
