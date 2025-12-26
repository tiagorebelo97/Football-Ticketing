import React from 'react';
import Header from './Header';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-space)' }}>
            <div className="animated-bg" />
            <Header />
            <main style={{
                flex: 1,
                padding: '20px',
                marginTop: 'var(--header-height)',
                overflowY: 'auto'
            }}>
                {children}
            </main>
        </div>
    );
};

export default Layout;
