import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Tooltip, Dropdown, Avatar, App } from 'antd';
import { DownOutlined, LogoutOutlined, ReloadOutlined, PlusOutlined } from '@ant-design/icons';
import ibimaLogo from '../../assets/images/ibimaLogo.svg';
import { SIDEBAR_GROUPS, isNavItemActive } from '../../constants/navigation';
import { COLORS } from '../../constants/theme';
import { ROUTES } from '../../constants/routes';
import { clearSuperAdminSession, getSuperAdminSession } from '../../auth/session';
import { useResetData } from '../../store/DataStore';

const NavItem = ({ item, isActive, collapsed, onNavigate }) => {
    const Icon = item.icon;
    const button = (
        <button
            type="button"
            onClick={() => onNavigate(item.path)}
            className="relative flex items-center w-full transition-colors hover:bg-white/10"
            style={{
                gap: collapsed ? 0 : 10,
                padding: collapsed ? '8px 0' : '6.5px 14px 6.5px 24px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                color: '#fff',
                background: isActive ? COLORS.sidebarItemActiveBg : undefined,
                borderRadius: isActive ? '0 6px 6px 0' : 0,
                fontWeight: 500,
                fontSize: 13,
            }}
        >
            {/* Left accent bar on the active item, as in the design. */}
            {isActive && <span className="absolute left-0 top-0 bottom-0" style={{ width: 4, background: '#fff', borderRadius: '0 3px 3px 0' }} />}
            <Icon style={{ fontSize: 16, flexShrink: 0 }} />
            {!collapsed && <span className="whitespace-nowrap overflow-hidden text-ellipsis">{item.label}</span>}
        </button>
    );
    return collapsed ? <Tooltip title={item.label} placement="right">{button}</Tooltip> : button;
};

/**
 * Left navigation -- logo + "+ Add More", grouped sections, and the
 * "Super Admin" profile card (logout / reset demo data) pinned at the
 * bottom. `collapsed` = icon-only rail (desktop); `onNavigateItem` lets
 * AppLayout close the mobile drawer after a click.
 */
const Sidebar = ({ collapsed = false, onNavigateItem }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { modal, message } = App.useApp();
    const resetData = useResetData();
    const session = getSuperAdminSession();

    const go = (path) => {
        navigate(path);
        onNavigateItem?.();
    };

    const profileMenu = {
        items: [
            { key: 'reset', icon: <ReloadOutlined />, label: 'Reset demo data' },
            { type: 'divider' },
            { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', danger: true },
        ],
        onClick: ({ key }) => {
            if (key === 'logout') {
                clearSuperAdminSession();
                navigate(ROUTES.LOGIN, { replace: true });
            }
            if (key === 'reset') {
                modal.confirm({
                    title: 'Reset demo data?',
                    content: 'All organizations, users and settings changed in this browser go back to the original sample data.',
                    okText: 'Reset',
                    onOk: () => {
                        resetData();
                        message.success('Demo data reset.');
                    },
                });
            }
        },
    };

    return (
        <div className="h-full flex flex-col overflow-hidden" style={{ background: COLORS.sidebarBg }}>
            {/* Brand + Add More */}
            <div className={`flex items-center shrink-0 ${collapsed ? 'flex-col gap-2 py-3' : 'justify-between px-3 pt-2 pb-1'}`}>
                <button type="button" onClick={() => go(ROUTES.HOME)} aria-label="Dashboard" className="bg-white/95 rounded-md p-0.5">
                    <img src={ibimaLogo} alt="IBima Assist" style={{ height: collapsed ? 30 : 40, display: 'block' }} />
                </button>
                <Tooltip title={collapsed ? 'Add More' : ''} placement="right">
                    <button
                        type="button"
                        onClick={() => go(ROUTES.ORGANIZATION_NEW)}
                        className="rounded-md text-white text-[11px] font-medium hover:bg-white/10"
                        style={{ border: '1px solid rgba(255,255,255,0.85)', padding: collapsed ? '4px 8px' : '5px 12px' }}
                    >
                        {collapsed ? <PlusOutlined /> : '+ Add More'}
                    </button>
                </Tooltip>
            </div>

            <nav className="flex-1 overflow-y-auto overflow-x-hidden pb-2">
                {SIDEBAR_GROUPS.map((group, gi) => (
                    <div key={group.title ?? gi} className="mt-1.5">
                        {group.title && !collapsed && (
                            <div className="px-3.5 pt-1.5 pb-1 text-[10.5px] font-semibold tracking-wide text-white/90 whitespace-nowrap">{group.title}</div>
                        )}
                        {group.title && collapsed && <div className="mx-4 my-1.5 border-t border-white/20" />}
                        <div className="flex flex-col gap-0.5 pr-2">
                            {group.items.map((item) => (
                                <NavItem key={item.key} item={item} isActive={isNavItemActive(item, location.pathname)} collapsed={collapsed} onNavigate={go} />
                            ))}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Profile card */}
            <div className="shrink-0 p-2.5">
                <Dropdown menu={profileMenu} trigger={['click']} placement="topLeft">
                    <button
                        type="button"
                        className="w-full flex items-center gap-2 rounded-md text-left text-white"
                        style={{ border: '1px solid rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.12)', padding: collapsed ? 6 : '6px 10px', justifyContent: collapsed ? 'center' : 'flex-start' }}
                    >
                        <Avatar size={30} style={{ background: '#fff', color: COLORS.primary, fontWeight: 700, fontSize: 12, flexShrink: 0 }}>SA</Avatar>
                        {!collapsed && (
                            <>
                                <span className="flex-1 min-w-0">
                                    <span className="block text-[13px] font-medium leading-tight">Super Admin</span>
                                    <span className="block text-[10px] truncate opacity-90">{session?.email || 'Superadmin@ibima.com'}</span>
                                </span>
                                <DownOutlined style={{ fontSize: 11 }} />
                            </>
                        )}
                    </button>
                </Dropdown>
            </div>
        </div>
    );
};

export default Sidebar;
