import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaGlobe, FaBuilding, FaMapMarkerAlt, FaTrophy, FaCalendarAlt, FaUsers, FaCog } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
    isCollapsed: boolean;
    toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, toggleSidebar }) => {
    const location = useLocation();
    const { user } = useAuth();
    // Removed local state: const [isCollapsed, setIsCollapsed] = React.useState(false);

    const menuItems = [
        { path: '/countries', label: 'Countries', icon: <FaGlobe /> },
        { path: '/clubs', label: 'Clubs', icon: <FaBuilding /> },
        { path: '/venues', label: 'Venues', icon: <FaMapMarkerAlt /> },
        { path: '/competitions', label: 'Competitions', icon: <FaTrophy /> },
        { path: '/seasons', label: 'Seasons', icon: <FaCalendarAlt /> },
    ];

    if (user?.role === 'super_admin') {
        menuItems.push({ path: '/users', label: 'Users', icon: <FaUsers /> });
        menuItems.push({ path: '/settings', label: 'Settings', icon: <FaCog /> });
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
            <div style={{ padding: isCollapsed ? '20px 0' : '32px', marginBottom: '10px', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: isCollapsed ? 'center' : 'flex-start' }}>
                <button
                    onClick={toggleSidebar}
                    style={{
                        position: 'absolute',
                        right: isCollapsed ? 'auto' : '20px',
                        top: '20px',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: '16px',
                        outline: 'none'
                    }}
                >
                    {isCollapsed ? '»' : '«'}
                </button>

                {!isCollapsed && (
                    <>
                        <h1 className="text-gradient" style={{ fontSize: '22px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            Antigravity
                        </h1>
                        <p style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '2px' }}>
                            Super Admin Portal
                        </p>
                    </>
                )}
                {isCollapsed && (
                    <h1 className="text-gradient" style={{ fontSize: '22px', fontWeight: 800, marginTop: '30px' }}>
                        AG
                    </h1>
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
                            <span style={{ marginRight: isCollapsed ? 0 : '16px', fontSize: '18px', display: 'flex' }}>{item.icon}</span>
                            {!isCollapsed && <span style={{ fontWeight: isActive ? 600 : 500, fontSize: '15px' }}>{item.label}</span>}
                        </Link>
                    );
                })}
            </nav>

            <div style={{ padding: isCollapsed ? '16px' : '24px', borderTop: '1px solid var(--border-glass)' }}>
                <div className="glass-card" style={{ padding: '12px', display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'flex-start', gap: '12px', background: 'rgba(255,255,255,0.02)' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--accent-vibrant)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', flexShrink: 0 }}>
                        {user?.email[0].toUpperCase()}
                    </div>
                    {!isCollapsed && (
                        <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Administrator</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
