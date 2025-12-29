import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaBuilding, FaUsers, FaMapMarkerAlt, FaChartLine, FaArrowRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
    clubs: {
        total: number;
        active: number;
    };
    users: {
        total: number;
    };
    venues: {
        total: number;
    };
    recentClubs: Array<{
        id: string;
        name: string;
        city: string;
        country: string;
        createdAt: string;
        logoUrl?: string;
    }>;
}

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await axios.get('/api/dashboard/stats');
            setStats(response.data);
        } catch (err) {
            console.error('Error fetching dashboard stats:', err);
            setError('Failed to load dashboard statistics');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-muted)' }}>
                Please wait, loading overview...
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '24px', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                {error}
                <button
                    onClick={fetchStats}
                    className="premium-btn"
                    style={{ marginLeft: '16px', fontSize: '12px' }}
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ margin: 0, color: 'var(--text-main)', fontSize: '32px', fontWeight: 700, background: 'linear-gradient(135deg, #fff 0%, #a5b4fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Platform Overview
                </h1>
                <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
                    Welcome back, Super Admin. Here's what's happening across the platform today.
                </p>
            </div>

            {/* Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '24px',
                marginBottom: '40px'
            }}>
                {/* Total Clubs Card */}
                <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Total Clubs
                        </div>
                        <div style={{ fontSize: '36px', fontWeight: 700, color: 'var(--text-main)', marginTop: '8px', lineHeight: 1 }}>
                            {stats?.clubs.total}
                        </div>
                        <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#22c55e' }}>
                            <span style={{ padding: '2px 8px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '10px', fontWeight: 600 }}>
                                {stats?.clubs.active} Active
                            </span>
                        </div>
                    </div>
                    <div style={{
                        width: '48px', height: '48px',
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.2))',
                        borderRadius: '12px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#60a5fa'
                    }}>
                        <FaBuilding size={24} />
                    </div>
                </div>

                {/* Total Users Card */}
                <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Total Users
                        </div>
                        <div style={{ fontSize: '36px', fontWeight: 700, color: 'var(--text-main)', marginTop: '8px', lineHeight: 1 }}>
                            {stats?.users.total}
                        </div>
                        <div style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-muted)' }}>
                            Registered across all clubs
                        </div>
                    </div>
                    <div style={{
                        width: '48px', height: '48px',
                        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(147, 51, 234, 0.2))',
                        borderRadius: '12px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#c084fc'
                    }}>
                        <FaUsers size={24} />
                    </div>
                </div>

                {/* Venues Card */}
                <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Venues Managed
                        </div>
                        <div style={{ fontSize: '36px', fontWeight: 700, color: 'var(--text-main)', marginTop: '8px', lineHeight: 1 }}>
                            {stats?.venues.total}
                        </div>
                        <div style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-muted)' }}>
                            Active stadiums & arenas
                        </div>
                    </div>
                    <div style={{
                        width: '48px', height: '48px',
                        background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(219, 39, 119, 0.2))',
                        borderRadius: '12px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#f472b6'
                    }}>
                        <FaMapMarkerAlt size={24} />
                    </div>
                </div>

                {/* System Status Card */}
                <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            System Status
                        </div>
                        <div style={{ fontSize: '20px', fontWeight: 700, color: '#22c55e', marginTop: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ width: '10px', height: '10px', background: '#22c55e', borderRadius: '50%', boxShadow: '0 0 10px #22c55e' }}></span>
                            Operational
                        </div>
                        <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
                            All services running smoothly
                        </div>
                    </div>
                    <div style={{
                        width: '48px', height: '48px',
                        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(21, 128, 61, 0.2))',
                        borderRadius: '12px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#4ade80'
                    }}>
                        <FaChartLine size={24} />
                    </div>
                </div>
            </div>

            {/* Recent Clubs Section */}
            <div className="glass-panel" style={{ padding: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: 'var(--text-main)' }}>Recently Onboarded Clubs</h2>
                    <button
                        onClick={() => navigate('/clubs')}
                        className="premium-btn"
                        style={{ fontSize: '13px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                        View All <FaArrowRight size={10} />
                    </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                                <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', fontWeight: 600 }}>Club Name</th>
                                <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', fontWeight: 600 }}>Location</th>
                                <th style={{ textAlign: 'left', padding: '16px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', fontWeight: 600 }}>Joined Date</th>
                                <th style={{ textAlign: 'right', padding: '16px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', fontWeight: 600 }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats?.recentClubs.map((club) => (
                                <tr key={club.id} style={{ borderBottom: '1px solid var(--border-glass)', transition: 'background 0.2s' }}>
                                    <td style={{ padding: '16px', color: 'var(--text-main)', fontWeight: 500 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            {club.logoUrl ? (
                                                <img src={club.logoUrl} alt={club.name} style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--bg-glass-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 }}>
                                                    {club.name.substring(0, 2).toUpperCase()}
                                                </div>
                                            )}
                                            {club.name}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px', color: 'var(--text-muted)' }}>
                                        {club.city}, {club.country}
                                    </td>
                                    <td style={{ padding: '16px', color: 'var(--text-muted)' }}>
                                        {new Date(club.createdAt).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '16px', textAlign: 'right' }}>
                                        <button
                                            onClick={() => navigate(`/clubs`)}
                                            className="icon-btn"
                                            title="View Details"
                                        >
                                            <FaArrowRight />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {stats?.recentClubs.length === 0 && (
                                <tr>
                                    <td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        No recent club activity found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
