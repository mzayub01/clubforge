'use client';

import { useContext } from 'react';
import { FeatureGateContext, type FeatureGateContextValue } from '@/components/providers/FeatureGateProvider';

/**
 * Hook to access the feature gate context.
 *
 * @example
 * const { can, tier, checkLimit } = useFeatureGate();
 * if (!can('events')) return <UpgradePrompt />;
 */
export function useFeatureGate(): FeatureGateContextValue {
    return useContext(FeatureGateContext);
}
