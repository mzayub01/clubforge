"""
Email and phone number extraction utilities for club websites.
"""

import re
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from config import REQUEST_TIMEOUT


# Email regex - matches standard email patterns, filters out common false positives
EMAIL_REGEX = re.compile(
    r'[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}',
    re.IGNORECASE
)

# UK phone number patterns
UK_PHONE_REGEX = re.compile(
    r'(?:'
    r'(?:\+44\s?|0)(?:'
    r'(?:1\d{3}|\d{4})\s?\d{3}\s?\d{3,4}'  # Landlines: 01234 567890
    r'|7\d{3}\s?\d{3}\s?\d{3}'               # Mobiles: 07123 456789
    r'|[23]\d\s?\d{4}\s?\d{4}'               # London/regional: 020 1234 5678
    r'|800\s?\d{3}\s?\d{3,4}'               # Freephone: 0800 123 4567
    r')'
    r')',
    re.VERBOSE
)

# UAE phone number patterns
UAE_PHONE_REGEX = re.compile(
    r'(?:'
    r'(?:\+971[\s\-]?|00971[\s\-]?|0)'
    r'(?:'
    r'5[0-9][\s\-]?'       # Mobiles: 05X
    r'|[2-4679][\s\-]?'    # Landlines: 02, 03, 04, 06, 07, 09
    r')'
    r'\d{3}[\s\-]?\d{4}'
    r')',
    re.VERBOSE
)

# False positive email domains to filter out
IGNORE_EMAIL_DOMAINS = {
    'example.com', 'domain.com', 'email.com', 'test.com',
    'sentry.io', 'wixpress.com', 'sentry-next.wixpress.com', 'w3.org',
    'googleusercontent.com', 'gstatic.com', 'googleapis.com',
    'schema.org', 'wordpress.org', 'jquery.com', 'facebook.com',
    'twitter.com', 'instagram.com', 'youtube.com', 'google.com',
    'cloudflare.com', 'jsdelivr.net', 'bootstrapcdn.com',
    'fontawesome.com', 'wp.com', 'gravatar.com', 'godaddy.com',
    'squarespace.com', 'shopify.com', 'mailchimp.com',
    'hubspot.com', 'sendgrid.net', 'amazonaws.com',
    'doe.com', 'placeholder.com', 'noreply.com',
}

# Known placeholder/dummy email patterns to filter
IGNORE_EMAIL_PATTERNS = [
    'user@', 'test@', 'admin@admin', 'info@example',
    'filler@', 'noreply@', 'no-reply@', 'donotreply@',
    'john@doe', 'jane@doe', 'alex@email', 'n@herman',
    'sentry', '@sentry',
]

# File extensions that are definitely not contact pages
IGNORE_EXTENSIONS = {
    '.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.ico',
    '.css', '.js', '.pdf', '.zip', '.mp4', '.mp3', '.woff',
    '.woff2', '.ttf', '.eot', '.map',
}

# Common headers to look less like a bot
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-GB,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate',
}


def extract_emails(html_text):
    """
    Extract email addresses from HTML text.
    Filters out common false positives (image files, CSS/JS references, etc.)
    """
    if not html_text:
        return []

    raw_emails = EMAIL_REGEX.findall(html_text)
    valid_emails = []

    for email in raw_emails:
        email = email.lower().strip()
        domain = email.split('@')[-1]

        # Skip false positive domains
        if domain in IGNORE_EMAIL_DOMAINS:
            continue
        # Skip subdomains of known false positive domains
        if any(domain.endswith('.' + d) for d in IGNORE_EMAIL_DOMAINS):
            continue
        if any(email.endswith(ext) for ext in IGNORE_EXTENSIONS):
            continue
        if len(email) > 100:
            continue
        # Skip emails that look like file paths
        if '/' in email:
            continue
        # Skip known placeholder patterns
        if any(pattern in email for pattern in IGNORE_EMAIL_PATTERNS):
            continue
        # Skip hex-looking email local parts (Sentry/Wix tracking IDs)
        local_part = email.split('@')[0]
        if len(local_part) > 20 and all(c in '0123456789abcdef' for c in local_part.replace('-', '')):
            continue

        valid_emails.append(email)

    return list(set(valid_emails))


