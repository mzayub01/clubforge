import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getTenantId } from '@/lib/tenant';
import { Bell, Calendar, MapPin, Info } from 'lucide-react';

export const metadata = {
    title: 'Announcements',
    description: 'Announcements and updates from your club',
};

interface Announcement {
    id: string;
    title: string;
    message: string;
    location_id: string | null;
    target_audience: string;
    created_at: string;
    expires_at: string | null;
    location?: {
        name: string;
    };
}

export default async function AnnouncementsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch active announcements
    const { data: rawAnnouncements } = await supabase
        .from('announcements')
        .select(`
            *,
            location:locations(name)
        `)
        .eq('is_active', true)
        .or('expires_at.is.null,expires_at.gt.now()')
        .order('created_at', { ascending: false });

    // Only show what was aimed at this person: staff-only announcements go to
    // staff, and location-specific ones to people with a membership (own or a
    // child's) at that location.
    const admin = createAdminClient();
    const tenantId = await getTenantId();
    let isStaff = false;
    const memberLocationIds = new Set<string>();
    if (user) {
        const { data: tm } = tenantId
            ? await admin.from('tenant_members').select('role').eq('user_id', user.id).eq('tenant_id', tenantId).eq('is_active', true).maybeSingle()
            : { data: null };
        isStaff = ['admin', 'instructor', 'professor'].includes(tm?.role || '');

        const { data: me } = await admin.from('profiles').select('id').eq('user_id', user.id).maybeSingle();
        const { data: children } = me
            ? await admin.from('profiles').select('user_id').eq('parent_guardian_id', me.id)
            : { data: [] as { user_id: string }[] };
        const userIds = [user.id, ...(children || []).map(c => c.user_id)];
        const { data: ms } = await admin
            .from('memberships')
            .select('location_id')
            .in('user_id', userIds)
            .in('status', ['active', 'pending']);
        (ms || []).forEach(m => { if (m.location_id) memberLocationIds.add(m.location_id); });
    }

    const announcements = ((rawAnnouncements || []) as Announcement[]).filter(a => {
        const audience = a.target_audience || 'all';
        if (audience === 'instructors' && !isStaff) return false;
        if (a.location_id && memberLocationIds.size > 0 && !memberLocationIds.has(a.location_id) && !isStaff) return false;
        return true;
    });

    // Group by date
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    const groupedAnnouncements: Record<string, Announcement[]> = {};
    announcements.forEach(announcement => {
        const date = new Date(announcement.created_at).toDateString();
        let label = date;
        if (date === today) label = 'Today';
        else if (date === yesterday) label = 'Yesterday';
        else label = new Date(announcement.created_at).toLocaleDateString('en-GB', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        });

        if (!groupedAnnouncements[label]) {
            groupedAnnouncements[label] = [];
        }
        groupedAnnouncements[label].push(announcement);
    });

    return (
        <div>
            <div className="dashboard-header">
                <h1 className="dashboard-title">Announcements</h1>
                <p className="dashboard-subtitle">
                    Stay updated with the latest news and announcements
                </p>
            </div>

            {announcements.length === 0 ? (
                <div className="glass-card" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
                    <Bell size={48} color="var(--text-tertiary)" style={{ margin: '0 auto var(--space-4)' }} />
                    <h3 style={{ marginBottom: 'var(--space-2)' }}>No Announcements</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 0 }}>
                        There are no announcements at this time. Check back later!
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
                    {Object.entries(groupedAnnouncements).map(([dateLabel, items]) => (
                        <div key={dateLabel}>
                            <h3 style={{
                                fontSize: 'var(--text-sm)',
                                color: 'var(--text-secondary)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                marginBottom: 'var(--space-4)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--space-2)',
                            }}>
                                <Calendar size={16} />
                                {dateLabel}
                            </h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                                {items.map((announcement) => (
                                    <div key={announcement.id} className="glass-card">
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: 'var(--space-4)',
                                        }}>
                                            <div style={{
                                                width: '44px',
                                                height: '44px',
                                                borderRadius: 'var(--radius-lg)',
                                                background: 'var(--color-gold-gradient)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0,
                                            }}>
                                                <Bell size={22} color="var(--color-black)" />
                                            </div>

                                            <div style={{ flex: 1 }}>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 'var(--space-2)',
                                                    marginBottom: 'var(--space-2)',
                                                    flexWrap: 'wrap',
                                                }}>
                                                    <h4 style={{
                                                        fontSize: 'var(--text-lg)',
                                                        fontWeight: '600',
                                                        margin: 0,
                                                    }}>
                                                        {announcement.title}
                                                    </h4>
                                                    {announcement.location && (
                                                        <span className="badge badge-gray" style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 'var(--space-1)',
                                                        }}>
                                                            <MapPin size={12} />
                                                            {announcement.location.name}
                                                        </span>
                                                    )}
                                                </div>

                                                <p style={{
                                                    color: 'var(--text-secondary)',
                                                    lineHeight: '1.6',
                                                    marginBottom: 'var(--space-3)',
                                                    whiteSpace: 'pre-wrap',
                                                }}>
                                                    {announcement.message}
                                                </p>

                                                <div style={{
                                                    fontSize: 'var(--text-sm)',
                                                    color: 'var(--text-tertiary)',
                                                }}>
                                                    {new Date(announcement.created_at).toLocaleTimeString('en-GB', {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
