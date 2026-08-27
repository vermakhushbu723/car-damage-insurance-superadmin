import React from 'react';
import { CheckCircleFilled } from '@ant-design/icons';
import { COLORS } from '../../constants/theme';

/**
 * One selectable tile in the Account Status step (Active / Inactive) --
 * radio icon + label/description in a row, colored (green) when this is
 * the "Active" tile and it's selected.
 */
const StatusOptionCard = ({ label, description, selected, tone = 'neutral', onSelect }) => {
    const isPositive = tone === 'positive';
    const activeColor = isPositive ? COLORS.success : COLORS.textMuted;

    return (
        <button
            type="button"
            onClick={onSelect}
            className="flex-1 min-w-[200px] flex items-center gap-3 rounded-xl text-left transition-colors"
            style={{
                padding: '14px 18px',
                background: selected && isPositive ? COLORS.successBg : COLORS.bgSoftBlue,
                border: `1.5px solid ${selected ? activeColor : COLORS.border}`,
            }}
        >
            {selected ? (
                <CheckCircleFilled style={{ fontSize: 20, color: activeColor }} />
            ) : (
                <span className="rounded-full shrink-0" style={{ width: 20, height: 20, border: `2px solid ${COLORS.border}` }} />
            )}
            <div className="flex flex-col leading-tight">
                <span className="text-sm font-bold" style={{ color: COLORS.textPrimary }}>{label}</span>
                <span className="text-xs" style={{ color: COLORS.textSecondary }}>{description}</span>
            </div>
        </button>
    );
};

export default StatusOptionCard;
