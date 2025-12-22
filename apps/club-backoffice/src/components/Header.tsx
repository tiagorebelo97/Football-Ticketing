import React from 'react';
import { FaBars, FaUserCircle, FaBell, FaCog } from 'react-icons/fa';

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
                <div style={{ marginLeft: '20px', fontWeight: 'bold' }}>
                    {/* Add logo image or text if needed in center as per design, currently keeping simple */}
                    <img src="https://upload.wikimedia.org/wikipedia/en/thumb/a/a2/SL_Benfica_logo.svg/1200px-SL_Benfica_logo.svg.png" alt="Logo" style={{ height: '40px' }} />
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', color: 'var(--color-text-light)' }}>
                <FaUserCircle size={24} style={{ color: '#dbaf35' }} /> {/* Approx avatar color from image */}
                <FaBell size={18} />
                <FaCog size={18} />
            </div>
        </header>
    );
};

export default Header;
