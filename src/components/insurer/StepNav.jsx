import React from 'react';
import { COLORS } from '../../constants/theme';

/**
 * Left step list for the New ID Creation form. This is a single long
 * scrollable form (not a wizard that hides other steps), so clicking a
 * step just scrolls its section into view -- `activeStep` highlights
 * whichever section is currently in the viewport.
 */
const StepNav = ({ steps, activeStep, onStepClick }) => (
    <div className="hidden lg:flex flex-col gap-1 shrink-0" style={{ width: 220 }}>
        {steps.map((step, i) => {
            const isActive = activeStep === i + 1;
            return (
                <button
                    key={step}
                    type="button"
                    onClick={() => onStepClick(i + 1)}
                    className="flex items-start gap-3 text-left"
                    style={{ padding: '10px 4px' }}
                >
                    <span
                        className="flex items-center justify-center rounded-full shrink-0 text-xs font-bold"
                        style={{
                            width: 22,
                            height: 22,
                            background: isActive ? COLORS.primary : '#E2E8F0',
                            color: isActive ? '#fff' : COLORS.textMuted,
                        }}
                    >
                        {i + 1}
                    </span>
                    <span
                        className="text-sm leading-snug"
                        style={{ color: isActive ? COLORS.primary : COLORS.textSecondary, fontWeight: isActive ? 700 : 500 }}
                    >
                        {step}
                    </span>
                </button>
            );
        })}
    </div>
);

export default StepNav;
