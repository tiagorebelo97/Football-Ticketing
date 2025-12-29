import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StatCard from '../components/dashboard/StatCard';
import ActivityChart from '../components/dashboard/ActivityChart';
import Inbox from '../components/dashboard/Inbox';
import NewMembersList from '../components/dashboard/NewMembersList';
import { useAuth } from '../context/AuthContext';

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
        padding: '10px',
        borderRadius: '8px',
        border: 'none',
        background: '#fff',
        fontSize: '14px',
        fontWeight: 500,
        color: '#000000', // Explicit black
        flex: 1,
        // Ensure browser default styles don't override color
        WebkitTextFillColor: '#000000',
        opacity: 1
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ marginBottom: '20px' }}>
                <h1 style={{ margin: 0, color: '#ffffff' }}>Welcome, {user?.name || 'Admin'}!</h1>
            </div>

            {/* Top Controls */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '10px' }}>
                <select className="dropdown-control" style={{ ...dropdownStyle, flex: 2 }}>
                    <option style={{ color: '#000000' }}>Football / Basketball / Volleyball / Futsal / Hockey</option>
                </select>
                <select className="dropdown-control" style={dropdownStyle}>
                    <option style={{ color: '#000000' }}>Membership / Tickets</option>
                </select>
                <select className="dropdown-control" style={dropdownStyle}>
                    <option style={{ color: '#000000' }}>Total / Revenue / Percentage</option>
                </select>
            </div>

            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                <StatCard
                    title="Total Members"
                    value={loading ? "..." : stats?.members.total.toLocaleString() || "0"}
                />
                <StatCard
                    title="Upcoming Matches (30 Days)"
                    value={loading ? "..." : stats?.matches.upcoming.toString() || "0"}
                    trend={stats?.matches.trend}
                />
                <StatCard
                    title="Ticket Revenue"
                    value={loading ? "..." : formatCurrency(stats?.revenue.total || 0)}
                    trend={stats?.revenue.trend}
                />
            </div>

            {/* Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                {/* Left Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <ActivityChart data={stats?.activity} />
                </div>

                {/* Right Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <Inbox messages={stats?.notifications} />
                    <NewMembersList members={stats?.recentMembers} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
