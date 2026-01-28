import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StatCard from '../components/dashboard/StatCard';
import ActivityChart from '../components/dashboard/ActivityChart';
import Inbox from '../components/dashboard/Inbox';
import NewMembersList from '../components/dashboard/NewMembersList';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

interface DashboardStats {
    members: {
        total: number;
        active: number;
        trend: { value: number; isPositive: boolean };
    };
    matches: {
        upcoming: number;
        trend: { value: number; isPositive: boolean };
    };
    revenue: {
        total: number;
        trend: { value: number; isPositive: boolean };
    };
    activity: Array<{ name: string; value: number }>;
    notifications: Array<{ id: string; user: string; text: string; time: string; type: string }>;
    recentMembers: Array<{ name: string; status: string }>;
}

const Dashboard: React.FC = () => {
    const { club, user } = useAuth();
    const { t } = useTranslation();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            if (!user?.clubId) return;

            try {
                const response = await axios.get(`/api/dashboard/stats/${user.clubId}`);
                setStats(response.data);
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [user?.clubId]);

    // Format currency
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(value);
    };

    const dropdownStyle = {
        padding: '12px 16px',
        borderRadius: '12px',
        border: '1px solid var(--border-glass)',
        background: 'var(--bg-glass-light)',
        fontSize: '14px',
        fontWeight: 500,
        color: 'var(--text-main)',
        flex: 1,
        cursor: 'pointer',
        backdropFilter: 'blur(10px)',
        WebkitAppearance: 'none' as const,
        appearance: 'none' as const,
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
            <div style={{ marginBottom: '8px' }}>
                <h1 className="font-premium text-gradient" style={{ margin: 0, fontSize: '2.5rem', fontWeight: 800 }}>
                    {t('dashboard.welcome', { name: user?.name || 'Admin' })}
                </h1>
                <p style={{ margin: '8px 0 0', color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                    {t('dashboard.subtitle')}
                </p>
            </div>

            {/* Top Controls */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '8px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 2, minWidth: '240px' }}>
                    <select className="dropdown-control glass-effect" style={dropdownStyle}>
                        <option value="all" style={{ background: '#1a1a1a' }}>{t('dashboard.filters.allSports')}</option>
                    </select>
                </div>
                <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
                    <select className="dropdown-control glass-effect" style={dropdownStyle}>
                        <option value="both" style={{ background: '#1a1a1a' }}>{t('dashboard.filters.membershipTickets')}</option>
                    </select>
                </div>
                <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
                    <select className="dropdown-control glass-effect" style={dropdownStyle}>
                        <option value="revenue" style={{ background: '#1a1a1a' }}>{t('dashboard.filters.revenueType')}</option>
                    </select>
                </div>
            </div>

            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                <StatCard
                    title={t('dashboard.stats.totalMembers')}
                    value={loading ? "..." : stats?.members.total.toLocaleString() || "0"}
                />
                <StatCard
                    title={t('dashboard.stats.upcomingMatches')}
                    value={loading ? "..." : stats?.matches.upcoming.toString() || "0"}
                    trend={stats?.matches.trend}
                />
                <StatCard
                    title={t('dashboard.stats.ticketRevenue')}
                    value={loading ? "..." : formatCurrency(stats?.revenue.total || 0)}
                    trend={stats?.revenue.trend}
                />
            </div>

            {/* Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', alignItems: 'start' }}>
                {/* Left Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <ActivityChart data={stats?.activity} />
                </div>

                {/* Right Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <Inbox messages={stats?.notifications} />
                    <NewMembersList members={stats?.recentMembers} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
