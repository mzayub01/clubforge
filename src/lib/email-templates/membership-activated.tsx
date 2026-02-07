import * as React from 'react';
import { Text, Link, Hr } from '@react-email/components';
import { BaseEmailLayout, baseStyles } from './base-layout';

interface MembershipActivatedEmailProps {
    firstName: string;
    locationName: string;
    membershipType: string;
    price: string;
    startDate: string;
    dashboardUrl?: string;
}

export function MembershipActivatedEmail({
    firstName,
    locationName,
    membershipType,
    price,
    startDate,
    dashboardUrl = 'https://dojohub.com/dashboard',
}: MembershipActivatedEmailProps) {
    return (
        <BaseEmailLayout previewText={`Your ${membershipType} membership is now active!`}>
            <Text style={baseStyles.heading}>
                Membership Activated! ✅
            </Text>

            <Text style={baseStyles.text}>
                Assalamu Alaikum {firstName},
            </Text>

            <Text style={baseStyles.text}>
                Your payment has been processed successfully and your membership is now active!
            </Text>

            <Hr style={{ borderColor: '#e5e5e5', margin: '24px 0' }} />

            <div style={{
                backgroundColor: '#f0fdf4',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '24px',
                border: '1px solid #bbf7d0',
            }}>
                <Text style={{ ...baseStyles.text, margin: '0 0 12px', fontWeight: '600', color: '#166534' }}>
                    Membership Details:
                </Text>
                <Text style={{ ...baseStyles.text, margin: '0 0 8px' }}>
                    📍 <strong>Location:</strong> {locationName}
                </Text>
                <Text style={{ ...baseStyles.text, margin: '0 0 8px' }}>
                    🏷️ <strong>Plan:</strong> {membershipType}
                </Text>
                <Text style={{ ...baseStyles.text, margin: '0 0 8px' }}>
                    💳 <strong>Monthly:</strong> {price}
                </Text>
                <Text style={{ ...baseStyles.text, margin: '0' }}>
                    📅 <strong>Started:</strong> {startDate}
                </Text>
            </div>

            <Text style={baseStyles.text}>
                Your subscription will automatically renew each month. You can manage your membership at any time from your dashboard.
            </Text>

            <div style={baseStyles.buttonContainer}>
                <Link href={dashboardUrl} style={baseStyles.button}>
                    Go to Dashboard
                </Link>
            </div>

            <Text style={baseStyles.text}>
                Thank you for joining our martial arts community!
            </Text>

            <Text style={baseStyles.text}>
                JazakAllahu Khayran,<br />
                <strong>The DojoHub Team</strong>
            </Text>
        </BaseEmailLayout>
    );
}

/**
 * Render membership activated email to HTML string
 */
export function renderMembershipActivatedEmail(props: MembershipActivatedEmailProps): string {
    const { renderToStaticMarkup } = require('react-dom/server');
    return renderToStaticMarkup(<MembershipActivatedEmail {...props} />);
}
