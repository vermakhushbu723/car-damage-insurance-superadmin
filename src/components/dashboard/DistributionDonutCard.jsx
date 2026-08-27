import React, { useState } from 'react';
import { Select } from 'antd';
import { PieChart, Pie, Cell } from 'recharts';
import { COLORS } from '../../constants/theme';

const PERIOD_OPTIONS = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'yearly', label: 'Yearly' },
];

/**
 * Donut chart + total-in-center + a colored-dot legend with counts.
 * `segments` is an array of { key, label, value, color } where `color` is
 * a key into COLORS (see constants/theme.js).
 */
const DistributionDonutCard = ({ title, total, segments }) => {
    const [period, setPeriod] = useState('monthly');
    const data = segments.map((s) => ({ name: s.label, value: s.value, color: COLORS[s.color] }));

    return (
        <div className="rounded-2xl p-5 flex flex-col gap-4" style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}` }}>
            <div className="flex items-center justify-between">
                <span className="font-semibold text-base" style={{ color: COLORS.textPrimary }}>{title}</span>
                <Select value={period} onChange={setPeriod} options={PERIOD_OPTIONS} style={{ width: 120 }} size="middle" />
            </div>

            <div className="flex items-center gap-6 flex-wrap">
                <div className="relative shrink-0" style={{ width: 176, height: 176 }}>
                    <PieChart width={176} height={176}>
                        <Pie data={data} dataKey="value" innerRadius={62} outerRadius={86} startAngle={90} endAngle={-270} stroke="none">
                            {data.map((d) => <Cell key={d.name} fill={d.color} />)}
                        </Pie>
                    </PieChart>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-2xl font-bold" style={{ color: COLORS.textPrimary }}>{total}</span>
                        <span className="text-xs font-semibold tracking-wide" style={{ color: COLORS.textMuted }}>TOTAL</span>
                    </div>
                </div>

                <div className="flex flex-col gap-3 flex-1 min-w-[140px]">
                    {segments.map((seg) => (
                        <div key={seg.key} className="flex items-center gap-2.5">
                            <span className="rounded-full shrink-0" style={{ width: 12, height: 12, background: COLORS[seg.color] }} />
                            <div className="flex flex-col leading-tight">
                                <span className="text-sm" style={{ color: COLORS.textSecondary }}>{seg.label}</span>
                                <span className="text-base font-bold" style={{ color: COLORS.textPrimary }}>{seg.value}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DistributionDonutCard;
