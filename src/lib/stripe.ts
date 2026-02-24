import Stripe from 'stripe';

// Unified Stripe API version — must match across all files
const STRIPE_API_VERSION = '2024-12-18.acacia' as Stripe.LatestApiVersion;

// Check if Stripe is configured
export const isStripeConfigured = () => {
    return !!(process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
};

// Server-side Stripe client - only initialize if configured
let stripeClient: Stripe | null = null;

export const getStripeClient = (): Stripe | null => {
    if (!isStripeConfigured()) {
        return null;
    }

    if (!stripeClient) {
        stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
            apiVersion: STRIPE_API_VERSION,
            typescript: true,
        });
    }

    return stripeClient;
};

// Legacy export for compatibility — uses the same shared client
export const stripe = isStripeConfigured()
    ? getStripeClient()!
    : null as unknown as Stripe;
