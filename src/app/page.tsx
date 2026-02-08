import Link from 'next/link';
import {
  Users,
  Calendar,
  Award,
  CreditCard,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  Shield,
  Zap,
  Building2,
  Star,
  TrendingUp,
  Clock,
  UserCheck,
  Layers,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'ClubForge — The Operating System for Clubs',
  description: 'Build, run, and grow your gym, dojo, or academy with one powerful platform. Member management, class scheduling, belt progression, payments, and more.',
};

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const features = [
    {
      icon: Users,
      title: 'Member Management',
      description: 'Complete member profiles, family accounts, self-registration, and automated onboarding. Know every member.',
      color: '#3B82F6',
    },
    {
      icon: Calendar,
      title: 'Class Scheduling',
      description: 'Recurring and one-off classes, instructor assignment, capacity limits, and waitlists. Your timetable, automated.',
      color: '#8B5CF6',
    },
    {
      icon: Award,
      title: 'Belt & Rank Progression',
      description: 'Structured ranking systems, grading history, coach feedback, and promotion audit trails. No other platform does this.',
      color: '#F59E0B',
    },
    {
      icon: CheckCircle2,
      title: 'Attendance Tracking',
      description: 'One-tap check-in, parent-child support, attendance reports, and retention insights. See who shows up.',
      color: '#10B981',
    },
    {
      icon: CreditCard,
      title: 'Payments & Billing',
      description: 'Stripe-powered subscriptions, automated invoicing, promo codes, and revenue dashboards. Get paid on time.',
      color: '#EC4899',
    },
    {
      icon: BarChart3,
      title: 'Reports & Insights',
      description: 'Retention trends, attendance analytics, revenue forecasting, and operational health. Make data-driven decisions.',
      color: '#06B6D4',
    },
  ];

  const painPoints = [
    { pain: 'Managing members in spreadsheets', solution: 'Automated member database with self-registration' },
    { pain: 'Chasing payments via WhatsApp', solution: 'Stripe billing with automated reminders' },
    { pain: 'No idea who actually attends', solution: 'Real-time attendance tracking and reports' },
    { pain: 'Running 3 locations with 3 systems', solution: 'Unified multi-location management' },
    { pain: 'Parents asking about their kid\'s progress', solution: 'Member portal with rank progress and feedback' },
    { pain: 'No audit trail for gradings', solution: 'Structured promotion history with coach sign-off' },
  ];

  const steps = [
    { step: '01', title: 'Sign Up', description: 'Create your account in 60 seconds. No credit card required. 14-day free trial with full Pro features.' },
    { step: '02', title: 'Configure Your Club', description: 'Set your branding, add locations, create membership tiers, and customise your class types and rank structure.' },
    { step: '03', title: 'Go Live', description: 'Share your club URL with members. They self-register, you manage everything from one dashboard.' },
  ];

  return (
    <>
      <Navbar user={user ? { id: user.id, email: user.email! } : null} />

      <main>
        {/* ==================== HERO ==================== */}
        <section
          style={{
            background: 'linear-gradient(160deg, #0F172A 0%, #1E293B 40%, #0F172A 100%)',
            minHeight: '90vh',
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Gradient orbs */}
          <div style={{
            position: 'absolute', width: '600px', height: '600px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(197,164,86,0.15) 0%, transparent 70%)',
            top: '-200px', right: '-100px', pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', width: '400px', height: '400px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)',
            bottom: '-100px', left: '-100px', pointerEvents: 'none',
          }} />

          <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: 'var(--space-20) var(--space-6)', position: 'relative', zIndex: 1 }}>
            <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
              {/* Badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)',
                background: 'rgba(197, 164, 86, 0.15)', border: '1px solid rgba(197, 164, 86, 0.3)',
                padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-full)',
                marginBottom: 'var(--space-6)',
              }}>
                <Zap size={14} color="#C5A456" />
                <span style={{ color: '#C5A456', fontSize: 'var(--text-sm)', fontWeight: '600' }}>
                  14-day free trial — no credit card required
                </span>
              </div>

              {/* Headline */}
              <h1 style={{
                fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                fontWeight: '800',
                lineHeight: '1.1',
                marginBottom: 'var(--space-6)',
                color: 'var(--color-white)',
              }}>
                The operating system{' '}
                <span style={{
                  background: 'linear-gradient(135deg, #D4B86A 0%, #C5A456 50%, #A88B3D 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  for clubs
                </span>
              </h1>

              {/* Subheadline */}
              <p style={{
                fontSize: 'var(--text-xl)',
                color: 'var(--color-gray-400)',
                lineHeight: '1.7',
                marginBottom: 'var(--space-8)',
                maxWidth: '650px',
                margin: '0 auto var(--space-8)',
              }}>
                Members, classes, payments, belt progression, attendance — all in one system.
                Built for martial arts gyms, fitness clubs, and sports academies who are serious about running a real operation.
              </p>

              {/* CTAs */}
              <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap', marginBottom: 'var(--space-10)' }}>
                <Link href="/get-started" className="btn btn-primary btn-lg" style={{ fontSize: 'var(--text-lg)', padding: 'var(--space-5) var(--space-10)' }}>
                  Start Free Trial
                  <ArrowRight size={20} />
                </Link>
                <Link href="/demo" className="btn btn-lg" style={{
                  background: 'rgba(255,255,255,0.1)', color: 'var(--color-white)',
                  border: '1px solid rgba(255,255,255,0.2)', padding: 'var(--space-5) var(--space-10)',
                  fontSize: 'var(--text-lg)',
                }}>
                  Book a Demo
                </Link>
              </div>

              {/* Trust bar */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 'var(--space-8)', flexWrap: 'wrap', color: 'var(--color-gray-500)',
                fontSize: 'var(--text-sm)',
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <Shield size={16} color="#C5A456" />
                  Stripe-secured payments
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <Building2 size={16} color="#C5A456" />
                  Multi-location support
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <Layers size={16} color="#C5A456" />
                  White-label ready
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== PAIN → SOLUTION ==================== */}
        <section style={{ background: 'var(--bg-primary)', padding: 'var(--space-20) var(--space-6)' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
              <h2 style={{ marginBottom: 'var(--space-4)' }}>
                Stop running your club with{' '}
                <span style={{ color: 'var(--color-red)' }}>duct tape</span>
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-lg)', maxWidth: '600px', margin: '0 auto' }}>
                Spreadsheets, WhatsApp groups, and 4 different tools. Sound familiar? There&apos;s a better way.
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 'var(--space-4)',
            }}>
              {painPoints.map((item, i) => (
                <div
                  key={i}
                  className="glass-card"
                  style={{
                    padding: 'var(--space-5)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-3)',
                  }}
                >
                  <p style={{
                    fontSize: 'var(--text-sm)', color: 'var(--color-red-light)',
                    fontWeight: '500', margin: 0, textDecoration: 'line-through',
                    opacity: 0.8,
                  }}>
                    {item.pain}
                  </p>
                  <p style={{
                    fontSize: 'var(--text-base)', color: 'var(--text-primary)',
                    fontWeight: '600', margin: 0,
                    display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)',
                  }}>
                    <CheckCircle2 size={18} color="var(--color-green)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    {item.solution}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==================== FEATURES ==================== */}
        <section
          id="features"
          style={{ background: 'var(--bg-secondary)', padding: 'var(--space-20) var(--space-6)' }}
        >
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
              <h2 style={{ marginBottom: 'var(--space-4)' }}>
                Everything your club needs.{' '}
                <span style={{ background: 'var(--color-gold-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  Nothing it doesn&apos;t.
                </span>
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-lg)', maxWidth: '600px', margin: '0 auto' }}>
                One system that replaces your spreadsheet, your booking tool, your payment processor, and your WhatsApp group.
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: 'var(--space-6)',
            }}>
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className="glass-card"
                  style={{ padding: 'var(--space-8)' }}
                >
                  <div
                    style={{
                      width: '56px', height: '56px', borderRadius: 'var(--radius-xl)',
                      background: `${feature.color}15`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: 'var(--space-5)',
                    }}
                  >
                    <feature.icon size={28} color={feature.color} />
                  </div>
                  <h3 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-3)' }}>
                    {feature.title}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', margin: 0, lineHeight: '1.7' }}>
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==================== HOW IT WORKS ==================== */}
        <section style={{ background: 'var(--bg-primary)', padding: 'var(--space-20) var(--space-6)' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
              <h2 style={{ marginBottom: 'var(--space-4)' }}>Live in 3 steps</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-lg)' }}>
                From signup to your first check-in, in under 10 minutes.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
              {steps.map((item, index) => (
                <div
                  key={item.step}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 'var(--space-6)',
                  }}
                >
                  <div style={{
                    width: '64px', height: '64px', borderRadius: 'var(--radius-full)',
                    background: 'var(--color-gold-gradient)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    fontSize: 'var(--text-xl)', fontWeight: '800', color: 'var(--color-black)',
                  }}>
                    {item.step}
                  </div>
                  <div>
                    <h3 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-2)' }}>
                      {item.title}
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', margin: 0, lineHeight: '1.7' }}>
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==================== PRICING PREVIEW ==================== */}
        <section style={{
          background: 'linear-gradient(160deg, #0F172A 0%, #1E293B 40%, #0F172A 100%)',
          padding: 'var(--space-20) var(--space-6)',
          color: 'var(--color-white)',
        }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
              <h2 style={{ color: 'var(--color-white)', marginBottom: 'var(--space-4)' }}>
                Simple, honest pricing
              </h2>
              <p style={{ color: 'var(--color-gray-400)', fontSize: 'var(--text-lg)' }}>
                No hidden fees. No per-member charges. One price for your entire club.
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 'var(--space-6)',
            }}>
              {/* Starter */}
              <div style={{
                background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-2xl)',
                border: '1px solid rgba(255,255,255,0.1)', padding: 'var(--space-8)',
              }}>
                <h3 style={{ color: 'var(--color-gray-300)', fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)' }}>
                  Starter
                </h3>
                <div style={{ marginBottom: 'var(--space-6)' }}>
                  <span style={{ fontSize: 'var(--text-4xl)', fontWeight: '800', color: 'var(--color-white)' }}>£39</span>
                  <span style={{ color: 'var(--color-gray-500)', fontSize: 'var(--text-base)' }}>/month</span>
                </div>
                <p style={{ color: 'var(--color-gray-400)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-6)' }}>
                  For new and small clubs getting started.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {['Up to 150 members', '1 location', '3 staff accounts', 'Class scheduling', 'Attendance tracking', 'Belt progression', 'Stripe payments'].map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-gray-300)', fontSize: 'var(--text-sm)' }}>
                      <CheckCircle2 size={16} color="#C5A456" /> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/get-started" className="btn btn-outline" style={{ width: '100%', borderColor: 'rgba(255,255,255,0.2)', color: 'var(--color-white)' }}>
                  Start Free Trial
                </Link>
              </div>

              {/* Pro — highlighted */}
              <div style={{
                background: 'rgba(197,164,86,0.1)', borderRadius: 'var(--radius-2xl)',
                border: '2px solid var(--color-gold)', padding: 'var(--space-8)',
                position: 'relative',
              }}>
                <div style={{
                  position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                  background: 'var(--color-gold-gradient)', color: 'var(--color-black)',
                  padding: 'var(--space-1) var(--space-4)', borderRadius: 'var(--radius-full)',
                  fontSize: 'var(--text-xs)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px',
                }}>
                  Most Popular
                </div>
                <h3 style={{ color: 'var(--color-gold)', fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)' }}>
                  Pro
                </h3>
                <div style={{ marginBottom: 'var(--space-6)' }}>
                  <span style={{ fontSize: 'var(--text-4xl)', fontWeight: '800', color: 'var(--color-white)' }}>£129</span>
                  <span style={{ color: 'var(--color-gray-500)', fontSize: 'var(--text-base)' }}>/month</span>
                </div>
                <p style={{ color: 'var(--color-gray-400)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-6)' }}>
                  For established clubs ready to scale.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {['Up to 750 members', '3 locations', '10 staff accounts', 'Everything in Starter', 'Event management', 'Custom email templates', 'Advanced reports', 'Priority support (24h)'].map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-gray-300)', fontSize: 'var(--text-sm)' }}>
                      <CheckCircle2 size={16} color="#C5A456" /> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/get-started" className="btn btn-primary" style={{ width: '100%' }}>
                  Start Free Trial
                  <ArrowRight size={16} />
                </Link>
              </div>

              {/* Elite */}
              <div style={{
                background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-2xl)',
                border: '1px solid rgba(255,255,255,0.1)', padding: 'var(--space-8)',
              }}>
                <h3 style={{ color: 'var(--color-gray-300)', fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)' }}>
                  Elite
                </h3>
                <div style={{ marginBottom: 'var(--space-6)' }}>
                  <span style={{ fontSize: 'var(--text-4xl)', fontWeight: '800', color: 'var(--color-white)' }}>£349</span>
                  <span style={{ color: 'var(--color-gray-500)', fontSize: 'var(--text-base)' }}>/month</span>
                </div>
                <p style={{ color: 'var(--color-gray-400)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-6)' }}>
                  For large academies and franchises.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {['Unlimited members', 'Unlimited locations', 'Unlimited staff', 'Everything in Pro', 'Custom domain', 'White-label branding', 'API access & webhooks', 'Dedicated support + SLA'].map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-gray-300)', fontSize: 'var(--text-sm)' }}>
                      <CheckCircle2 size={16} color="#C5A456" /> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/demo" className="btn btn-outline" style={{ width: '100%', borderColor: 'rgba(255,255,255,0.2)', color: 'var(--color-white)' }}>
                  Book a Demo
                </Link>
              </div>
            </div>

            <p style={{ textAlign: 'center', color: 'var(--color-gray-500)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-6)', marginBottom: 0 }}>
              All plans include 2.5% platform fee on member payments processed through Stripe.{' '}
              <Link href="/pricing" style={{ color: 'var(--color-gold)' }}>See full comparison →</Link>
            </p>
          </div>
        </section>

        {/* ==================== WHO IT'S FOR ==================== */}
        <section style={{ background: 'var(--bg-primary)', padding: 'var(--space-20) var(--space-6)' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ marginBottom: 'var(--space-4)' }}>Built for clubs that take themselves seriously</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-lg)', lineHeight: '1.7', marginBottom: 'var(--space-8)' }}>
              Whether you run a BJJ gym, a boxing club, a CrossFit box, a dance academy, or a youth martial arts programme —
              if you have members, classes, and coaches, ClubForge is built for you.
            </p>
            <div style={{
              display: 'flex', justifyContent: 'center', gap: 'var(--space-3)', flexWrap: 'wrap',
            }}>
              {['BJJ & Jiu-Jitsu', 'MMA & Boxing', 'Karate & Taekwondo', 'CrossFit', 'Wrestling', 'Dance & Gymnastics', 'Youth Sports'].map(sport => (
                <span
                  key={sport}
                  className="badge badge-gold"
                  style={{ fontSize: 'var(--text-sm)', padding: 'var(--space-2) var(--space-4)' }}
                >
                  {sport}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ==================== DIFFERENTIATOR ==================== */}
        <section style={{ background: 'var(--bg-secondary)', padding: 'var(--space-20) var(--space-6)' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
              <h2 style={{ marginBottom: 'var(--space-4)' }}>
                Not just software.{' '}
                <span style={{ background: 'var(--color-gold-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  A system.
                </span>
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-lg)', maxWidth: '600px', margin: '0 auto' }}>
                Most gym tools are glorified booking calendars. ClubForge is an operating system — it structures how your club actually runs.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-6)' }}>
              {[
                { icon: Layers, title: 'Operational Structure', desc: 'Roles, permissions, and governance. Owner → Admin → Coach → Staff → Member. Everyone knows their lane.' },
                { icon: TrendingUp, title: 'Progression Engine', desc: 'Belts, ranks, gradings, and coach feedback with a full audit trail. No other platform does this natively.' },
                { icon: Building2, title: 'Multi-Location', desc: 'One dashboard, many venues. Cross-site memberships, unified reporting, location-specific settings.' },
                { icon: Shield, title: 'Data Integrity', desc: 'Row-level security, tenant isolation, and complete audit trails. Your data is yours — export it anytime.' },
              ].map((item) => (
                <div key={item.title} className="glass-card" style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: 'var(--radius-full)',
                    background: 'var(--color-gold-gradient)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto var(--space-4)',
                  }}>
                    <item.icon size={24} color="var(--color-black)" />
                  </div>
                  <h4 style={{ marginBottom: 'var(--space-2)', fontSize: 'var(--text-lg)' }}>{item.title}</h4>
                  <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: 'var(--text-sm)', lineHeight: '1.7' }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==================== FINAL CTA ==================== */}
        <section style={{
          background: 'var(--color-gold-gradient)',
          padding: 'var(--space-20) var(--space-6)',
          textAlign: 'center',
        }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ color: 'var(--color-black)', marginBottom: 'var(--space-4)' }}>
              Ready to run your club like a real operation?
            </h2>
            <p style={{ color: 'rgba(0,0,0,0.7)', fontSize: 'var(--text-lg)', marginBottom: 'var(--space-8)', lineHeight: '1.7' }}>
              Join club owners who stopped duct-taping their admin together and started running their club with structure, clarity, and confidence.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/get-started" className="btn btn-lg" style={{
                background: 'var(--color-black)', color: 'var(--color-white)',
                padding: 'var(--space-5) var(--space-10)', fontSize: 'var(--text-lg)',
              }}>
                Start Your Free Trial
                <ArrowRight size={20} />
              </Link>
              <Link href="/demo" className="btn btn-lg" style={{
                background: 'transparent', color: 'var(--color-black)',
                border: '2px solid var(--color-black)', padding: 'var(--space-5) var(--space-10)',
                fontSize: 'var(--text-lg)',
              }}>
                Book a Demo
              </Link>
            </div>
            <p style={{ marginTop: 'var(--space-6)', marginBottom: 0, color: 'rgba(0,0,0,0.5)', fontSize: 'var(--text-sm)' }}>
              14-day free trial · No credit card required · Cancel anytime
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
