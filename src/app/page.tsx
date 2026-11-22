import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowDown, ArrowRight, ArrowUpRight, Award, BadgePoundSterling, Building2, CalendarDays,
  Check, CircleCheck, ClipboardCheck, CreditCard, FileDown, Smartphone, Ticket, Users,
  type LucideIcon,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CurrencyPrice from '@/components/CurrencyPrice';
import { SoftwareApplicationSchema, BreadcrumbSchema, FAQPageSchema } from '@/components/structured-data';
import ProductTour from '@/components/home/ProductTour';
import { BrowserFrame, PhoneFrame, DashboardCompact, MemberHome, BeltBar } from '@/components/home/screens';
import { CLUB_LOGOS, TESTIMONIALS } from '@/components/home/social-proof';
import s from '@/components/home/home.module.css';

// Statically prerendered: no cookies() / auth lookups here. The Navbar works
// out whether someone is signed in on the client. See .agent/DECISIONS.md
// "Marketing / SEO pages".

export const metadata: Metadata = {
  title: { absolute: 'ClubForge — Martial Arts & Gym Management Software UK | Free Trial' },
  description: 'Purpose-built for martial arts clubs & gyms. Manage members, classes, belt progression, Stripe payments & attendance from one dashboard. Built for BJJ, MMA & Karate academies across the UK. Start your free 14-day trial today.',
  alternates: {
    canonical: 'https://clubforgehq.com',
  },
  openGraph: {
    title: 'ClubForge — Martial Arts & Gym Management Software UK',
    description: 'Run your whole club from one place. Members, classes, belt gradings and payments in one system, built for martial arts clubs. 14-day free trial.',
    url: 'https://clubforgehq.com',
  },
};

// ---------- Content ----------

const FEATURES: { icon: LucideIcon; title: string; text: string; href?: string }[] = [
  { icon: Users, title: 'Member management', text: 'Profiles, family accounts and self sign-up.', href: '/features/member-management' },
  { icon: CalendarDays, title: 'Class scheduling', text: 'Timetables, instructors and capacity limits.', href: '/features/class-scheduling' },
  { icon: Award, title: 'Belt and grading tracking', text: 'Belts, stripes and gradings with coach sign-off.', href: '/features/belt-progression' },
  { icon: ClipboardCheck, title: 'Attendance tracking', text: 'One-tap check-in and attendance reports.', href: '/features/attendance-tracking' },
  { icon: CreditCard, title: 'Payments and billing', text: 'Stripe subscriptions, invoices and promo codes.', href: '/features/payments-billing' },
  { icon: Smartphone, title: 'Branded member portal', text: 'Your logo, your colours, on members’ phones.' },
  { icon: Ticket, title: 'Events and ticketing', text: 'Seminars, gradings and competitions.' },
  { icon: Building2, title: 'Multi-location', text: 'Every venue in one dashboard.', href: '/features/multi-location' },
];

const ARTS: { label: string; href?: string }[] = [
  { label: 'BJJ', href: '/for/bjj' },
  { label: 'Karate', href: '/for/karate' },
  { label: 'Judo', href: '/for/judo' },
  { label: 'Taekwondo', href: '/for/taekwondo' },
  { label: 'MMA', href: '/for/boxing-mma' },
  { label: 'Boxing', href: '/for/boxing' },
  { label: 'Kickboxing', href: '/for/kickboxing' },
  { label: 'Muay Thai', href: '/for/martial-arts' },
  { label: 'Kids’ programmes', href: '/for/martial-arts' },
];

