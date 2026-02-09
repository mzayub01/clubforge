'use client';

import { createContext, type ReactNode } from 'react';
import {
    hasFeature,
    checkUsageLimit,
    getTierFeatures,
    getUsageLimits,
    type SubscriptionTier,
    type UsageLimits,
} from '@/lib/feature-gate';

// -----------------------------------------------
// Context shape
// -----------------------------------------------

export interface FeatureGateContextValue {
    tier: SubscriptionTier;
    /** Check if the current tier has access to a feature */
    can: (feature: string) => boolean;
    /** Check a usage limit against the current tier */
    checkLimit: (
        resource: keyof UsageLimits,
        currentCount: number,
    ) => { allowed: boolean; limit: number; current: number; remaining: number };
    /** All features available on the current tier */
    features: readonly string[];
    /** Raw usage limits for the current tier */
    limits: UsageLimits;
}

export const FeatureGateContext = createContext<FeatureGateContextValue>({
    tier: 'starter',
    can: () => true,
    checkLimit: () => ({ allowed: true, limit: -1, current: 0, remaining: -1 }),
    features: [],
    limits: { maxMembers: 150, maxLocations: 1, maxEvents: 5, maxVideos: 0 },
});

// -----------------------------------------------
// Provider
// -----------------------------------------------

interface FeatureGateProviderProps {
    tier?: SubscriptionTier;
    children: ReactNode;
}

/**
 * Wraps children with feature-gate context.
 * Accepts `tier` as a server-side prop from the layout.
 * Defaults to 'starter' if no tier is provided.
 */
export function FeatureGateProvider({ tier = 'starter', children }: FeatureGateProviderProps) {
    const value: FeatureGateContextValue = {
        tier,
        can: (feature: string) => hasFeature(tier, feature),
        checkLimit: (resource: keyof UsageLimits, currentCount: number) =>
            checkUsageLimit(tier, resource, currentCount),
        features: getTierFeatures(tier),
        limits: getUsageLimits(tier),
    };

    return (
        <FeatureGateContext.Provider value={value}>
            {children}
        </FeatureGateContext.Provider>
    );
}
