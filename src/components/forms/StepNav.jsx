import React from 'react';
import { COLORS } from '../../constants/theme';

/**
 * Left step list for long single-page forms. Clicking a step scrolls its
 * section into view; `activeIndex` (scroll-spy, see useScrollSpy) marks
 * the section currently on screen. Steps with `section == null` are labels
 * from the design that have no section on this form yet -- shown, but not
 * clickable.
 */
const StepNav = ({ steps, activeIndex, onStepClick }) => (
    <nav className="hidden lg:flex flex-col gap-0.5 shrink-0 sticky top-2 self-start" style={{ width: 170 }}>
        {steps.map((step, i) => {
            const isActive = step.section != null && step.section === activeIndex;
            const clickable = step.section != null;
            return (
                <button
                    key={step.label}
                    type="button"
                    disabled={!clickable}
                    onClick={() => onStepClick(step.section)}
                    className="flex items-start gap-2.5 text-left py-2"
                    style={{ cursor: clickable ? 'pointer' : 'default' }}
                >
                    <span
                        className="flex items-center justify-center rounded-full shrink-0 text-[10px] font-semibold"
                        style={{ width: 20, height: 20, background: isActive ? COLORS.primary : '#F1F5F9', color: isActive ? '#fff' : COLORS.textMuted, border: isActive ? 'none' : '1px solid #E2E8F0' }}
                    >
                        {i + 1}
                    </span>
                    <span className="text-xs leading-snug pt-0.5" style={{ color: isActive ? COLORS.primary : '#B6BECB', fontWeight: isActive ? 600 : 500 }}>
                        {step.label}
                    </span>
                </button>
            );
        })}
    </nav>
);

export default StepNav;
