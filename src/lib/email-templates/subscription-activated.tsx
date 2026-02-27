import * as React from 'react';
import { Text, Link, Hr } from '@react-email/components';
import { BaseEmailLayout, baseStyles } from './base-layout';

interface SubscriptionActivatedEmailProps {
    firstName: string;
    clubName: string;
    planName: string;           // e.g. "Pro"
    price: string;              // e.g. "£129/month"
    trialEndDate: string;       // e.g. "13 March 2026"
    dashboardUrl?: string;
    features: string[];         // e.g. ["Up to 750 members", "3 locations", ...]
}

export function SubscriptionActivatedEmail({
    firstName,
    clubName,
    planName,
    price,
    trialEndDate,
    dashboardUrl = 'https://clubforgehq.com/admin',
    features,
}: SubscriptionActivatedEmailProps) {
    return (
        <BaseEmailLayout previewText={`Welcome to ClubForge — your ${planName} plan is active!`}>
            <Text style={baseStyles.heading}>
                Welcome to ClubForge! 🚀
            </Text>

            <Text style={baseStyles.text}>
                Hi {firstName},
            </Text>

            <Text style={baseStyles.text}>
                Congratulations — <strong>{clubName}</strong> is now live on ClubForge!
                Your <strong>{planName}</strong> plan is ready to go.
            </Text>

            <Hr style={{ borderColor: '#e5e5e5', margin: '24px 0' }} />

            <Text style={{ ...baseStyles.text, fontWeight: '600' }}>
                Your Plan Details:
            </Text>

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
                    🎉 <strong>Free Trial:</strong> 14 days (ends {trialEndDate})
                </Text>
                <Text style={{ ...baseStyles.text, margin: 0 }}>
                    💳 <strong>After Trial:</strong> {price}
                </Text>
            </div>

            <Text style={{ ...baseStyles.text, fontWeight: '600' }}>
                What&apos;s Included:
            </Text>

            <Text style={{ ...baseStyles.text, paddingLeft: '8px' }}>
                {features.map((feature, i) => (
                    <React.Fragment key={i}>
                        ✅ {feature}
                        {i < features.length - 1 && <br />}
                    </React.Fragment>
                ))}
            </Text>

            <div style={baseStyles.buttonContainer}>
                <Link href={dashboardUrl} style={baseStyles.button}>
                    Go to Admin Dashboard
                </Link>
            </div>

            <Text style={baseStyles.text}>
                Your card on file won&apos;t be charged until the trial ends on <strong>{trialEndDate}</strong>.
                You can manage your subscription at any time from Admin Settings.
            </Text>

            <Text style={baseStyles.text}>
                Need help getting started? Reply to this email — we&apos;re here to help.
            </Text>

            <Text style={baseStyles.text}>
                Welcome aboard!<br />
                <strong>The ClubForge Team</strong>
            </Text>
        </BaseEmailLayout>
    );
}

/**
 * Render subscription activated email to HTML string
 */
export function renderSubscriptionActivatedEmail(props: SubscriptionActivatedEmailProps): string {
    const { renderToStaticMarkup } = require('react-dom/server');
    return renderToStaticMarkup(<SubscriptionActivatedEmail {...props} />);
}
