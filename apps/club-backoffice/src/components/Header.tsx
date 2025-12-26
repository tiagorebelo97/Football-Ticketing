import React from 'react';
import { FaSignOutAlt, FaBuilding } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Header: React.FC = () => {
    const { logout } = useAuth();

    return (
        <header className="glass-effect" style={{
            height: 'var(--header-height)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 40px',
            position: 'fixed',
            left: 'var(--sidebar-width)',
            right: 0,
            top: 0,
            zIndex: 900,
            borderBottom: '1px solid var(--border-glass)'
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
                    <FaBuilding style={{ color: 'var(--accent-secondary)', fontSize: '18px' }} />
                </div>
                <div>
                    <h2 className="font-premium" style={{ fontSize: '18px', fontWeight: 600 }}>Club Control Panel</h2>
                    <p style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px' }}>Manage your club operations</p>
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
