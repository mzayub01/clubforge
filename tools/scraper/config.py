"""
Configuration for the UK Martial Arts Club Scraper.
"""

# Martial art disciplines and their Google Maps search terms
DISCIPLINES = {
    "BJJ": "Brazilian Jiu Jitsu",
    "MMA": "Mixed Martial Arts MMA",
    "Judo": "Judo",
    "Karate": "Karate",
    "Taekwondo": "Taekwondo",
    "Kickboxing": "Kickboxing",
    "Muay Thai": "Muay Thai Thai Boxing",
    "Martial Arts": "Martial Arts",
}

# Major UK cities and towns to search across
UK_CITIES = [
    # England - Major Cities
    "London", "Birmingham", "Manchester", "Leeds", "Liverpool",
    "Newcastle", "Sheffield", "Bristol", "Nottingham", "Leicester",
    "Coventry", "Bradford", "Stoke-on-Trent", "Wolverhampton", "Plymouth",
    "Southampton", "Reading", "Derby", "Sunderland", "Norwich",
    "Brighton", "Portsmouth", "Milton Keynes", "Northampton", "Luton",
    "Bolton", "Bournemouth", "Swindon", "Peterborough", "Southend-on-Sea",
    "Oxford", "Cambridge", "Gloucester", "Ipswich", "York",
    "Blackpool", "Middlesbrough", "Huddersfield", "Blackburn", "Cheltenham",
    "Exeter", "Lincoln", "Doncaster", "Oldham", "Rochdale",
    "Wigan", "Stockport", "Warrington", "Slough", "Colchester",
    "Crawley", "Basildon", "Chelmsford", "Maidstone", "Bath",
    "Worcester", "Eastbourne", "Hastings", "Carlisle", "Canterbury",
    "Chester", "Barnsley", "Wakefield", "Rotherham", "Grimsby",
    "Harrogate", "Scarborough", "Darlington", "Chesterfield", "Mansfield",
    "Telford", "Shrewsbury", "Hereford", "Salisbury", "Taunton",
    "Torquay", "Weston-super-Mare", "Guildford", "Watford", "St Albans",
    "Stevenage", "High Wycombe", "Aylesbury", "Basingstoke", "Woking",

    # Scotland
    "Glasgow", "Edinburgh", "Aberdeen", "Dundee", "Inverness",
    "Stirling", "Perth", "Paisley", "Kilmarnock", "Falkirk",

    # Wales
    "Cardiff", "Swansea", "Newport", "Wrexham", "Bangor",
    "Aberystwyth", "Carmarthen", "Llanelli", "Bridgend", "Barry",

    # Northern Ireland
    "Belfast", "Derry", "Lisburn", "Newry", "Bangor",
    "Craigavon", "Ballymena", "Newtownabbey", "Carrickfergus", "Omagh",
]

# Scraping settings
MIN_DELAY = 2       # Minimum seconds between actions
MAX_DELAY = 5       # Maximum seconds between actions
PAGE_LOAD_WAIT = 3  # Seconds to wait for page loads
SCROLL_PAUSE = 2    # Seconds to pause between scrolls in Maps
MAX_SCROLLS = 15    # Max number of scroll actions to load more results
REQUEST_TIMEOUT = 15 # Seconds for HTTP request timeouts

# Output settings
OUTPUT_DIR = "output"
CHECKPOINT_FILE = "output/checkpoint.json"
CSV_OUTPUT = "output/uk_martial_arts_clubs.csv"
JSON_OUTPUT = "output/uk_martial_arts_clubs.json"

# CSV column headers
CSV_HEADERS = [
    "name", "discipline", "address", "city", "postcode",
    "phone", "email", "website", "rating", "reviews_count",
    "source", "scraped_at"
]
