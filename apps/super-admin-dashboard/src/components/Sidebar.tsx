import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaGlobe, FaBuilding, FaMapMarkerAlt, FaTrophy, FaCalendarAlt, FaUsers, FaCog, FaTh, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
    isCollapsed: boolean;
    toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, toggleSidebar }) => {
    const location = useLocation();
    const { user, logout } = useAuth();
    // Removed local state: const [isCollapsed, setIsCollapsed] = React.useState(false);

    const menuItems = [
        { path: '/', label: 'Dashboard', icon: <FaTh /> },
        { path: '/countries', label: 'Countries', icon: <FaGlobe /> },
        { path: '/clubs', label: 'Clubs', icon: <FaBuilding /> },
        { path: '/venues', label: 'Venues', icon: <FaMapMarkerAlt /> },
        { path: '/competitions', label: 'Competitions', icon: <FaTrophy /> },
        { path: '/seasons', label: 'Seasons', icon: <FaCalendarAlt /> },
        { path: '/settings', label: 'Settings', icon: <FaCog /> },
    ];

    if (user?.role === 'super_admin') {
        menuItems.push({ path: '/users', label: 'Users', icon: <FaUsers /> });
    }

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
            {/* Logo and Branding Section */}
            <div style={{ 
                padding: isCollapsed ? '32px 0' : '32px 24px', 
                marginBottom: '16px', 
                position: 'relative', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: isCollapsed ? 'center' : 'flex-start',
                gap: '12px'
            }}>
                <button
                    onClick={toggleSidebar}
                    style={{
                        position: 'absolute',
                        right: isCollapsed ? '50%' : '20px',
                        top: '20px',
                        transform: isCollapsed ? 'translateX(50%)' : 'none',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: '16px',
                        outline: 'none',
                        transition: 'var(--transition-smooth)'
                    }}
                >
                    {isCollapsed ? '»' : '«'}
                </button>

                {!isCollapsed ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--bg-space)',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            flexShrink: 0
                        }}>
                            <FaTh />
                        </div>
                        <div>
                            <h1 className="text-gradient" style={{ 
                                fontSize: '20px', 
                                fontWeight: 700, 
                                letterSpacing: '0.02em',
                                marginBottom: '2px'
                            }}>
                                Antigravity
                            </h1>
                            <p style={{ 
                                fontSize: '11px', 
                                color: 'var(--text-dim)', 
                                textTransform: 'uppercase', 
                                letterSpacing: '1px',
                                fontWeight: 500
                            }}>
                                Super Admin
                            </p>
                        </div>
                    </div>
                ) : (
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--bg-space)',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        marginTop: '8px'
                    }}>
                        <FaTh />
                    </div>
                )}
            </div>

            {/* Navigation Menu */}
            <nav style={{ flex: 1, padding: '0 16px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ flex: 1 }}>
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path || 
                            (item.path !== '/' && location.pathname.startsWith(item.path + '/'));
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                title={isCollapsed ? item.label : ''}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                                    padding: isCollapsed ? '14px 0' : '14px 16px',
                                    textDecoration: 'none',
                                    borderRadius: 'var(--radius-md)',
                                    color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
                                    background: isActive ? 'rgba(0, 0, 0, 0.3)' : 'transparent',
                                    marginBottom: '8px',
                                    transition: 'var(--transition-smooth)',
                                    fontWeight: isActive ? 600 : 500,
                                    fontSize: '15px',
                                    position: 'relative'
                                }}
                                className="nav-link"
                                onMouseEnter={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.background = 'transparent';
                                    }
                                }}
                            >
                                <span style={{ 
                                    marginRight: isCollapsed ? 0 : '14px', 
                                    fontSize: '20px', 
                                    display: 'flex',
                                    opacity: isActive ? 1 : 0.7
                                }}>
                                    {item.icon}
                                </span>
                                {!isCollapsed && <span>{item.label}</span>}
                            </Link>
                        );
                    })}
                </div>

                {/* Logout Button */}
                <button
                    onClick={logout}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: isCollapsed ? 'center' : 'flex-start',
                        padding: isCollapsed ? '14px 0' : '14px 16px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid var(--border-glass)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-main)',
                        cursor: 'pointer',
                        transition: 'var(--transition-smooth)',
                        fontWeight: 600,
                        fontSize: '15px',
                        fontFamily: 'inherit',
                        marginBottom: '20px',
                        width: '100%'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                        e.currentTarget.style.borderColor = 'var(--border-glass)';
                    }}
                >
                    <span style={{ 
                        marginRight: isCollapsed ? 0 : '14px', 
                        fontSize: '18px', 
                        display: 'flex'
                    }}>
                        <FaSignOutAlt />
                    </span>
                    {!isCollapsed && <span>Logout</span>}
                </button>
            </nav>
        </div>
    );
};

export default Sidebar;
