import React from 'react';
import { FaBars, FaUserShield } from 'react-icons/fa';

const Header: React.FC = () => {
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
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>
                    <FaBars />
                </button>
                <div style={{ marginLeft: '20px', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                    Platform Administration
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', color: 'var(--color-text-light)' }}>
                <FaUserShield size={24} style={{ color: 'var(--color-secondary)' }} />
            </div>
        </header>
    );
};

export default Header;
