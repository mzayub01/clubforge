// Email Templates Index
// Export all email templates and their render functions

export { WelcomeEmail, renderWelcomeEmail } from './welcome';
export { EventConfirmationEmail, renderEventConfirmationEmail } from './event-confirmation';
export { MembershipActivatedEmail, renderMembershipActivatedEmail } from './membership-activated';
export { PaymentFailedEmail, renderPaymentFailedEmail } from './payment-failed';
export { SubscriptionActivatedEmail, renderSubscriptionActivatedEmail } from './subscription-activated';
export { PlanUpgradeEmail, renderPlanUpgradeEmail } from './plan-upgrade';
export { TrialEndingEmail, renderTrialEndingEmail } from './trial-ending';
export { BaseEmailLayout, baseStyles } from './base-layout';