const PLANS: {
  tier: 'starter' | 'pro' | 'elite';
  name: string;
  forWho: string;
  points: string[];
  cta: string;
  href: string;
}[] = [
  {
    tier: 'starter', name: 'Starter', forWho: 'For new and small clubs.',
    points: ['Up to 150 members', '1 location', 'Scheduling, attendance and belts', 'Stripe payments'],
    cta: 'Start free trial', href: '/get-started',
  },
  {
    tier: 'pro', name: 'Pro', forWho: 'For established clubs ready to grow.',
    points: ['Up to 750 members', '3 locations', 'Video library and events', 'Advanced reports, priority support'],
    cta: 'Start free trial', href: '/get-started',
  },
  {
    tier: 'elite', name: 'Elite', forWho: 'For large academies and franchises.',
    points: ['Unlimited members and locations', 'Unlimited events and videos', 'Your club on its own domain', 'Dedicated support'],
    cta: 'Book a demo', href: '/demo',
  },
];

const FAQS: { question: string; answer: string }[] = [
  {
    question: 'Does it work for my martial art?',
    answer: 'ClubForge is built for BJJ, MMA, karate, judo, taekwondo, boxing, kickboxing and Muay Thai clubs. Rank systems for BJJ (adults and kids), karate, judo and taekwondo are ready to switch on, and clubs that don’t grade can turn belts off.',
  },
  {
    question: 'How do members pay?',
    answer: 'By card, through Stripe. Members take out a monthly membership from your club’s page and are billed automatically, and the money goes to your own Stripe account. ClubForge charges a 2.5% platform fee on member payments, on top of Stripe’s processing fee.',
  },
  {
    question: 'Can parents manage their kids’ accounts?',
    answer: 'Yes. A parent or guardian signs up once, adds each child, and looks after their memberships, check-ins and progress from one login. Club emails about a child go to the guardian.',
  },
  {
    question: 'How long does setup take?',
    answer: 'Signing up takes a few minutes. A setup guide in your dashboard then walks you through adding your logo, timetable, memberships and belt system, and you can invite members as soon as you’re ready.',
  },
  {
    question: 'Is there a contract?',
    answer: 'No. ClubForge is paid monthly and you can cancel at any time from your admin settings. Your data is kept for 90 days after you cancel in case you come back, and you can export it whenever you like.',
  },
];

function Terms() {
  return (
    <p className={s.terms}>
      <span>14-day free trial</span>
      <span>Cancel anytime</span>
      <span>Not charged until your trial ends</span>
    </p>
  );
}

// ---------- Page ----------

