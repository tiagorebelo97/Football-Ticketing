import React from 'react';

const Header: React.FC = () => {
    return (
        <header style={{
            height: 'var(--header-height)',
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            position: 'fixed',
            left: 0,
            right: 0,
            top: 0,
            zIndex: 100
        }}>
            <div style={{ fontWeight: 'bold', fontSize: '18px' }}>
                ⚽ Football Fan App
            </div>
        </header>
    );
};

export default Header;
