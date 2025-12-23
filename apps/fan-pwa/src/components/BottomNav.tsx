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
        <nav style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: 'var(--bottom-nav-height)',
            backgroundColor: 'var(--color-white)',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
            zIndex: 100
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
                            color: isActive ? 'var(--color-primary)' : 'var(--color-text-light)',
                            fontSize: '12px',
                            fontWeight: 500
                        }}
                    >
                        <span style={{ fontSize: '20px', marginBottom: '4px' }}>{item.icon}</span>
                        {item.label}
                    </Link>
                );
            })}
        </nav>
    );
};

export default BottomNav;
