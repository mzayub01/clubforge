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
