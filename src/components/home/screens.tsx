// ===============================================
// ClubForge homepage — illustrated product screens
//
// Faithful, simplified versions of the real admin and member screens
// (/admin, /admin/members, /admin/classes, /professor, /admin/finance,
// /dashboard, /dashboard/progress), drawn in markup so they stay sharp at any
// size and weigh nothing. All data is sample data and every frame says so.
//
// Rule: only draw screens and controls that exist in the product. If a screen
// changes materially, update its twin here.
// ===============================================

import type { ReactNode } from 'react';
import {
    LayoutGrid, Users, MapPin, Bell, PoundSterling, Settings, CircleCheck, CalendarDays,
    Search, Download, Plus, Clock, User, Menu, House, Award, TrendingUp, ChevronDown,
} from 'lucide-react';
import s from './home.module.css';

// ---------- Frames ----------

export function BrowserFrame({ url, label, children }: { url: string; label: string; children: ReactNode }) {
    return (
        <figure className={s.browser} role="img" aria-label={label} style={{ margin: 0 }}>
            <div className={s.chrome} aria-hidden="true">
                <span className={s.dots}><i /><i /><i /></span>
                <span className={s.url}>{url}</span>
                <span className={s.sample}>Sample data</span>
            </div>
            <div className={s.viewport} aria-hidden="true">{children}</div>
        </figure>
    );
}

export function PhoneFrame({ label, children }: { label: string; children: ReactNode }) {
    return (
        <figure className={s.phone} role="img" aria-label={label} style={{ margin: 0 }}>
            <div className={s.phoneShell} aria-hidden="true">
                <div className={s.phoneView}>{children}</div>
            </div>
        </figure>
    );
}

// ---------- Shared pieces ----------

const BELTS: Record<string, string> = {
    white: '#F5F5F5', grey: '#9CA3AF', yellow: '#EAB308', blue: '#1E40AF',
    purple: '#6B21A8', brown: '#78350F', black: '#1A1A1A',
};

/** A belt with its rank bar and stripes, as members see it on their progress page. */
export function BeltBar({ rank, stripes = 0 }: { rank: keyof typeof BELTS | string; stripes?: number }) {
    const fill = BELTS[rank] || BELTS.white;
    const bar = rank === 'black' ? '#DC2626' : '#1A1A1A';
    return (
        <svg className={s.beltBar} viewBox="0 0 128 25" preserveAspectRatio="none" aria-hidden="true">
            <rect x="0.5" y="0.5" width="127" height="24" rx="4" fill={fill} stroke={rank === 'white' ? '#D1D5DB' : 'none'} />
            <rect x="92" y="2.5" width="28" height="20" rx="1.5" fill={bar} />
            {Array.from({ length: Math.min(stripes, 4) }).map((_, i) => (
                <rect key={i} x={96 + i * 6} y="2.5" width="3" height="20" fill="#FFFFFF" />
            ))}
        </svg>
    );
}

function BeltPill({ rank }: { rank: string }) {
    return (
        <span className={s.belt}><i style={{ background: BELTS[rank] || BELTS.white }} />{rank}</span>
    );
}

type AdminSection = 'dashboard' | 'members' | 'classes' | 'grading' | 'finance';

function AdminShell({ active, children }: { active: AdminSection; children: ReactNode }) {
    const on = (key: AdminSection) => (active === key ? `${s.navItem} ${s.navOn}` : s.navItem);
    const sub = (key: AdminSection) => (active === key ? `${s.navSub} ${s.navSubOn}` : s.navSub);
    return (
        <div className={s.screen}>
            <aside className={s.side}>
                <div className={s.club}><span className={s.crest}>YC</span>Your Club</div>
                <div className={s.who}>
                    <span className={s.av}>SK</span>
                    <span><b>Sam Kelly</b><small>Club Owner</small></span>
                </div>
                <div className={on('dashboard')}><LayoutGrid />Dashboard</div>
                <div className={on('members')}><Users />Members</div>
                <div className={active === 'classes' || active === 'grading' ? `${s.navItem} ${s.navOn}` : s.navItem}><MapPin />Your Club</div>
                <div className={sub('classes')}>Classes</div>
                <div className={s.navSub}>Class Roster</div>
                <div className={sub('grading')}>Grading</div>
                <div className={s.navItem}><Bell />Engagement</div>
                <div className={on('finance')}><PoundSterling />Money</div>
                <div className={s.navItem}><Settings />Settings</div>
            </aside>
            <div className={s.main}>{children}</div>
        </div>
    );
}

