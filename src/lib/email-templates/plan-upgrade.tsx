import * as React from 'react';
import { Text, Link, Hr } from '@react-email/components';
import { BaseEmailLayout, baseStyles } from './base-layout';

interface PlanUpgradeEmailProps {
    firstName: string;
    clubName: string;
    previousPlan: string;       // e.g. "Starter"
    newPlan: string;            // e.g. "Pro"
    newPrice: string;           // e.g. "£129/month"
    dashboardUrl?: string;
    newFeatures: string[];      // Features unlocked by upgrading
}

export function PlanUpgradeEmail({
    firstName,
    clubName,
    previousPlan,
    newPlan,
    newPrice,
    dashboardUrl = 'https://clubforgehq.com/admin',
    newFeatures,
}: PlanUpgradeEmailProps) {
    return (
        <BaseEmailLayout previewText={`${clubName} has been upgraded to ${newPlan}!`}>
            <Text style={baseStyles.heading}>
                Plan Upgraded! 🎉
            </Text>

            <Text style={baseStyles.text}>
                Hi {firstName},
            </Text>

            <Text style={baseStyles.text}>
                Great news — <strong>{clubName}</strong> has been upgraded
                from <strong>{previousPlan}</strong> to <strong>{newPlan}</strong>!
            </Text>

            <Hr style={{ borderColor: '#e5e5e5', margin: '24px 0' }} />

            <div style={{
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '16px',
            }}>
                <Text style={{ ...baseStyles.text, margin: '0 0 8px' }}>
                    📋 <strong>New Plan:</strong> {newPlan}
                </Text>
                <Text style={{ ...baseStyles.text, margin: 0 }}>
                    💳 <strong>New Price:</strong> {newPrice}
                </Text>
            </div>

            <Text style={{ ...baseStyles.text, fontWeight: '600' }}>
                New Features Unlocked:
            </Text>

            <Text style={{ ...baseStyles.text, paddingLeft: '8px' }}>
                {newFeatures.map((feature, i) => (
                    <React.Fragment key={i}>
                        🆕 {feature}
                        {i < newFeatures.length - 1 && <br />}
                    </React.Fragment>
                ))}
            </Text>

            <div style={baseStyles.buttonContainer}>
                <Link href={dashboardUrl} style={baseStyles.button}>
                    Explore Your New Features
                </Link>
            </div>

            <Text style={baseStyles.text}>
                Your billing has been updated automatically. You can view your billing details
                and manage your subscription from Admin Settings at any time.
            </Text>

            <Text style={baseStyles.text}>
                Thank you for growing with us!<br />
                <strong>The ClubForge Team</strong>
            </Text>
        </BaseEmailLayout>
    );
}

/**
 * Render plan upgrade email to HTML string
 */
export function renderPlanUpgradeEmail(props: PlanUpgradeEmailProps): string {
    const { renderToStaticMarkup } = require('react-dom/server');
    return renderToStaticMarkup(<PlanUpgradeEmail {...props} />);
}
