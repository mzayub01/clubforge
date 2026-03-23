"""
Data Cleanup Script for Martial Arts / Combat Sports Scraper
=============================================================
Deduplicates and cleans the scraped club data.

Fixes:
  1. Removes entries where different club names share the same address+phone+website
     (Google Maps artifact from stale detail panels)
  2. Re-applies the improved email filter to remove Wix/Sentry false positives
  3. Removes non-martial-arts results that crept in
  4. Normalizes phone numbers and location codes
  5. Exports cleaned data to new CSV/JSON files

Usage:
    python clean_data.py                        # Clean UK data (default)
    python clean_data.py --region uae           # Clean UAE data
    python clean_data.py --input output/file.json  # Clean from specific JSON
"""

import argparse
import csv
import json
import os
import re
from collections import defaultdict
from datetime import datetime, timezone

# Config loaded dynamically in main()
CSV_HEADERS = []
OUTPUT_DIR = "output"
CLEAN_REGION = "uk"

from extractors import extract_emails, extract_phones, extract_postcode, extract_location_code


# Non-martial-arts keywords that indicate a wrong result
NON_MA_KEYWORDS = [
    'pureGym', 'the gym group', 'anytime fitness', 'david lloyd',
    'virgin active', 'nuffield', 'bannatyne', 'fitness first',
    'better gym', 'jd gym', 'snap fitness', 'planet fitness',
    'decathlon', 'sports direct', 'leisure centre',
    'community centre', 'swimming', 'trampolining',
    'yoga studio', 'pilates', 'crossfit',
    'physiotherapy', 'chiropract', 'osteopath',
    'personal training only', 'fencing club',
    'archery', 'golf', 'tennis', 'cricket', 'football',
    'rugby', 'netball', 'basketball', 'volleyball',
    'dance school', 'ballet',
]

# Additional UAE-specific exclusion keywords
UAE_NON_MA_KEYWORDS = [
    'ladies salon', 'beauty salon', 'spa ', 'hotel gym',
    'hotel fitness', 'physiotherapy', 'rehab center',
    'rehabilitation', 'playground', 'trampoline park',
    'bounce', 'laser tag', 'escape room',
]

# Martial arts keywords that confirm a result is relevant
MA_KEYWORDS = [
    'jiu jitsu', 'jiu-jitsu', 'jiujitsu', 'bjj', 'grappling',
    'mma', 'mixed martial art', 'martial art', 'combat',
    'judo', 'karate', 'taekwondo', 'tae kwon do', 'tkd',
    'kickbox', 'kick box', 'muay thai', 'thai box',
    'boxing', 'kung fu', 'kungfu', 'aikido', 'krav maga',
    'self defence', 'self defense', 'jujitsu', 'ju jitsu',
    'dojo', 'academy', 'fighter', 'grapple', 'submission',
    'wrestling', 'sambo', 'capoeira', 'wing chun', 'wing tsun',
    'ninjutsu', 'hapkido', 'kenpo', 'kempo', 'bujinkan',
]


def is_martial_arts_club(club, region='uk'):
    """Check if a club is likely a martial arts club based on its name."""
    name = club.get('name', '').lower()

    # Check if it matches any MA keywords — if yes, keep it
    for kw in MA_KEYWORDS:
        if kw in name:
            return True

    # Check if it matches any non-MA keywords — if yes, likely not a club
    exclusions = NON_MA_KEYWORDS + (UAE_NON_MA_KEYWORDS if region == 'uae' else [])
    for kw in exclusions:
        if kw.lower() in name:
            return False

    # If neither matched, keep it (benefit of the doubt)
    return True


def clean_email_field(email_str):
    """Re-filter emails through the improved extractor."""
    if not email_str:
        return ''

    # Split semicolon-separated emails
    raw_emails = [e.strip() for e in email_str.split(';') if e.strip()]
    clean = extract_emails(' '.join(raw_emails))
    return '; '.join(clean) if clean else ''


