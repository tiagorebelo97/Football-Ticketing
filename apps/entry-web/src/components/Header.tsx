import React from 'react';
import { FaQrcode, FaChartBar } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
    return (
        <header style={{
            height: 'var(--header-height)',
            backgroundColor: 'var(--color-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            position: 'fixed',
            left: 0,
            right: 0,
            top: 0,
            zIndex: 100,
            color: 'white'
        }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ fontWeight: 'bold', fontSize: '18px', display: 'flex', alignItems: 'center' }}>
                    <FaQrcode style={{ marginRight: '10px' }} /> Entry Scanner
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <Link to="/capacity" style={{ color: 'white', opacity: 0.8, textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                    <FaChartBar style={{ marginRight: '6px' }} /> Capacity
                </Link>
            </div>
        </header>
    );
};

export default Header;
