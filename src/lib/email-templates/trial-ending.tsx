import * as React from 'react';
import { Text, Link, Hr } from '@react-email/components';
import { BaseEmailLayout, baseStyles } from './base-layout';

interface TrialEndingEmailProps {
    firstName: string;
    clubName: string;
    planName: string;           // e.g. "Pro"
    price: string;              // e.g. "£129/month"
    trialEndDate: string;       // e.g. "13 March 2026"
    daysRemaining: number;      // e.g. 3
    dashboardUrl?: string;
}

export function TrialEndingEmail({
    firstName,
    clubName,
    planName,
    price,
    trialEndDate,
    daysRemaining,
    dashboardUrl = 'https://clubforgehq.com/admin',
}: TrialEndingEmailProps) {
    return (
        <BaseEmailLayout previewText={`Your ClubForge trial ends in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}`}>
            <Text style={baseStyles.heading}>
                Trial Ending Soon ⏳
            </Text>

            <Text style={baseStyles.text}>
                Hi {firstName},
            </Text>

            <Text style={baseStyles.text}>
                Just a friendly heads-up — the free trial for <strong>{clubName}</strong> ends
                in <strong>{daysRemaining} day{daysRemaining !== 1 ? 's' : ''}</strong> (on {trialEndDate}).
            </Text>

            <Hr style={{ borderColor: '#e5e5e5', margin: '24px 0' }} />

            <div style={{
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '16px',
            }}>
                <Text style={{ ...baseStyles.text, margin: '0 0 8px' }}>
                    📋 <strong>Plan:</strong> {planName}
                </Text>
                <Text style={{ ...baseStyles.text, margin: '0 0 8px' }}>
                    💳 <strong>Billing starts:</strong> {trialEndDate}
                </Text>
                <Text style={{ ...baseStyles.text, margin: 0 }}>
                    💰 <strong>Amount:</strong> {price}
                </Text>
            </div>

            <Text style={baseStyles.text}>
                <strong>No action needed</strong> — your card on file will be charged automatically
                when the trial ends, and your <strong>{planName}</strong> plan will continue without interruption.
            </Text>

            <Text style={baseStyles.text}>
                If you&apos;d like to change your plan or update your billing details,
                you can do so from Admin Settings at any time.
            </Text>

            <div style={baseStyles.buttonContainer}>
                <Link href={dashboardUrl} style={baseStyles.button}>
                    View Your Dashboard
                </Link>
            </div>

            <Text style={baseStyles.text}>
                Questions? Just reply to this email.<br />
                <strong>The ClubForge Team</strong>
            </Text>
        </BaseEmailLayout>
    );
}

/**
 * Render trial ending email to HTML string
 */
export function renderTrialEndingEmail(props: TrialEndingEmailProps): string {
    const { renderToStaticMarkup } = require('react-dom/server');
    return renderToStaticMarkup(<TrialEndingEmail {...props} />);
}
