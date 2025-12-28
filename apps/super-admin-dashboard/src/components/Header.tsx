import { useAuth } from '../context/AuthContext';
import { FaSignOutAlt, FaRocket } from 'react-icons/fa';

const Header: React.FC = () => {
    const { logout } = useAuth();

    return (
        <header className="glass-effect" style={{
            height: 'var(--header-height)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 40px',
            position: 'relative',
            zIndex: 900,
            borderBottom: '1px solid var(--border-glass)',
            flexShrink: 0
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                    padding: '8px',
                    borderRadius: '12px',
                    background: 'rgba(79, 172, 254, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <FaRocket style={{ color: 'var(--accent-secondary)', fontSize: '18px' }} />
                </div>
                <div>
                    <h2 className="font-premium" style={{ fontSize: '18px', fontWeight: 600 }}>Platform Control Center</h2>
                    <p style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px' }}>Version 2.4.0 • System Stable</p>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <button
                    onClick={logout}
                    className="premium-btn premium-btn-secondary"
                    style={{ padding: '8px 16px', fontSize: '13px' }}
                >
                    <FaSignOutAlt />
                    Logout
                </button>
            </div>
        </header>
    );
};

export default Header;
