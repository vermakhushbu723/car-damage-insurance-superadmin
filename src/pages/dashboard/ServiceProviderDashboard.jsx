import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BankOutlined, TeamOutlined, SafetyCertificateOutlined, FileTextOutlined, ArrowRightOutlined, EyeOutlined,
    FileAddOutlined, UserSwitchOutlined, RobotOutlined, SolutionOutlined, FileSearchOutlined, WalletOutlined, FolderOpenOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import StatCard from '../../components/ui/StatCard';
import Panel from '../../components/ui/Panel';
import StatusTag from '../../components/ui/StatusTag';
import DataTable from '../../components/ui/DataTable';
import { DonutWithLegend, SimpleBars } from '../../components/charts/Charts';
import { COLORS, TONES } from '../../constants/theme';
import { ROUTES, orgPath } from '../../constants/routes';
import { formatDate, formatNumber } from '../../utils/format';

/** Service Provider claim stages, in processing order (donut + "Claim Processing Stage"). */
const STAGES = [
    { label: 'Intimation', color: '#1F6FEB', tone: 'blue', icon: <FileAddOutlined /> },
    { label: 'Handler Allocation', color: '#35B44A', tone: 'green', icon: <UserSwitchOutlined /> },
    { label: 'AI ILA', color: '#F5B82E', tone: 'purple', icon: <RobotOutlined /> },
    // ILA is the SaaS name of the handler's assessment.
    { label: 'Handler ILA', color: '#7C3AED', tone: 'orange', icon: <SolutionOutlined />, also: ['ILA'] },
    { label: 'FLA', color: '#0E9488', tone: 'teal', icon: <FileSearchOutlined /> },
    { label: 'Fee Bill', color: '#F03E3E', tone: 'blue', icon: <WalletOutlined /> },
    { label: 'DMS', color: '#D9D9D9', tone: 'purple', icon: <FolderOpenOutlined /> },
];

/** Avg. TAT in days -> the design's Good / Average / Delay tag. */
const RATINGS = [
    { max: 2, label: 'Good', bg: '#D1EEDD', color: '#1E8E4E' },
    { max: 3.5, label: 'Average', bg: '#FDEBC8', color: '#E89A0C' },
    { max: Infinity, label: 'Delay', bg: '#F6CDCD', color: '#C81E1E' },
];

const monthStart = () => dayjs().startOf('month');
const newThisMonth = (list, key) => list.filter((x) => !dayjs(x[key]).isBefore(monthStart())).length;

/** "12%" claims intimated this month vs last month. */
function monthTrend(claims) {
    const start = monthStart();
    const prevStart = start.subtract(1, 'month');
    const now = claims.filter((c) => !dayjs(c.intimationDate).isBefore(start)).length;
    const prev = claims.filter((c) => !dayjs(c.intimationDate).isBefore(prevStart) && dayjs(c.intimationDate).isBefore(start)).length;
    if (!prev) return { trend: now ? '100%' : '0%', trendDown: false };
    return { trend: `${Math.abs(Math.round(((now - prev) / prev) * 100))}%`, trendDown: now < prev };
}

/** Days from intimation to settlement (or to today while still open). */
const tatDays = (c) => Math.max(0, dayjs(c.settledAt ?? undefined).diff(dayjs(c.intimationDate), 'hour') / 24);

/**
 * "Super Admin Dashboard" of the Service Provider super admin (Figma: SUPER ADMIN AS
 * FOR SERVICE PROVIDER > SUPER ADMIN DASHBOARD SCREEN). Insurers are the Service
 * Provider organizations of type Insurer; users and claims are theirs only.
 */
