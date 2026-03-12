/**
 * Currency configuration for geo-based pricing display.
 *
 * Uses the browser's timezone to detect the visitor's region and show
 * prices in their local currency. Prices are fixed per currency (not
 * live-converted) — the standard SaaS approach for clean, predictable pricing.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CurrencyCode = 'GBP' | 'USD' | 'EUR' | 'AED' | 'AUD' | 'CAD' | 'INR' | 'ZAR';
export type Tier = 'starter' | 'pro' | 'elite';
export type Period = 'monthly' | 'annual';

export interface CurrencyInfo {
    code: CurrencyCode;
    symbol: string;
    symbolPosition: 'before' | 'after';
    locale: string;
}

// ---------------------------------------------------------------------------
// Currency definitions
// ---------------------------------------------------------------------------

export const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
    GBP: { code: 'GBP', symbol: '£', symbolPosition: 'before', locale: 'en-GB' },
    USD: { code: 'USD', symbol: '$', symbolPosition: 'before', locale: 'en-US' },
    EUR: { code: 'EUR', symbol: '€', symbolPosition: 'before', locale: 'en-IE' },
    AED: { code: 'AED', symbol: 'AED ', symbolPosition: 'before', locale: 'en-AE' },
    AUD: { code: 'AUD', symbol: 'A$', symbolPosition: 'before', locale: 'en-AU' },
    CAD: { code: 'CAD', symbol: 'C$', symbolPosition: 'before', locale: 'en-CA' },
    INR: { code: 'INR', symbol: '₹', symbolPosition: 'before', locale: 'en-IN' },
    ZAR: { code: 'ZAR', symbol: 'R', symbolPosition: 'before', locale: 'en-ZA' },
};

// ---------------------------------------------------------------------------
// Fixed pricing per currency (monthly / annual per month)
// ---------------------------------------------------------------------------

export const PRICING: Record<CurrencyCode, Record<Tier, { monthly: number; annual: number }>> = {
    GBP: {
        starter: { monthly: 39, annual: 31 },
        pro: { monthly: 129, annual: 103 },
        elite: { monthly: 349, annual: 279 },
    },
    USD: {
        starter: { monthly: 49, annual: 39 },
        pro: { monthly: 159, annual: 127 },
        elite: { monthly: 429, annual: 349 },
    },
    EUR: {
        starter: { monthly: 45, annual: 36 },
        pro: { monthly: 149, annual: 119 },
        elite: { monthly: 399, annual: 319 },
    },
    AED: {
        starter: { monthly: 189, annual: 149 },
        pro: { monthly: 599, annual: 479 },
        elite: { monthly: 1599, annual: 1279 },
    },
    AUD: {
        starter: { monthly: 79, annual: 63 },
        pro: { monthly: 249, annual: 199 },
        elite: { monthly: 669, annual: 539 },
    },
    CAD: {
        starter: { monthly: 69, annual: 55 },
        pro: { monthly: 219, annual: 175 },
        elite: { monthly: 579, annual: 469 },
    },
    INR: {
        starter: { monthly: 3999, annual: 3199 },
        pro: { monthly: 12999, annual: 10499 },
        elite: { monthly: 34999, annual: 27999 },
    },
    ZAR: {
        starter: { monthly: 899, annual: 719 },
        pro: { monthly: 2899, annual: 2319 },
        elite: { monthly: 7899, annual: 6299 },
    },
};

// ---------------------------------------------------------------------------
// Timezone → Currency mapping
// ---------------------------------------------------------------------------

const TIMEZONE_CURRENCY_MAP: Record<string, CurrencyCode> = {
    // UAE
    'Asia/Dubai': 'AED',
    'Asia/Muscat': 'AED', // Oman uses same tz

    // USA
    'America/New_York': 'USD',
    'America/Chicago': 'USD',
    'America/Denver': 'USD',
    'America/Los_Angeles': 'USD',
    'America/Phoenix': 'USD',
    'America/Anchorage': 'USD',
    'Pacific/Honolulu': 'USD',
    'America/Indianapolis': 'USD',
    'America/Detroit': 'USD',
    'America/Boise': 'USD',

    // Europe (EUR)
    'Europe/Paris': 'EUR',
    'Europe/Berlin': 'EUR',
    'Europe/Rome': 'EUR',
    'Europe/Madrid': 'EUR',
    'Europe/Amsterdam': 'EUR',
    'Europe/Brussels': 'EUR',
    'Europe/Vienna': 'EUR',
    'Europe/Lisbon': 'EUR',
    'Europe/Dublin': 'EUR',
    'Europe/Helsinki': 'EUR',
    'Europe/Athens': 'EUR',
    'Europe/Zurich': 'EUR', // CHF really, but EUR is close enough for display

    // Australia
    'Australia/Sydney': 'AUD',
    'Australia/Melbourne': 'AUD',
    'Australia/Brisbane': 'AUD',
    'Australia/Perth': 'AUD',
    'Australia/Adelaide': 'AUD',
    'Australia/Hobart': 'AUD',
    'Australia/Darwin': 'AUD',

    // Canada
    'America/Toronto': 'CAD',
    'America/Vancouver': 'CAD',
    'America/Edmonton': 'CAD',
    'America/Winnipeg': 'CAD',
    'America/Halifax': 'CAD',
    'America/St_Johns': 'CAD',

    // India
    'Asia/Kolkata': 'INR',
    'Asia/Calcutta': 'INR',

    // South Africa
    'Africa/Johannesburg': 'ZAR',

    // UK — default, but listed explicitly for clarity
    'Europe/London': 'GBP',
};

/**
 * Detect the visitor's currency from their browser timezone.
 * Falls back to GBP if timezone is not mapped.
 */
export function detectCurrency(): CurrencyCode {
    try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        return TIMEZONE_CURRENCY_MAP[tz] || 'GBP';
    } catch {
        return 'GBP';
    }
}

/**
 * Format a price with its currency symbol.
 */
export function formatPrice(
    currency: CurrencyCode,
    tier: Tier,
    period: Period,
): string {
    const info = CURRENCIES[currency];
    const amount = PRICING[currency][tier][period];

    // Use Intl.NumberFormat for proper thousand separators
    const formatted = new Intl.NumberFormat(info.locale, {
        maximumFractionDigits: 0,
    }).format(amount);

    return `${info.symbol}${formatted}`;
}