def normalize_phone(phone, region='uk'):
    """Normalize a phone number for the specified region."""
    if not phone:
        return ''

    clean = re.sub(r'[\s\-]+', '', phone)

    if region == 'uae':
        # Normalize to +971 format
        if clean.startswith('00971'):
            clean = '+971' + clean[5:]
        elif clean.startswith('0'):
            clean = '+971' + clean[1:]
        digits = re.sub(r'\D', '', clean)
        if len(digits) < 9 or len(digits) > 12:
            return ''
        # Format: +971 XX XXX XXXX
        if clean.startswith('+971') and len(digits) == 12:
            local = clean[4:]
            return f"+971 {local[:2]} {local[2:5]} {local[5:]}"
        return clean
    else:
        # UK normalization
        if clean.startswith('+44'):
            clean = '0' + clean[3:]
        digits = re.sub(r'\D', '', clean)
        if len(digits) < 10 or len(digits) > 11:
            return ''
        if digits.startswith('07') and len(digits) == 11:
            return f"{digits[:5]} {digits[5:8]} {digits[8:]}"
        elif digits.startswith('01') or digits.startswith('02'):
            if len(digits) >= 10:
                return f"{digits[:4]} {digits[4:7]} {digits[7:]}"
        return clean


def deduplicate_by_address(clubs):
    """
    Advanced deduplication:
    1. Group by (address + phone + website) — keep the best name from each group
    2. Group by (address only) — merge contact data but keep separate entries if they look genuinely different
    """

    # Phase 1: Exact match on address+phone+website
    groups = defaultdict(list)
    for club in clubs:
        addr = club.get('address', '').strip().lower()
        phone = re.sub(r'\s+', '', club.get('phone', ''))
        website = club.get('website', '').strip().lower().rstrip('/')

        key = f"{addr}|{phone}|{website}"
        groups[key].append(club)

    deduplicated = []
    for key, group in groups.items():
        if len(group) == 1:
            deduplicated.append(group[0])
        else:
            # Pick the best entry from the group
            best = pick_best_entry(group)
            deduplicated.append(best)

    return deduplicated


def pick_best_entry(group):
    """
    From a group of duplicate entries, pick the best one.
    Prefers: longer name, more data fields filled, martial arts keywords in name.
    """

    def score(club):
        s = 0
        name = club.get('name', '').lower()

        # Prefer names with martial arts keywords
        for kw in MA_KEYWORDS:
            if kw in name:
                s += 10
                break

        # Prefer entries with more data
        if club.get('email'):
            s += 5
        if club.get('phone'):
            s += 3
        if club.get('website'):
            s += 2
        if club.get('rating'):
            s += 1
        if club.get('postcode'):
            s += 1
        if club.get('area'):
            s += 1

        # Prefer longer, more descriptive names (but not too long)
        name_len = len(club.get('name', ''))
        if 10 <= name_len <= 60:
            s += 3
        elif name_len > 60:
            s += 1

        # Penalize generic names
        generic = ['gym', 'fitness', 'leisure', 'centre', 'center']
        for g in generic:
            if g in name and not any(kw in name for kw in MA_KEYWORDS):
                s -= 5

        return s

    group.sort(key=score, reverse=True)

    # Take the best entry but merge in any extra data from others
    best = group[0].copy()
    for other in group[1:]:
        if not best.get('email') and other.get('email'):
            best['email'] = other['email']
        if not best.get('phone') and other.get('phone'):
            best['phone'] = other['phone']
        if not best.get('rating') and other.get('rating'):
            best['rating'] = other['rating']
        if not best.get('reviews_count') and other.get('reviews_count'):
            best['reviews_count'] = other['reviews_count']

    return best


def clean_data(clubs, region='uk'):
    """Full cleaning pipeline."""

    print(f"  📊 Starting with {len(clubs)} raw entries")

    # Step 1: Remove non-MA results
    clubs = [c for c in clubs if is_martial_arts_club(c, region=region)]
    print(f"  🥋 After MA filter: {len(clubs)} entries")

    # Step 2: Clean emails
    for club in clubs:
        club['email'] = clean_email_field(club.get('email', ''))

    # Step 3: Normalize phones
    for club in clubs:
        club['phone'] = normalize_phone(club.get('phone', ''), region=region)

    # Step 4: Ensure location codes
    for club in clubs:
        if region == 'uae':
            if not club.get('area') and club.get('address'):
                club['area'] = extract_location_code(club['address'], region)
        else:
            if not club.get('postcode') and club.get('address'):
                club['postcode'] = extract_postcode(club['address'])

    # Step 5: Deduplicate
    clubs = deduplicate_by_address(clubs)
    print(f"  🔄 After deduplication: {len(clubs)} unique entries")

    # Step 6: Remove entries with no useful contact data at all
    clubs_with_data = [c for c in clubs if c.get('phone') or c.get('email') or c.get('website')]
    removed = len(clubs) - len(clubs_with_data)
    if removed > 0:
        print(f"  🗑️  Removed {removed} entries with no contact data")
        clubs = clubs_with_data

    # Step 7: Sort by city, then name
    clubs.sort(key=lambda c: (c.get('city', ''), c.get('name', '')))

    print(f"  ✅ Final clean dataset: {len(clubs)} clubs")
    return clubs


