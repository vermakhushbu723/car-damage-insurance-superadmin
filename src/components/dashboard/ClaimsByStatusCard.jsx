import React from 'react';
import { MoreOutlined } from '@ant-design/icons';
import { COLORS } from '../../constants/theme';

/**
 * Stacked bar + legend + "great job" insight banner. `breakdown` is an
 * array of { key, label, percent, count, color } where `color` is a key
 * into COLORS (see constants/theme.js).
 */
const ClaimsByStatusCard = ({ breakdown, insightTitle, insightSubtitle }) => {
    const approvedLike = breakdown[0];

    return (
        <div className="rounded-2xl p-5 flex flex-col gap-4" style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}` }}>
            <div className="flex items-center justify-between">
                <span className="font-semibold text-base" style={{ color: COLORS.textPrimary }}>Claims by status</span>
                <MoreOutlined style={{ color: COLORS.textMuted, fontSize: 18 }} />
            </div>

            <div className="flex w-full rounded-full overflow-hidden" style={{ height: 14 }}>
                {breakdown.map((seg) => (
                    <div key={seg.key} style={{ width: `${seg.percent}%`, background: COLORS[seg.color] }} />
                ))}
            </div>

            <div className="flex flex-wrap gap-x-8 gap-y-3">
                {breakdown.map((seg) => (
                    <div key={seg.key} className="flex items-center gap-2">
                        <span className="rounded-full shrink-0" style={{ width: 12, height: 12, background: COLORS[seg.color] }} />
                        <span className="text-sm font-semibold" style={{ color: COLORS.textPrimary }}>{seg.label}</span>
                        <span className="text-sm" style={{ color: COLORS.textSecondary }}>{seg.percent}% ({seg.count})</span>
                    </div>
                ))}
            </div>

            <div className="rounded-xl p-4" style={{ background: COLORS.bgSoftBlue }}>
                <p className="font-semibold text-sm mb-0.5" style={{ color: COLORS.textPrimary }}>
                    {insightTitle ?? `${approvedLike.percent}% of claims have been approved`}
                </p>
                <p className="text-sm" style={{ color: COLORS.textSecondary }}>
                    {insightSubtitle ?? 'Great Job! Your approval rate is above target'}
                </p>
            </div>
        </div>
    );
};

export default ClaimsByStatusCard;
