import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaThLarge, FaUsers, FaCalendarAlt, FaMapMarkerAlt, FaChartBar, FaUsersCog } from 'react-icons/fa';
import { FaThLarge, FaUsers, FaCalendarAlt, FaMapMarkerAlt, FaChartBar, FaCog } from 'react-icons/fa';
import '../index.css';
import { useAuth } from '../context/AuthContext';

const Sidebar: React.FC = () => {
    const location = useLocation();
    const { club, user } = useAuth();

    const menuItems = [
        { path: '/', label: 'Dashboard', icon: <FaThLarge /> },
        { path: '/members', label: 'Club Members', icon: <FaUsers /> },
        { path: '/calendar', label: 'Calendar', icon: <FaCalendarAlt /> },
        { path: '/venues', label: 'Venues', icon: <FaMapMarkerAlt /> },
        { path: '/reports', label: 'Reports', icon: <FaChartBar /> },
        { path: '/user-management', label: 'User Management', icon: <FaUsersCog /> },
        { path: '/settings', label: 'Settings', icon: <FaCog /> },
    ];

    return (
        <div className="glass-effect" style={{
            width: 'var(--sidebar-width)',
            color: 'var(--text-main)',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            position: 'fixed',
            zIndex: 1000,
            overflow: 'hidden'
        }}>
            <div style={{ padding: '32px', marginBottom: '10px', textAlign: 'center' }}>
                {club?.logoUrl ? (
                    <img
                        src={club.logoUrl}
                        alt={`${club.name} logo`}
                        style={{ maxWidth: '80%', maxHeight: '80px', objectFit: 'contain', marginBottom: '16px' }}
                    />
                ) : (
                    <h1 className="text-gradient" style={{ fontSize: '22px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        {club?.name || 'Club'}
                    </h1>
                )}
                <p style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '2px' }}>
                    Club Backoffice
                </p>
            </div>

            <nav style={{ flex: 1, padding: '0 16px' }}>
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '14px 20px',
                                textDecoration: 'none',
                                borderRadius: 'var(--radius-sm)',
                                color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
                                background: isActive ? 'rgba(0, 242, 254, 0.08)' : 'transparent',
                                marginBottom: '8px',
                                transition: 'var(--transition-smooth)',
                                position: 'relative'
                            }}
                            className="nav-link"
                        >
                            {isActive && (
                                <div style={{
                                    position: 'absolute',
                                    left: 0,
                                    height: '20px',
                                    width: '3px',
                                    background: 'var(--accent-primary)',
                                    borderRadius: '0 4px 4px 0'
                                }} />
                            )}
                            <span style={{ marginRight: '16px', fontSize: '18px', display: 'flex' }}>{item.icon}</span>
                            <span style={{ fontWeight: isActive ? 600 : 500, fontSize: '15px' }}>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div style={{ padding: '24px', borderTop: '1px solid var(--border-glass)' }}>
                <div className="glass-card" style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.02)' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--accent-vibrant)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                        {user?.email?.[0]?.toUpperCase() || 'A'}
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email || 'Admin'}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Club Administrator</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
