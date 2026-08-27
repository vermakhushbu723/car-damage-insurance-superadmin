import React from 'react';
import { COLORS } from '../../constants/theme';

const NavRow = ({ index, label, isActive, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className="flex items-start gap-3 text-left w-full"
        style={{ padding: '10px 4px' }}
    >
        <span
            className="flex items-center justify-center rounded-full shrink-0 text-xs font-bold"
            style={{
                width: 22, height: 22,
                background: isActive ? COLORS.primary : '#E2E8F0',
                color: isActive ? '#fff' : COLORS.textMuted,
            }}
        >
            {index}
        </span>
        <span className="text-sm leading-snug" style={{ color: isActive ? COLORS.primary : COLORS.textSecondary, fontWeight: isActive ? 700 : 500 }}>
            {label}
        </span>
    </button>
);

/**
 * Settings page's left nav -- two groups: the main numbered list, then a
 * "SUPER ADMIN" header with its own separately-numbered sub-list (matches
 * the reference screenshots exactly -- the two groups have independent
 * 1/2/3.../1/2/3 numbering, not one continuous sequence).
 */
const SettingsSideNav = ({ mainSteps, superAdminSteps, activeKey, onStepClick }) => (
    <div className="hidden lg:flex flex-col gap-1 shrink-0" style={{ width: 220 }}>
        {mainSteps.map((step, i) => (
            <NavRow key={step.key} index={i + 1} label={step.label} isActive={activeKey === step.key} onClick={() => onStepClick(step.key)} />
        ))}

        <span className="text-xs font-bold tracking-wide mt-4 mb-1" style={{ color: COLORS.primary }}>SUPER ADMIN</span>

        {superAdminSteps.map((step, i) => (
            <NavRow key={step.key} index={i + 1} label={step.label} isActive={activeKey === step.key} onClick={() => onStepClick(step.key)} />
        ))}
    </div>
);

export default SettingsSideNav;
