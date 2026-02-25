'use client';

import Link from 'next/link';
import { useState } from 'react';

const objections = [
    {
        q: '"We already use spreadsheets / WhatsApp / pen and paper"', sub: 'They\'re saying: "Our current system works well enough."',
        resp: 'I totally get it — every club starts there. It works… until it doesn\'t. The problem with spreadsheets is you don\'t see what you\'re losing. You can\'t see the members who quietly drifted away, the payments that silently failed, or the 12 hours a week you spend on admin instead of coaching.\n\nClubForge doesn\'t replace your coaching — it replaces the 4-5 tools you\'re duct-taping together. Most owners save 8-10 hours per week in the first month.',
        clincher: 'Club owners typically spend 12+ hours/week on admin. ClubForge gets that to near-zero.'
    },
    {
        q: '"It\'s too expensive"', sub: 'They\'re saying: "I don\'t see the ROI yet."',
        resp: 'I hear you — every pound matters. How much do you lose each month to members who cancel because they felt disconnected? Or payments that failed and never got chased?\n\nMost clubs recover the cost in the first month from reduced payment failures. Stripe\'s automated retry recovers revenue you\'re currently losing silently.\n\nAt £39/month — that\'s less than one membership. If ClubForge prevents even one cancellation per month, it pays for itself four times over.',
        clincher: '26 pence per member per month. Less than one water bottle.'
    },
    {
        q: '"My members won\'t use it"', sub: 'They\'re saying: "I\'m worried about adoption."',
        resp: 'That\'s the best part — nothing to install. It\'s a web app on any phone. Tap a link, log in, done.\n\nThe portal is simpler than WhatsApp. Check schedule, tap to check in, see belt progress. So simple that 8-year-olds use it.\n\nThe real question: what are your members using now? WhatsApp and texts? ClubForge gives them something better — a branded portal that makes your club look professional.',
        clincher: 'Members don\'t adopt tools. They adopt experiences they enjoy. Belt journey = engagement.'
    },
    {
        q: '"We\'re too small for this"', sub: 'They\'re saying: "We\'re not sure we\'re ready."',
        resp: 'Actually, that\'s exactly when you should start. Clubs that struggle most try to implement systems when already at 200 members and drowning.\n\nStarter is designed for under 150 members. £39/month — less than boxing gloves. When you grow, everything scales with you.',
        clincher: 'You\'re at the perfect stage. Right foundation now = never migrate or rebuild later.'
    },
    {
        q: '"What about data security?"', sub: 'They\'re saying: "Can I trust you with my members\' data?"',
        resp: 'More secure than a spreadsheet on your laptop. Built on Supabase: enterprise PostgreSQL with row-level security. Every club\'s data is completely isolated.\n\nPayments through Stripe directly — PCI-DSS Level 1. We never see card numbers. GDPR compliant with full data export and deletion.',
        clincher: '✅ Supabase RLS • ✅ Stripe PCI-DSS • ✅ GDPR • ✅ Full data isolation'
    },
    {
        q: '"Can I try before I commit?"', sub: 'They\'re saying: "I\'m interested but nervous."',
        resp: 'Absolutely. 14 days, full Pro features, no credit card required. Set up your real club, invite a few members, see how it feels.\n\nAfter 14 days, if it\'s not for you, your account simply pauses. No charges, no pressure. Most people know by day 3.',
        clincher: 'Let\'s set you up right now — 10 minutes. 👉 clubforgehq.com/get-started'
    },
    {
        q: '"I\'ve tried gym software before and it was terrible"', sub: 'They\'re saying: "I\'ve been burned."',
        resp: 'I hear that a lot. Most gym software is built for big-box fitness chains — treadmill bookings and smoothie bars. Not for you.\n\nClubForge is built specifically for martial arts. Belt progression, kids schemes, professor access, grading feedback. You won\'t find that in MindBody or GymMaster.\n\nThe trial is free. No contract. The worst is you waste 10 minutes.',
        clincher: 'Generic gym software doesn\'t know what a purple belt is. We do.'
    },
    {
        q: '"I need to talk to my partner / co-owner"', sub: 'They\'re saying: "I need backup."',
        resp: 'Of course — smart move. Would it help if I sent a quick summary they can review? Pricing, features, and a trial link so they can poke around themselves.\n\nBetter yet — when would be a good time for a quick 15-minute call with all of us?',
        clincher: 'Send Feature Overview + Pricing docs. Book follow-up within 3 days. Don\'t let it go cold.'
    },
    {
        q: '"Can you integrate with [X]?"', sub: 'They\'re saying: "I have a workflow I don\'t want to lose."',
        resp: 'We integrate natively with Stripe for payments. Elite plan offers full API access and webhooks.\n\nBut most clubs find they don\'t need integrations because ClubForge already handles what they were using 4-5 separate tools for. What specifically are you looking to connect?',
        clincher: 'Email → built-in templates. Scheduling → included. Accounting → Stripe + CSV export.'
    },
];

