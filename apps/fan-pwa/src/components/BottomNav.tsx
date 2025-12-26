import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaCalendarAlt, FaTicketAlt } from 'react-icons/fa';

const BottomNav: React.FC = () => {
    const location = useLocation();

    const menuItems = [
        { path: '/', label: 'Matches', icon: <FaCalendarAlt /> },
        { path: '/my-tickets', label: 'My Tickets', icon: <FaTicketAlt /> },
    ];

    return (
        <nav className="glass-effect" style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: 'var(--bottom-nav-height)',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            zIndex: 100,
            borderTop: '1px solid var(--border-glass)'
        }}>
            {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                    <Link
                        key={item.path}
                        to={item.path}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textDecoration: 'none',
                            color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
                            fontSize: '12px',
                            fontWeight: 600,
                            padding: '8px 24px',
                            borderRadius: 'var(--radius-sm)',
                            background: isActive ? 'rgba(0, 242, 254, 0.08)' : 'transparent',
                            transition: 'var(--transition-smooth)'
                        }}
                    >
                        <span style={{ fontSize: '22px', marginBottom: '4px' }}>{item.icon}</span>
                        {item.label}
                    </Link>
                );
            })}
        </nav>
    );
};

export default BottomNav;
