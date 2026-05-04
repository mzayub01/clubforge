import Link from 'next/link';
import { ArrowRight, BookOpen, Clock } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { BreadcrumbSchema } from '@/components/structured-data';
import { createClient } from '@/lib/supabase/server';

// Blog post data — in future this could come from a CMS or MDX files
export interface BlogPost {
    slug: string;
    title: string;
    description: string;
    category: string;
    readTime: string;
    publishedAt: string;
    featured?: boolean;
}

export const blogPosts: BlogPost[] = [
    {
        slug: 'best-app-to-track-belt-promotions',
        title: 'The Best App to Track Belt Promotions in 2026',
        description: 'Compare the top belt tracking apps for martial arts schools. From BJJ stripe progression to Karate dan rankings — find the right tool for your academy.',
        category: 'Software Reviews',
        readTime: '8 min read',
        publishedAt: '2026-05-04',
        featured: true,
    },
    {
        slug: 'martial-arts-software-uk-guide',
        title: 'Martial Arts Software UK: The Complete Guide for Club Owners',
        description: 'Everything UK martial arts club owners need to know about choosing, comparing, and switching to the right management software in 2026.',
        category: 'Guides',
        readTime: '12 min read',
        publishedAt: '2026-05-04',
        featured: true,
    },
    {
        slug: 'how-much-does-gym-management-software-cost',
        title: 'How Much Does Gym Management Software Cost in 2026?',
        description: 'A transparent breakdown of gym software pricing in the UK. Compare costs across ClubForge, Gymdesk, Zen Planner, Coacha, and more.',
        category: 'Guides',
        readTime: '10 min read',
        publishedAt: '2026-05-04',
    },
];

export const metadata = {
    title: 'Blog — Martial Arts Club Management Tips, Guides & Software Reviews | ClubForge',
    description: 'Expert guides, software comparisons, and actionable tips for martial arts club owners. Learn how to manage your gym, track belt promotions, automate payments, and grow your academy.',
    alternates: {
        canonical: 'https://clubforgehq.com/blog',
    },
    openGraph: {
        title: 'ClubForge Blog — Martial Arts Club Management Guides',
        description: 'Expert guides, software comparisons, and tips for martial arts gym owners.',
        url: 'https://clubforgehq.com/blog',
    },
    keywords: [
        'martial arts club management blog',
        'gym management tips',
        'belt tracking software guide',
        'martial arts software reviews',
        'gym owner advice',
        'BJJ academy management',
    ],
};

