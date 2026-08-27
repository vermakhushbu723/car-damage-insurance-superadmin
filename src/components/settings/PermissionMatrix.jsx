import React, { useState } from 'react';
import { COLORS } from '../../constants/theme';

const PAGES = [
    'Dashboard', 'Claim Intimation', 'Surveyor Appointment', 'Handler Allocation',
    'Claim Details', 'AI ILA', 'Handler ILA', 'FLA', 'Recommendation', 'Fee Bill', 'Settings',
];
const COLUMNS = ['FLA', 'Recommend', 'Fee approval', 'Settlement'];

// 'none' -> 'view' -> 'edit' -> 'none' (matches the "click a cell to cycle
// none, view, edit" subtitle). Every cell in the reference screenshot
// starts fully colored (both View + Edit granted), so the initial state
// below is 'edit' for all of them.
const CYCLE = { none: 'view', view: 'edit', edit: 'none' };

const cellKey = (page, col) => `${page}::${col}`;

function buildInitialState() {
    const state = {};
    PAGES.forEach((page) => COLUMNS.forEach((col) => { state[cellKey(page, col)] = 'edit'; }));
    return state;
}

const Pill = ({ label, active, tone }) => (
    <span
        className="text-xs font-bold rounded-full px-2.5 py-1"
        style={{
            background: active ? (tone === 'view' ? COLORS.primary : COLORS.danger) : '#E2E8F0',
            color: active ? '#fff' : COLORS.textMuted,
        }}
    >
        {label}
    </span>
);

/**
 * The Page × (FLA/Recommend/Fee approval/Settlement) access-level grid on
 * the User & Roles step. Each cell cycles none → view → edit → none on
 * click (see the page's own subtitle) -- real interactive state, not
 * static markup.
 */
const PermissionMatrix = () => {
    const [state, setState] = useState(buildInitialState);

    const cycleCell = (page, col) => {
        const key = cellKey(page, col);
        setState((prev) => ({ ...prev, [key]: CYCLE[prev[key]] }));
    };

    return (
        <div className="overflow-x-auto rounded-xl" style={{ border: `1px solid ${COLORS.border}` }}>
            <table className="w-full border-collapse" style={{ minWidth: 700 }}>
                <thead>
                    <tr style={{ background: COLORS.primary }}>
                        <th className="text-left text-sm font-bold px-4 py-3" style={{ color: '#fff' }}>Page</th>
                        {COLUMNS.map((col) => (
                            <th key={col} className="text-center text-sm font-bold px-4 py-3" style={{ color: '#fff' }}>{col}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {PAGES.map((page, i) => (
                        <tr key={page} style={{ background: i % 2 === 0 ? COLORS.bgSoftBlue : '#fff' }}>
                            <td className="text-sm font-semibold px-4 py-3" style={{ color: COLORS.textPrimary }}>{page}</td>
                            {COLUMNS.map((col) => {
                                const cellState = state[cellKey(page, col)];
                                return (
                                    <td key={col} className="px-4 py-3">
                                        <button
                                            type="button"
                                            onClick={() => cycleCell(page, col)}
                                            className="flex items-center justify-center gap-2 mx-auto"
                                        >
                                            <Pill label="View" tone="view" active={cellState === 'view' || cellState === 'edit'} />
                                            <Pill label="Edit" tone="edit" active={cellState === 'edit'} />
                                        </button>
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default PermissionMatrix;
