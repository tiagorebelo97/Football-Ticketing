import React from 'react';
import Header from './Header';
import BottomNav from './BottomNav';

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
                paddingBottom: '20px',
                maxWidth: '600px',
                margin: '0 auto',
                width: '100%'
            }}>
                {children}
            </main>
            <BottomNav />
        </div>
    );
};

export default Layout;
