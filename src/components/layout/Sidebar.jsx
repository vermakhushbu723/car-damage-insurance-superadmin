import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SafetyCertificateFilled } from '@ant-design/icons';
import { SIDEBAR_ITEMS, SIDEBAR_FOOTER_ITEMS, isDashboardRoute } from '../../constants/navigation';
import { COLORS } from '../../constants/theme';
import { ROUTES } from '../../constants/routes';

const NavItem = ({ item, isActive, onNavigate }) => {
    const Icon = item.icon;
    return (
        <button
            type="button"
            onClick={() => onNavigate(item.path)}
            className="flex items-center gap-3 w-full text-left transition-colors"
            style={{
                padding: '11px 20px',
                color: '#fff',
                background: isActive ? COLORS.sidebarItemActiveBg : 'transparent',
                borderRadius: isActive ? 8 : 0,
                margin: isActive ? '0 12px' : 0,
                width: isActive ? 'calc(100% - 24px)' : '100%',
                fontWeight: isActive ? 600 : 500,
                fontSize: 15,
            }}
        >
            <Icon style={{ fontSize: 18 }} />
            <span>{item.label}</span>
        </button>
    );
};

/**
 * Left navigation rail -- shared across every authenticated page.
 * `onNavigateItem` lets AppLayout close a mobile drawer after a click.
 */
const Sidebar = ({ onNavigateItem }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleNavigate = (path) => {
        navigate(path);
        onNavigateItem?.();
    };

    const isItemActive = (item) => {
        if (item.key === 'dashboard') return isDashboardRoute(location.pathname);
        return location.pathname.startsWith(item.path);
    };

    return (
        <div className="h-full flex flex-col" style={{ background: COLORS.sidebarBg }}>
            {/* Brand */}
            <button
                type="button"
                onClick={() => handleNavigate(ROUTES.HOME)}
                className="flex items-center gap-2 shrink-0"
                style={{ padding: '22px 20px', color: '#fff' }}
            >
                <SafetyCertificateFilled style={{ fontSize: 24 }} />
                <span className="font-bold text-lg tracking-tight">IBima Admin</span>
            </button>

            <nav className="flex-1 overflow-y-auto flex flex-col gap-1 pt-2">
                {SIDEBAR_ITEMS.map((item) => (
                    <NavItem key={item.key} item={item} isActive={isItemActive(item)} onNavigate={handleNavigate} />
                ))}
            </nav>

            <div className="flex flex-col gap-1 pb-6 pt-2 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.15)' }}>
                {SIDEBAR_FOOTER_ITEMS.map((item) => (
                    <NavItem key={item.key} item={item} isActive={isItemActive(item)} onNavigate={handleNavigate} />
                ))}
            </div>
        </div>
    );
};

export default Sidebar;
