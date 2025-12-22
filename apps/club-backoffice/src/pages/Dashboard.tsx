import React from 'react';
import StatCard from '../components/dashboard/StatCard';
import ActivityChart from '../components/dashboard/ActivityChart';
import Inbox from '../components/dashboard/Inbox';
import NewMembersList from '../components/dashboard/NewMembersList';

const Dashboard: React.FC = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Top Controls */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '10px' }}>
                <select className="dropdown-control" style={{ padding: '10px', borderRadius: '8px', border: 'none', background: '#fff', fontSize: '14px', fontWeight: 500, color: 'var(--color-text)', flex: 2 }}>
                    <option>Football / Basketball / Volleyball / Futsal / Hockey</option>
                </select>
                <select className="dropdown-control" style={{ padding: '10px', borderRadius: '8px', border: 'none', background: '#fff', fontSize: '14px', fontWeight: 500, color: 'var(--color-text)', flex: 1 }}>
                    <option>Membership / Tickets</option>
                </select>
                <select className="dropdown-control" style={{ padding: '10px', borderRadius: '8px', border: 'none', background: '#fff', fontSize: '14px', fontWeight: 500, color: 'var(--color-text)', flex: 1 }}>
                    <option>Total / Revenue / Percentage</option>
                </select>
            </div>

            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                <StatCard title="Club Members" value="100.568" />
                <StatCard title="New Members Today" value="10" trend={{ value: 5, isPositive: true }} />
                <StatCard title="New Members This Month" value="123" trend={{ value: 5, isPositive: true }} />
            </div>

            {/* Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                {/* Left Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <ActivityChart />
                </div>

                {/* Right Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <Inbox />
                    <NewMembersList />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
