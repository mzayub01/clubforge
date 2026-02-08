// ===============================================
// ClubForge - Stripe Plan Configuration
// Maps subscription tiers to Stripe Price IDs
// ===============================================

export interface PlanConfig {
    name: string;
    tier: 'starter' | 'pro' | 'elite';
    description: string;
    monthlyPrice: number; // in pence
    annualPrice: number; // total annual in pence
    monthlyPriceDisplay: string; // formatted string
    annualPriceDisplay: string;
    stripePriceMonthly: string; // Stripe Price ID
    stripePriceAnnual: string;  // Stripe Price ID
}

/**
 * Stripe Plan configuration.
 * 
 * IMPORTANT: Replace the `stripePriceMonthly` and `stripePriceAnnual` values
 * with real Stripe Price IDs after creating the Products in your Stripe Dashboard.
 * 
 * To create these in Stripe:
 * 1. Go to Products → Add Product
 * 2. Create 3 products: "ClubForge Starter", "ClubForge Pro", "ClubForge Elite"
 * 3. Add 2 prices per product: Monthly (recurring) and Annual (recurring)
 * 4. Copy the price IDs (price_xxx) into this config
 */
export const PLANS: Record<string, PlanConfig> = {
    starter: {
        name: 'Starter',
        tier: 'starter',
        description: 'For new and small clubs getting started.',
        monthlyPrice: 3900,    // £39.00
        annualPrice: 37200,    // £31/mo × 12 = £372.00
        monthlyPriceDisplay: '£39',
        annualPriceDisplay: '£31',
        stripePriceMonthly: process.env.STRIPE_PRICE_STARTER_MONTHLY || '',
        stripePriceAnnual: process.env.STRIPE_PRICE_STARTER_ANNUAL || '',
    },
    pro: {
        name: 'Pro',
        tier: 'pro',
        description: 'For established clubs ready to scale.',
        monthlyPrice: 12900,   // £129.00
        annualPrice: 123600,   // £103/mo × 12 = £1,236.00
        monthlyPriceDisplay: '£129',
        annualPriceDisplay: '£103',
        stripePriceMonthly: process.env.STRIPE_PRICE_PRO_MONTHLY || '',
        stripePriceAnnual: process.env.STRIPE_PRICE_PRO_ANNUAL || '',
    },
    elite: {
        name: 'Elite',
        tier: 'elite',
        description: 'For large academies and franchises.',
        monthlyPrice: 34900,   // £349.00
        annualPrice: 334800,   // £279/mo × 12 = £3,348.00
        monthlyPriceDisplay: '£349',
        annualPriceDisplay: '£279',
        stripePriceMonthly: process.env.STRIPE_PRICE_ELITE_MONTHLY || '',
        stripePriceAnnual: process.env.STRIPE_PRICE_ELITE_ANNUAL || '',
    },
};

/**
 * Get the Stripe Price ID for a given tier and billing interval.
 */
export function getStripePriceId(tier: string, interval: 'monthly' | 'annual'): string {
    const plan = PLANS[tier];
    if (!plan) throw new Error(`Unknown plan tier: ${tier}`);
    return interval === 'annual' ? plan.stripePriceAnnual : plan.stripePriceMonthly;
}

/**
 * Platform fee percentage charged on member payments via Stripe Connect.
 */
export const PLATFORM_FEE_PERCENT = 2.5;

/**
 * Trial duration in days.
 */
export const TRIAL_DURATION_DAYS = 14;
