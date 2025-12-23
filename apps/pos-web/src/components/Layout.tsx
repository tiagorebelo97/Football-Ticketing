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
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginLeft: 'var(--sidebar-width)' }}>
                {staffInfo && onLogout && <Header staffInfo={staffInfo} onLogout={onLogout} />}
                <main style={{
                    flex: 1,
                    padding: '20px',
                    marginTop: 'var(--header-height)',
                    backgroundColor: 'var(--color-background)',
                    overflowY: 'auto'
                }}>
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
