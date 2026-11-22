// ===============================================
// ClubForge homepage — social proof
//
// The homepage shows club logos and club-owner quotes ONLY from the two lists
// below, and only entries a real club has agreed to. While a list is empty its
// section is replaced by something factual (a trust line, the origin story),
// so nothing here needs to be filled in for the page to work.
//
// DO NOT add an entry the club has not approved in writing. UK advertising
// rules (CAP Code 3.45, and the ban on fake reviews in the Digital Markets,
// Competition and Consumers Act 2024) require proof that a testimonial is
// genuine. Keep the approval (an email is enough) where you can find it.
// ===============================================

export interface ClubLogo {
    /** Club name, used as the image alt text. */
    name: string;
    /** Path under /public, e.g. '/clubs/hameem.svg'. */
    src: string;
    /** Optional link to the club's site. */
    href?: string;
}

export interface Testimonial {
    /** The quote, in the owner's words, without quotation marks. */
    quote: string;
    /** Person's name as they want it shown. */
    name: string;
    /** Club and town, as the owner wants them shown. */
    club: string;
    /** Date the club approved this wording (YYYY-MM-DD). Required to publish. */
    approvedOn: string;
}

/** Shown as "Used by martial arts clubs across the UK" once it has 3 or more. */
export const CLUB_LOGOS: ClubLogo[] = [];

/** Shown as "What club owners say" once it has at least one entry. */
export const TESTIMONIALS: Testimonial[] = [];

/**
 * Starting points to send to real club owners. They are NOT published and are
 * not quotes from anyone: ask the owner to rewrite one in their own words (or
 * reject it), then move the approved text into TESTIMONIALS with their name,
 * club and the approval date.
 */
export const DRAFTS_FOR_APPROVAL: { theme: string; suggestion: string }[] = [
    {
        theme: 'Time saved on admin',
        suggestion: 'I used to spend my Sunday evenings matching bank payments to a spreadsheet. Now the memberships bill themselves and I can see who has paid in a few seconds.',
    },
    {
        theme: 'Getting paid on time',
        suggestion: 'Since we moved memberships onto ClubForge I have stopped chasing people on WhatsApp. If a payment fails the member gets an email and sorts it out themselves.',
    },
    {
        theme: 'Parents, members and belt tracking',
        suggestion: 'Parents can see exactly where their child is with their grading, and every promotion has the coach and the date against it. It has made the club look far more professional.',
    },
];
