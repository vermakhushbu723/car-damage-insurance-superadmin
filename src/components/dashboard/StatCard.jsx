import React from 'react';
import { COLORS } from '../../constants/theme';

/**
 * One of the 3 stat tiles at the top of every dashboard variant.
 * @param {'dark'|'light'} tone - 'dark' = solid navy card (first tile in
 *   every screenshot), 'light' = white card with a colored icon badge.
 * @param {{icon: React.ReactNode, text: string, tone: 'success'|'danger'}} [footer]
 */
const StatCard = ({ icon, label, value, tone = 'light', footer }) => {
    const isDark = tone === 'dark';
    const footerColor = footer?.tone === 'danger' ? COLORS.danger : COLORS.success;

    return (
        <div
            className="flex-1 min-w-[220px] rounded-2xl p-5 flex flex-col gap-3"
            style={{
                background: isDark ? COLORS.primaryDark : COLORS.bgCard,
                border: isDark ? 'none' : `1px solid ${COLORS.border}`,
            }}
        >
            <div className="flex items-start justify-between">
                <span
                    className="text-sm font-medium"
                    style={{ color: isDark ? 'rgba(255,255,255,0.85)' : COLORS.textSecondary }}
                >
                    {label}
                </span>
                <div
                    className="flex items-center justify-center rounded-lg shrink-0"
                    style={{
                        width: 34,
                        height: 34,
                        background: isDark ? 'rgba(255,255,255,0.18)' : COLORS.bgSoftBlue,
                        color: isDark ? '#fff' : COLORS.primary,
                    }}
                >
                    {icon}
                </div>
            </div>

            <span className="text-3xl font-bold" style={{ color: isDark ? '#fff' : COLORS.textPrimary }}>
                {value}
            </span>

            {footer && (
                <span className="flex items-center gap-1.5 text-sm font-medium" style={{ color: isDark ? '#fff' : footerColor }}>
                    {footer.icon}
                    {footer.text}
                </span>
            )}
        </div>
    );
};

export default StatCard;
