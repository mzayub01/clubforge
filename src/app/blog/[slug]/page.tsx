import Link from 'next/link';
import { ArrowRight, ArrowLeft, Clock, User, Calendar } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { BreadcrumbSchema, FAQPageSchema } from '@/components/structured-data';
import { createClient } from '@/lib/supabase/server';
import { blogPosts } from '../page';
import { notFound } from 'next/navigation';

// Article content registry
import { beltTrackingArticle } from './articles/best-app-to-track-belt-promotions';
import { martialArtsSoftwareUKArticle } from './articles/martial-arts-software-uk-guide';
import { gymSoftwareCostArticle } from './articles/how-much-does-gym-management-software-cost';

interface ArticleData {
    content: React.ReactNode;
    faqs: { question: string; answer: string }[];
}

const articleRegistry: Record<string, ArticleData> = {
    'best-app-to-track-belt-promotions': beltTrackingArticle,
    'martial-arts-software-uk-guide': martialArtsSoftwareUKArticle,
    'how-much-does-gym-management-software-cost': gymSoftwareCostArticle,
};

export async function generateStaticParams() {
    return blogPosts.map(post => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = blogPosts.find(p => p.slug === slug);
    if (!post) return {};

    return {
        title: post.title,
        description: post.description,
        alternates: { canonical: `https://clubforgehq.com/blog/${slug}` },
        openGraph: {
            title: post.title,
            description: post.description,
            url: `https://clubforgehq.com/blog/${slug}`,
            type: 'article',
            publishedTime: post.publishedAt,
        },
    };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = blogPosts.find(p => p.slug === slug);
    if (!post) notFound();

    const article = articleRegistry[slug];
    if (!article) notFound();

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <>
            <Navbar user={user ? { id: user.id, email: user.email! } : null} />
            <BreadcrumbSchema items={[
                { name: 'Home', url: 'https://clubforgehq.com' },
                { name: 'Blog', url: 'https://clubforgehq.com/blog' },
                { name: post.title, url: `https://clubforgehq.com/blog/${slug}` },
            ]} />
            <FAQPageSchema faqs={article.faqs} />

            {/* Article JSON-LD */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'Article',
                headline: post.title,
                description: post.description,
                datePublished: post.publishedAt,
                dateModified: post.publishedAt,
                author: { '@type': 'Organization', name: 'ClubForge', url: 'https://clubforgehq.com' },
                publisher: { '@type': 'Organization', name: 'ClubForge', url: 'https://clubforgehq.com', logo: { '@type': 'ImageObject', url: 'https://clubforgehq.com/logo-clubforge-final.svg' } },
                mainEntityOfPage: `https://clubforgehq.com/blog/${slug}`,
            })}} />

            <main>
                {/* Hero */}
                <section style={{ background: 'linear-gradient(180deg, #0F172A 0%, #1E293B 100%)', padding: '140px 24px 60px' }}>
                    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
                        <Link href="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#C5A456', fontSize: '14px', fontWeight: '600', textDecoration: 'none', marginBottom: '24px' }}>
                            <ArrowLeft size={14} /> Back to Blog
                        </Link>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                            <span style={{ fontSize: '12px', fontWeight: '600', color: '#C5A456', background: 'rgba(197,164,86,0.12)', padding: '4px 12px', borderRadius: '100px' }}>{post.category}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#94A3B8' }}><Clock size={12} /> {post.readTime}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#94A3B8' }}><Calendar size={12} /> {post.publishedAt}</span>
                        </div>
                        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: '800', lineHeight: '1.15', color: '#FFFFFF', marginBottom: '20px' }}>{post.title}</h1>
                        <p style={{ color: '#94A3B8', fontSize: '1.1rem', lineHeight: '1.7' }}>{post.description}</p>
                    </div>
                </section>

                {/* Article Content */}
                <section style={{ background: '#FFFFFF', padding: '60px 24px 80px' }}>
                    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
                        {article.content}

                        {/* FAQ Section */}
                        {article.faqs.length > 0 && (
                            <div style={{ marginTop: '48px', paddingTop: '48px', borderTop: '1px solid #F1F5F9' }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0F172A', marginBottom: '24px' }}>Frequently Asked Questions</h2>
                                {article.faqs.map((faq, i) => (
                                    <details key={i} style={{ border: '1px solid #F1F5F9', borderRadius: '12px', overflow: 'hidden', marginBottom: '8px' }}>
                                        <summary style={{ padding: '16px 20px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: '600', color: '#0F172A' }}>{faq.question}</summary>
                                        <div style={{ padding: '0 20px 16px', borderTop: '1px solid #F1F5F9', paddingTop: '12px' }}>
                                            <p style={{ color: '#64748B', margin: 0, lineHeight: '1.7', fontSize: '0.9rem' }}>{faq.answer}</p>
                                        </div>
                                    </details>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* CTA */}
                <section style={{ background: 'linear-gradient(135deg, #D4B86A 0%, #C5A456 40%, #A88B3D 100%)', padding: '80px 24px', textAlign: 'center' }}>
                    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <h2 style={{ color: '#0F172A', fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: '800', marginBottom: '16px' }}>Ready to manage your club properly?</h2>
                        <p style={{ color: 'rgba(15,23,42,0.6)', fontSize: '1rem', marginBottom: '32px' }}>14-day free trial. No credit card required.</p>
                        <Link href="/get-started" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#0F172A', color: '#FFFFFF', padding: '14px 32px', borderRadius: '12px', fontSize: '1rem', fontWeight: '700', textDecoration: 'none' }}>
                            Start Free Trial <ArrowRight size={18} />
                        </Link>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
