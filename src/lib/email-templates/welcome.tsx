import * as React from 'react';
import { Text, Link, Hr } from '@react-email/components';
import { BaseEmailLayout, baseStyles } from './base-layout';

interface WelcomeEmailProps {
    firstName: string;
    locationName: string;
    membershipType: string;
    clubName?: string;
    dashboardUrl?: string;
}

/**
 * Static fallback welcome email — used only when a club has no active
 * `welcome` row in email_templates. Wording is deliberately sport-neutral:
 * this template can't know whether the club is a dojo or a 24/7 gym.
 */
export function WelcomeEmail({
    firstName,
    locationName,
    membershipType,
    clubName = 'ClubForge',
    dashboardUrl = 'https://clubforgehq.com/dashboard',
}: WelcomeEmailProps) {
    return (
        <BaseEmailLayout previewText={`Welcome to ${clubName}, ${firstName}!`}>
            <Text style={baseStyles.heading}>
                Welcome to {clubName}!
            </Text>

            <Text style={baseStyles.text}>
                Hi {firstName},
            </Text>

            <Text style={baseStyles.text}>
                We're thrilled to welcome you to {clubName}! Your registration at <strong>{locationName}</strong> has been successfully completed.
            </Text>

            <Hr style={{ borderColor: '#e5e5e5', margin: '24px 0' }} />

            <Text style={{ ...baseStyles.text, fontWeight: '600' }}>
                Your Membership Details:
            </Text>

            <Text style={baseStyles.text}>
                📍 <strong>Location:</strong> {locationName}<br />
                🏷️ <strong>Membership:</strong> {membershipType}
            </Text>

            <div style={baseStyles.buttonContainer}>
                <Link href={dashboardUrl} style={baseStyles.button}>
                    Go to Dashboard
                </Link>
            </div>

            <Text style={baseStyles.text}>
                Before your first session, please remember to:
            </Text>

            <Text style={{ ...baseStyles.text, paddingLeft: '16px' }}>
                ✅ Wear comfortable training clothes<br />
                ✅ Arrive 10 minutes early<br />
                ✅ Bring water and a positive attitude!
            </Text>

            <Text style={baseStyles.text}>
                If you have any questions, please don't hesitate to reach out to us.
            </Text>

            <Text style={baseStyles.text}>
                See you soon!<br />
                <strong>The {clubName} Team</strong>
            </Text>
        </BaseEmailLayout>
    );
}

/**
 * Render welcome email to HTML string
 */
export function renderWelcomeEmail(props: WelcomeEmailProps): string {
    const { renderToStaticMarkup } = require('react-dom/server');
    return renderToStaticMarkup(<WelcomeEmail {...props} />);
}
