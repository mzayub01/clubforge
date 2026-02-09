// ===============================================
// ClubForge - Feature Gate Service
// Tier-based feature access control
// ===============================================

export type SubscriptionTier = 'starter' | 'pro' | 'elite';

// -----------------------------------------------
// Feature definitions per tier
// -----------------------------------------------

const STARTER_FEATURES = [
    'members',
    'classes',
    'attendance',
    'basic_reports',
    'belt_progression',
    'check_in',
    'announcements',
    'single_location',
    'stripe_billing',
] as const;

const PRO_FEATURES = [
    ...STARTER_FEATURES,
    'events',
    'email_templates',
    'waitlist',
    'advanced_reports',
    'multi_location',
    'videos',
    'naseeha',
    'grading_feedback',
    'data_export_csv',
    'data_export_json',
] as const;

const ELITE_FEATURES = [
    ...PRO_FEATURES,
    'custom_domain',
    'api_access',
    'white_label',
    'automation',
    'unlimited_locations',
    'priority_support',
    'data_export_api',
    'webhooks',
    'sla',
] as const;

const TIER_FEATURES: Record<SubscriptionTier, readonly string[]> = {
    starter: STARTER_FEATURES,
    pro: PRO_FEATURES,
    elite: ELITE_FEATURES,
};

// -----------------------------------------------
// Usage limits per tier
// -----------------------------------------------

export interface UsageLimits {
    maxMembers: number;
    maxLocations: number;
    maxEvents: number;
    maxVideos: number;
}

const TIER_LIMITS: Record<SubscriptionTier, UsageLimits> = {
    starter: {
        maxMembers: 150,
        maxLocations: 1,
        maxEvents: 5,
        maxVideos: 0,
    },
    pro: {
        maxMembers: 750,
        maxLocations: 3,
        maxEvents: 50,
        maxVideos: 30,
    },
    elite: {
        maxMembers: Infinity,
        maxLocations: Infinity,
        maxEvents: Infinity,
        maxVideos: Infinity,
    },
};

// -----------------------------------------------
// Public API
// -----------------------------------------------

/**
 * Check if a tier has access to a specific feature.
 */
export function hasFeature(tier: SubscriptionTier, feature: string): boolean {
    const features = TIER_FEATURES[tier];
    if (!features) return false;
    return features.includes(feature);
}

/**
 * Require a feature — throws if the tier doesn't have access.
 * Use in API routes to enforce gating.
 */
export function requireFeature(tier: SubscriptionTier, feature: string): void {
    if (!hasFeature(tier, feature)) {
        throw new FeatureGateError(
            `Feature "${feature}" requires a higher plan. Current plan: ${tier}.`,
            feature,
            tier,
        );
    }
}

/**
 * Get usage limits for a tier.
 */
export function getUsageLimits(tier: SubscriptionTier): UsageLimits {
    return TIER_LIMITS[tier] || TIER_LIMITS.starter;
}

/**
 * Check if a specific resource usage is within the tier limit.
 */
export function checkUsageLimit(
    tier: SubscriptionTier,
    resource: keyof UsageLimits,
    currentCount: number,
): { allowed: boolean; limit: number; current: number; remaining: number } {
    const limits = getUsageLimits(tier);
    const limit = limits[resource];
    const remaining = Math.max(0, limit - currentCount);
    return {
        allowed: currentCount < limit,
        limit: limit === Infinity ? -1 : limit, // -1 = unlimited
        current: currentCount,
        remaining: limit === Infinity ? -1 : remaining,
    };
}

/**
 * Get all features available for a tier.
 */
export function getTierFeatures(tier: SubscriptionTier): readonly string[] {
    return TIER_FEATURES[tier] || TIER_FEATURES.starter;
}

/**
 * Get the minimum tier required for a feature.
 */
export function getMinimumTier(feature: string): SubscriptionTier | null {
    const tiers: SubscriptionTier[] = ['starter', 'pro', 'elite'];
    for (const tier of tiers) {
        if (hasFeature(tier, feature)) return tier;
    }
    return null;
}

// -----------------------------------------------
// Error class
// -----------------------------------------------

export class FeatureGateError extends Error {
    public readonly feature: string;
    public readonly currentTier: SubscriptionTier;

    constructor(message: string, feature: string, currentTier: SubscriptionTier) {
        super(message);
        this.name = 'FeatureGateError';
        this.feature = feature;
        this.currentTier = currentTier;
    }
}
