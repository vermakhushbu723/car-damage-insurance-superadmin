import React from 'react';
import { COLORS } from '../../constants/theme';
import { getAdminScope } from '../../auth/session';

const OPTIONS = [
    { value: 'saas', label: 'SaaS Mode' },
    { value: 'serviceProvider', label: 'As Service Provider' },
];

/**
 * "SaaS Mode | As Service Provider" two-segment toggle (Dashboard, Workflow,
 * Organization forms). A SaaS-only or Service-Provider-only super admin
 * sees just their own segment.
 */
const ModeToggle = ({ value, onChange }) => {
    const scope = getAdminScope();
    const options = scope === 'all' ? OPTIONS : OPTIONS.filter((o) => o.value === scope);
    return (
    <div className="inline-flex rounded-md overflow-hidden shrink-0" style={{ border: `1px solid ${COLORS.border}`, background: '#F1F5F9' }}>
        {options.map((o) => {
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
};

export default ModeToggle;
