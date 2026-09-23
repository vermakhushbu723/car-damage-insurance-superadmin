import React from 'react';
import { COLORS } from '../../constants/theme';

const OPTIONS = [
    { value: 'saas', label: 'SaaS Mode' },
    { value: 'serviceProvider', label: 'As Service Provider' },
];

/** "SaaS Mode | As Service Provider" two-segment toggle (Workflow + Organization forms). */
const ModeToggle = ({ value, onChange }) => (
    <div className="inline-flex rounded-md overflow-hidden shrink-0" style={{ border: `1px solid ${COLORS.border}`, background: '#F1F5F9' }}>
        {OPTIONS.map((o) => {
            const active = value === o.value;
            return (
                <button
                    key={o.value}
                    type="button"
                    onClick={() => onChange(o.value)}
                    className="text-[11px] font-semibold px-3 py-1.5 transition-colors"
                    style={{ background: active ? COLORS.primary : 'transparent', color: active ? '#fff' : COLORS.primary }}
                >
                    {o.label}
                </button>
            );
        })}
    </div>
);

export default ModeToggle;
