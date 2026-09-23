import React, { forwardRef } from 'react';
import { COLORS } from '../../constants/theme';

/** One numbered, bordered section of a long creation form ("1  COMPANY DETAILS"). */
const FormSection = forwardRef(({ step, title, extra, children, id }, ref) => (
    <section ref={ref} id={id} className="rounded-lg p-4 md:p-5 mb-4 scroll-mt-4" style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, boxShadow: '0 1px 3px rgba(15,23,42,0.06)' }}>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2.5">
                {step != null && (
                    <span className="flex items-center justify-center rounded-full shrink-0 text-[11px] font-bold" style={{ width: 22, height: 22, background: COLORS.primary, color: '#fff' }}>
                        {step}
                    </span>
                )}
                <h3 className="text-[15px] font-semibold uppercase m-0" style={{ color: COLORS.primary }}>{title}</h3>
            </div>
            {extra}
        </div>
        {children}
    </section>
));

export default FormSection;