export default function HomePage() {
  const logos = CLUB_LOGOS.length >= 3 ? CLUB_LOGOS : [];
  const quotes = TESTIMONIALS.filter(t => t.quote && t.name && t.club && t.approvedOn);

  return (
    <>
      <Navbar />

      <SoftwareApplicationSchema />
      <BreadcrumbSchema items={[{ name: 'Home', url: 'https://clubforgehq.com' }]} />
      <FAQPageSchema faqs={FAQS} />

      <main className={s.page}>
        {/* ---------- Hero ---------- */}
        <section className={s.hero}>
          <div className={`${s.wrap} ${s.heroGrid}`}>
            <div className={s.heroCopy}>
              <h1 className={s.h1}>
                <span className={s.h1Line}>Run your whole club from one place.</span>
                <span className={s.h1Kind}>Club management software for martial arts.</span>
              </h1>
              <p className={s.lede}>
                Members, classes, belt gradings and payments in one system, built for BJJ, karate,
                judo and MMA clubs. No more spreadsheets or chasing payments on WhatsApp.
              </p>
              <div className={s.ctaRow}>
                <Link href="/get-started" className={`${s.btn} ${s.btnGold}`}>Start your free trial</Link>
                <a href="#tour" className={`${s.btn} ${s.btnLine}`}>See it in action <ArrowDown size={18} aria-hidden="true" /></a>
              </div>
              <Terms />
            </div>

            <div className={s.heroArt}>
              <BrowserFrame
                url="yourclub.clubforgehq.com"
                label="The ClubForge admin dashboard with sample data: 247 active members, 3 pending payments, 18 active classes, £8,420 monthly revenue and a list of recent members with their belts."
              >
                <DashboardCompact />
              </BrowserFrame>
              <div className={s.heroPhone}>
                <PhoneFrame label="The member app on a phone, with sample data: today’s class and a one-tap check-in button.">
                  <MemberHome />
                </PhoneFrame>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- Proof ---------- */}
        <section className={s.proof} aria-label="Why clubs trust ClubForge">
          <div className={s.wrap}>
            {logos.length > 0 ? (
              <div className={s.logoRow}>
                <p>Used by martial arts clubs across the UK</p>
                <ul>
                  {logos.map(logo => (
                    <li key={logo.name}>
                      <Image src={logo.src} alt={logo.name} width={160} height={40} />
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <ul className={s.proofList}>
                <li><Award size={18} aria-hidden="true" />Built inside a working martial arts academy</li>
                <li><CreditCard size={18} aria-hidden="true" />Payments by Stripe</li>
                <li><BadgePoundSterling size={18} aria-hidden="true" />No per-member fees</li>
                <li><FileDown size={18} aria-hidden="true" />Your data is yours to export</li>
              </ul>
            )}
          </div>
        </section>

        {/* ---------- Why clubs switch ---------- */}
        <section className={s.section}>
          <div className={s.wrap}>
            <div className={s.sectionHead}>
              <h2 className={`${s.h2} ${s.h2Wide}`}>Less admin. More time on the mats.</h2>
            </div>

            <div className={s.switchGrid}>
              <article className={s.switchItem}>
                <div className={s.switchArt} aria-hidden="true">
                  <div className={s.mini}>
                    <div className={s.miniRow}>
                      <span><b>Maya Patel</b><small>Adults £45/mo</small></span>
                      <span className={`${s.pill} ${s.pillOk}`}><Check size={12} strokeWidth={3} />Paid 1 Nov</span>
                    </div>
                    <div className={s.miniRow}>
                      <span><b>Olivia Jones</b><small>Reminder emailed</small></span>
                      <span className={`${s.pill} ${s.pillWarn}`}>Payment failed</span>
                    </div>
                    <div className={s.miniRow}>
                      <span><b>Daniel Okafor</b><small>All-Access £65/mo</small></span>
                      <span className={`${s.pill} ${s.pillOk}`}><Check size={12} strokeWidth={3} />Paid 1 Nov</span>
                    </div>
                  </div>
                </div>
                <div className={s.switchText}>
                  <p className={s.was}><span className={s.srOnly}>Before: </span><s>Chasing payments every month</s></p>
                  <h3 className={s.h3}>Memberships that bill themselves</h3>
                  <p>Monthly subscriptions through Stripe, with an automatic email to the member when a payment fails.</p>
                </div>
              </article>

              <article className={s.switchItem}>
                <div className={s.switchArt} aria-hidden="true">
                  <div className={s.mini}>
                    <div className={s.miniCard}>
                      <BeltBar rank="blue" stripes={3} />
                      <div style={{ marginTop: 10 }}><b>Emily Carter · Blue belt, 3 stripes</b></div>
                      <small>Promoted 14 Nov by Tom Wilson</small>
                      <p className={s.miniQuote}>Guard retention has come on a lot. Keep drilling the knee cut.</p>
                    </div>
                  </div>
                </div>
                <div className={s.switchText}>
                  <p className={s.was}><span className={s.srOnly}>Before: </span><s>Belt records on paper</s></p>
                  <h3 className={s.h3}>Gradings tracked properly</h3>
                  <p>Every belt, stripe and grading logged with the coach’s name, date and feedback.</p>
                </div>
              </article>

              <article className={s.switchItem}>
                <div className={s.switchArt} aria-hidden="true">
                  <div className={s.mini}>
                    <div className={s.miniCard}>
                      <b>Fundamentals BJJ</b>
                      <small>Today · 18:00 – 19:30 · Main mat</small>
                      <div className={s.checkBtn}><CircleCheck size={16} />Check in</div>
                      <div className={s.stack}>
                        <span className={s.avatars}><i /><i /><i /><i /></span>
                        18 of 25 checked in
                      </div>
                    </div>
                  </div>
                </div>
                <div className={s.switchText}>
                  <p className={s.was}><span className={s.srOnly}>Before: </span><s>No idea who turns up</s></p>
                  <h3 className={s.h3}>Check-in in one tap</h3>
                  <p>Members check in from their phone, and every class has a roster of who turned up.</p>
                </div>
              </article>
            </div>
            <p className={s.gridNote}>Examples show sample data.</p>
          </div>
        </section>

        {/* ---------- Product tour ---------- */}
        <section id="tour" className={`${s.section} ${s.onInk} ${s.tour}`}>
          <div className={s.wrap}>
            <div className={s.sectionHead}>
              <h2 className={s.h2}>Take a look around. No demo call needed.</h2>
              <p>Click through the screens your team and members actually use.</p>
            </div>
            <ProductTour />
            <p className={s.tourFoot}>
              Prefer a walkthrough with our team?{' '}
              <Link href="/demo" className={s.textLink}>Book a demo</Link>
            </p>
          </div>
        </section>

        {/* ---------- Features ---------- */}
        <section id="features" className={`${s.section} ${s.mist}`}>
          <div className={s.wrap}>
            <div className={s.sectionHead}>
              <h2 className={s.h2}>Everything your club needs, nothing it doesn’t</h2>
            </div>
            <ul className={s.index}>
              {FEATURES.map(feature => {
                const body = (
                  <>
                    <feature.icon size={24} strokeWidth={1.75} aria-hidden="true" />
                    <h3 className={s.h3}>{feature.title}</h3>
                    <p>{feature.text}</p>
                  </>
                );
                return (
                  <li key={feature.title}>
                    {feature.href ? (
                      <Link href={feature.href} className={s.indexCell}>
                        {body}
                        <ArrowUpRight size={18} className={s.indexArrow} aria-hidden="true" />
                      </Link>
                    ) : (
                      <div className={s.indexCell}>{body}</div>
                    )}
                  </li>
                );
              })}
            </ul>
            <p className={s.afterGrid}>
              <Link href="/features" className={s.textLink}>See all features</Link>
            </p>
          </div>
        </section>

        {/* ---------- Disciplines ---------- */}
        <section className={`${s.section} ${s.arts}`}>
          <div className={s.wrap}>
            <h2 className={s.h2}>Set up for the way your art grades</h2>
            <p>
              Ready-made rank systems for BJJ, kids’ BJJ, karate, judo and taekwondo. Clubs that
              don’t grade, like boxing and Muay Thai gyms, simply switch belts off.
            </p>
            <ul className={s.artList}>
              {ARTS.map(art => (
                <li key={art.label}>
                  {art.href
                    ? <Link href={art.href} className={s.art}>{art.label}</Link>
                    : <span className={s.art}>{art.label}</span>}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------- Steps ---------- */}
        <section className={`${s.section} ${s.mist}`}>
          <div className={s.wrap}>
            <div className={s.sectionHead}>
              <h2 className={s.h2}>Up and running in three steps</h2>
            </div>
            <ol className={s.steps}>
              <li>
                <h3 className={s.h3}>Create your account</h3>
                <p>Pick a plan and start your 14-day free trial.</p>
              </li>
              <li>
                <h3 className={s.h3}>Set up your club</h3>
                <p>Add your logo, timetable, memberships and belt system.</p>
              </li>
              <li>
                <h3 className={s.h3}>Invite your members</h3>
                <p>Share your club link. Members sign up, pay and check in online.</p>
              </li>
            </ol>
          </div>
        </section>

        {/* ---------- Club owners / story + switching ---------- */}
        <section className={s.section}>
          <div className={s.wrap}>
            {quotes.length > 0 ? (
              <>
                <div className={s.sectionHead}>
                  <h2 className={s.h2}>What club owners say</h2>
                </div>
                <ul className={s.quotes}>
                  {quotes.map(t => (
                    <li key={t.name + t.club}>
                      <figure className={s.quote}>
                        <blockquote>“{t.quote}”</blockquote>
                        <figcaption><b>{t.name}</b>{t.club}</figcaption>
                      </figure>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <div className={s.story}>
                <h2 className={s.h2}>Built inside a working academy</h2>
                <div>
                  <p>
                    ClubForge wasn’t designed in a lab. It started as the system for one martial
                    arts academy, built by the people running it, who were tired of holding a club
                    together with spreadsheets and WhatsApp.
                  </p>
                  <p>
                    Every feature is there because a real club needed it, and every workflow has
                    been used with real members, real coaches and real payments.
                  </p>
                </div>
              </div>
            )}

            <div id="switching" className={s.moving} style={{ marginTop: 'clamp(48px, 7vw, 88px)' }}>
              <div>
                <h2 className={s.h3} style={{ fontSize: 'clamp(1.35rem, 2.2vw, 1.75rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>
                  Moving from spreadsheets or another system?
                </h2>
                <p>Tell us what you use today and we’ll talk you through bringing your members, memberships and belt records across.</p>
              </div>
              <Link href="/demo" className={`${s.btn} ${s.btnInk}`}>Talk to us about switching</Link>
            </div>
          </div>
        </section>

        {/* ---------- Pricing ---------- */}
        <section id="pricing" className={`${s.section} ${s.onInk}`}>
          <div className={s.wrap}>
            <div className={s.sectionHead}>
              <h2 className={s.h2}>One price for your whole club</h2>
              <p>
                No per-member charges or setup fees. All plans include a 2.5% platform fee on
                member payments processed through Stripe.
              </p>
            </div>

            <div className={s.plans}>
              {PLANS.map(plan => {
                const pro = plan.tier === 'pro';
                return (
                  <article key={plan.tier} className={pro ? `${s.plan} ${s.planPro}` : s.plan}>
                    <div className={s.planTop}>
                      <h3 className={s.h3}>{plan.name}</h3>
                      {pro && <span className={s.badge}>Recommended</span>}
                    </div>
                    <p className={s.price}>
                      <b><CurrencyPrice tier={plan.tier} period="monthly" /></b>
                      <span>/month</span>
                    </p>
                    <p className={s.planFor}>{plan.forWho}</p>
                    <ul className={s.planList}>
                      {plan.points.map(point => (
                        <li key={point}><Check size={16} strokeWidth={2.5} aria-hidden="true" />{point}</li>
                      ))}
                    </ul>
                    <Link
                      href={plan.href}
                      className={`${s.btn} ${s.btnBlock} ${pro ? s.btnGold : s.btnGhostGold}`}
                      aria-label={`${plan.cta}: ${plan.name} plan`}
                    >
                      {plan.cta}
                    </Link>
                  </article>
                );
              })}
            </div>

            <p className={s.afterGrid}>
              <Link href="/pricing" className={s.textLink}>Compare all plans</Link>
            </p>
          </div>
        </section>

        {/* ---------- FAQ ---------- */}
        <section className={s.section}>
          <div className={s.wrap}>
            <div className={s.faq}>
              <h2 className={s.h2}>Questions</h2>
              {FAQS.map(faq => (
                <details key={faq.question} className={s.qa}>
                  <summary>{faq.question}</summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
              <p className={s.afterGrid}>
                <Link href="/faq" className={s.textLink}>More questions answered</Link>
              </p>
            </div>
          </div>
        </section>

        {/* ---------- Close ---------- */}
        <section className={`${s.section} ${s.mist} ${s.close}`}>
          <div className={s.wrap}>
            <h2 className={s.h2}>Ready to run your club properly?</h2>
            <p>Try ClubForge free for 14 days.</p>
            <div className={s.ctaRow}>
              <Link href="/get-started" className={`${s.btn} ${s.btnGold}`}>
                Start your free trial <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link href="/demo" className={`${s.btn} ${s.btnLine}`}>Book a demo</Link>
            </div>
            <Terms />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