function StatTiles() {
    return (
        <div className={s.stats}>
            <div className={s.stat}>
                <span>Active Members</span><b>247</b><small>people with a live membership</small>
                <i className={s.tGreen}><CircleCheck /></i>
            </div>
            <div className={s.stat}>
                <span>Pending Payment</span><b>3</b><small>chose a plan, not yet paid</small>
                <i className={s.tAmber}><Users /></i>
            </div>
            <div className={s.stat}>
                <span>Active Classes</span><b>18</b><small>across the week</small>
                <i className={s.tIndigo}><CalendarDays /></i>
            </div>
            <div className={s.stat}>
                <span>Monthly Revenue</span><b>£8,420</b><small>from memberships</small>
                <i className={s.tGold}><PoundSterling /></i>
            </div>
        </div>
    );
}

interface SampleMember {
    initials: string;
    name: string;
    role?: 'Instructor' | 'Member';
    rank: string;
    line: ReactNode;
    tone?: string;
    end?: string;
}

const MEMBERS: SampleMember[] = [
    { initials: 'AK', name: 'Aisha Khan', rank: 'blue', line: <><b className={s.cGreen}>Active</b> · Adults £45/mo <span className={s.chip}>Stripe subscription</span></>, end: 'Joined 12 Nov' },
    { initials: 'LM', name: 'Leo Martins', rank: 'grey', tone: s.av4, line: <><b className={s.cGreen}>Active</b> · Kids £30/mo · guardian Ana Martins</>, end: 'Joined 9 Nov' },
    { initials: 'OJ', name: 'Olivia Jones', rank: 'white', tone: s.av3, line: <><b className={s.cAmber}>Pending payment</b> · Adults £45/mo</>, end: 'Joined 8 Nov' },
    { initials: 'TW', name: 'Tom Wilson', role: 'Instructor', rank: 'brown', tone: s.av2, line: <><b className={s.cGreen}>Active</b> · Staff</>, end: 'Joined 2 Mar' },
    { initials: 'DO', name: 'Daniel Okafor', rank: 'purple', line: <><b className={s.cGreen}>Active</b> · All-Access £65/mo <span className={s.chip}>Stripe subscription</span></>, end: 'Joined 14 Jan' },
];

function MemberRows({ count }: { count: number }) {
    return (
        <>
            {MEMBERS.slice(0, count).map(m => (
                <div className={s.row} key={m.name}>
                    <span className={`${s.av} ${m.tone || ''}`}>{m.initials}</span>
                    <div className={s.rowMain}>
                        <div className={s.rowTop}>
                            {m.name}
                            <span className={m.role === 'Instructor' ? `${s.tag} ${s.tagStaff}` : s.tag}>{m.role || 'Member'}</span>
                            <BeltPill rank={m.rank} />
                        </div>
                        <div className={s.rowSub}>{m.line}</div>
                    </div>
                    <span className={`${s.rowEnd} ${s.hideNarrow}`}>{m.end}</span>
                </div>
            ))}
        </>
    );
}

// ---------- Admin screens ----------

/** Hero version: no sidebar, sized by its content. */
export function DashboardCompact() {
    return (
        <div className={`${s.screen} ${s.screenBare}`}>
            <div className={s.main}>
                <div className={s.mainHead}>
                    <div><h4>Good evening, Sam</h4><p>Here&apos;s what&apos;s happening with your club today.</p></div>
                </div>
                <StatTiles />
                <div className={s.block}>
                    <div className={s.blockHead}>Recent Members</div>
                    <MemberRows count={4} />
                </div>
            </div>
        </div>
    );
}

export function DashboardScreen() {
    return (
        <AdminShell active="dashboard">
            <div className={s.mainHead}>
                <div><h4>Good evening, Sam</h4><p>Here&apos;s what&apos;s happening with your club today.</p></div>
            </div>
            <StatTiles />
            <div className={`${s.stats} ${s.stats3}`}>
                <div className={s.stat}><span>Check-ins Today</span><b className={s.cAmber}>42</b></div>
                <div className={s.stat}><span>Active Memberships</span><b className={s.cGreen}>247</b></div>
                <div className={s.stat}><span>Total Profiles</span><b>268</b></div>
            </div>
            <div className={s.block}>
                <div className={s.blockHead}>Recent Members</div>
                <MemberRows count={2} />
            </div>
        </AdminShell>
    );
}

export function MembersScreen() {
    return (
        <AdminShell active="members">
            <div className={s.mainHead}>
                <div><h4>Members</h4><p>268 registered profiles · 247 with an active membership</p></div>
                <div className={s.acts}>
                    <span className={`${s.act} ${s.actLine}`}><Download />Export CSV</span>
                    <span className={s.act}><Plus />Add Member</span>
                </div>
            </div>
            <div className={s.filters}>
                <span className={s.field}><Search />Search by name, email, or phone…</span>
                <span className={s.field}>All Roles <ChevronDown /></span>
                <span className={s.field}>All Ranks <ChevronDown /></span>
                <span className={s.field}>All Members <ChevronDown /></span>
            </div>
            <div className={s.block}>
                <MemberRows count={5} />
            </div>
        </AdminShell>
    );
}

