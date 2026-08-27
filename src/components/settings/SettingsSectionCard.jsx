import React, { forwardRef } from 'react';
import { COLORS } from '../../constants/theme';

/**
 * One section of the Settings page -- like insurer/FormSectionCard, but
 * with an optional right-aligned "Insurer SaaS Mode" style badge (every
 * section in the reference screenshots has one except General, which
 * shows its own Platform Mode readout inline instead).
 */
const SettingsSectionCard = forwardRef(({ badge, title, modeBadge, children }, ref) => (
    <div ref={ref} className="rounded-2xl p-5 md:p-6 mb-6" style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}` }}>
        <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
                <span
                    className="flex items-center justify-center rounded-full shrink-0 text-xs font-bold"
                    style={{ width: 22, height: 22, background: COLORS.primary, color: '#fff' }}
                >
                    {badge}
                </span>
                <h3 className="text-lg font-bold tracking-wide m-0" style={{ color: COLORS.primary }}>{title}</h3>
            </div>
            {modeBadge && (
                <span className="text-sm font-bold" style={{ color: COLORS.textPrimary }}>{modeBadge}</span>
            )}
        </div>
        {children}
    </div>
));

export default SettingsSectionCard;
