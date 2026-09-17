// ===============================================
// ClubForge - Member contact helpers (isomorphic)
//
// Child accounts are phantom auth users with a generated dummy address on
// CHILD_EMAIL_DOMAIN. They can never receive mail, so anywhere a child's
// email would be shown or sent to, the guardian's real address is used:
//   - server:  sendEmail() (src/lib/email.ts) resolves dummies → guardian
//   - client:  useGuardianContacts().contactFor(email) for display
// ===============================================

export const CHILD_EMAIL_DOMAIN = '@child.clubforge.local';

export function isChildDummyEmail(email?: string | null): boolean {
    return !!email && email.toLowerCase().endsWith(CHILD_EMAIL_DOMAIN);
}

/**
 * Placeholder / reserved domains that can never receive mail (demo data,
 * RFC 2606 reserved names). Resend rejects these outright with "Invalid `to`
 * field … domains like example.com", so we explain it before trying.
 */
const UNDELIVERABLE_RE = /@(?:example\.(?:com|org|net)|test\.com|[^@]+\.(?:test|invalid|local|localhost|example))$/i;

export function isPlaceholderEmail(email?: string | null): boolean {
    return !!email && (UNDELIVERABLE_RE.test(email) || isChildDummyEmail(email));
}

/** Human explanation for a placeholder address, or null if it looks deliverable. */
export function undeliverableReason(email?: string | null): string | null {
    if (!email) return 'No email address on file';
    if (isChildDummyEmail(email)) return 'Child account with no guardian email linked';
    if (UNDELIVERABLE_RE.test(email)) return `${email} is a placeholder address (demo/test data) and cannot receive email — update the member's email first`;
    return null;
}