const WEEK: { day: string; classes: { name: string; tag: string; time: string; coach: string }[] }[] = [
    { day: 'Monday', classes: [
        { name: 'Kids BJJ', tag: 'Kids', time: '17:00 – 17:45', coach: 'Priya Nair' },
        { name: 'Fundamentals BJJ', tag: 'BJJ', time: '18:00 – 19:30', coach: 'Tom Wilson' },
        { name: 'Competition Class', tag: 'BJJ', time: '19:30 – 21:00', coach: 'Sam Kelly' },
    ] },
    { day: 'Tuesday', classes: [
        { name: 'Kids Muay Thai', tag: 'Kids', time: '17:00 – 17:45', coach: 'Marcus Reid' },
        { name: 'Muay Thai', tag: 'Striking', time: '18:00 – 19:30', coach: 'Marcus Reid' },
        { name: 'Advanced No-Gi', tag: 'No Gi', time: '19:30 – 21:00', coach: 'Tom Wilson' },
    ] },
    { day: 'Wednesday', classes: [
        { name: 'Kids BJJ', tag: 'Kids', time: '17:00 – 17:45', coach: 'Priya Nair' },
        { name: 'Fundamentals BJJ', tag: 'BJJ', time: '18:00 – 19:00', coach: 'Tom Wilson' },
        { name: 'Open Mat', tag: 'BJJ', time: '19:00 – 20:30', coach: 'Sam Kelly' },
    ] },
];

