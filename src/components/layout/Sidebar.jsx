import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Tooltip } from 'antd';
import { SafetyCertificateFilled } from '@ant-design/icons';
import { SIDEBAR_ITEMS, SIDEBAR_FOOTER_ITEMS, isDashboardRoute } from '../../constants/navigation';
import { COLORS } from '../../constants/theme';
import { ROUTES } from '../../constants/routes';

const NavItem = ({ item, isActive, collapsed, onNavigate }) => {
    const Icon = item.icon;
    const button = (
        <button
            type="button"
            onClick={() => onNavigate(item.path)}
            className="flex items-center transition-colors"
            style={{
                gap: collapsed ? 0 : 12,
                padding: collapsed ? '11px 0' : '11px 20px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                color: '#fff',
                background: isActive ? COLORS.sidebarItemActiveBg : 'transparent',
                borderRadius: isActive ? 8 : 0,
                margin: isActive ? (collapsed ? '0 12px' : '0 12px') : 0,
                width: isActive ? `calc(100% - 24px)` : '100%',
                fontWeight: isActive ? 600 : 500,
                fontSize: 15,
            }}
        >
            <Icon style={{ fontSize: 18, flexShrink: 0 }} />
            {!collapsed && <span className="whitespace-nowrap overflow-hidden">{item.label}</span>}
        </button>
    );

    // Icon-only rail needs the label somewhere -- a tooltip on hover.
    return collapsed ? <Tooltip title={item.label} placement="right">{button}</Tooltip> : button;
};

/**
 * Left navigation rail -- shared across every authenticated page.
 * `collapsed` renders an icon-only rail (desktop only, see AppLayout's
 * toggle); `onNavigateItem` lets AppLayout close a mobile drawer after a
 * click.
 */
const Sidebar = ({ collapsed = false, onNavigateItem }) => {
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
        <div className="h-full flex flex-col overflow-hidden" style={{ background: COLORS.sidebarBg }}>
            {/* Brand */}
            <button
                type="button"
                onClick={() => handleNavigate(ROUTES.HOME)}
                className="flex items-center shrink-0"
                style={{ gap: collapsed ? 0 : 8, padding: collapsed ? '22px 0' : '22px 20px', justifyContent: collapsed ? 'center' : 'flex-start', color: '#fff' }}
            >
                <SafetyCertificateFilled style={{ fontSize: 24, flexShrink: 0 }} />
                {!collapsed && <span className="font-bold text-lg tracking-tight whitespace-nowrap">IBima Admin</span>}
            </button>

            <nav className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col gap-1 pt-2">
                {SIDEBAR_ITEMS.map((item) => (
                    <NavItem key={item.key} item={item} isActive={isItemActive(item)} collapsed={collapsed} onNavigate={handleNavigate} />
                ))}
            </nav>

            <div className="flex flex-col gap-1 pb-6 pt-2 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.15)' }}>
                {SIDEBAR_FOOTER_ITEMS.map((item) => (
                    <NavItem key={item.key} item={item} isActive={isItemActive(item)} collapsed={collapsed} onNavigate={handleNavigate} />
                ))}
            </div>
        </div>
    );
};

export default Sidebar;
