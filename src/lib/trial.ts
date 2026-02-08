// ===============================================
// ClubForge - Trial Management
// Tracks 14-day trial status for tenants
// ===============================================

import { TRIAL_DURATION_DAYS } from './stripe-plans';

export interface TrialStatus {
    isTrialing: boolean;
    daysRemaining: number;
    isExpired: boolean;
    showWarning: boolean;    // true when ≤ 3 days remain
    showUrgent: boolean;     // true when ≤ 1 day remains
    trialEndsAt: Date | null;
    percentComplete: number; // 0-100
}

interface TenantTrialInput {
    subscription_status: string;
    trial_ends_at?: string | null;
}

/**
 * Calculate the trial status for a tenant.
 */
export function getTrialStatus(tenant: TenantTrialInput): TrialStatus {
    const isTrialing = tenant.subscription_status === 'trialing';

    if (!isTrialing || !tenant.trial_ends_at) {
        return {
            isTrialing: false,
            daysRemaining: 0,
            isExpired: false,
            showWarning: false,
            showUrgent: false,
            trialEndsAt: null,
            percentComplete: 100,
        };
    }

    const now = new Date();
    const trialEnd = new Date(tenant.trial_ends_at);
    const msRemaining = trialEnd.getTime() - now.getTime();
    const daysRemaining = Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)));
    const isExpired = msRemaining <= 0;
    const daysElapsed = TRIAL_DURATION_DAYS - daysRemaining;
    const percentComplete = Math.min(100, Math.round((daysElapsed / TRIAL_DURATION_DAYS) * 100));

    return {
        isTrialing: true,
        daysRemaining,
        isExpired,
        showWarning: daysRemaining <= 3 && daysRemaining > 0,
        showUrgent: daysRemaining <= 1 && !isExpired,
        trialEndsAt: trialEnd,
        percentComplete,
    };
}

/**
 * Calculate the trial end date from now.
 */
export function calculateTrialEndDate(): string {
    const end = new Date();
    end.setDate(end.getDate() + TRIAL_DURATION_DAYS);
    return end.toISOString();
}

/**
 * Format the trial status for display.
 */
export function formatTrialMessage(status: TrialStatus): string {
    if (!status.isTrialing) return '';
    if (status.isExpired) return 'Your trial has expired. Please choose a plan to continue.';
    if (status.showUrgent) return 'Your trial expires tomorrow! Upgrade now to keep your data.';
    if (status.showWarning) return `Your trial expires in ${status.daysRemaining} days.`;
    return `${status.daysRemaining} days left in your trial.`;
}
