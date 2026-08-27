import React, { forwardRef } from 'react';
import { COLORS } from '../../constants/theme';

/** One numbered, bordered section of the New ID Creation form. */
const FormSectionCard = forwardRef(({ step, title, children }, ref) => (
    <div ref={ref} className="rounded-2xl p-5 md:p-6 mb-6" style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}` }}>
        <div className="flex items-center gap-2.5 mb-5">
            <span
                className="flex items-center justify-center rounded-full shrink-0 text-xs font-bold"
                style={{ width: 22, height: 22, background: COLORS.primary, color: '#fff' }}
            >
                {step}
            </span>
            <h3 className="text-sm font-bold tracking-wide m-0" style={{ color: COLORS.primary }}>{title}</h3>
        </div>
        {children}
    </div>
));

export default FormSectionCard;