export function ClassesScreen() {
    return (
        <AdminShell active="classes">
            <div className={s.mainHead}>
                <div><h4>Classes</h4><p>Manage class schedules and assign instructors</p></div>
                <div className={s.acts}><span className={s.act}><Plus />Add Class</span></div>
            </div>
            <div className={s.week}>
                {WEEK.map(d => (
                    <div key={d.day}>
                        <div className={s.day}><CalendarDays />{d.day}</div>
                        {d.classes.map(c => (
                            <div className={s.lesson} key={d.day + c.name}>
                                <b>{c.name}</b>
                                <span className={s.tag}>{c.tag}</span>
                                <small><Clock />{c.time}</small>
                                <small><MapPin />Main mat · 25 max</small>
                                <small><User />{c.coach}</small>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </AdminShell>
    );
}

export function GradingScreen() {
    const rows: { initials: string; name: string; rank: string; stripes: number; tone?: string; on?: boolean }[] = [
        { initials: 'AK', name: 'Aisha Khan', rank: 'blue', stripes: 3, on: true },
        { initials: 'DO', name: 'Daniel Okafor', rank: 'purple', stripes: 1 },
        { initials: 'OJ', name: 'Olivia Jones', rank: 'white', stripes: 2, tone: s.av3 },
        { initials: 'MP', name: 'Maya Patel', rank: 'white', stripes: 4, tone: s.av4 },
        { initials: 'JB', name: 'Jamal Brooks', rank: 'blue', stripes: 0, tone: s.av2 },
    ];
    const label = (rank: string) => rank.charAt(0).toUpperCase() + rank.slice(1);
    return (
        <AdminShell active="grading">
            <div className={s.mainHead}>
                <div><h4>Grading Dashboard</h4><p>Promote members to new ranks</p></div>
            </div>
            <div className={s.filters}>
                <span className={s.field}><Search />Search members…</span>
                <span className={s.field}>Main mat <ChevronDown /></span>
                <span className={s.field}>Fundamentals BJJ <ChevronDown /></span>
                <span className={s.field}>BJJ Adult <ChevronDown /></span>
            </div>
            <div className={s.gradeGrid}>
                <div className={s.block}>
                    {rows.map(r => (
                        <div className={s.row} key={r.name}>
                            <span className={`${s.av} ${r.tone || ''}`}>{r.initials}</span>
                            <div className={s.rowMain}>
                                <div className={s.rowTop}>{r.name}</div>
                                <div className={s.rowSub}>{label(r.rank)} belt · {r.stripes} {r.stripes === 1 ? 'stripe' : 'stripes'}</div>
                            </div>
                            <BeltBar rank={r.rank} stripes={r.stripes} />
                            <span className={r.on ? `${s.promote} ${s.promoteOn}` : s.promote}>Promote</span>
                        </div>
                    ))}
                </div>
                <div className={`${s.block} ${s.note}`}>
                    <h5>Promotion recorded</h5>
                    <dl>
                        <dt>Member</dt><dd>Aisha Khan</dd>
                        <dt>New rank</dt><dd>Blue belt, 3 stripes</dd>
                        <dt>Coach</dt><dd>Tom Wilson</dd>
                        <dt>Date</dt><dd>14 Nov 2026</dd>
                    </dl>
                    <p className={s.feedback}>Guard retention has come on a lot. Keep drilling the knee cut before your next stripe.</p>
                </div>
            </div>
        </AdminShell>
    );
}

export function PaymentsScreen() {
    return (
        <AdminShell active="finance">
            <div className={s.mainHead}>
                <div><h4>Financial MI</h4><p>Revenue analysis and financial insights</p></div>
            </div>
            <div className={`${s.stats} ${s.stats3}`}>
                <div className={s.stat}>
                    <span>Monthly Revenue</span><b>£8,420</b><small>From 235 paying members</small>
                    <i className={s.tGold}><PoundSterling /></i>
                </div>
                <div className={s.stat}>
                    <span>New Signups This Month</span><b>14</b><small className={s.up}>+27% vs last month (11)</small>
                    <i className={s.tGreen}><TrendingUp /></i>
                </div>
                <div className={s.stat}>
                    <span>Avg Revenue/<wbr />Member</span><b>£34.09</b><small>across 247 active members</small>
                    <i className={s.tGreen}><Users /></i>
                </div>
            </div>
            <div className={s.block}>
                <div className={s.blockHead}>Subscription Status</div>
                <div className={s.subs}>
                    <div className={`${s.sub} ${s.subOk}`}><span>Stripe Active</span><b className={s.cGreen}>235</b><small>£8,420/month</small></div>
                    <div className={s.sub}><span>Free Members</span><b>12</b><small>No payment required</small></div>
                    <div className={`${s.sub} ${s.subWarn}`}><span>Pending/Manual</span><b className={s.cAmber}>3</b><small>Awaiting payment</small></div>
                    <div className={`${s.sub} ${s.subOff}`}><span>Cancelled</span><b>9</b><small>Subscription ended</small></div>
                </div>
                <div className={s.cover}>
                    <div className={s.coverTop}><span>Stripe Subscription Coverage</span><span>99%</span></div>
                    <div className={s.bar}><i /></div>
                    <small>235 of 238 paid members have active Stripe subscriptions</small>
                </div>
            </div>
        </AdminShell>
    );
}

// ---------- Member app ----------

function AppChrome({ here, children }: { here: 'home' | 'progress'; children: ReactNode }) {
    return (
        <div className={s.app}>
            <div className={s.appBar}><Menu /><span className={s.crest}>YC</span><User /></div>
            <div className={s.appBody}>{children}</div>
            <div className={s.appNav}>
                <span className={here === 'home' ? s.here : undefined}><House />Home</span>
                <span><CalendarDays />Classes</span>
                <span className={s.tap}><i><CircleCheck /></i>Check in</span>
                <span className={here === 'progress' ? s.here : undefined}><Award />Progress</span>
                <span><User />Profile</span>
            </div>
        </div>
    );
}

export function MemberHome() {
    return (
        <AppChrome here="home">
            <h4>Welcome, Aisha!</h4>
            <p>Here&apos;s your training overview.</p>
            <div className={`${s.card} ${s.cardInk}`}>
                <span>Today&apos;s class</span>
                <b>Fundamentals BJJ</b>
                <small>18:00 – 19:30 · Main mat</small>
                <div className={s.go}><CircleCheck />Check in</div>
            </div>
            <div className={`${s.card} ${s.rank}`}>
                <div><span>Current rank</span><b>Blue · 3 stripes</b></div>
                <BeltBar rank="blue" stripes={3} />
            </div>
            <div className={s.pair}>
                <div className={s.card}><span>Total sessions</span><b className={s.big}>147</b></div>
                <div className={s.card}><span>Membership</span><b>Adults</b><small>Main mat</small></div>
            </div>
        </AppChrome>
    );
}

export function MemberProgress() {
    const path = ['White', 'Blue', 'Purple', 'Brown', 'Black'];
    return (
        <AppChrome here="progress">
            <h4>Rank Progress</h4>
            <p>Track your journey</p>
            <div className={`${s.card} ${s.center}`}>
                <span>Current rank</span>
                <BeltBar rank="blue" stripes={3} />
                <b>Blue Belt</b>
                <small>3 stripes</small>
            </div>
            <div className={s.card}>
                <span>Your journey</span>
                <ol className={s.journey}>
                    {path.map((p, i) => (
                        <li key={p} className={i === 0 ? s.done : i === 1 ? s.now : undefined}><i />{p}</li>
                    ))}
                </ol>
            </div>
            <div className={s.card}>
                <span>Promotion history</span>
                <ul className={s.hist}>
                    <li><b>Blue belt, 3rd stripe</b><small>14 Nov 2026 · Tom Wilson</small></li>
                    <li><b>Blue belt</b><small>2 Feb 2025 · Tom Wilson</small></li>
                </ul>
            </div>
        </AppChrome>
    );
}
