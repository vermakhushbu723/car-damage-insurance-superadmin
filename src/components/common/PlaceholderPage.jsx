import React from 'react';
import { COLORS } from '../../constants/theme';

/** Generic "not built yet" page for sidebar sections that don't have a dedicated screen in the reference design. */
const PlaceholderPage = ({ title, icon }) => (
    <div className="p-4 md:p-8">
        <h1 className="text-3xl font-extrabold mb-6" style={{ color: COLORS.headingBlue }}>{title}</h1>
        <div
            className="rounded-2xl flex flex-col items-center justify-center gap-3 text-center"
            style={{ background: COLORS.bgCard, border: `1px dashed ${COLORS.border}`, minHeight: 320 }}
        >
            <div className="flex items-center justify-center rounded-full" style={{ width: 56, height: 56, background: COLORS.bgSoftBlue, color: COLORS.primary, fontSize: 26 }}>
                {icon}
            </div>
            <p className="font-semibold m-0" style={{ color: COLORS.textPrimary }}>{title} coming soon</p>
            <p className="text-sm m-0" style={{ color: COLORS.textSecondary }}>This section isn't in the current design yet.</p>
        </div>
    </div>
);

export default PlaceholderPage;