def print_summary(clubs):
    """Print summary stats."""
    print("\n" + "=" * 60)
    print("📊 CLEANED DATA SUMMARY")
    print("=" * 60)
    print(f"  Total unique clubs:   {len(clubs)}")

    with_email = sum(1 for c in clubs if c.get('email'))
    with_phone = sum(1 for c in clubs if c.get('phone'))
    with_website = sum(1 for c in clubs if c.get('website'))
    with_location = sum(1 for c in clubs if c.get('postcode') or c.get('area'))

    print(f"  With email:           {with_email} ({100*with_email/max(len(clubs),1):.1f}%)")
    print(f"  With phone:           {with_phone} ({100*with_phone/max(len(clubs),1):.1f}%)")
    print(f"  With website:         {with_website} ({100*with_website/max(len(clubs),1):.1f}%)")
    print(f"  With location code:   {with_location} ({100*with_location/max(len(clubs),1):.1f}%)")

    # Top 10 cities
    city_counts = defaultdict(int)
    for c in clubs:
        city_counts[c.get('city', 'Unknown')] += 1

    print(f"\n  Top 15 cities:")
    for city, count in sorted(city_counts.items(), key=lambda x: -x[1])[:15]:
        print(f"    {city:25s} {count:5d}")

    print("=" * 60)


def export_csv(clubs, filepath):
    """Export to CSV."""
    with open(filepath, 'w', newline='', encoding='utf-8-sig') as f:
        writer = csv.DictWriter(f, fieldnames=CSV_HEADERS, extrasaction='ignore')
        writer.writeheader()
        writer.writerows(clubs)
    print(f"  📁 CSV: {filepath} ({len(clubs)} clubs)")


def export_json(clubs, filepath):
    """Export to JSON."""
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(clubs, f, indent=2, ensure_ascii=False)
    print(f"  📁 JSON: {filepath} ({len(clubs)} clubs)")


def main():
    parser = argparse.ArgumentParser(description='Clean scraped club data')
    parser.add_argument('--region', type=str, default='uk', choices=['uk', 'uae'],
                        help='Region: uk (default) or uae')
    parser.add_argument('--input', type=str, help='Input JSON file (default: checkpoint)')
    args = parser.parse_args()

    global CSV_HEADERS, OUTPUT_DIR, CLEAN_REGION
    CLEAN_REGION = args.region

    if args.region == 'uae':
        import config_uae as cfg
    else:
        import config as cfg

    CSV_HEADERS = cfg.CSV_HEADERS
    OUTPUT_DIR = cfg.OUTPUT_DIR

    region_label = 'UAE COMBAT SPORTS' if args.region == 'uae' else 'UK MARTIAL ARTS'

    print("=" * 60)
    print(f"🧹 {region_label} CLUB DATA CLEANER")
    print("=" * 60)

    # Load data
    if args.input:
        with open(args.input, 'r', encoding='utf-8') as f:
            clubs = json.load(f)
    else:
        checkpoint_file = cfg.CHECKPOINT_FILE
        with open(checkpoint_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
            clubs = data.get('clubs', [])

    if not clubs:
        print("  ❌ No data found!")
        return

    # Clean
    clubs = clean_data(clubs, region=args.region)

    # Summary
    print_summary(clubs)

    # Export
    print("\n  📦 Exporting cleaned data...")
    if args.region == 'uae':
        csv_path = os.path.join(OUTPUT_DIR, 'uae_combat_sports_clubs_clean.csv')
        json_path = os.path.join(OUTPUT_DIR, 'uae_combat_sports_clubs_clean.json')
    else:
        csv_path = os.path.join(OUTPUT_DIR, 'uk_martial_arts_clubs_clean.csv')
        json_path = os.path.join(OUTPUT_DIR, 'uk_martial_arts_clubs_clean.json')

    export_csv(clubs, csv_path)
    export_json(clubs, json_path)

    print(f"\n✅ Done! Clean files saved to:")
    print(f"   📄 {csv_path}")
    print(f"   📄 {json_path}")


if __name__ == '__main__':
    main()
