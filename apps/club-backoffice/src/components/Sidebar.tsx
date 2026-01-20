import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaThLarge, FaUsers, FaCalendarAlt, FaMapMarkerAlt, FaChartBar, FaUsersCog, FaCog, FaBars } from 'react-icons/fa';
import '../index.css';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
    onCollapsedChange?: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onCollapsedChange }) => {
    const location = useLocation();
    const { club, user } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleCollapsed = () => {
        const newCollapsed = !isCollapsed;
        setIsCollapsed(newCollapsed);
        onCollapsedChange?.(newCollapsed);
    };

    // Auto-retract when entering stadium architect
    React.useEffect(() => {
        const handleAutoRetract = () => {
            if (!isCollapsed) {
                setIsCollapsed(true);
                onCollapsedChange?.(true);
            }
        };

        window.addEventListener('stadium-architect-opened', handleAutoRetract);
        return () => window.removeEventListener('stadium-architect-opened', handleAutoRetract);
    }, [isCollapsed, onCollapsedChange]);

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
            width: isCollapsed ? '80px' : 'var(--sidebar-width)',
            color: 'var(--text-main)',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            position: 'fixed',
            zIndex: 1000,
            overflow: 'hidden',
            transition: 'width 0.3s ease'
        }}>
            {/* Toggle Button */}
            <button
                onClick={toggleCollapsed}
                style={{
                    position: 'absolute',
                    top: '20px',
                    right: isCollapsed ? '50%' : '20px',
                    transform: isCollapsed ? 'translateX(50%)' : 'none',
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontSize: '18px',
                    zIndex: 10
                }}
                className="glass-effect"
            >
                <FaBars />
            </button>

            <div style={{
                padding: isCollapsed ? '70px 0 20px' : '60px 32px 20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease'
            }}>
                {club?.logoUrl && (
                    <img
                        src={club.logoUrl}
                        alt={`${club.name} logo`}
                        style={{
                            maxWidth: isCollapsed ? '44px' : '80%',
                            maxHeight: isCollapsed ? '44px' : '80px',
                            objectFit: 'contain',
                            display: 'block',
                            transition: 'all 0.3s ease'
                        }}
                    />
                )}
                {!isCollapsed && (
                    <>
                        <h2 style={{
                            fontSize: '16px',
                            fontWeight: 700,
                            marginTop: '12px',
                            color: 'var(--text-main)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>
                            {club?.name || 'Club'}
                        </h2>
                        <p style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '2px' }}>
                            Club Backoffice
                        </p>
                    </>
                )}
            </div>

            <nav style={{ flex: 1, padding: '0 16px' }}>
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            title={isCollapsed ? item.label : ''}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: isCollapsed ? 'center' : 'flex-start',
                                padding: isCollapsed ? '14px 10px' : '14px 20px',
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
                            <span style={{ marginRight: isCollapsed ? '0' : '16px', fontSize: '18px', display: 'flex' }}>{item.icon}</span>
                            {!isCollapsed && <span style={{ fontWeight: isActive ? 600 : 500, fontSize: '15px' }}>{item.label}</span>}
                        </Link>
                    );
                })}
            </nav>

            <div style={{
                padding: isCollapsed ? '20px 0' : '24px',
                borderTop: '1px solid var(--border-glass)',
                display: 'flex',
                justifyContent: 'center'
            }}>
                <div className={isCollapsed ? "" : "glass-card"} style={{
                    padding: isCollapsed ? '0' : '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: isCollapsed ? '0' : '12px',
                    background: isCollapsed ? 'transparent' : 'rgba(255,255,255,0.02)',
                    borderRadius: isCollapsed ? '0' : '12px',
                    width: isCollapsed ? 'auto' : '100%',
                    justifyContent: isCollapsed ? 'center' : 'flex-start'
                }}>
                    <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: 'var(--accent-vibrant)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        boxShadow: isCollapsed ? '0 0 15px rgba(0, 242, 254, 0.3)' : 'none',
                        transition: 'all 0.3s ease'
                    }}>
                        {user?.email?.[0]?.toUpperCase() || 'A'}
                    </div>
                    {!isCollapsed && (
                        <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email || 'Admin'}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Club Administrator</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
