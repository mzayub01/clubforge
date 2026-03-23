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
  Play,
  Dumbbell,
  Swords,
  Target,
  Heart,
  Lock,
  Eye,
  GitBranch,
  Settings,
  Globe,
  ChevronDown,
  Video,
  Ticket,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/server';
import { SoftwareApplicationSchema, BreadcrumbSchema } from '@/components/structured-data';
import CurrencyPrice from '@/components/CurrencyPrice';

export const metadata = {
  title: 'ClubForge — The #1 Gym & Martial Arts Club Management Software',
  description: 'Build, run, and grow your gym, dojo, or martial arts academy with one powerful platform. Member management, class scheduling, belt progression, Stripe payments, attendance tracking, and multi-location support. Start your free 14-day trial.',
  alternates: {
    canonical: 'https://clubforgehq.com',
  },
  openGraph: {
    title: 'ClubForge — The #1 Gym & Martial Arts Club Management Software',
    description: 'The all-in-one operating system for gyms, dojos, and martial arts academies. Members, classes, belt progression, payments — one dashboard.',
    url: 'https://clubforgehq.com',
  },
};

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <>
      <Navbar user={user ? { id: user.id, email: user.email! } : null} />

      {/* Structured Data for Rich Results */}
      <SoftwareApplicationSchema />
      <BreadcrumbSchema items={[
        { name: 'Home', url: 'https://clubforgehq.com' },
      ]} />

      <main>
        {/* ==================== PROMO BANNER ==================== */}
        <div style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          padding: '14px 24px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          borderBottom: '2px solid #C5A456',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(90deg, transparent 0%, rgba(197,164,86,0.08) 50%, transparent 100%)',
            animation: 'promoShimmer 3s ease-in-out infinite',
            pointerEvents: 'none',
          }} />
          <style>{`
            @keyframes promoShimmer {
              0%, 100% { opacity: 0; transform: translateX(-100%); }
              50% { opacity: 1; transform: translateX(100%); }
            }
          `}</style>
          <p style={{ margin: 0, fontSize: 'clamp(13px, 2.5vw, 16px)', lineHeight: '1.5' }}>
            <span style={{ color: '#FFFFFF', fontWeight: '700' }}>🔥 LIMITED TIME: </span>
            <span style={{
              background: 'linear-gradient(135deg, #D4B86A, #F5D98C)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              fontWeight: '800', fontSize: 'clamp(14px, 2.8vw, 18px)',
            }}>
              40% OFF
            </span>
            <span style={{ color: '#CBD5E1', fontWeight: '500' }}> all plans — sign up before April 30th. Use code </span>
            <span style={{
              background: 'rgba(197,164,86,0.15)', color: '#D4B86A', fontWeight: '800',
              padding: '3px 10px', borderRadius: '6px', border: '1px solid rgba(197,164,86,0.3)',
              fontFamily: 'monospace', fontSize: 'clamp(13px, 2.5vw, 15px)', letterSpacing: '1px',
            }}>
              APRIL40
            </span>
            <span style={{ color: '#CBD5E1', fontWeight: '500' }}> at checkout</span>
            <span style={{ display: 'inline-block', marginLeft: '12px' }}>
              <Link href="/get-started" style={{
                color: '#0F172A', background: 'linear-gradient(135deg, #D4B86A, #A88B3D)',
                padding: '5px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: '700',
                textDecoration: 'none', whiteSpace: 'nowrap',
              }}>
                Claim Offer →
              </Link>
            </span>
          </p>
        </div>

        {/* Responsive overrides and hover effects */}
        <style>{`
          @media (max-width: 768px) {
            .cf-dashboard-mockup { display: none !important; }
            .cf-mobile-phone-mockup { display: block !important; }
            .cf-pain-row { grid-template-columns: 1fr !important; }
            .cf-pain-row > div:first-child { border-right: none !important; border-bottom: 1px solid #F1F5F9; }
            .cf-steps-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
            .cf-pricing-grid { grid-template-columns: 1fr !important; }
            .cf-pricing-pro { transform: none !important; }
            .cf-stats-row { grid-template-columns: repeat(2, 1fr) !important; }
            .cf-hero-section { min-height: auto !important; padding-top: 100px !important; }
            .cf-member-mobile-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          }
          @media (max-width: 480px) {
            .cf-stats-row { grid-template-columns: 1fr !important; }
          }
        `}</style>
        {/* ==================== HERO ==================== */}
        <section
          style={{
            background: '#FAFBFC',
            minHeight: '95vh',
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle background elements */}
          <div style={{
            position: 'absolute', width: '800px', height: '800px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(197,164,86,0.08) 0%, transparent 70%)',
            top: '-300px', right: '-200px', pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', width: '600px', height: '600px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(15,23,42,0.04) 0%, transparent 70%)',
            bottom: '-200px', left: '-100px', pointerEvents: 'none',
          }} />
          {/* Grid pattern overlay */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.03,
            backgroundImage: 'linear-gradient(rgba(15,23,42,1) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }} />

          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '140px 24px 80px', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '60px', alignItems: 'center' }}>
              {/* Hero content */}
              <div style={{ textAlign: 'center', maxWidth: '850px', margin: '0 auto' }}>
                {/* Badge */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '12px',
                  marginBottom: '32px',
                }}>
                  <div style={{
                    width: '36px', height: '2px',
                    background: 'linear-gradient(to right, transparent, #C5A456)',
                  }} />
                  <span style={{
                    color: '#A88B3D', fontSize: '14px', fontWeight: '600',
                    letterSpacing: '0.05em', textTransform: 'uppercase',
                  }}>
                    14-day free trial · Cancel anytime
                  </span>
                  <div style={{
                    width: '36px', height: '2px',
                    background: 'linear-gradient(to left, transparent, #C5A456)',
                  }} />
                </div>

                {/* Headline */}
                <h1 style={{
                  fontSize: 'clamp(2.8rem, 5.5vw, 4.5rem)',
                  fontWeight: '800',
                  lineHeight: '1.08',
                  marginBottom: '16px',
                  color: '#0F172A',
                  letterSpacing: '-0.03em',
                }}>
                  Stop running your club{' '}
                  <br />
                  <span style={{
                    background: 'linear-gradient(135deg, #D4B86A 0%, #C5A456 50%, #A88B3D 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}>
                    with spreadsheets
                  </span>
                </h1>

                {/* Positioning line */}
                <p style={{
                  fontSize: 'clamp(1.1rem, 2vw, 1.35rem)',
                  color: '#334155',
                  lineHeight: '1.6',
                  marginBottom: '12px',
                  maxWidth: '680px',
                  margin: '0 auto 12px',
                  fontWeight: '500',
                }}>
                  ClubForge is the all-in-one operating system for gyms, dojos, and academies.
                </p>
                <p style={{
                  fontSize: '1.05rem',
                  color: '#64748B',
                  lineHeight: '1.7',
                  marginBottom: '40px',
                  maxWidth: '600px',
                  margin: '0 auto 40px',
                }}>
                  Members, classes, payments, belt progression, attendance, multi-location control — structured into one professional system. Not another tool. The backbone your club actually needs.
                </p>

                {/* CTAs */}
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '40px' }}>
                  <Link href="/get-started" style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    background: 'linear-gradient(135deg, #D4B86A 0%, #C5A456 50%, #A88B3D 100%)',
                    color: '#0F172A', padding: '16px 36px', borderRadius: '12px',
                    fontSize: '1.05rem', fontWeight: '700', textDecoration: 'none',
                    boxShadow: '0 4px 24px rgba(197, 164, 86, 0.35)',
                    transition: 'all 0.2s ease',
                  }}>
                    Start Free Trial
                    <ArrowRight size={20} />
                  </Link>
                  <Link href="/demo" style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    background: 'transparent', color: '#0F172A',
                    border: '2px solid #E2E8F0', padding: '16px 36px',
                    borderRadius: '12px', fontSize: '1.05rem', fontWeight: '600',
                    textDecoration: 'none', transition: 'all 0.2s ease',
                  }}>
                    <Play size={18} />
                    Book a Demo
                  </Link>
                </div>

                {/* Trust bar */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: '28px', flexWrap: 'wrap', color: '#94A3B8',
                  fontSize: '13px', fontWeight: '500',
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Shield size={15} color="#C5A456" /> Stripe-secured payments
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Building2 size={15} color="#C5A456" /> Multi-location
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Layers size={15} color="#C5A456" /> White-label ready
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Lock size={15} color="#C5A456" /> GDPR compliant
                  </span>
                </div>
              </div>

              {/* Dashboard Mockup */}
              <div className="cf-dashboard-mockup" style={{
                maxWidth: '1000px', margin: '0 auto', width: '100%',
                perspective: '1200px',
              }}>
                <div style={{
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  boxShadow: '0 25px 100px rgba(15, 23, 42, 0.12), 0 8px 32px rgba(15, 23, 42, 0.08)',
                  border: '1px solid #E2E8F0',
                  overflow: 'hidden',
                  transform: 'rotateX(2deg)',
                }}>
                  {/* Browser chrome */}
                  <div style={{
                    padding: '12px 16px', background: '#F8FAFC',
                    borderBottom: '1px solid #E2E8F0',
                    display: 'flex', alignItems: 'center', gap: '8px',
                  }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#FCA5A5' }} />
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#FDE68A' }} />
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#86EFAC' }} />
                    </div>
                    <div style={{
                      flex: 1, background: '#F1F5F9', borderRadius: '8px',
                      padding: '6px 16px', fontSize: '12px', color: '#94A3B8',
                      textAlign: 'center',
                    }}>
                      yourclub.clubforgehq.com/dashboard
                    </div>
                  </div>

                  {/* Dashboard content */}
                  <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '200px 1fr', gap: '24px', minHeight: '380px' }} className="cf-dashboard-inner">
                    {/* Mini sidebar */}
                    <div style={{ background: '#0F172A', borderRadius: '12px', padding: '20px 16px' }}>
                      <div style={{
                        background: 'linear-gradient(135deg, #D4B86A, #A88B3D)',
                        borderRadius: '8px', padding: '10px 12px',
                        marginBottom: '20px', textAlign: 'center',
                      }}>
                        <span style={{ color: '#0F172A', fontWeight: '700', fontSize: '13px' }}>Your Club</span>
                      </div>
                      {['Dashboard', 'Members', 'Classes', 'Attendance', 'Progress', 'Payments'].map((item, i) => (
                        <div key={item} style={{
                          padding: '8px 12px', borderRadius: '8px', marginBottom: '4px',
                          fontSize: '12px', fontWeight: '500',
                          color: i === 0 ? '#C5A456' : '#94A3B8',
                          background: i === 0 ? 'rgba(197,164,86,0.1)' : 'transparent',
                        }}>
                          {item}
                        </div>
                      ))}
                    </div>

                    {/* Main area */}
                    <div>
                      {/* Stats row */}
                      <div className="cf-stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
                        {[
                          { label: 'Total Members', value: '247', change: '+12%', color: '#3B82F6' },
                          { label: 'Classes This Week', value: '18', change: '3 today', color: '#8B5CF6' },
                          { label: 'Monthly Revenue', value: '£8,420', change: '+8.3%', color: '#10B981' },
                          { label: 'Attendance Rate', value: '87%', change: '+4.2%', color: '#F59E0B' },
                        ].map((stat) => (
                          <div key={stat.label} style={{
                            background: '#F8FAFC', borderRadius: '12px', padding: '16px',
                            border: '1px solid #F1F5F9',
                          }}>
                            <p style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '500', margin: '0 0 4px' }}>{stat.label}</p>
                            <p style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', margin: '0 0 2px' }}>{stat.value}</p>
                            <p style={{ fontSize: '11px', color: stat.color, fontWeight: '600', margin: 0 }}>{stat.change}</p>
                          </div>
                        ))}
                      </div>

                      {/* Class schedule preview */}
                      <div style={{
                        background: '#F8FAFC', borderRadius: '12px', padding: '16px',
                        border: '1px solid #F1F5F9',
                      }}>
                        <p style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A', margin: '0 0 12px' }}>Today&apos;s Classes</p>
                        {[
                          { time: '09:00', name: 'Adult BJJ Fundamentals', instructor: 'Coach Ali', spots: '18/25', status: 'Live' },
                          { time: '16:30', name: 'Kids Karate (6-12)', instructor: 'Sensei Tanaka', spots: '22/30', status: 'Upcoming' },
                          { time: '18:00', name: 'MMA Conditioning', instructor: 'Coach Diaz', spots: '14/20', status: 'Upcoming' },
                        ].map((cls) => (
                          <div key={cls.time} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '10px 0',
                            borderBottom: '1px solid #F1F5F9',
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', width: '40px' }}>{cls.time}</span>
                              <div>
                                <p style={{ fontSize: '12px', fontWeight: '600', color: '#0F172A', margin: 0 }}>{cls.name}</p>
                                <p style={{ fontSize: '11px', color: '#94A3B8', margin: 0 }}>{cls.instructor}</p>
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <span style={{ fontSize: '11px', color: '#64748B' }}>{cls.spots}</span>
                              <span style={{
                                fontSize: '10px', fontWeight: '700',
                                padding: '3px 8px', borderRadius: '6px',
                                background: cls.status === 'Live' ? '#DCFCE7' : '#F1F5F9',
                                color: cls.status === 'Live' ? '#16A34A' : '#64748B',
                              }}>{cls.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Phone Mockup — visible only on mobile */}
              <div className="cf-mobile-phone-mockup" style={{ display: 'none', maxWidth: '320px', margin: '0 auto' }}>
                <div style={{
                  background: '#0F172A', borderRadius: '36px', padding: '12px',
                  boxShadow: '0 25px 80px rgba(15, 23, 42, 0.3)',
                }}>
                  <div style={{ background: '#FFFFFF', borderRadius: '26px', overflow: 'hidden' }}>
                    <div style={{ padding: '8px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0F172A' }}>
                      <span style={{ fontSize: '12px', fontWeight: '600', color: '#FFFFFF' }}>9:41</span>
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <div style={{ width: '14px', height: '10px', borderRadius: '2px', border: '1px solid #fff', position: 'relative' }}>
                          <div style={{ position: 'absolute', top: '2px', left: '2px', right: '2px', bottom: '2px', background: '#10B981', borderRadius: '1px' }} />
                        </div>
                      </div>
                    </div>
                    <div style={{ padding: '16px 20px 12px', background: 'linear-gradient(180deg, #0F172A, #1E293B)' }}>
                      <div style={{ background: 'linear-gradient(135deg, #D4B86A, #A88B3D)', borderRadius: '8px', padding: '6px 12px', display: 'inline-block', marginBottom: '12px' }}>
                        <span style={{ color: '#0F172A', fontWeight: '700', fontSize: '11px' }}>Your Club</span>
                      </div>
                      <p style={{ color: '#FFFFFF', fontWeight: '700', fontSize: '16px', margin: '0 0 4px' }}>Dashboard</p>
                      <p style={{ color: '#94A3B8', fontSize: '11px', margin: 0 }}>Welcome back, Admin</p>
                    </div>
                    <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      {[
                        { label: 'Members', value: '247', change: '+12%', color: '#3B82F6' },
                        { label: 'Revenue', value: '£8,420', change: '+8.3%', color: '#10B981' },
                        { label: 'Classes', value: '18', change: '3 today', color: '#8B5CF6' },
                        { label: 'Attendance', value: '87%', change: '+4.2%', color: '#F59E0B' },
                      ].map((s) => (
                        <div key={s.label} style={{ background: '#F8FAFC', borderRadius: '12px', padding: '12px', border: '1px solid #F1F5F9' }}>
                          <p style={{ fontSize: '10px', color: '#94A3B8', fontWeight: '500', margin: '0 0 2px' }}>{s.label}</p>
                          <p style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', margin: '0 0 2px' }}>{s.value}</p>
                          <p style={{ fontSize: '10px', color: s.color, fontWeight: '600', margin: 0 }}>{s.change}</p>
                        </div>
                      ))}
                    </div>
                    <div style={{ padding: '0 16px 16px' }}>
                      <p style={{ fontSize: '12px', fontWeight: '700', color: '#0F172A', margin: '0 0 10px' }}>Today&apos;s Classes</p>
                      {[
                        { time: '09:00', name: 'Adult BJJ', spots: '18/25', live: true },
                        { time: '16:30', name: 'Kids Karate', spots: '22/30', live: false },
                        { time: '18:00', name: 'MMA Conditioning', spots: '14/20', live: false },
                      ].map((c) => (
                        <div key={c.time} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #F1F5F9' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', width: '36px' }}>{c.time}</span>
                            <div>
                              <p style={{ fontSize: '12px', fontWeight: '600', color: '#0F172A', margin: 0 }}>{c.name}</p>
                              <p style={{ fontSize: '10px', color: '#94A3B8', margin: 0 }}>{c.spots} spots</p>
                            </div>
                          </div>
                          <span style={{ fontSize: '9px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px', background: c.live ? '#DCFCE7' : '#F1F5F9', color: c.live ? '#16A34A' : '#64748B' }}>{c.live ? 'LIVE' : 'UPCOMING'}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ padding: '10px 20px 16px', display: 'flex', justifyContent: 'space-around', borderTop: '1px solid #F1F5F9' }}>
                      {['🏠', '👥', '📅', '💳'].map((icon, i) => (
                        <div key={i} style={{ textAlign: 'center', fontSize: '16px', opacity: i === 0 ? 1 : 0.4 }}>
                          {icon}
                          <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: i === 0 ? '#C5A456' : 'transparent', margin: '4px auto 0' }} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ==================== BUILT FOR ==================== */}
        <section style={{ background: '#FFFFFF', padding: '80px 24px', borderTop: '1px solid #F1F5F9' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
            <p style={{
              fontSize: '14px', fontWeight: '600', color: '#C5A456',
              textTransform: 'uppercase', letterSpacing: '1.5px',
              marginBottom: '16px',
            }}>
              Built for serious clubs
            </p>
            <h2 style={{
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              color: '#0F172A', fontWeight: '700',
              marginBottom: '40px',
            }}>
              Whatever you run, ClubForge runs it better
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
            }}>
              {[
                { icon: Swords, label: 'Martial Arts Academies', desc: 'BJJ, MMA, Karate, Taekwondo, Judo' },
                { icon: Dumbbell, label: 'Gyms & Fitness Studios', desc: 'CrossFit, Boxing, Functional Fitness' },
                { icon: Building2, label: 'Multi-Location Clubs', desc: '2 venues or 20 — one dashboard' },
                { icon: Heart, label: 'Youth & Community Orgs', desc: 'After-school, camps, youth sports' },
              ].map((item) => (
                <div key={item.label} style={{
                  padding: '32px 24px', borderRadius: '16px',
                  border: '1px solid #F1F5F9',
                  background: '#FAFBFC',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                }}>
                  <div style={{
                    width: '52px', height: '52px', borderRadius: '14px',
                    background: 'rgba(197, 164, 86, 0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}>
                    <item.icon size={24} color="#C5A456" />
                  </div>
                  <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>{item.label}</h4>
                  <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0, lineHeight: '1.5' }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==================== MEMBER MOBILE EXPERIENCE ==================== */}
        <section style={{ background: '#FAFBFC', padding: '100px 24px', borderTop: '1px solid #F1F5F9' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'center' }}
            className="cf-member-mobile-grid"
          >
            {/* Left: Text */}
            <div>
              <p style={{
                fontSize: '14px', fontWeight: '600', color: '#C5A456',
                textTransform: 'uppercase', letterSpacing: '1.5px',
                marginBottom: '16px',
              }}>
                The member experience
              </p>
              <h2 style={{
                fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
                color: '#0F172A', fontWeight: '800', lineHeight: '1.15',
                marginBottom: '20px',
              }}>
                Your members get<br />
                <span style={{
                  background: 'linear-gradient(135deg, #C5A456, #D4B86A)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>their own portal too</span>
              </h2>
              <p style={{ color: '#64748B', fontSize: '1.05rem', lineHeight: '1.8', marginBottom: '32px' }}>
                Every member gets a branded mobile-friendly dashboard. They can check in to class, track their belt progression, view schedules, and stay connected — without a single WhatsApp message to you.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { emoji: '📱', title: 'One-tap class check-in', desc: 'Members check in from their phone. You see who showed up instantly.' },
                  { emoji: '🥋', title: 'Belt progress & grading history', desc: 'Members see their rank, grading feedback, and what\'s next — without asking.' },
                  { emoji: '📅', title: 'Class schedule & booking', desc: 'Full timetable with spot availability. Members manage themselves.' },
                  { emoji: '👨‍👩‍👧', title: 'Family accounts', desc: 'Parents manage all their children from one login. You manage one family.' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '14px' }}>
                    <span style={{ fontSize: '24px', flexShrink: 0, marginTop: '2px' }}>{item.emoji}</span>
                    <div>
                      <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A', marginBottom: '4px' }}>{item.title}</h4>
                      <p style={{ color: '#64748B', fontSize: '13px', margin: 0, lineHeight: '1.6' }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Mobile Phone Mockup */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{
                width: '300px', height: '600px',
                background: '#0F172A',
                borderRadius: '40px',
                padding: '12px',
                boxShadow: '0 25px 80px rgba(15, 23, 42, 0.25), 0 10px 30px rgba(15, 23, 42, 0.15)',
                position: 'relative',
              }}>
                {/* Notch */}
                <div style={{
                  position: 'absolute', top: '12px', left: '50%', transform: 'translateX(-50%)',
                  width: '120px', height: '28px', background: '#0F172A',
                  borderRadius: '0 0 16px 16px', zIndex: 2,
                }} />
                {/* Screen */}
                <div style={{
                  width: '100%', height: '100%',
                  background: '#FAFBFC', borderRadius: '30px',
                  overflow: 'hidden', display: 'flex', flexDirection: 'column',
                }}>
                  {/* Status bar */}
                  <div style={{
                    background: '#FFFFFF', padding: '14px 20px 8px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    fontSize: '11px', fontWeight: '600', color: '#0F172A',
                  }}>
                    <span>9:41</span>
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      <div style={{ width: '16px', height: '10px', border: '1.5px solid #0F172A', borderRadius: '2px', position: 'relative' }}>
                        <div style={{ position: 'absolute', right: '2px', top: '2px', bottom: '2px', left: '2px', background: '#22C55E', borderRadius: '1px' }} />
                      </div>
                    </div>
                  </div>

                  {/* App Header */}
                  <div style={{
                    background: '#FFFFFF', padding: '12px 20px 16px',
                    borderBottom: '1px solid #F1F5F9',
                  }}>
                    <p style={{ fontSize: '12px', color: '#94A3B8', margin: '0 0 2px', fontWeight: '500' }}>Welcome back,</p>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', margin: 0 }}>Sarah 👋</h3>
                  </div>

                  {/* Content */}
                  <div style={{ padding: '16px', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Today's Class Card */}
                    <div style={{
                      background: 'linear-gradient(135deg, #0F172A, #1E293B)',
                      borderRadius: '16px', padding: '16px', color: '#FFFFFF',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ fontSize: '11px', color: '#C5A456', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Today&apos;s Class</span>
                        <span style={{ fontSize: '10px', background: '#22C55E', color: '#FFFFFF', padding: '2px 8px', borderRadius: '100px', fontWeight: '600' }}>Live Now</span>
                      </div>
                      <h4 style={{ fontSize: '15px', fontWeight: '700', margin: '0 0 4px', color: '#FFFFFF' }}>Advanced BJJ — No Gi</h4>
                      <p style={{ fontSize: '12px', color: '#94A3B8', margin: '0 0 12px' }}>Coach Marcus · 7:00 PM · Main Hall</p>
                      <div style={{
                        background: 'linear-gradient(135deg, #D4B86A, #A88B3D)',
                        color: '#0F172A', textAlign: 'center', padding: '10px',
                        borderRadius: '10px', fontSize: '13px', fontWeight: '700',
                        cursor: 'pointer',
                      }}>
                        ✓ Check In Now
                      </div>
                    </div>

                    {/* Belt Progress */}
                    <div style={{
                      background: '#FFFFFF', borderRadius: '14px',
                      padding: '14px', border: '1px solid #F1F5F9',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#0F172A' }}>Belt Progress</span>
                        <span style={{ fontSize: '11px', color: '#C5A456', fontWeight: '600' }}>Blue Belt 🥋</span>
                      </div>
                      <div style={{ background: '#F1F5F9', borderRadius: '100px', height: '8px', overflow: 'hidden', marginBottom: '6px' }}>
                        <div style={{ background: 'linear-gradient(to right, #C5A456, #D4B86A)', width: '72%', height: '100%', borderRadius: '100px' }} />
                      </div>
                      <p style={{ fontSize: '11px', color: '#94A3B8', margin: 0 }}>72% to Purple Belt · 3 stripes earned</p>
                    </div>

                    {/* Attendance Streak */}
                    <div style={{
                      background: '#FFFFFF', borderRadius: '14px',
                      padding: '14px', border: '1px solid #F1F5F9',
                      display: 'flex', alignItems: 'center', gap: '14px',
                    }}>
                      <div style={{
                        width: '44px', height: '44px', borderRadius: '12px',
                        background: 'rgba(34, 197, 94, 0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '20px',
                      }}>🔥</div>
                      <div>
                        <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A', margin: '0 0 2px' }}>12-week streak!</h4>
                        <p style={{ fontSize: '11px', color: '#64748B', margin: 0 }}>3 classes this week · 47 total</p>
                      </div>
                    </div>

                    {/* Upcoming Classes */}
                    <div style={{
                      background: '#FFFFFF', borderRadius: '14px',
                      padding: '14px', border: '1px solid #F1F5F9',
                    }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#0F172A', marginBottom: '10px', display: 'block' }}>Upcoming</span>
                      {[
                        { name: 'Open Mat', time: 'Tomorrow · 10 AM', spots: '8 spots' },
                        { name: 'Competition Prep', time: 'Wed · 6:30 PM', spots: '3 spots' },
                      ].map((cls, i) => (
                        <div key={i} style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '8px 0',
                          borderTop: i > 0 ? '1px solid #F8FAFC' : 'none',
                        }}>
                          <div>
                            <p style={{ fontSize: '13px', fontWeight: '600', color: '#0F172A', margin: 0 }}>{cls.name}</p>
                            <p style={{ fontSize: '11px', color: '#94A3B8', margin: 0 }}>{cls.time}</p>
                          </div>
                          <span style={{ fontSize: '10px', color: '#C5A456', fontWeight: '600' }}>{cls.spots}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Nav */}
                  <div style={{
                    background: '#FFFFFF', borderTop: '1px solid #F1F5F9',
                    padding: '10px 20px 16px', display: 'flex', justifyContent: 'space-around',
                  }}>
                    {['🏠', '📅', '🥋', '👤'].map((icon, i) => (
                      <div key={i} style={{
                        textAlign: 'center', fontSize: '18px',
                        opacity: i === 0 ? 1 : 0.4,
                      }}>
                        {icon}
                        <div style={{
                          width: '4px', height: '4px', borderRadius: '50%',
                          background: i === 0 ? '#C5A456' : 'transparent',
                          margin: '4px auto 0',
                        }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== PAIN → SOLUTION ==================== */}
        <section style={{
          background: 'linear-gradient(180deg, #0F172A 0%, #1A2332 100%)',
          padding: '100px 24px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Subtle background pattern */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(197, 164, 86, 0.04) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(239, 68, 68, 0.03) 0%, transparent 50%)',
            pointerEvents: 'none',
          }} />

          <div style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <h2 style={{
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                color: '#FFFFFF', fontWeight: '800', lineHeight: '1.1',
                marginBottom: '20px',
              }}>
                Still running your club{' '}
                <span style={{
                  background: 'linear-gradient(135deg, #EF4444, #F97316)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>
                  like this?
                </span>
              </h2>
              <p style={{ color: '#94A3B8', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto', lineHeight: '1.7' }}>
                Spreadsheets, WhatsApp groups, and 4 different tools duct-taped together.
                Your members deserve a professional experience. So do you.
              </p>
            </div>

            {/* Stat callout */}
            <p style={{
              textAlign: 'center', fontSize: '13px', fontWeight: '600',
              color: '#64748B', textTransform: 'uppercase', letterSpacing: '1.5px',
              marginBottom: '16px',
            }}>
              The typical club owner
            </p>
            <div style={{
              display: 'flex', justifyContent: 'center', gap: '32px', marginBottom: '48px',
              flexWrap: 'wrap',
            }}
              className="cf-stat-callout"
            >
              {[
                { value: '12+', unit: 'hrs/week', desc: 'spent on admin' },
                { value: '4-5', unit: 'tools', desc: 'juggled daily' },
                { value: '£000s', unit: 'lost', desc: 'in missed payments' },
              ].map((stat) => (
                <div key={stat.desc} style={{
                  textAlign: 'center', padding: '20px 28px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '16px',
                  minWidth: '160px',
                }}>
                  <p style={{
                    fontSize: '2rem', fontWeight: '800', margin: '0 0 2px',
                    background: 'linear-gradient(135deg, #EF4444, #F97316)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                  }}>
                    {stat.value}
                  </p>
                  <p style={{ fontSize: '13px', color: '#64748B', margin: 0, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {stat.unit}
                  </p>
                  <p style={{ fontSize: '12px', color: '#475569', margin: '4px 0 0' }}>
                    {stat.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Before → After transformation */}
            <div className="cf-before-after" style={{
              display: 'grid', gridTemplateColumns: '1fr auto 1fr',
              gap: '0', marginBottom: '12px', padding: '0 8px',
            }}>
              <p style={{ fontSize: '13px', fontWeight: '700', color: '#EF4444', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>
                Before
              </p>
              <div />
              <p style={{ fontSize: '13px', fontWeight: '700', color: '#10B981', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>
                With ClubForge
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '48px' }}>
              {[
                { emoji: '📊', before: 'Managing 200+ members across spreadsheets', after: 'Automated member database with self-registration & family accounts' },
                { emoji: '💬', before: 'Chasing payments via WhatsApp every month', after: 'Stripe-powered subscriptions with automated billing & reminders' },
                { emoji: '👻', before: 'No idea who actually shows up to class', after: 'One-tap attendance tracking with retention reports & analytics' },
                { emoji: '🏢', before: 'Running 3 locations with 3 different systems', after: 'Unified multi-location management from a single dashboard' },
                { emoji: '😩', before: 'Parents constantly asking about their kid\'s progress', after: 'Member portal with rank progression, grading history & feedback' },
                { emoji: '📋', before: 'No audit trail for belt promotions or gradings', after: 'Structured grading history with coach sign-off & full audit trail' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="cf-pain-card"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto 1fr',
                    alignItems: 'center',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {/* BEFORE */}
                  <div style={{
                    padding: '20px 24px',
                    display: 'flex', alignItems: 'center', gap: '14px',
                    background: 'rgba(239, 68, 68, 0.04)',
                    borderRight: '1px solid rgba(255, 255, 255, 0.04)',
                  }}>
                    <span style={{ fontSize: '22px', lineHeight: '1', flexShrink: 0 }}>{item.emoji}</span>
                    <p style={{
                      fontSize: '14px', color: '#FCA5A5', margin: 0,
                      textDecoration: 'line-through',
                      textDecorationColor: 'rgba(252, 165, 165, 0.35)',
                      fontWeight: '500', lineHeight: '1.5',
                    }}>
                      {item.before}
                    </p>
                  </div>

                  {/* Arrow */}
                  <div style={{
                    padding: '0 12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(255, 255, 255, 0.02)',
                  }}>
                    <ArrowRight size={20} style={{
                      color: '#C5A456',
                      filter: 'drop-shadow(0 0 4px rgba(197, 164, 86, 0.4))',
                    }} />
                  </div>

                  {/* AFTER */}
                  <div style={{
                    padding: '20px 24px',
                    display: 'flex', alignItems: 'center', gap: '12px',
                    background: 'rgba(16, 185, 129, 0.04)',
                    borderLeft: '1px solid rgba(255, 255, 255, 0.04)',
                  }}>
                    <CheckCircle2 size={18} color="#10B981" style={{ flexShrink: 0 }} />
                    <p style={{
                      fontSize: '14px', color: '#E2E8F0', fontWeight: '600',
                      margin: 0, lineHeight: '1.5',
                    }}>
                      {item.after}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#64748B', fontSize: '1rem', marginBottom: '20px' }}>
                Ready to leave the chaos behind?
              </p>
              <Link
                href="/get-started"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '10px',
                  background: 'linear-gradient(135deg, #D4B86A, #A88B3D)',
                  color: '#0F172A', fontWeight: '700', fontSize: '1rem',
                  padding: '14px 32px', borderRadius: '12px',
                  textDecoration: 'none',
                  boxShadow: '0 4px 24px rgba(197, 164, 86, 0.25)',
                  transition: 'all 0.2s ease',
                }}
              >
                Start Your Free Trial <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>

        {/* ==================== FEATURES ==================== */}
        <section id="features" style={{ background: '#FFFFFF', padding: '100px 24px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '56px' }}>
              <p style={{
                fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)', fontWeight: '800',
                background: 'linear-gradient(135deg, #D4B86A, #C5A456, #A88B3D)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                letterSpacing: '0.5px',
                marginBottom: '12px',
              }}>
                ClubForge is
              </p>
              <h2 style={{
                fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
                color: '#0F172A', fontWeight: '800', lineHeight: '1.15',
                marginBottom: '16px',
              }}>
                Everything your club needs.{' '}
                <span style={{
                  background: 'linear-gradient(135deg, #D4B86A, #A88B3D)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>
                  Nothing it doesn&apos;t.
                </span>
              </h2>
              <p style={{ color: '#64748B', fontSize: '1.05rem', maxWidth: '550px', margin: '0 auto', lineHeight: '1.7' }}>
                One system that replaces your spreadsheet, your booking tool, your payment processor, and your WhatsApp group.
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '20px',
            }}>
              {[
                { icon: Users, title: 'Member Management', description: 'Complete profiles, family accounts, self-registration, automated onboarding. Know every member.', color: '#3B82F6' },
                { icon: Calendar, title: 'Class Scheduling', description: 'Recurring and one-off classes, instructor assignment, capacity limits, waitlists. Your timetable, automated.', color: '#8B5CF6' },
                { icon: Award, title: 'Belt & Rank Progression', description: 'Structured ranking systems, grading history, coach feedback, promotion audit trails. No other platform does this.', color: '#F59E0B' },
                { icon: CheckCircle2, title: 'Attendance Tracking', description: 'One-tap check-in, parent-child support, attendance reports, retention insights. See who shows up.', color: '#10B981' },
                { icon: CreditCard, title: 'Payments & Billing', description: 'Stripe-powered subscriptions, automated invoicing, promo codes, revenue dashboards. Get paid on time.', color: '#EC4899' },
                { icon: Video, title: 'Video Library & Monetisation', description: 'Upload drill and technique videos for your members. Build a premium content library that adds value to memberships and keeps students training between sessions.', color: '#6366F1' },
                { icon: Ticket, title: 'Events & Ticketing', description: 'Run seminars, competitions, and retreats with built-in registration and Stripe-powered payments. Accept payments, manage attendees, and track revenue — all from one dashboard.', color: '#F97316' },
                { icon: BarChart3, title: 'Reports & Insights', description: 'Retention trends, attendance analytics, revenue forecasting, operational health. Data-driven decisions.', color: '#06B6D4' },
              ].map((feature) => (
                <div
                  key={feature.title}
                  style={{
                    padding: '32px', borderRadius: '16px',
                    border: '1px solid #F1F5F9',
                    background: '#FAFBFC',
                    transition: 'all 0.25s ease',
                  }}
                >
                  <div style={{
                    width: '52px', height: '52px', borderRadius: '14px',
                    background: `${feature.color}12`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '20px',
                  }}>
                    <feature.icon size={26} color={feature.color} />
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#0F172A', marginBottom: '10px' }}>
                    {feature.title}
                  </h3>
                  <p style={{ color: '#64748B', margin: 0, lineHeight: '1.7', fontSize: '0.95rem' }}>
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==================== TRUST & AUTHORITY ==================== */}
        <section style={{
          background: 'linear-gradient(180deg, #0F172A 0%, #1E293B 100%)',
          padding: '100px 24px',
          color: '#FFFFFF',
        }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '56px' }}>
              <p style={{
                fontSize: '14px', fontWeight: '600', color: '#C5A456',
                textTransform: 'uppercase', letterSpacing: '1.5px',
                marginBottom: '16px',
              }}>
                Enterprise-grade infrastructure
              </p>
              <h2 style={{
                fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
                color: '#FFFFFF', fontWeight: '800', lineHeight: '1.15',
                marginBottom: '16px',
              }}>
                Built for trust. Built to last.
              </h2>
              <p style={{ color: '#94A3B8', fontSize: '1.05rem', maxWidth: '550px', margin: '0 auto', lineHeight: '1.7' }}>
                Your members trust you with their data. We take that as seriously as you do. Professional infrastructure for professional clubs.
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px',
            }}>
              {[
                { icon: Shield, title: 'Stripe-Powered Billing', desc: 'PCI-compliant payment processing. Subscriptions, invoicing, and promo codes — all handled by the industry standard.' },
                { icon: Lock, title: 'Tenant Isolation', desc: 'Full multi-tenant architecture with row-level security. Your data is completely isolated.' },
                { icon: Eye, title: 'Role-Based Permissions', desc: 'Owner → Admin → Instructor → Staff → Member. Everyone sees exactly what they should. Nothing more.' },
                { icon: Globe, title: 'Reliable & Fast', desc: 'Hosted on modern cloud infrastructure with automatic backups, SSL encryption, and 99.9% uptime. Always on when you need it.' },
              ].map((item) => (
                <div key={item.title} style={{
                  padding: '28px', borderRadius: '16px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '12px',
                    background: 'rgba(197, 164, 86, 0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '16px',
                  }}>
                    <item.icon size={22} color="#C5A456" />
                  </div>
                  <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#FFFFFF', marginBottom: '8px' }}>{item.title}</h4>
                  <p style={{ color: '#94A3B8', margin: 0, fontSize: '0.9rem', lineHeight: '1.7' }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==================== DIFFERENTIATOR ==================== */}
        <section style={{ background: '#FAFBFC', padding: '100px 24px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '56px' }}>
              <p style={{
                fontSize: '14px', fontWeight: '600', color: '#C5A456',
                textTransform: 'uppercase', letterSpacing: '1.5px',
                marginBottom: '16px',
              }}>
                Beyond software
              </p>
              <h2 style={{
                fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
                color: '#0F172A', fontWeight: '800', lineHeight: '1.15',
                marginBottom: '16px',
              }}>
                Not just software.{' '}
                <span style={{
                  background: 'linear-gradient(135deg, #D4B86A, #A88B3D)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>
                  A system.
                </span>
              </h2>
              <p style={{ color: '#64748B', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto', lineHeight: '1.7' }}>
                Most gym tools are glorified booking calendars. ClubForge is an operating system — it structures how your club actually runs, grows, and scales.
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px',
            }}>
              {[
                { icon: Layers, title: 'Operational Structure', desc: 'Defined roles, permissions, and governance. Owner → Admin → Coach → Staff → Member. Everyone knows their lane.' },
                { icon: Award, title: 'Progression Engine', desc: 'Belts, ranks, gradings, and coach feedback with a full audit trail. No other platform does this natively.' },
                { icon: Building2, title: 'Multi-Location Control', desc: 'One dashboard, many venues. Cross-site memberships, unified reporting, location-specific settings. Scale without chaos.' },
                { icon: GitBranch, title: 'Audit Trail', desc: 'Every grading, every payment, every membership change — tracked, timestamped, and attributable. Full operational transparency.' },
                { icon: Settings, title: 'Automation & Scalability', desc: 'Automated billing, onboarding, attendance tracking, and notifications. Your admin workload shrinks as your club grows.' },
                { icon: UserCheck, title: 'Self-Service Member Portal', desc: 'Members manage their own profiles, track progress, view classes, and manage payments. Less admin for you, better experience for them.' },
              ].map((item) => (
                <div key={item.title} style={{
                  padding: '28px', borderRadius: '16px',
                  border: '1px solid #F1F5F9',
                  background: '#FFFFFF',
                }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #D4B86A, #A88B3D)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '16px',
                  }}>
                    <item.icon size={22} color="#0F172A" />
                  </div>
                  <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#0F172A', marginBottom: '8px' }}>{item.title}</h4>
                  <p style={{ color: '#64748B', margin: 0, fontSize: '0.9rem', lineHeight: '1.7' }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==================== GROWTH NARRATIVE ==================== */}
        <section style={{ background: '#FFFFFF', padding: '100px 24px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '56px' }}>
              <p style={{
                fontSize: '14px', fontWeight: '600', color: '#C5A456',
                textTransform: 'uppercase', letterSpacing: '1.5px',
                marginBottom: '16px',
              }}>
                Growth
              </p>
              <h2 style={{
                fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
                color: '#0F172A', fontWeight: '800', lineHeight: '1.15',
                marginBottom: '16px',
              }}>
                Built to help your club grow
              </h2>
              <p style={{ color: '#64748B', fontSize: '1.05rem', maxWidth: '550px', margin: '0 auto', lineHeight: '1.7' }}>
                ClubForge isn&apos;t just about reducing admin. It&apos;s about giving you the visibility and control to grow with confidence.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
              {[
                {
                  icon: TrendingUp,
                  title: 'Improve Retention',
                  desc: 'See exactly who\'s attending, who\'s dropping off, and why. Intervention before you lose them.',
                },
                {
                  icon: Star,
                  title: 'Look Professional',
                  desc: 'Your own branded portal, automated comms, and a seamless member experience. First impressions matter.',
                },
                {
                  icon: Building2,
                  title: 'Scale to Multi-Location',
                  desc: 'When you\'re ready for venue two (or three, or ten), ClubForge is already built for it. No migration needed.',
                },
                {
                  icon: BarChart3,
                  title: 'See Everything',
                  desc: 'Revenue, attendance, retention, member growth — real-time dashboards that show you the health of your operation.',
                },
              ].map((item) => (
                <div key={item.title} style={{
                  padding: '28px', borderRadius: '16px',
                  background: '#FAFBFC', border: '1px solid #F1F5F9',
                }}>
                  <item.icon size={28} color="#C5A456" style={{ marginBottom: '16px' }} />
                  <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#0F172A', marginBottom: '8px' }}>{item.title}</h4>
                  <p style={{ color: '#64748B', margin: 0, fontSize: '0.9rem', lineHeight: '1.7' }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==================== HOW IT WORKS ==================== */}
        <section style={{ background: '#FAFBFC', padding: '100px 24px', borderTop: '1px solid #F1F5F9' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '56px' }}>
              <p style={{
                fontSize: '14px', fontWeight: '600', color: '#C5A456',
                textTransform: 'uppercase', letterSpacing: '1.5px',
                marginBottom: '16px',
              }}>
                Getting started
              </p>
              <h2 style={{
                fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
                color: '#0F172A', fontWeight: '800', lineHeight: '1.15',
                marginBottom: '16px',
              }}>
                Live in under 10 minutes
              </h2>
              <p style={{ color: '#64748B', fontSize: '1.05rem', maxWidth: '480px', margin: '0 auto', lineHeight: '1.7' }}>
                From signup to your first member check-in. No technical skills required. No onboarding call needed.
              </p>
            </div>

            <div className="cf-steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
              {[
                { step: '01', title: 'Create Your Account', description: '60 seconds. Full Pro features for 14 days so you can test everything.' },
                { step: '02', title: 'Configure Your Club', description: 'Upload your logo, add your locations, create membership tiers, set up your class schedule and belt structure.' },
                { step: '03', title: 'Go Live', description: 'Share your branded club URL. Members self-register, book classes, and pay online. You manage it all from one dashboard.' },
              ].map((item) => (
                <div key={item.step} style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '64px', height: '64px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #D4B86A, #A88B3D)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 20px',
                    fontSize: '1.25rem', fontWeight: '800', color: '#0F172A',
                  }}>
                    {item.step}
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0F172A', marginBottom: '10px' }}>
                    {item.title}
                  </h3>
                  <p style={{ color: '#64748B', margin: 0, lineHeight: '1.7', fontSize: '0.9rem' }}>
                    {item.description}
                  </p>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '48px' }}>
              <Link href="/get-started" style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'linear-gradient(135deg, #D4B86A 0%, #C5A456 50%, #A88B3D 100%)',
                color: '#0F172A', padding: '14px 32px', borderRadius: '12px',
                fontSize: '1rem', fontWeight: '700', textDecoration: 'none',
                boxShadow: '0 4px 24px rgba(197, 164, 86, 0.3)',
              }}>
                Start Your Free Trial
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>

        {/* ==================== PRICING ==================== */}
        <section style={{
          background: 'linear-gradient(180deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
          padding: '100px 24px',
          color: '#FFFFFF',
        }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '56px' }}>
              <p style={{
                fontSize: '14px', fontWeight: '600', color: '#C5A456',
                textTransform: 'uppercase', letterSpacing: '1.5px',
                marginBottom: '16px',
              }}>
                Pricing
              </p>
              <h2 style={{
                fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
                color: '#FFFFFF', fontWeight: '800', lineHeight: '1.15',
                marginBottom: '16px',
              }}>
                Simple, honest pricing
              </h2>
              <p style={{ color: '#94A3B8', fontSize: '1.05rem', maxWidth: '480px', margin: '0 auto', lineHeight: '1.7' }}>
                No hidden fees. No per-member charges. One price for your entire club. Cancel anytime.
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px',
              alignItems: 'stretch',
            }} className="cf-pricing-grid">
              {/* Starter */}
              <div style={{
                background: 'rgba(255,255,255,0.04)', borderRadius: '20px',
                border: '1px solid rgba(255,255,255,0.08)', padding: '36px',
                display: 'flex', flexDirection: 'column',
              }}>
                <h3 style={{ color: '#CBD5E1', fontSize: '1rem', fontWeight: '600', marginBottom: '8px' }}>
                  Starter
                </h3>
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ fontSize: '3rem', fontWeight: '800', color: '#FFFFFF' }}><CurrencyPrice tier="starter" period="monthly" /></span>
                  <span style={{ color: '#64748B', fontSize: '1rem' }}>/month</span>
                </div>
                <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginBottom: '28px', lineHeight: '1.6' }}>
                  For new and small clubs building their foundation.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                  {['Up to 150 members', '1 location', 'Up to 5 events', 'Class scheduling & attendance', 'Belt progression tracking', 'Stripe payments & invoicing', 'Member self-registration'].map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#CBD5E1', fontSize: '0.9rem' }}>
                      <CheckCircle2 size={16} color="#C5A456" style={{ flexShrink: 0 }} /> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/get-started" style={{
                  display: 'block', textAlign: 'center', textDecoration: 'none',
                  padding: '14px', borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.15)', color: '#FFFFFF',
                  fontWeight: '600', fontSize: '0.95rem',
                }}>
                  Start Free Trial
                </Link>
              </div>

              {/* Pro */}
              <div style={{
                background: 'rgba(197,164,86,0.08)', borderRadius: '20px',
                border: '2px solid rgba(197,164,86,0.5)', padding: '36px',
                position: 'relative',
                display: 'flex', flexDirection: 'column',
                transform: 'scale(1.02)',
              }} className="cf-pricing-pro">
                <div style={{
                  position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)',
                  background: 'linear-gradient(135deg, #D4B86A, #A88B3D)', color: '#0F172A',
                  padding: '6px 20px', borderRadius: '100px',
                  fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px',
                }}>
                  Most Popular
                </div>
                <h3 style={{ color: '#C5A456', fontSize: '1rem', fontWeight: '600', marginBottom: '8px' }}>
                  Pro
                </h3>
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ fontSize: '3rem', fontWeight: '800', color: '#FFFFFF' }}><CurrencyPrice tier="pro" period="monthly" /></span>
                  <span style={{ color: '#64748B', fontSize: '1rem' }}>/month</span>
                </div>
                <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginBottom: '28px', lineHeight: '1.6' }}>
                  For established clubs ready to professionalise and scale.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                  {['Up to 750 members', '3 locations', 'Up to 50 events', 'Up to 30 training videos', 'Everything in Starter', 'Video library for drills & techniques', 'Event management & ticketing', 'Advanced analytics & reports', 'Priority support (24h SLA)'].map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#CBD5E1', fontSize: '0.9rem' }}>
                      <CheckCircle2 size={16} color="#C5A456" style={{ flexShrink: 0 }} /> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/get-started" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  textDecoration: 'none',
                  padding: '14px', borderRadius: '12px',
                  background: 'linear-gradient(135deg, #D4B86A, #A88B3D)', color: '#0F172A',
                  fontWeight: '700', fontSize: '0.95rem',
                  boxShadow: '0 4px 24px rgba(197, 164, 86, 0.3)',
                }}>
                  Start Free Trial
                  <ArrowRight size={16} />
                </Link>
              </div>

              {/* Elite */}
              <div style={{
                background: 'rgba(255,255,255,0.04)', borderRadius: '20px',
                border: '1px solid rgba(255,255,255,0.08)', padding: '36px',
                display: 'flex', flexDirection: 'column',
              }}>
                <h3 style={{ color: '#CBD5E1', fontSize: '1rem', fontWeight: '600', marginBottom: '8px' }}>
                  Elite
                </h3>
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ fontSize: '3rem', fontWeight: '800', color: '#FFFFFF' }}><CurrencyPrice tier="elite" period="monthly" /></span>
                  <span style={{ color: '#64748B', fontSize: '1rem' }}>/month</span>
                </div>
                <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginBottom: '28px', lineHeight: '1.6' }}>
                  For large academies and franchise operations.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                  {['Unlimited members', 'Unlimited locations', 'Unlimited events & videos', 'Everything in Pro', 'Custom subdomain', 'Full white-label branding', 'API access & webhooks', 'Dedicated support + SLA'].map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#CBD5E1', fontSize: '0.9rem' }}>
                      <CheckCircle2 size={16} color="#C5A456" style={{ flexShrink: 0 }} /> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/demo" style={{
                  display: 'block', textAlign: 'center', textDecoration: 'none',
                  padding: '14px', borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.15)', color: '#FFFFFF',
                  fontWeight: '600', fontSize: '0.95rem',
                }}>
                  Book a Demo
                </Link>
              </div>
            </div>

            <p style={{ textAlign: 'center', color: '#64748B', fontSize: '0.85rem', marginTop: '28px', marginBottom: 0 }}>
              All plans include a 2.5% platform fee on member payments processed through Stripe.{' '}
              <Link href="/pricing" style={{ color: '#C5A456', textDecoration: 'underline' }}>See full comparison →</Link>
            </p>
          </div>
        </section>

        {/* ==================== ORIGIN / CREDIBILITY ==================== */}
        <section style={{ background: '#FFFFFF', padding: '100px 24px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <p style={{
              fontSize: '14px', fontWeight: '600', color: '#C5A456',
              textTransform: 'uppercase', letterSpacing: '1.5px',
              marginBottom: '16px',
            }}>
              Our story
            </p>
            <h2 style={{
              fontSize: 'clamp(1.8rem, 3.5vw, 2.25rem)',
              color: '#0F172A', fontWeight: '800', lineHeight: '1.2',
              marginBottom: '24px',
            }}>
              Built from a real club. For real clubs.
            </h2>
            <div style={{ maxWidth: '650px', margin: '0 auto' }}>
              <p style={{
                color: '#475569', fontSize: '1.05rem', lineHeight: '1.8',
                marginBottom: '20px',
              }}>
                ClubForge wasn&apos;t designed in a lab. It was born inside a working martial arts academy — built by operators who were tired of running their club across spreadsheets, WhatsApp, and prayer.
              </p>
              <p style={{
                color: '#475569', fontSize: '1.05rem', lineHeight: '1.8',
                marginBottom: '32px',
              }}>
                Every feature exists because a real club needed it. Every workflow was tested with real members, real coaches, and real payments. This isn&apos;t theoretical — it&apos;s battle-tested.
              </p>
            </div>
            <div style={{
              display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap',
            }}>
              {[
                { value: 'Club-Operated', label: 'Designed by real operators' },
                { value: 'Battle-Tested', label: 'Used in a live academy' },
                { value: 'Purpose-Built', label: 'Every feature earnt its place' },
              ].map((stat) => (
                <div key={stat.value} style={{ textAlign: 'center' }}>
                  <p style={{
                    fontSize: '1.1rem', fontWeight: '700', color: '#C5A456',
                    margin: '0 0 4px',
                  }}>{stat.value}</p>
                  <p style={{ fontSize: '0.85rem', color: '#94A3B8', margin: 0 }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==================== FINAL CTA ==================== */}
        <section style={{
          background: 'linear-gradient(135deg, #D4B86A 0%, #C5A456 40%, #A88B3D 100%)',
          padding: '100px 24px',
          textAlign: 'center',
        }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{
              color: '#0F172A', marginBottom: '16px',
              fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
              fontWeight: '800', lineHeight: '1.15',
            }}>
              Ready to run your club like a real operation?
            </h2>
            <p style={{
              color: 'rgba(15, 23, 42, 0.65)', fontSize: '1.1rem',
              marginBottom: '36px', lineHeight: '1.7',
            }}>
              Join club owners who stopped duct-taping their admin together and started running their club with structure, clarity, and confidence.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/get-started" style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: '#0F172A', color: '#FFFFFF',
                padding: '16px 36px', borderRadius: '12px',
                fontSize: '1.05rem', fontWeight: '700', textDecoration: 'none',
                boxShadow: '0 4px 24px rgba(15, 23, 42, 0.3)',
              }}>
                Start Your Free Trial
                <ArrowRight size={20} />
              </Link>
              <Link href="/demo" style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'transparent', color: '#0F172A',
                border: '2px solid rgba(15, 23, 42, 0.3)', padding: '16px 36px',
                borderRadius: '12px', fontSize: '1.05rem', fontWeight: '600',
                textDecoration: 'none',
              }}>
                Book a Demo
              </Link>
            </div>
            <p style={{
              marginTop: '24px', marginBottom: 0,
              color: 'rgba(15, 23, 42, 0.45)', fontSize: '0.85rem',
            }}>
              14-day free trial · Cancel anytime · Switch plans whenever
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
