import React from 'react';
import { FaTicketAlt } from 'react-icons/fa';

const Header: React.FC = () => {
    return (
        <header className="glass-effect" style={{
            height: 'var(--header-height)',
            color: 'var(--text-main)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 20px',
            position: 'fixed',
            left: 0,
            right: 0,
            top: 0,
            zIndex: 100,
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
                    <FaTicketAlt style={{ color: 'var(--accent-secondary)', fontSize: '20px' }} />
                </div>
                <h1 className="text-gradient" style={{ fontWeight: 800, fontSize: '20px', letterSpacing: '0.05em' }}>
                    Football Tickets
                </h1>
            </div>
        </header>
    );
};

export default Header;
