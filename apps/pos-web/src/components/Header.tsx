import React from 'react';
import { FaUserCircle, FaStore } from 'react-icons/fa';

interface HeaderProps {
    staffInfo: any;
    onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ staffInfo, onLogout }) => {
    return (
        <header style={{
            height: 'var(--header-height)',
            backgroundColor: 'var(--color-white)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            position: 'fixed',
            left: 'var(--sidebar-width)',
            right: 0,
            top: 0,
            zIndex: 100
        }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ marginLeft: '10px', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                    <FaStore style={{ marginRight: '8px' }} /> Point of Sale
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', color: 'var(--color-text-light)' }}>
                <span>{staffInfo?.name || 'Staff Member'}</span>
                <button
                    onClick={onLogout}
                    style={{
                        background: 'none',
                        border: '1px solid #eee',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        cursor: 'pointer',
                        color: 'var(--color-danger)'
                    }}
                >
                    Logout
                </button>
                <FaUserCircle size={24} style={{ color: 'var(--color-secondary)' }} />
            </div>
        </header>
    );
};

export default Header;