export default async function BlogPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const featuredPosts = blogPosts.filter(p => p.featured);
    const otherPosts = blogPosts.filter(p => !p.featured);

    return (
        <>
            <Navbar user={user ? { id: user.id, email: user.email! } : null} />
            <BreadcrumbSchema items={[
                { name: 'Home', url: 'https://clubforgehq.com' },
                { name: 'Blog', url: 'https://clubforgehq.com/blog' },
            ]} />

            <main>
                {/* Hero */}
                <section style={{
                    background: 'linear-gradient(180deg, #0F172A 0%, #1E293B 100%)',
                    padding: '140px 24px 80px',
                    position: 'relative',
                    overflow: 'hidden',
                }}>
                    <div style={{
                        position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.03,
                        backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
                        backgroundSize: '60px 60px',
                    }} />
                    <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1, textAlign: 'center' }}>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '8px',
                            marginBottom: '24px', background: 'rgba(197,164,86,0.12)',
                            padding: '8px 16px', borderRadius: '100px',
                            border: '1px solid rgba(197,164,86,0.2)',
                        }}>
                            <BookOpen size={14} color="#C5A456" />
                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#C5A456', letterSpacing: '0.03em' }}>
                                ClubForge Blog
                            </span>
                        </div>

                        <h1 style={{
                            fontSize: 'clamp(2rem, 4.5vw, 3rem)',
                            fontWeight: '800', lineHeight: '1.1',
                            marginBottom: '20px', color: '#FFFFFF',
                        }}>
                            Guides, Tips & Reviews for{' '}
                            <span style={{
                                background: 'linear-gradient(135deg, #D4B86A, #A88B3D)',
                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            }}>
                                Martial Arts Club Owners
                            </span>
                        </h1>
                        <p style={{ color: '#94A3B8', fontSize: '1.1rem', lineHeight: '1.7', maxWidth: '600px', margin: '0 auto' }}>
                            Practical advice on managing your academy, choosing the right software, growing your membership, and running your club like a professional operation.
                        </p>
                    </div>
                </section>

                {/* Featured Posts */}
                {featuredPosts.length > 0 && (
                    <section style={{ background: '#FFFFFF', padding: '80px 24px', borderBottom: '1px solid #F1F5F9' }}>
                        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                            <p style={{
                                fontSize: '14px', fontWeight: '600', color: '#C5A456',
                                textTransform: 'uppercase', letterSpacing: '1.5px',
                                marginBottom: '24px',
                            }}>
                                Featured Articles
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px' }}>
                                {featuredPosts.map(post => (
                                    <Link
                                        key={post.slug}
                                        href={`/blog/${post.slug}`}
                                        style={{
                                            display: 'block', textDecoration: 'none',
                                            padding: '32px', borderRadius: '16px',
                                            border: '1px solid #F1F5F9', background: '#FAFBFC',
                                            transition: 'all 0.2s ease',
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                            <span style={{
                                                fontSize: '12px', fontWeight: '600', color: '#C5A456',
                                                background: 'rgba(197,164,86,0.1)', padding: '4px 12px',
                                                borderRadius: '100px',
                                            }}>
                                                {post.category}
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#94A3B8' }}>
                                                <Clock size={12} /> {post.readTime}
                                            </span>
                                        </div>
                                        <h2 style={{
                                            fontSize: '1.25rem', fontWeight: '800', color: '#0F172A',
                                            marginBottom: '12px', lineHeight: '1.3',
                                        }}>
                                            {post.title}
                                        </h2>
                                        <p style={{
                                            color: '#64748B', fontSize: '0.9rem', lineHeight: '1.7',
                                            marginBottom: '16px',
                                        }}>
                                            {post.description}
                                        </p>
                                        <span style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                                            color: '#C5A456', fontSize: '14px', fontWeight: '600',
                                        }}>
                                            Read article <ArrowRight size={14} />
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* All Posts */}
                {otherPosts.length > 0 && (
                    <section style={{ background: '#FAFBFC', padding: '80px 24px' }}>
                        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                            <p style={{
                                fontSize: '14px', fontWeight: '600', color: '#0F172A',
                                textTransform: 'uppercase', letterSpacing: '1.5px',
                                marginBottom: '24px',
                            }}>
                                All Articles
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {otherPosts.map(post => (
                                    <Link
                                        key={post.slug}
                                        href={`/blog/${post.slug}`}
                                        style={{
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            textDecoration: 'none', padding: '24px',
                                            borderRadius: '14px', border: '1px solid #E2E8F0',
                                            background: '#FFFFFF', transition: 'all 0.2s ease',
                                        }}
                                    >
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                                <span style={{ fontSize: '12px', fontWeight: '600', color: '#C5A456' }}>{post.category}</span>
                                                <span style={{ fontSize: '12px', color: '#94A3B8' }}>{post.readTime}</span>
                                            </div>
                                            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                                                {post.title}
                                            </h3>
                                            <p style={{ color: '#64748B', fontSize: '0.85rem', margin: 0 }}>
                                                {post.description}
                                            </p>
                                        </div>
                                        <ArrowRight size={18} color="#C5A456" style={{ flexShrink: 0, marginLeft: '24px' }} />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* CTA */}
                <section style={{
                    background: 'linear-gradient(135deg, #D4B86A 0%, #C5A456 40%, #A88B3D 100%)',
                    padding: '80px 24px', textAlign: 'center',
                }}>
                    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <h2 style={{ color: '#0F172A', fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: '800', marginBottom: '16px', lineHeight: '1.2' }}>
                            Ready to simplify your club management?
                        </h2>
                        <p style={{ color: 'rgba(15,23,42,0.6)', fontSize: '1rem', marginBottom: '32px' }}>
                            Start your free 14-day trial. No credit card required.
                        </p>
                        <Link href="/get-started" style={{
                            display: 'inline-flex', alignItems: 'center', gap: '8px',
                            background: '#0F172A', color: '#FFFFFF',
                            padding: '14px 32px', borderRadius: '12px',
                            fontSize: '1rem', fontWeight: '700', textDecoration: 'none',
                        }}>
                            Start Free Trial <ArrowRight size={18} />
                        </Link>
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}
