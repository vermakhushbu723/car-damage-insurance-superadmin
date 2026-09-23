import React from 'react';
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, Legend,
} from 'recharts';
import { COLORS } from '../../constants/theme';

const AXIS = { fontSize: 10, fill: COLORS.textMuted };
const kFormat = (v) => (v === 0 ? '00' : `${Math.round(v / 1000)}K`);
const tooltipStyle = { fontSize: 12, borderRadius: 6, border: `1px solid ${COLORS.border}` };

/** Soft-filled area chart with dots (System Alerts / Users Growth / DAU vs MAU). */
export const AreaTrend = ({ data, series = [{ key: 'value', name: 'Value', color: COLORS.primary }], height = 200, max = 5000 }) => (
    <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
            <defs>
                {series.map((s) => (
                    <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={s.color} stopOpacity={0.28} />
                        <stop offset="100%" stopColor={s.color} stopOpacity={0.04} />
                    </linearGradient>
                ))}
            </defs>
            <CartesianGrid stroke="#EEF2F7" vertical={false} />
            <XAxis dataKey="label" tick={AXIS} axisLine={false} tickLine={false} interval="preserveStartEnd" minTickGap={6} />
            <YAxis tick={AXIS} axisLine={false} tickLine={false} domain={[0, max]} ticks={[0, 1000, 2000, 3000, 4000, 5000].filter((t) => t <= max)} tickFormatter={kFormat} />
            <Tooltip contentStyle={tooltipStyle} />
            {series.length > 1 && <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />}
            {series.map((s) => (
                <Area key={s.key} type="linear" dataKey={s.key} name={s.name} stroke={s.color} strokeWidth={1.5} fill={`url(#grad-${s.key})`} dot={{ r: 3, fill: s.color, stroke: s.color }} activeDot={{ r: 4 }} isAnimationActive={false} />
            ))}
        </AreaChart>
    </ResponsiveContainer>
);

/**
 * Donut with a centered total + right-side legend ("Organization Overview",
 * "Role Distrubution"). `segments`: [{ label, value, color, display? }].
 */
export const DonutWithLegend = ({ segments, centerValue, centerLabel = 'Total', size = 170, onSegmentClick }) => (
    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
        <div className="relative shrink-0" style={{ width: size, height: size }}>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie data={segments} dataKey="value" nameKey="label" innerRadius="62%" outerRadius="100%" startAngle={90} endAngle={-270} stroke="none" isAnimationActive={false}>
                        {segments.map((s) => <Cell key={s.label} fill={s.color} cursor={onSegmentClick ? 'pointer' : 'default'} onClick={() => onSegmentClick?.(s)} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold leading-none" style={{ color: COLORS.textPrimary }}>{centerValue}</span>
                <span className="text-xs font-medium mt-1" style={{ color: COLORS.textPrimary }}>{centerLabel}</span>
            </div>
        </div>
        <ul className="flex-1 w-full list-none p-0 m-0 flex flex-col gap-2.5">
            {segments.map((s) => (
                <li key={s.label}>
                    <button
                        type="button"
                        onClick={() => onSegmentClick?.(s)}
                        className="w-full flex items-center justify-between gap-3 text-[13px]"
                        style={{ cursor: onSegmentClick ? 'pointer' : 'default' }}
                    >
                        <span className="flex items-center gap-2 font-medium" style={{ color: COLORS.textPrimary }}>
                            <span className="rounded-full shrink-0" style={{ width: 12, height: 12, background: s.color }} />
                            {s.label}
                        </span>
                        <span className="font-medium" style={{ color: COLORS.textPrimary }}>{s.display ?? s.value}</span>
                    </button>
                </li>
            ))}
        </ul>
    </div>
);

/** Plain vertical bars (Settlement Performance By Region). */
export const SimpleBars = ({ data, height = 210, color = COLORS.primary }) => (
    <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 10, right: 6, left: -18, bottom: 0 }}>
            <CartesianGrid stroke="#EEF2F7" vertical={false} />
            <XAxis dataKey="label" tick={AXIS} axisLine={false} tickLine={false} />
            <YAxis tick={AXIS} axisLine={false} tickLine={false} domain={[0, 5000]} ticks={[0, 1000, 2000, 3000, 4000, 5000]} tickFormatter={kFormat} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#F1F5F9' }} />
            <Bar dataKey="value" name="Settlements" fill={color} radius={[4, 4, 0, 0]} maxBarSize={26} isAnimationActive={false} />
        </BarChart>
    </ResponsiveContainer>
);

/** Thin line chart (Claims Trend (MTD)). */
export const ThinLine = ({ data, height = 210 }) => (
    <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 10, right: 10, left: -18, bottom: 0 }}>
            <CartesianGrid stroke="#EEF2F7" vertical={false} />
            <XAxis dataKey="label" tick={AXIS} axisLine={{ stroke: COLORS.textPrimary }} tickLine={false} interval="preserveStartEnd" minTickGap={6} />
            <YAxis tick={AXIS} axisLine={{ stroke: COLORS.textPrimary }} tickLine={false} tickFormatter={(v) => (v === 0 ? '0' : `${v / 1000}k`)} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="linear" dataKey="value" name="Claims" stroke={COLORS.primary} strokeWidth={1.5} dot={false} activeDot={{ r: 4 }} isAnimationActive={false} />
        </LineChart>
    </ResponsiveContainer>
);

/** Horizontal progress bars with trailing value (Claims By Region). */
export const ProgressBars = ({ data, max }) => {
    const top = max ?? Math.max(...data.map((d) => d.value)) * 1.03;
    return (
        <div className="flex flex-col gap-3">
            {data.map((d) => (
                <div key={d.label} className="grid items-center gap-3" style={{ gridTemplateColumns: 'minmax(110px, 150px) 1fr 36px' }}>
                    <span className="text-[13px] truncate" style={{ color: COLORS.textPrimary }}>{d.label}</span>
                    <div className="h-2.5 rounded-sm overflow-hidden" style={{ background: '#DDE1E7' }}>
                        <div className="h-full" style={{ width: `${(d.value / top) * 100}%`, background: COLORS.primary }} />
                    </div>
                    <span className="text-[13px] text-right" style={{ color: COLORS.textPrimary }}>{d.value}</span>
                </div>
            ))}
        </div>
    );
};
