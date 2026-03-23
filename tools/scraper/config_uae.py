"""
Configuration for the UAE Combat Sports Club Scraper.
"""

# Combat sports disciplines and their Google Maps search terms
DISCIPLINES = {
    "BJJ": "Brazilian Jiu Jitsu BJJ",
    "MMA": "Mixed Martial Arts MMA",
    "Muay Thai": "Muay Thai Thai Boxing",
    "Kickboxing": "Kickboxing",
    "Boxing": "Boxing gym",
    "Wrestling": "Wrestling",
    "Karate": "Karate",
    "Judo": "Judo",
    "Taekwondo": "Taekwondo",
    "Martial Arts": "Martial Arts",
}

# UAE cities, emirates, and key areas/districts
UAE_CITIES = [
    # Emirates - main cities
    "Dubai",
    "Abu Dhabi",
    "Sharjah",
    "Ajman",
    "Ras Al Khaimah",
    "Fujairah",
    "Umm Al Quwain",
    "Al Ain",

    # Dubai key areas
    "Jumeirah Dubai",
    "JLT Dubai",
    "JBR Dubai",
    "Dubai Marina",
    "Business Bay Dubai",
    "DIFC Dubai",
    "Sports City Dubai",
    "Motor City Dubai",
    "Al Quoz Dubai",
    "Deira Dubai",
    "Bur Dubai",
    "Al Barsha Dubai",
    "Mirdif Dubai",
    "Silicon Oasis Dubai",
    "International City Dubai",
    "Dubai Hills",
    "Arabian Ranches Dubai",
    "Palm Jumeirah Dubai",

    # Abu Dhabi key areas
    "Khalifa City Abu Dhabi",
    "Al Reem Island Abu Dhabi",
    "Yas Island Abu Dhabi",
    "Saadiyat Island Abu Dhabi",
    "Al Mushrif Abu Dhabi",
    "Corniche Abu Dhabi",
]

# Country suffix for Google Maps searches
COUNTRY_SUFFIX = ", UAE"

# Scraping settings
MIN_DELAY = 2
MAX_DELAY = 5
PAGE_LOAD_WAIT = 3
SCROLL_PAUSE = 2
MAX_SCROLLS = 15
REQUEST_TIMEOUT = 15

# Output settings
OUTPUT_DIR = "output"
CHECKPOINT_FILE = "output/uae_checkpoint.json"
CSV_OUTPUT = "output/uae_combat_sports_clubs.csv"
JSON_OUTPUT = "output/uae_combat_sports_clubs.json"

# CSV column headers
CSV_HEADERS = [
    "name", "discipline", "address", "city", "area",
    "phone", "email", "website", "rating", "reviews_count",
    "source", "scraped_at"
]

# UAE phone number regex (supports +971 and local 0 prefix)
# Landlines: 02/03/04/06/07/09 followed by 7 digits
# Mobiles:   050/052/054/055/056/058 followed by 7 digits
import re

UAE_PHONE_REGEX = re.compile(
    r'(?:'
    r'(?:\+971[\s\-]?|00971[\s\-]?|0)'  # Country code or local prefix
    r'(?:'
    r'5[0-9][\s\-]?'       # Mobiles: 05X
    r'|[2-4679][\s\-]?'    # Landlines: 02, 03, 04, 06, 07, 09
    r')'
    r'\d{3}[\s\-]?\d{4}'   # 7 remaining digits
    r')',
    re.VERBOSE
)