def extract_phones(html_text, region='uk'):
    """
    Extract phone numbers from HTML text.
    Returns cleaned, deduplicated phone numbers.
    """
    if not html_text:
        return []

    if region == 'uae':
        raw_phones = UAE_PHONE_REGEX.findall(html_text)
        cleaned = []
        for phone in raw_phones:
            clean = re.sub(r'[\s\-]+', '', phone)
            if clean.startswith('00971'):
                clean = '+971' + clean[5:]
            elif clean.startswith('0'):
                clean = '+971' + clean[1:]
            digits = re.sub(r'\D', '', clean)
            if 9 <= len(digits) <= 12:
                cleaned.append(clean)
        return list(set(cleaned))
    else:
        raw_phones = UK_PHONE_REGEX.findall(html_text)
        cleaned = []
        for phone in raw_phones:
            clean = re.sub(r'\s+', '', phone)
            if clean.startswith('+44'):
                clean = '0' + clean[3:]
            digits = re.sub(r'\D', '', clean)
            if len(digits) >= 10 and len(digits) <= 12:
                cleaned.append(clean)
        return list(set(cleaned))


def find_contact_page_urls(soup, base_url):
    """
    Find URLs that are likely contact pages.
    Looks for links containing 'contact', 'about', 'get-in-touch', etc.
    """
    contact_keywords = [
        'contact', 'get-in-touch', 'about', 'reach-us',
        'enquir', 'enquiry', 'find-us'
    ]

    urls = set()

    for link in soup.find_all('a', href=True):
        href = link.get('href', '').lower()
        link_text = link.get_text(strip=True).lower()

        # Check both the URL and link text
        for keyword in contact_keywords:
            if keyword in href or keyword in link_text:
                full_url = urljoin(base_url, link['href'])
                # Only follow links on the same domain
                if urlparse(full_url).netloc == urlparse(base_url).netloc:
                    urls.add(full_url)
                break

    return list(urls)


def extract_postcode(address_text):
    """Extract a UK postcode from address text."""
    if not address_text:
        return ""
    postcode_regex = re.compile(
        r'[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}',
        re.IGNORECASE
    )
    match = postcode_regex.search(address_text)
    return match.group(0).upper() if match else ""


def extract_location_code(address_text, region='uk'):
    """
    Extract a location identifier from address text.
    For UK: returns postcode. For UAE: returns emirate/area name.
    """
    if not address_text:
        return ""

    if region == 'uae':
        # Try to identify the emirate from the address
        emirates = [
            'Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman',
            'Ras Al Khaimah', 'Ras al-Khaimah', 'Fujairah',
            'Umm Al Quwain', 'Umm al-Quwain', 'Al Ain',
        ]
        address_lower = address_text.lower()
        for emirate in emirates:
            if emirate.lower() in address_lower:
                return emirate
        return ""
    else:
        return extract_postcode(address_text)


def scrape_website_contacts(url, timeout=REQUEST_TIMEOUT, region='uk'):
    """
    Visit a club's website and extract email and phone numbers.
    First checks the homepage, then tries to find and visit a contact page.

    Returns:
        dict: {'emails': [...], 'phones': [...]}
    """
    result = {'emails': [], 'phones': []}

    if not url or not url.startswith('http'):
        return result

    try:
        # Step 1: Fetch homepage
        response = requests.get(url, headers=HEADERS, timeout=timeout, allow_redirects=True)
        response.raise_for_status()
        html = response.text

        soup = BeautifulSoup(html, 'lxml')

        # Extract from homepage
        result['emails'].extend(extract_emails(html))
        result['phones'].extend(extract_phones(html, region=region))

        # Step 2: Find and visit contact page
        contact_urls = find_contact_page_urls(soup, url)

        for contact_url in contact_urls[:3]:  # Limit to 3 contact-ish pages
            try:
                resp = requests.get(contact_url, headers=HEADERS, timeout=timeout, allow_redirects=True)
                resp.raise_for_status()
                contact_html = resp.text

                result['emails'].extend(extract_emails(contact_html))
                result['phones'].extend(extract_phones(contact_html, region=region))

            except Exception:
                continue

        # Deduplicate
        result['emails'] = list(set(result['emails']))
        result['phones'] = list(set(result['phones']))

    except Exception as e:
        print(f"    ⚠ Could not scrape {url}: {e}")

    return result