const ServiceProviderDashboard = ({ orgs, users, claims, title }) => {
    const navigate = useNavigate();

    const insurers = useMemo(() => orgs.filter((o) => o.type === 'Insurer'), [orgs]);
    const active = insurers.filter((o) => o.status === 'Active').length;

    const claimsByOrg = useMemo(() => {
        const map = new Map();
        for (const c of claims) map.set(c.organizationId, [...(map.get(c.organizationId) ?? []), c]);
        return map;
    }, [claims]);

    // Insurers with the most claims first (bar chart + performance list).
    const ranked = useMemo(
        () => insurers
            .map((o) => {
                const list = claimsByOrg.get(o.id) ?? [];
                const avg = list.length ? list.reduce((s, c) => s + tatDays(c), 0) / list.length : null;
                return { ...o, claimCount: list.length, avgTat: avg };
            })
            .sort((a, b) => b.claimCount - a.claimCount),
        [insurers, claimsByOrg],
    );

    const stageCount = (s) => claims.filter((c) => c.status === s.label || s.also?.includes(c.status)).length;
    const stageTotal = STAGES.reduce((sum, s) => sum + stageCount(s), 0);
    const donut = STAGES.map((s) => {
        const value = stageCount(s);
        return { label: s.label, value, color: s.color, display: `${value}(${stageTotal ? Math.round((value / stageTotal) * 100) : 0}%)` };
    });

    const activeShare = insurers.length ? Math.round((active / insurers.length) * 100) : 0;
    const stats = [
        { label: 'Total Insurers', value: insurers.length, icon: <BankOutlined />, tone: 'blue', trend: `${newThisMonth(insurers, 'createdOn')} New This Month`, trendLabel: '', to: ROUTES.ORGANIZATIONS },
        { label: 'Total Users', value: formatNumber(users.length), icon: <TeamOutlined />, tone: 'green', trend: `${newThisMonth(users, 'createdOn')} New This Month`, trendLabel: '', to: ROUTES.USERS },
        { label: 'Active Insurers', value: active, icon: <SafetyCertificateOutlined />, tone: 'purple', note: `${activeShare}% Of Total`, to: ROUTES.ORGANIZATIONS },
        { label: 'Total Claims (All Insurers)', value: formatNumber(claims.length), icon: <FileTextOutlined />, tone: 'teal', ...monthTrend(claims), to: ROUTES.CLAIM_REPORT },
    ];

    return (
        <div>
            {title}

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-3">
                {stats.map((s) => <StatCard key={s.label} {...s} onClick={() => navigate(s.to)} />)}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-[1fr_1.3fr_0.75fr] gap-3 mb-3">
                <Panel title="Claim Volume By Insurer">
                    {ranked.some((o) => o.claimCount)
                        ? <SimpleBars data={ranked.slice(0, 5).map((o) => ({ label: o.name.split(' ')[0], value: o.claimCount }))} name="Claims" height={200} />
                        : <p className="text-[13px] m-0 py-16 text-center" style={{ color: COLORS.textSecondary }}>No claims yet.</p>}
                </Panel>

                <Panel title="Claim Stage Over View">
                    <DonutWithLegend segments={donut} centerValue={formatNumber(stageTotal)} centerLabel="Total Claim" size={150} onSegmentClick={() => navigate(ROUTES.CLAIM_REPORT)} />
                </Panel>

                <Panel title="Insurer Performance" className="lg:col-span-2 xl:col-span-1">
                    {!ranked.length && <p className="text-[13px] m-0 py-6 text-center" style={{ color: COLORS.textSecondary }}>No insurers yet.</p>}
                    <ul className="list-none p-0 m-0 flex flex-col gap-3">
                        {ranked.slice(0, 5).map((o) => {
                            const r = o.avgTat == null ? null : RATINGS.find((x) => o.avgTat <= x.max);
                            return (
                                <li key={o.id}>
                                    <button type="button" onClick={() => navigate(orgPath(o.id))} className="w-full grid grid-cols-[1fr_auto_64px] items-center gap-3 text-[12px] text-left" title="Avg. TAT (days)">
                                        <span className="truncate" style={{ color: COLORS.textPrimary }}>{o.name}</span>
                                        <span className="font-medium" style={{ color: COLORS.textPrimary }}>{o.avgTat == null ? '—' : o.avgTat.toFixed(1)}</span>
                                        {r
                                            ? <span className="text-center text-[11px] font-semibold rounded px-2 py-1" style={{ background: r.bg, color: r.color }}>{r.label}</span>
                                            : <span className="text-center text-[11px]" style={{ color: COLORS.textSecondary }}>No claims</span>}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </Panel>
            </div>

            <Panel title="Claim Processing Stage" className="mb-3">
                <div className="flex items-start justify-between gap-2 overflow-x-auto pb-1">
                    {STAGES.map((s, i) => {
                        const t = TONES[s.tone];
                        return (
                            <React.Fragment key={s.label}>
                                <div className="flex flex-col items-center gap-1.5 min-w-[84px]" title={`${stageCount(s)} claim(s)`}>
                                    <span className="flex items-center justify-center rounded-full" style={{ width: 52, height: 52, background: t.bg, color: t.color, fontSize: 22 }}>{s.icon}</span>
                                    <span className="text-[12px] text-center" style={{ color: COLORS.primary }}>{s.label}</span>
                                </div>
                                {i < STAGES.length - 1 && <ArrowRightOutlined className="mt-5 shrink-0" style={{ color: COLORS.textSecondary }} />}
                            </React.Fragment>
                        );
                    })}
                </div>
            </Panel>

            <DataTable
                title="Insurer Managment"
                dataSource={insurers}
                pageSize={5}
                scrollX={760}
                columns={[
                    { title: 'INSURER NAME', dataIndex: 'name', align: 'center', render: (n) => <span className="font-semibold uppercase">{n}</span> },
                    { title: 'CODE', dataIndex: 'id', align: 'center' },
                    { title: 'STATUS', dataIndex: 'status', align: 'center', render: (s) => <StatusTag status={s} /> },
                    { title: 'CREATED ON', dataIndex: 'createdOn', align: 'center', render: formatDate },
                    {
                        title: 'ACTION',
                        key: 'action',
                        align: 'center',
                        render: (_, r) => (
                            <button type="button" onClick={() => navigate(orgPath(r.id))} className="inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-[12px]" style={{ background: '#DCE6FA', color: COLORS.primary }}>
                                View <EyeOutlined />
                            </button>
                        ),
                    },
                ]}
            />
        </div>
    );
};

export default ServiceProviderDashboard;
