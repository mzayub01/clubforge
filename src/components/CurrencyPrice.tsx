'use client';

import { useState, useEffect } from 'react';
import {
    detectCurrency,
    formatPrice,
    type Tier,
    type Period,
    type CurrencyCode,
    PRICING,
    CURRENCIES,
} from '@/lib/currency-config';

interface CurrencyPriceProps {
    /** Pricing tier */
    tier: Tier;
    /** Billing period */
    period: Period;
    /** If true, renders just the number (e.g. "189") with symbol separate for custom layouts */
    raw?: boolean;
}

/**
 * Displays a price in the visitor's local currency based on their timezone.
 * SSR fallback shows GBP. Swaps to detected currency on hydration.
 */
export default function CurrencyPrice({ tier, period, raw }: CurrencyPriceProps) {
    const [currency, setCurrency] = useState<CurrencyCode>('GBP');

    useEffect(() => {
        setCurrency(detectCurrency());
    }, []);

    if (raw) {
        const info = CURRENCIES[currency];
        const amount = PRICING[currency][tier][period];
        const formatted = new Intl.NumberFormat(info.locale, {
            maximumFractionDigits: 0,
        }).format(amount);
        return <>{info.symbol}{formatted}</>;
    }

    return <>{formatPrice(currency, tier, period)}</>;
}

/**
 * Displays the annual savings text, e.g. "or AED 149/mo billed annually"
 */
export function CurrencyAnnualNote({ tier }: { tier: Tier }) {
    const [currency, setCurrency] = useState<CurrencyCode>('GBP');

    useEffect(() => {
        setCurrency(detectCurrency());
    }, []);

    const price = formatPrice(currency, tier, 'annual');
    return <>or {price}/mo billed annually</>;
}
