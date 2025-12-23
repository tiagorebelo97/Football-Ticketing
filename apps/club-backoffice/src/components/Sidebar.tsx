import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaThLarge, FaUsers, FaCalendarAlt, FaMapMarkerAlt, FaChartBar } from 'react-icons/fa';
import '../index.css';
import { useAuth } from '../context/AuthContext';

const Sidebar: React.FC = () => {
    const location = useLocation();
    const { club } = useAuth();

    const menuItems = [
        { path: '/', label: 'Dashboard', icon: <FaThLarge /> },
        { path: '/club-members', label: 'Club Members', icon: <FaUsers /> },
        { path: '/calendar', label: 'Calendar', icon: <FaCalendarAlt /> },
        { path: '/venues', label: 'Venues', icon: <FaMapMarkerAlt /> },
        { path: '/reports', label: 'Reports', icon: <FaChartBar /> },
    ];

    return (
        <div style={{
            width: 'var(--sidebar-width)',
            backgroundColor: 'var(--color-sidebar)',
            color: '#ecf0f1',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            position: 'fixed'
        }}>
            <div style={{
                padding: '20px',
                fontSize: '24px',
                fontWeight: 'bold',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {club?.logoUrl ? (
                    <img
                        src={club.logoUrl}
                        alt={`${club.name} logo`}
                        style={{ maxWidth: '100%', maxHeight: '60px', objectFit: 'contain' }}
                    />
                ) : (
                    <span style={{ color: 'white' }}>{club?.name || 'Club'}</span>
                )}
            </div>
            <nav style={{ flex: 1, padding: '20px 0' }}>
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '12px 24px',
                                textDecoration: 'none',
                                color: isActive ? 'var(--color-white)' : 'var(--color-text-light)',
                                backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
                                borderLeft: isActive ? '4px solid var(--color-primary-dark)' : '4px solid transparent',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <span style={{ marginRight: '12px' }}>{item.icon}</span>
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
};

export default Sidebar;
