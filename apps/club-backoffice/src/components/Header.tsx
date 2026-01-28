import React from 'react';
import { useTranslation } from 'react-i18next';
import { FaSignOutAlt, FaBuilding, FaBars, FaSun, FaMoon } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import LanguageSwitcher from './LanguageSwitcher';

interface HeaderProps {
    sidebarCollapsed?: boolean;
    onMobileToggle?: () => void;
}

const Header: React.FC<HeaderProps> = ({ sidebarCollapsed = false, onMobileToggle }) => {
    const { t } = useTranslation();
    const { logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 768);

    React.useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <header className="glass-effect header-premium" style={{
            height: 'var(--header-height)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 40px',
            position: 'fixed',
            left: isMobile ? 0 : (sidebarCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)'),
            right: 0,
            top: 0,
            zIndex: 900,
            borderBottom: '1px solid var(--border-glass)',
            transition: 'all 0.3s ease'
        }}>
            <button
                onClick={onMobileToggle}
                className="glass-effect"
                style={{
                    display: 'none', // Hidden by default, shown via media query in CSS or logic
                    padding: '8px',
                    borderRadius: '8px',
                    border: 'none',
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                    fontSize: '20px',
                    marginRight: '16px'
                }}
                id="header-mobile-toggle"
            >
                <FaBars />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                <div style={{
                    padding: '8px',
                    borderRadius: '12px',
                    background: 'rgba(79, 172, 254, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <FaBuilding style={{ color: 'var(--accent-secondary)', fontSize: '18px' }} />
                </div>
                <div>
                    <h2 className="font-premium" style={{ fontSize: '18px', fontWeight: 600 }}>{t('header.title')}</h2>
                    <p style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('header.subtitle')}</p>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <LanguageSwitcher />
                <button
                    onClick={toggleTheme}
                    className="glass-effect"
                    style={{
                        padding: '8px',
                        borderRadius: '50%',
                        border: '1px solid var(--border-glass)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: theme === 'dark' ? '#fbbf24' : '#64748b',
                        background: theme === 'dark' ? 'rgba(251, 191, 36, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                        transition: 'all 0.3s ease'
                    }}
                >
                    {theme === 'dark' ? <FaSun size={16} /> : <FaMoon size={16} />}
                </button>

                <div style={{ width: '1px', height: '24px', background: 'var(--border-glass)' }}></div>

                <button
                    onClick={logout}
                    className="premium-btn premium-btn-secondary"
                    style={{ padding: '8px 16px', fontSize: '13px' }}
                >
                    <FaSignOutAlt />
                    {t('header.logout')}
                </button>
            </div>
        </header>
    );
};

export default Header;
