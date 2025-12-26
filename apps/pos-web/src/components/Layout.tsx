import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
    children: React.ReactNode;
    staffInfo?: any;
    onLogout?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, staffInfo, onLogout }) => {
    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-space)' }}>
            <div className="animated-bg" />
            <Sidebar />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginLeft: 'var(--sidebar-width)', transition: 'margin 0.3s ease' }}>
                {staffInfo && onLogout && <Header staffInfo={staffInfo} onLogout={onLogout} />}
                <main style={{
                    flex: 1,
                    padding: '40px 40px 80px 40px',
                    marginTop: 'var(--header-height)',
                    overflowY: 'auto'
                }}>
                    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
