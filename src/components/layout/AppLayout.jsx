import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Drawer } from 'antd';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { COLORS } from '../../constants/theme';

const SIDEBAR_WIDTH = 260;
const SIDEBAR_WIDTH_COLLAPSED = 80;
const COLLAPSE_STORAGE_KEY = 'superadmin_sidebar_collapsed';

const readStoredCollapsed = () => {
    try {
        return localStorage.getItem(COLLAPSE_STORAGE_KEY) === 'true';
    } catch {
        return false;
    }
};

/**
 * Shell for every authenticated screen: a fixed-width sidebar on desktop
 * (collapsible to an icon-only rail via Topbar's toggle, remembers the
 * choice in localStorage; collapses into a Drawer below the `lg`
 * breakpoint on mobile instead) + topbar + scrollable content area
 * rendering the active route via <Outlet />.
 */
const AppLayout = () => {
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(readStoredCollapsed);

    const toggleCollapsed = () => {
        setCollapsed((prev) => {
            const next = !prev;
            try {
                localStorage.setItem(COLLAPSE_STORAGE_KEY, String(next));
            } catch {
                /* ignore quota / disabled-storage errors */
            }
            return next;
        });
    };

    return (
        <div className="flex h-screen w-full overflow-hidden" style={{ background: COLORS.bgApp }}>
            {/* Desktop sidebar -- width animates between full and icon-only. */}
            <div
                className="hidden lg:block shrink-0"
                style={{ width: collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH, transition: 'width 0.2s ease' }}
            >
                <Sidebar collapsed={collapsed} />
            </div>

            {/* Mobile sidebar drawer -- always full width/labels, it's already an overlay. */}
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
                <Topbar onMenuClick={() => setMobileNavOpen(true)} collapsed={collapsed} onToggleCollapsed={toggleCollapsed} />
                <div className="flex-1 overflow-y-auto">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AppLayout;
