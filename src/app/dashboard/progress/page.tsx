'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Award, Star, Trophy, Target, Calendar, Loader2, MessageSquare } from 'lucide-react';
import BJJBelt from '@/components/BJJBelt';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useDashboard } from '@/components/dashboard/DashboardProvider';
import { useRankSchemas, getBeltColors } from '@/hooks/useRankSchemas';

interface ProfileData {
    belt_rank: string;
    stripes: number;
    is_child: boolean;
}

interface PromotionRecord {
    id: string;
    previous_belt: string;
    previous_stripes: number;
    new_belt: string;
    new_stripes: number;
    comments: string | null;
    promotion_date: string;
    promoted_by?: string;
    promoted_by_profile?: { first_name: string; last_name: string } | null;
}

interface FeedbackRecord {
    id: string;
    feedback: string;
    created_at: string;
    professor_id?: string;
    professor?: { first_name: string; last_name: string } | null;
}

export default function MemberProgressPage() {
    const supabase = getSupabaseClient();
    const { selectedProfileId, beltProgressEnabled } = useDashboard();
    const { getSchemaForMember, loading: schemasLoading } = useRankSchemas();
    const router = useRouter();

    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [promotions, setPromotions] = useState<PromotionRecord[]>([]);
    const [feedback, setFeedback] = useState<FeedbackRecord[]>([]);
    const [loading, setLoading] = useState(true);

    // Belt progression is switched off for this club: nothing to show here.
    useEffect(() => {
        if (!beltProgressEnabled) router.replace('/dashboard');
    }, [beltProgressEnabled, router]);

    useEffect(() => {
        fetchData();
    }, [selectedProfileId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Get profile with current belt and stripes
            const { data: profileData } = await supabase
                .from('profiles')
                .select('belt_rank, stripes, is_child')
                .eq('user_id', selectedProfileId)
                .single();

            setProfile(profileData);

            // Get promotion history (simple query without FK join)
            const { data: promotionsData } = await supabase
                .from('promotions')
                .select('*')
                .eq('user_id', selectedProfileId)
                .order('promotion_date', { ascending: false });

            // Fetch promoter names for promotions
            if (promotionsData && promotionsData.length > 0) {
                const promoterIds = [...new Set(promotionsData.map(p => p.promoted_by).filter(Boolean))];
                if (promoterIds.length > 0) {
                    const { data: promotersData } = await supabase
                        .from('profiles')
                        .select('user_id, first_name, last_name')
                        .in('user_id', promoterIds);

                    const promoterMap = new Map(promotersData?.map(p => [p.user_id, p]) || []);

                    const promotionsWithPromoters = promotionsData.map(p => ({
                        ...p,
                        promoted_by_profile: promoterMap.get(p.promoted_by) || null
                    }));
                    setPromotions(promotionsWithPromoters);
                } else {
                    setPromotions(promotionsData);
                }
            } else {
                setPromotions([]);
            }

            // Get professor feedback (simple query without FK join)
            const { data: feedbackData, error: feedbackError } = await supabase
                .from('professor_feedback')
                .select('id, feedback, created_at, professor_id')
                .eq('user_id', selectedProfileId)
                .order('created_at', { ascending: false });

            // Fetch professor names for feedback
            if (feedbackData && feedbackData.length > 0) {
                const professorIds = [...new Set(feedbackData.map(f => f.professor_id))];
                const { data: professorsData } = await supabase
                    .from('profiles')
                    .select('user_id, first_name, last_name')
                    .in('user_id', professorIds);

                const professorMap = new Map(professorsData?.map(p => [p.user_id, p]) || []);

                const feedbackWithProfessors = feedbackData.map(f => ({
                    ...f,
                    professor: professorMap.get(f.professor_id) || null
                }));
                setFeedback(feedbackWithProfessors);
            } else {
                setFeedback([]);
            }
        } catch (err) {
            console.error('Error fetching progress data:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading || schemasLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 'var(--space-12)', gap: 'var(--space-3)' }}>
                <Loader2 size={24} className="animate-spin" />
                <span>Loading progress...</span>
            </div>
        );
    }

    // Get the dynamic rank schema for this member
    const isChild = profile?.is_child || false;
    const schema = getSchemaForMember(isChild);
    const rankLevels = schema.rank_levels;

    const currentBelt = profile?.belt_rank || 'white';
    const currentStripes = profile?.stripes || 0;

    // Find current position in the rank levels (case-insensitive match)
    const currentLevelIndex = rankLevels.findIndex(l =>
        l.name.toLowerCase() === currentBelt.toLowerCase() ||
        l.name.toLowerCase().replace(/\//g, '-') === currentBelt.toLowerCase()
    );

    return (
        <div>
            <div className="dashboard-header">
                <h1 className="dashboard-title">Rank Progress</h1>
                <p className="dashboard-subtitle">Track your journey</p>
            </div>

            {/* Current Belt Display */}
            <div className="glass-card" style={{
                marginBottom: 'var(--space-6)',
                padding: 'var(--space-6)',
                textAlign: 'center',
            }}>
                <h3 style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text-tertiary)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    marginBottom: 'var(--space-2)',
                }}>
                    Current Rank
                </h3>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-3)' }}>
                    <BJJBelt
                        belt={currentBelt}
                        stripes={currentStripes}
                        size="lg"
                        isChild={isChild}
                        rankLevels={rankLevels}
                    />
                </div>
                <h2 style={{ textTransform: 'capitalize', marginBottom: 'var(--space-1)' }}>
                    {currentLevelIndex >= 0 ? rankLevels[currentLevelIndex].name : currentBelt.replace('-', '/')} Belt
                </h2>
                {schema.has_stripes && (
                    <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                        {currentStripes} stripe{currentStripes !== 1 ? 's' : ''}
                    </p>
                )}
            </div>

            {/* Belt Journey */}
            <h3 style={{
                fontSize: 'var(--text-lg)',
                marginBottom: 'var(--space-4)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
            }}>
                <Target size={20} color="var(--color-gold)" />
                Your Journey
            </h3>

            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 'var(--space-8)',
                padding: 'var(--space-4)',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-xl)',
                position: 'relative',
                overflowX: 'auto',
                gap: 'var(--space-2)',
            }}>
                {/* Progress Line */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: 'var(--space-6)',
                    right: 'var(--space-6)',
                    height: '4px',
                    background: 'var(--border-light)',
                    transform: 'translateY(-50%)',
                    zIndex: 0,
                }}>
                    <div style={{
                        width: `${(Math.max(0, currentLevelIndex) / Math.max(rankLevels.length - 1, 1)) * 100}%`,
                        height: '100%',
                        background: 'var(--color-gold-gradient)',
                        borderRadius: 'var(--radius-full)',
                    }} />
                </div>

                {rankLevels.map((level, index) => {
                    const isAchieved = index <= currentLevelIndex;
                    const isCurrent = index === currentLevelIndex;
                    const isWhiteBelt = level.color_hex === '#F5F5F5' || level.color_hex === '#FFFFFF';

                    return (
                        <div
                            key={level.id}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 'var(--space-2)',
                                position: 'relative',
                                zIndex: 1,
                                minWidth: rankLevels.length > 8 ? '40px' : 'auto',
                            }}
                        >
                            <div style={{
                                width: isCurrent ? '48px' : '36px',
                                height: isCurrent ? '48px' : '36px',
                                borderRadius: 'var(--radius-full)',
                                background: isAchieved ? level.color_hex : 'var(--bg-primary)',
                                border: isWhiteBelt && isAchieved ? '2px solid var(--border-medium)' : isAchieved ? 'none' : '2px dashed var(--border-light)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: isCurrent ? 'var(--shadow-gold)' : isAchieved ? 'var(--shadow-sm)' : 'none',
                                flexShrink: 0,
                            }}>
                                {isAchieved && (
                                    <Star
                                        size={isCurrent ? 20 : 16}
                                        color={isWhiteBelt ? 'var(--color-gold)' : 'white'}
                                        fill={isWhiteBelt ? 'var(--color-gold)' : 'white'}
                                    />
                                )}
                            </div>
                            <span style={{
                                fontSize: 'var(--text-xs)',
                                fontWeight: isCurrent ? '700' : '500',
                                textTransform: 'capitalize',
                                color: isCurrent ? 'var(--color-gold)' : isAchieved ? 'var(--text-primary)' : 'var(--text-tertiary)',
                                whiteSpace: 'nowrap',
                            }}>
                                {level.name}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Promotion History */}
            <h3 style={{
                fontSize: 'var(--text-lg)',
                marginBottom: 'var(--space-4)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
            }}>
                <Trophy size={20} color="var(--color-gold)" />
                Promotion History
            </h3>

            {promotions.length === 0 ? (
                <div className="card">
                    <div className="card-body" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                        <Award size={32} color="var(--text-tertiary)" style={{ margin: '0 auto var(--space-2)' }} />
                        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                            Your promotion history will appear here as you progress.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="card">
                    <div className="card-body" style={{ padding: 0 }}>
                        {promotions.map((record, index) => {
                            const prevColors = getBeltColors(record.previous_belt, rankLevels);
                            const newColors = getBeltColors(record.new_belt, rankLevels);
                            const isPrevWhite = prevColors.main === '#F5F5F5' || prevColors.main === '#FFFFFF';
                            const isNewWhite = newColors.main === '#F5F5F5' || newColors.main === '#FFFFFF';

                            return (
                                <div
                                    key={record.id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--space-4)',
                                        padding: 'var(--space-4)',
                                        borderBottom: index < promotions.length - 1 ? '1px solid var(--border-light)' : 'none',
                                        flexWrap: 'wrap',
                                    }}
                                >
                                    {/* Belt display */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                        <div style={{
                                            width: '32px',
                                            height: '12px',
                                            borderRadius: 'var(--radius-sm)',
                                            background: prevColors.main,
                                            border: isPrevWhite ? '1px solid var(--border-medium)' : 'none',
                                        }} />
                                        <span style={{ color: 'var(--text-tertiary)' }}>→</span>
                                        <div style={{
                                            width: '48px',
                                            height: '16px',
                                            borderRadius: 'var(--radius-sm)',
                                            background: newColors.main,
                                            border: isNewWhite ? '1px solid var(--border-medium)' : 'none',
                                        }} />
                                    </div>

                                    {/* Promotion details */}
                                    <div style={{ flex: 1, minWidth: '150px' }}>
                                        <p style={{ fontWeight: '600', margin: 0, textTransform: 'capitalize' }}>
                                            {record.new_belt.replace('-', '/')} Belt
                                            {record.new_stripes > 0 && ` • ${record.new_stripes} stripe${record.new_stripes !== 1 ? 's' : ''}`}
                                        </p>
                                        {record.comments && (
                                            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', margin: 0, marginTop: '2px' }}>
                                                &ldquo;{record.comments}&rdquo;
                                            </p>
                                        )}
                                    </div>

                                    {/* Date and professor */}
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', fontSize: 'var(--text-sm)', fontWeight: '500' }}>
                                            <Calendar size={12} />
                                            {new Date(record.promotion_date).toLocaleDateString('en-GB', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </div>
                                        {record.promoted_by_profile && (
                                            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', margin: 0 }}>
                                                By {record.promoted_by_profile.first_name} {record.promoted_by_profile.last_name}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Professor Feedback */}
            {feedback.length > 0 && (
                <>
                    <h3 style={{
                        fontSize: 'var(--text-lg)',
                        marginTop: 'var(--space-8)',
                        marginBottom: 'var(--space-4)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-2)',
                    }}>
                        <MessageSquare size={20} color="var(--color-gold)" />
                        Feedback from Professors
                    </h3>

                    <div className="card">
                        <div className="card-body" style={{ padding: 0 }}>
                            {feedback.map((item, index) => (
                                <div
                                    key={item.id}
                                    style={{
                                        padding: 'var(--space-4)',
                                        borderBottom: index < feedback.length - 1 ? '1px solid var(--border-light)' : 'none',
                                    }}
                                >
                                    <p style={{
                                        margin: 0,
                                        marginBottom: 'var(--space-2)',
                                        lineHeight: 1.6,
                                    }}>
                                        &ldquo;{item.feedback}&rdquo;
                                    </p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                                        {item.professor && (
                                            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                                                — {item.professor.first_name} {item.professor.last_name}
                                            </span>
                                        )}
                                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                                            {new Date(item.created_at).toLocaleDateString('en-GB', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
