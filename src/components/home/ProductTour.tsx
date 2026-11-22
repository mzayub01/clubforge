'use client';

// ===============================================
// ClubForge homepage — product tour
// Six tabs, one screen each. All six panels are in the server HTML (inactive
// ones carry `hidden`), so the copy is crawlable and the first tab works
// before hydration. Keyboard: arrow keys, Home and End move between tabs.
// ===============================================

import { useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import s from './home.module.css';
import {
    BrowserFrame, PhoneFrame, DashboardScreen, MembersScreen, ClassesScreen,
    GradingScreen, PaymentsScreen, MemberHome, MemberProgress,
} from './screens';

interface Stop {
    id: string;
    tab: string;
    title: string;
    text: string;
    points: string[];
    art: ReactNode;
}

const STOPS: Stop[] = [
    {
        id: 'dashboard',
        tab: 'Dashboard',
        title: 'See your club at a glance',
        text: 'Members, revenue and today’s check-ins on one screen, the moment you sign in.',
        points: [
            'Live member and revenue numbers',
            'Unpaid memberships flagged, with a reminder one click away',
            'New sign-ups as they come in',
        ],
        art: (
            <BrowserFrame url="yourclub.clubforgehq.com" label="The ClubForge admin dashboard with sample data: 247 active members, 3 pending payments, 18 active classes and £8,420 monthly revenue.">
                <DashboardScreen />
            </BrowserFrame>
        ),
    },
    {
        id: 'members',
        tab: 'Members',
        title: 'Every member in one list',
        text: 'Search by name, filter by belt or membership, and see who has paid without opening a spreadsheet.',
        points: [
            'Belt, membership and payment status on every row',
            'Family accounts: one parent login, each child a member',
            'Add members yourself, or let them join from your club link',
        ],
        art: (
            <BrowserFrame url="yourclub.clubforgehq.com" label="The ClubForge members list with sample data, showing each member’s role, belt, membership and payment status.">
                <MembersScreen />
            </BrowserFrame>
        ),
    },
    {
        id: 'classes',
        tab: 'Classes',
        title: 'Your timetable, organised',
        text: 'Build the week once. Members see it on their phone and coaches get a roster for every session.',
        points: [
            'Classes by day, with instructor and location',
            'A capacity limit on every class',
            'A roster showing who has checked in',
        ],
        art: (
            <BrowserFrame url="yourclub.clubforgehq.com" label="The ClubForge class timetable with sample data: kids, fundamentals, no-gi and Muay Thai classes across the week.">
                <ClassesScreen />
            </BrowserFrame>
        ),
    },
    {
        id: 'belts',
        tab: 'Belt progression',
        title: 'Gradings with a record behind them',
        text: 'Promote a student in a few clicks. The rank, the coach, the date and the feedback are kept for good.',
        points: [
            'Rank systems for BJJ, kids’ BJJ, karate, judo and taekwondo',
            'Stripes and belts, with the coach’s feedback attached',
            'Members see their rank and promotion history',
        ],
        art: (
            <BrowserFrame url="yourclub.clubforgehq.com" label="The ClubForge grading dashboard with sample data: students with their belts and stripes, and a recorded promotion with coach feedback.">
                <GradingScreen />
            </BrowserFrame>
        ),
    },
    {
        id: 'payments',
        tab: 'Payments',
        title: 'Get paid without chasing',
        text: 'Members subscribe by card through Stripe and are billed every month. You see what came in and what didn’t.',
        points: [
            'Monthly subscriptions and one-off payments',
            'Members are emailed automatically when a payment fails',
            'Revenue and subscription status in one view',
        ],
        art: (
            <BrowserFrame url="yourclub.clubforgehq.com" label="The ClubForge finance view with sample data: £8,420 monthly revenue, 14 new sign-ups and a breakdown of subscription status.">
                <PaymentsScreen />
            </BrowserFrame>
        ),
    },
    {
        id: 'member-app',
        tab: 'Member app',
        title: 'Your club on every member’s phone',
        text: 'Members open your club’s page, in your colours, and look after themselves.',
        points: [
            'One-tap check-in for today’s class',
            'Rank progress and promotion history',
            'Timetable, membership and payment details',
        ],
        art: (
            <div className={s.phones}>
                <PhoneFrame label="The member home screen on a phone, with sample data: today’s class and a check-in button."><MemberHome /></PhoneFrame>
                <PhoneFrame label="The member rank progress screen on a phone, with sample data: blue belt with three stripes and promotion history."><MemberProgress /></PhoneFrame>
            </div>
        ),
    },
];

export default function ProductTour() {
    const [active, setActive] = useState(0);
    const tabs = useRef<(HTMLButtonElement | null)[]>([]);

    const go = (index: number) => {
        const next = (index + STOPS.length) % STOPS.length;
        setActive(next);
        const el = tabs.current[next];
        el?.focus();
        el?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    };

    const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'ArrowRight') { e.preventDefault(); go(active + 1); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); go(active - 1); }
        else if (e.key === 'Home') { e.preventDefault(); go(0); }
        else if (e.key === 'End') { e.preventDefault(); go(STOPS.length - 1); }
    };

    return (
        <>
            <div className={s.tabs} role="tablist" aria-label="Product screens" onKeyDown={onKeyDown}>
                {STOPS.map((stop, i) => (
                    <button
                        key={stop.id}
                        ref={el => { tabs.current[i] = el; }}
                        type="button"
                        role="tab"
                        id={`tour-tab-${stop.id}`}
                        aria-selected={i === active}
                        aria-controls={`tour-panel-${stop.id}`}
                        tabIndex={i === active ? 0 : -1}
                        className={s.tab}
                        onClick={e => {
                            setActive(i);
                            e.currentTarget.scrollIntoView({ block: 'nearest', inline: 'nearest' });
                        }}
                    >
                        {stop.tab}
                    </button>
                ))}
            </div>

            {STOPS.map((stop, i) => (
                <div
                    key={stop.id}
                    role="tabpanel"
                    id={`tour-panel-${stop.id}`}
                    aria-labelledby={`tour-tab-${stop.id}`}
                    hidden={i !== active}
                    className={s.panel}
                >
                    <div className={s.panelCopy}>
                        <h3 className={s.h3}>{stop.title}</h3>
                        <p>{stop.text}</p>
                        <ul className={s.ticks}>
                            {stop.points.map(point => (
                                <li key={point}><Check size={18} strokeWidth={2.5} aria-hidden="true" />{point}</li>
                            ))}
                        </ul>
                        <Link href="/get-started" className={`${s.btn} ${s.btnGold}`}>Try it free for 14 days</Link>
                    </div>
                    <div className={s.panelArt}>
                        {stop.art}
                        <p className={s.sampleNote}>Illustrated with sample data.</p>
                    </div>
                </div>
            ))}
        </>
    );
}
