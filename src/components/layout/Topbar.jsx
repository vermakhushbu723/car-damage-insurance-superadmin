import React from 'react';
import { Input, Badge, Tooltip } from 'antd';
import { SearchOutlined, BellOutlined, UserOutlined, MenuOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { COLORS } from '../../constants/theme';

/**
 * Top bar -- search + notifications + profile.
 * `onMenuClick` opens the mobile Sidebar drawer (small screens only).
 * `onToggleCollapsed`/`collapsed` control the desktop sidebar's
 * full-width/icon-only state (large screens only).
 */
const Topbar = ({ onMenuClick, collapsed, onToggleCollapsed }) => {
    return (
        <div
            className="flex items-center gap-4 px-4 md:px-8"
            style={{ background: COLORS.topbarBg, height: 72, flexShrink: 0 }}
        >
            {/* Mobile: opens the Sidebar drawer */}
            <button
                type="button"
                onClick={onMenuClick}
                className="lg:hidden flex items-center justify-center rounded-full"
                style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.6)' }}
                aria-label="Open menu"
            >
                <MenuOutlined />
            </button>

            {/* Desktop: collapses/expands the sidebar to an icon-only rail */}
            <Tooltip title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
                <button
                    type="button"
                    onClick={onToggleCollapsed}
                    className="hidden lg:flex items-center justify-center rounded-full"
                    style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.6)' }}
                    aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                </button>
            </Tooltip>

            <Input
                prefix={<SearchOutlined style={{ color: COLORS.textMuted }} />}
                placeholder="Search"
                className="hidden sm:block"
                style={{ maxWidth: 360, background: '#fff', borderRadius: 8, border: 'none' }}
                variant="borderless"
            />

            <div className="flex-1" />

            <Badge dot offset={[-4, 4]}>
                <button
                    type="button"
                    className="flex items-center justify-center rounded-full"
                    style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.6)' }}
                    aria-label="Notifications"
                >
                    <BellOutlined style={{ fontSize: 17, color: COLORS.textPrimary }} />
                </button>
            </Badge>

            <button
                type="button"
                className="flex items-center justify-center rounded-full"
                style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.6)' }}
                aria-label="Account"
            >
                <UserOutlined style={{ fontSize: 17, color: COLORS.textPrimary }} />
            </button>
        </div>
    );
};

export default Topbar;
