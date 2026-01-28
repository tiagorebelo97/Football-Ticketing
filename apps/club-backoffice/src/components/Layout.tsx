import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-space)' }}>
            <div className="animated-bg" />
            <Sidebar
                onCollapsedChange={setSidebarCollapsed}
                mobileOpen={mobileOpen}
                onMobileClose={() => setMobileOpen(false)}
            />
            <div className="layout-content-wrapper" style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                marginLeft: isMobile ? 0 : (sidebarCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)'),
                transition: 'margin 0.3s ease',
                minWidth: 0 // Prevent flex-item from overflowing
            }}>
                <Header
                    sidebarCollapsed={sidebarCollapsed}
                    onMobileToggle={() => setMobileOpen(!mobileOpen)}
                />
                <main className="main-content" style={{
                    flex: 1,
                    padding: 'var(--content-padding) var(--content-padding) 80px var(--content-padding)',
                    marginTop: 'var(--header-height)',
                    overflowY: 'auto',
                    overflowX: 'hidden'
                }}>
                    <div style={{ maxWidth: 'var(--main-max-width)', margin: '0 auto' }}>
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
