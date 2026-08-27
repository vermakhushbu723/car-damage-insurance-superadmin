import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Drawer } from 'antd';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { COLORS } from '../../constants/theme';

const SIDEBAR_WIDTH = 260;

/**
 * Shell for every authenticated screen: a fixed-width sidebar on desktop
 * (collapses into a Drawer below the `lg` breakpoint) + topbar + scrollable
 * content area rendering the active route via <Outlet />.
 */
const AppLayout = () => {
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    return (
        <div className="flex h-screen w-full overflow-hidden" style={{ background: COLORS.bgApp }}>
            {/* Desktop sidebar */}
            <div className="hidden lg:block shrink-0" style={{ width: SIDEBAR_WIDTH }}>
                <Sidebar />
            </div>

            {/* Mobile sidebar drawer */}
            <Drawer
                placement="left"
                open={mobileNavOpen}
                onClose={() => setMobileNavOpen(false)}
                closable={false}
                size={SIDEBAR_WIDTH}
                styles={{ body: { padding: 0 } }}
            >
                <Sidebar onNavigateItem={() => setMobileNavOpen(false)} />
            </Drawer>

            <div className="flex-1 flex flex-col min-w-0">
                <Topbar onMenuClick={() => setMobileNavOpen(true)} />
                <div className="flex-1 overflow-y-auto">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AppLayout;