function Objection({ n, obj, open, toggle }: { n: number; obj: typeof objections[0]; open: boolean; toggle: () => void }) {
    return (
        <div className={`ob-card${open ? ' open' : ''}`}>
            <div className="ob-hdr" onClick={toggle}>
                <div className="ob-num">{n}</div>
                <div style={{ flex: 1 }}>
                    <div className="ob-q">{obj.q}</div>
                    <div className="ob-sub">{obj.sub}</div>
                </div>
                <span className="ob-arrow">{open ? '▲' : '▼'}</span>
            </div>
            {open && (
                <div className="ob-body">
                    <div className="ob-resp">{obj.resp.split('\n\n').map((p, i) => <p key={i}><em>{p}</em></p>)}</div>
                    <div className="ob-cl"><div className="ob-cl-label">🎯 CLINCHER:</div><p>{obj.clincher}</p></div>
                </div>
            )}
        </div>
    );
}

export default function ObjectionsPage() {
    const [openIdx, setOpenIdx] = useState(0);
    return (
        <div style={{ background: '#FAFBFC', color: '#334155', lineHeight: 1.7, minHeight: '100vh' }}>
            <style>{`
        .ob-hero{background:linear-gradient(135deg,#0F172A,#1E293B);color:#fff;padding:60px 24px 48px;text-align:center}
        .ob-hero h1{font-size:clamp(1.8rem,4vw,2.5rem);font-weight:800;margin-bottom:8px}
        .ob-hero h1 span{background:linear-gradient(135deg,#D4B86A,#C5A456);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
        .ob-hero p{color:#94A3B8;font-size:1rem;max-width:550px;margin:0 auto}
        .ob-wrap{max-width:800px;margin:0 auto;padding:40px 24px 80px}
        .ob-card{background:#fff;border:1px solid #E2E8F0;border-radius:16px;margin-bottom:16px;overflow:hidden;transition:box-shadow .2s}
        .ob-card:hover{box-shadow:0 4px 24px rgba(0,0,0,0.06)}
        .ob-hdr{padding:20px 24px;cursor:pointer;display:flex;align-items:center;gap:14px}
        .ob-num{width:32px;height:32px;background:linear-gradient(135deg,#D4B86A,#A88B3D);color:#0F172A;border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;flex-shrink:0}
        .ob-q{font-size:15px;font-weight:700;color:#0F172A}
        .ob-sub{font-size:12px;color:#94A3B8;font-style:italic;margin-top:2px}
        .ob-arrow{color:#94A3B8;font-size:14px;font-weight:700;flex-shrink:0}
        .ob-body{padding:0 24px 24px}
        .ob-resp{background:#F0FDF4;border-left:4px solid #22C55E;padding:16px 20px;border-radius:0 10px 10px 0;margin:0 0 12px;font-size:14px;line-height:1.8;color:#15803D}
        .ob-resp p{margin:0 0 10px}
        .ob-resp p:last-child{margin:0}
        .ob-cl{background:linear-gradient(135deg,rgba(197,164,86,0.08),rgba(197,164,86,0.04));border:1px solid rgba(197,164,86,0.2);border-radius:10px;padding:16px 20px;font-size:14px}
        .ob-cl-label{font-weight:800;font-size:11px;color:#A88B3D;letter-spacing:.5px;margin-bottom:4px}
        .ob-cl p{font-style:italic;color:#92400E;margin:0}
        .ob-safety{background:linear-gradient(135deg,#0F172A,#1E293B);border-radius:16px;padding:28px;color:#fff;margin-top:32px}
        .ob-safety h3{font-size:14px;font-weight:700;color:#C5A456;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px}
        .ob-safety p{font-size:14px;color:#E2E8F0;font-style:italic;line-height:1.8;margin:0 0 12px}
        .ob-safety .note{font-size:13px;color:#94A3B8;font-style:normal;font-weight:600;margin:0}
      `}</style>

            <nav className="sp-nav">
                <Link href="/docs/salespack" className="sp-nav-brand">Club<span>Forge</span> Sales Pack</Link>
                <Link href="/docs/salespack" className="sp-nav-back">← Back to Index</Link>
            </nav>

            <div className="ob-hero"><h1>🛡️ Objection <span>Handling</span></h1><p>9 common objections with ready-made responses. Keep this open during every sales call.</p></div>

            <div className="ob-wrap">
                {objections.map((obj, i) => (
                    <Objection key={i} n={i + 1} obj={obj} open={openIdx === i} toggle={() => setOpenIdx(openIdx === i ? -1 : i)} />
                ))}

                <div className="ob-safety">
                    <h3>🛟 Universal Safety Net</h3>
                    <p>&quot;That&apos;s a fair point. Let me make a note of that and get you a proper answer rather than guessing. In the meantime — the trial is free and there&apos;s zero commitment. Why don&apos;t you take it for a spin while I dig into that for you?&quot;</p>
                    <div className="note">⚡ Never leave a conversation without a clear next step.</div>
                </div>
            </div>
        </div>
    );
}
