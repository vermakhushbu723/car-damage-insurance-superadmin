import React from 'react';
import { Input, Badge } from 'antd';
import { SearchOutlined, BellOutlined, UserOutlined, MenuOutlined } from '@ant-design/icons';
import { COLORS } from '../../constants/theme';

/**
 * Top bar -- search + notifications + profile. `onMenuClick` shows the
 * hamburger (mobile only, opens the Sidebar drawer).
 */
const Topbar = ({ onMenuClick }) => {
    return (
        <div
            className="flex items-center gap-4 px-4 md:px-8"
            style={{ background: COLORS.topbarBg, height: 72, flexShrink: 0 }}
        >
            <button
                type="button"
                onClick={onMenuClick}
                className="lg:hidden flex items-center justify-center rounded-full"
                style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.6)' }}
            >
                <MenuOutlined />
            </button>

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
