import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AutoComplete, Input, Badge, Dropdown, Tooltip } from 'antd';
import {
    SearchOutlined, BellOutlined, UserOutlined, MenuOutlined, MenuFoldOutlined, MenuUnfoldOutlined,
    LogoutOutlined, WarningOutlined, InfoCircleOutlined,
} from '@ant-design/icons';
import { COLORS } from '../../constants/theme';
import { ROUTES } from '../../constants/routes';
import { ALL_NAV_ITEMS } from '../../constants/navigation';
import { SYSTEM_ALERTS } from '../../data/analytics';
import { clearSuperAdminSession } from '../../auth/session';

const circleBtn = { width: 36, height: 36, background: 'rgba(255,255,255,0.75)' };

/**
 * Top bar -- sidebar toggles, quick page search (jumps to any sidebar
 * page), notifications (the dashboard's System Alerts) and account menu.
 */
const Topbar = ({ onMenuClick, collapsed, onToggleCollapsed }) => {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');

    const searchOptions = ALL_NAV_ITEMS
        .filter((i) => !query || i.label.toLowerCase().includes(query.toLowerCase()))
        .map((i) => ({ value: i.path, label: i.label }));

    const alertTargets = {
        'saas-plans': ROUTES.SAAS_PLANS,
        organizations: ROUTES.ORGANIZATIONS,
        'user-activation': ROUTES.USER_ACTIVATION,
        'saas-usage': ROUTES.SAAS_USAGE,
    };

    const notificationsMenu = {
        items: SYSTEM_ALERTS.map((a) => ({
            key: a.id,
            icon: a.icon === 'warning' ? <WarningOutlined style={{ color: COLORS.danger }} /> : <InfoCircleOutlined style={{ color: COLORS.primary }} />,
            label: <span className="text-[12px]">{a.text}</span>,
        })),
        onClick: ({ key }) => {
            const alert = SYSTEM_ALERTS.find((a) => a.id === key);
            if (alert) navigate(alertTargets[alert.target]);
        },
    };

    const accountMenu = {
        items: [
            { key: 'profile', icon: <UserOutlined />, label: 'Super Admin', disabled: true },
            { type: 'divider' },
            { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', danger: true },
        ],
        onClick: ({ key }) => {
            if (key === 'logout') {
                clearSuperAdminSession();
                navigate(ROUTES.LOGIN, { replace: true });
            }
        },
    };

    return (
        <div className="flex items-center gap-3 px-3 md:px-6" style={{ background: COLORS.topbarBg, height: 56, flexShrink: 0 }}>
            <button type="button" onClick={onMenuClick} className="lg:hidden flex items-center justify-center rounded-full" style={circleBtn} aria-label="Open menu">
                <MenuOutlined />
            </button>
            <Tooltip title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
                <button type="button" onClick={onToggleCollapsed} className="hidden lg:flex items-center justify-center rounded-full" style={circleBtn} aria-label="Toggle sidebar">
                    {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                </button>
            </Tooltip>

            <div className="flex-1" />

            <AutoComplete
                className="hidden sm:block"
                style={{ width: 'min(360px, 40vw)' }}
                options={searchOptions}
                value={query}
                onChange={setQuery}
                onSelect={(path) => {
                    navigate(path);
                    setQuery('');
                }}
            >
                <Input placeholder="Search" suffix={<SearchOutlined style={{ color: COLORS.textMuted }} />} style={{ background: '#EDEDED', border: 'none' }} />
            </AutoComplete>

            <Dropdown menu={notificationsMenu} trigger={['click']} placement="bottomRight">
                <Badge count={SYSTEM_ALERTS.length} size="small" offset={[-4, 4]}>
                    <button type="button" className="flex items-center justify-center rounded-full" style={circleBtn} aria-label="Notifications">
                        <BellOutlined style={{ fontSize: 16, color: COLORS.textPrimary }} />
                    </button>
                </Badge>
            </Dropdown>

            <Dropdown menu={accountMenu} trigger={['click']} placement="bottomRight">
                <button type="button" className="flex items-center justify-center rounded-full" style={circleBtn} aria-label="Account">
                    <UserOutlined style={{ fontSize: 16, color: COLORS.textPrimary }} />
                </button>
            </Dropdown>
        </div>
    );
};

export default Topbar;
