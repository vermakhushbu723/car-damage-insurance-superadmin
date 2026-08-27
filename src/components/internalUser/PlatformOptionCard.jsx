import React from 'react';
import { COLORS } from '../../constants/theme';

/**
 * One selectable tile in the Platform step (Mob Application / Web Portal /
 * Omni-Channel) -- icon centered, label below, a radio dot in the top-right
 * corner. Click anywhere on the tile to select it.
 */
const PlatformOptionCard = ({ icon, label, selected, onSelect }) => (
    <button
        type="button"
        onClick={onSelect}
        className="flex-1 min-w-[160px] rounded-2xl flex flex-col items-center justify-center gap-3 relative transition-colors"
        style={{
            padding: '32px 16px',
            background: selected ? COLORS.bgSoftBlue : COLORS.bgCard,
            border: `1.5px solid ${selected ? COLORS.primary : COLORS.border}`,
        }}
    >
        <span
            className="absolute rounded-full"
            style={{
                top: 14, right: 14, width: 18, height: 18,
                border: `2px solid ${selected ? COLORS.primary : COLORS.border}`,
                background: selected ? COLORS.primary : 'transparent',
                boxShadow: selected ? `0 0 0 2px ${COLORS.bgCard}, 0 0 0 3px ${COLORS.primary}` : 'none',
            }}
        />
        <div
            className="flex items-center justify-center rounded-full"
            style={{ width: 48, height: 48, background: COLORS.bgSoftBlue, color: COLORS.primary, fontSize: 22 }}
        >
            {icon}
        </div>
        <span className="text-sm font-semibold" style={{ color: COLORS.textPrimary }}>{label}</span>
    </button>
);

export default PlatformOptionCard;
