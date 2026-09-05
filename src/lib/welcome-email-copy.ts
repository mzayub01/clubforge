// ===============================================
// ClubForge - Default welcome-email wording by club type
//
// Martial-arts clubs get the Gi / mats copy; every other club type (gyms,
// CrossFit, dance, yoga, swimming, "other") gets neutral "training session"
// copy. Used when seeding a new tenant's email templates at onboarding.
// Owners can edit the wording under Admin → Email Templates (Pro) or switch
// the email off in Admin → Settings → General.
// ===============================================

export const MARTIAL_ARTS_CLUB_TYPES = [
    'bjj', 'mma', 'karate', 'taekwondo', 'judo', 'boxing', 'wrestling', 'muay_thai',
];

export function isMartialArtsClub(clubType?: string | null): boolean {
    return !!clubType && MARTIAL_ARTS_CLUB_TYPES.includes(clubType);
}

export interface WelcomeCopy {
    body_intro: string;
    body_action: string;
    body_closing: string;
}

export function defaultWelcomeCopy(clubName: string, clubType?: string | null): WelcomeCopy {
    if (isMartialArtsClub(clubType)) {
        return {
            body_intro: `We're thrilled to welcome you to our martial arts family! Your registration at **{{locationName}}** has been successfully completed.`,
            body_action: 'Before your first class, please remember to:\n✅ Bring a clean Gi (uniform)\n✅ Trim your finger and toe nails\n✅ Arrive 10 minutes early\n✅ Bring water and a positive attitude!',
            body_closing: "If you have any questions, please don't hesitate to reach out to us. See you on the mats!",
        };
    }
    return {
        body_intro: `We're thrilled to welcome you to ${clubName}! Your registration at **{{locationName}}** has been successfully completed.`,
        body_action: 'Before your first session, please remember to:\n✅ Wear comfortable training clothes\n✅ Arrive 10 minutes early\n✅ Bring water and a positive attitude!',
        body_closing: "If you have any questions, please don't hesitate to reach out to us. See you soon!",
    };
}
