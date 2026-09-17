import * as React from 'react';
import { Text, Link, Hr } from '@react-email/components';
import { BaseEmailLayout, baseStyles } from './base-layout';

interface PaymentReminderEmailProps {
    firstName: string;
    clubName: string;
    locationName: string;
    membershipType?: string;
    paymentLink: string;
}

/**
 * Admin-triggered "complete your membership payment" reminder.
 * Static fallback used when the club has no `payment_incomplete` template in
 * the database (older clubs were never seeded with one). Sport-neutral wording.
 */
export function PaymentReminderEmail({
    firstName,
    clubName,
    locationName,
    membershipType,
    paymentLink,
}: PaymentReminderEmailProps) {
    return (
        <BaseEmailLayout previewText={`Complete your ${clubName} membership payment`}>
            <Text style={baseStyles.heading}>
                Complete your membership
            </Text>

            <Text style={baseStyles.text}>
                Hi {firstName},
            </Text>

            <Text style={baseStyles.text}>
                Your {clubName} account is set up, but the membership payment hasn&apos;t been completed yet.
                Once it&apos;s done you&apos;ll be able to check in to classes straight away.
            </Text>

            <Hr style={{ borderColor: '#e5e5e5', margin: '24px 0' }} />

            <Text style={{ ...baseStyles.text, fontWeight: '600' }}>
                Your Membership:
            </Text>

            <Text style={baseStyles.text}>
                📍 <strong>Location:</strong> {locationName}<br />
                {membershipType ? (<>🏷️ <strong>Membership:</strong> {membershipType}<br /></>) : null}
                ⏳ <strong>Status:</strong> Payment pending
            </Text>

            <div style={baseStyles.buttonContainer}>
                <Link href={paymentLink} style={baseStyles.button}>
                    Complete Payment
                </Link>
            </div>

            <Text style={baseStyles.text}>
                If you have already paid, or you think this was sent in error, just reply to this email and the club will sort it out.
            </Text>

            <Text style={baseStyles.text}>
                See you soon!<br />
                <strong>The {clubName} Team</strong>
            </Text>
        </BaseEmailLayout>
    );
}

export function renderPaymentReminderEmail(props: PaymentReminderEmailProps): string {
    const { renderToStaticMarkup } = require('react-dom/server');
    return renderToStaticMarkup(<PaymentReminderEmail {...props} />);
}
