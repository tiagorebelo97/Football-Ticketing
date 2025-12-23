import React from 'react';
import Header from './Header';
import BottomNav from './BottomNav';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <main style={{
                flex: 1,
                padding: '20px',
                marginTop: 'var(--header-height)',
                paddingBottom: '20px' // Extra padding is handled by body padding-bottom for fixed nav
            }}>
                {children}
            </main>
            <BottomNav />
        </div>
    );
};

export default Layout;
