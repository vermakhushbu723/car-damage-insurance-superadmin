import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Select } from 'antd';
import {
    AppstoreOutlined, SafetyCertificateOutlined, ToolOutlined, TeamOutlined, ShoppingOutlined, DollarOutlined,
    WarningOutlined, InfoCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import PageTitle from '../../components/ui/PageTitle';
import StatCard from '../../components/ui/StatCard';
import Panel from '../../components/ui/Panel';
import StatusTag from '../../components/ui/StatusTag';
import DataTable from '../../components/ui/DataTable';
import ModeToggle from '../../components/ui/ModeToggle';
import { scopedMode } from '../../auth/session';
import { DonutWithLegend, ThinLine } from '../../components/charts/Charts';
import { useCollection } from '../../store/DataStore';
import { COLORS } from '../../constants/theme';
import { ROUTES, orgPath } from '../../constants/routes';
import { claimsTrend, claimsInPeriod } from '../../utils/claimStats';
import useSystemAlerts from '../../hooks/useSystemAlerts';
import { formatDate, formatNumber } from '../../utils/format';

const PERIODS = ['This Month', 'Last Month', 'This Year'].map((p) => ({ value: p, label: p }));
// "12%" trend label: items created in the last 30 days vs the 30 days before.
const trendOf = (list, dateKey) => {
    const now = dayjs();
    const inWindow = (from, to) => list.filter((x) => {
        const d = dayjs(x[dateKey]);
        return d.isAfter(now.subtract(from, 'day')) && !d.isAfter(now.subtract(to, 'day'));
    }).length;
    const a = inWindow(30, 0);
    const b = inWindow(60, 30);
    if (!b) return { trend: a ? '100%' : '0%', trendDown: false };
    return { trend: `${Math.abs(Math.round(((a - b) / b) * 100))}%`, trendDown: a < b };
};
const pct = (n, total) => `${String(n).padStart(2, '0')}(${total ? Math.round((n / total) * 100) : 0}%)`;

/**
 * Overview dashboard, opened from the hub's "As SaaS" / "As Service
 * Provider" buttons (?mode=saas|service-provider). SaaS and Service
 * Provider are run by separate super admins, so everything on the page --
 * KPIs, alerts, status panel, donut, tables -- is scoped to the selected
 * mode's organizations only; neither mode shows the other's details.
 */
const OverviewDashboardPage = () => {
    const navigate = useNavigate();
    const [params, setParams] = useSearchParams();
    const mode = scopedMode(params.get('mode') === 'service-provider' ? 'serviceProvider' : 'saas');
    const modeLabel = mode === 'saas' ? 'SaaS' : 'Service Provider';
    const { items: orgs } = useCollection('organizations');
    const { items: users } = useCollection('users');
    const { items: plans } = useCollection('plans');
    const { items: claims } = useCollection('claims');
    const [topPeriod, setTopPeriod] = useState('This Month');
    const [trendPeriod, setTrendPeriod] = useState('This Month');

    const planName = (id) => plans.find((p) => p.id === id)?.name ?? '—';
    const isSaas = mode === 'saas';

    // Only this mode's organizations (and their users) feed the page.
    const modeOrgs = useMemo(() => orgs.filter((o) => o.serviceModel === modeLabel), [orgs, modeLabel]);
    const modeOrgIds = useMemo(() => new Set(modeOrgs.map((o) => o.id)), [modeOrgs]);
    const modeUsers = useMemo(() => users.filter((u) => modeOrgIds.has(u.organizationId)), [users, modeOrgIds]);
    const modeClaims = useMemo(() => claims.filter((c) => modeOrgIds.has(c.organizationId)), [claims, modeOrgIds]);
    const alerts = useSystemAlerts(mode);

    // Revenue (MTD): SaaS = monthly plan price of active organizations; Service Provider =
    // fee per claim x claims intimated this month.
    const revenue = useMemo(() => {
        if (mode === 'saas') {
            return modeOrgs.filter((o) => o.status === 'Active')
                .reduce((sum, o) => sum + (plans.find((p) => p.id === o.plan)?.price ?? 0), 0);
        }
        const monthStart = dayjs().startOf('month');
        return modeOrgs.reduce((sum, o) => {
            const fee = Number(o.settings?.feePerClaim) || 0;
            const n = modeClaims.filter((c) => c.organizationId === o.id && !dayjs(c.intimationDate).isBefore(monthStart)).length;
            return sum + fee * n;
        }, 0);
    }, [mode, modeOrgs, modeClaims, plans]);

    const m = useMemo(() => {
        const now = dayjs();
        const isExpired = (o) => o.status === 'Expired' || dayjs(o.subscriptionExpiry).isBefore(now);
        return {
            active: modeOrgs.filter((o) => o.status === 'Active' && !isExpired(o)).length,
            pending: modeOrgs.filter((o) => o.status === 'Pending' && !isExpired(o)).length,
            expiring: modeOrgs.filter((o) => !isExpired(o) && o.status !== 'Suspended' && dayjs(o.subscriptionExpiry).diff(now, 'day') <= 30).length,
            expired: modeOrgs.filter(isExpired).length,
            suspended: modeOrgs.filter((o) => o.status === 'Suspended' && !isExpired(o)).length,
            claims: modeClaims.length,
        };
    }, [modeOrgs, modeClaims]);

    const donut = [
        { label: 'Active', value: m.active, color: isSaas ? '#1F6FEB' : '#35B44A', display: pct(m.active, modeOrgs.length) },
        { label: 'Pending', value: m.pending, color: '#F59E0B', display: pct(m.pending, modeOrgs.length) },
        { label: 'Suspended', value: m.suspended, color: '#F03E3E', display: pct(m.suspended, modeOrgs.length) },
        { label: 'Expired', value: m.expired, color: '#D9D9D9', display: pct(m.expired, modeOrgs.length) },
    ];

    const allocationRows = useMemo(() => [...modeOrgs].sort((a, b) => b.createdOn.localeCompare(a.createdOn)), [modeOrgs]);

    const topOrgs = useMemo(() => {
        const inPeriod = claimsInPeriod(modeClaims, topPeriod);
        return modeOrgs
            .map((o) => ({ ...o, periodClaims: inPeriod.filter((c) => c.organizationId === o.id).length }))
            .filter((o) => o.periodClaims > 0)
            .sort((a, b) => b.periodClaims - a.periodClaims)
            .slice(0, 5);
    }, [modeOrgs, modeClaims, topPeriod]);
    const trendData = useMemo(() => claimsTrend(modeClaims, trendPeriod), [modeClaims, trendPeriod]);

    const stats = [
        { label: `Total ${modeLabel} Organizations`, value: modeOrgs.length, icon: <AppstoreOutlined />, tone: 'blue', ...trendOf(modeOrgs, 'createdOn'), to: ROUTES.ORGANIZATIONS },
        isSaas
            ? { label: 'Active SaaS', value: m.active, icon: <SafetyCertificateOutlined />, tone: 'green', ...trendOf(modeOrgs.filter((o) => o.status === 'Active'), 'createdOn'), to: ROUTES.ORGANIZATIONS }
            : { label: 'Active Service Provider', value: m.active, icon: <ToolOutlined />, tone: 'indigo', ...trendOf(modeOrgs.filter((o) => o.status === 'Active'), 'createdOn'), to: ROUTES.ORGANIZATIONS },
        { label: 'Total Users', value: formatNumber(modeUsers.length), icon: <TeamOutlined />, tone: 'orange', ...trendOf(modeUsers, 'createdOn'), to: ROUTES.USERS },
        { label: 'Total Claims', value: formatNumber(m.claims), icon: <ShoppingOutlined />, tone: 'red', ...trendOf(modeClaims, 'intimationDate'), to: ROUTES.CLAIM_REPORT },
        { label: isSaas ? 'Total Revenue(MTD)' : 'Service Fee Revenue(MTD)', value: `₹ ${formatNumber(revenue)}`, icon: <DollarOutlined />, tone: 'teal', to: isSaas ? ROUTES.SAAS_PLANS : ROUTES.ORGANIZATIONS },
    ];

    return (
        <div>
            <PageTitle
                title="Dashboard"
                extra={<ModeToggle value={mode} onChange={(v) => setParams({ mode: v === 'saas' ? 'saas' : 'service-provider' })} />}
            />

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 mb-3">
                {stats.map((s) => <StatCard key={s.label} {...s} onClick={() => navigate(s.to)} />)}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-[1.05fr_0.8fr_1.3fr] gap-3 mb-3">
                <Panel title="System Alerts" extra={<button type="button" className="text-xs" style={{ color: COLORS.primary }} onClick={() => navigate(ROUTES.AUDIT_LOGS)}>View All</button>}>
                    <ul className="list-none p-0 m-0 flex flex-col gap-3.5">
                        {alerts.map((a) => (
                            <li key={a.id} className="flex items-start gap-2 text-xs">
                                {a.icon === 'warning'
                                    ? <WarningOutlined style={{ color: '#B45309', fontSize: 15, marginTop: 1 }} />
                                    : <InfoCircleOutlined style={{ color: COLORS.primary, fontSize: 15, marginTop: 1 }} />}
                                <span className="flex-1" style={{ color: COLORS.textPrimary }}>{a.text}</span>
                                <button type="button" className="shrink-0 text-[11px]" style={{ color: COLORS.primary }} onClick={() => navigate(a.to)}>View Details</button>
                            </li>
                        ))}
                    </ul>
                </Panel>

                <Panel title={isSaas ? 'SaaS Subscription Status' : 'Service Provider Contract Status'}>
                    <div className="flex flex-col gap-4">
                        {[
                            ['Active', m.active, COLORS.success],
                            ['Expiring In 30 Days', m.expiring, COLORS.warning],
                            ['Expired', m.expired, COLORS.danger],
                            ['Suspended', m.suspended, COLORS.textPrimary],
                        ].map(([label, value, color]) => (
                            <button key={label} type="button" onClick={() => navigate(isSaas ? ROUTES.SAAS_PLANS : ROUTES.ORGANIZATIONS)} className="flex items-center justify-between text-[13px] font-semibold">
                                <span style={{ color }}>{label}</span>
                                <span style={{ color: COLORS.textPrimary }}>{String(value).padStart(2, '0')}</span>
                            </button>
                        ))}
                    </div>
                </Panel>

                <Panel title="Organization Overview" className="lg:col-span-2 xl:col-span-1">
                    <DonutWithLegend segments={donut} centerValue={modeOrgs.length} size={150} onSegmentClick={() => navigate(ROUTES.ORGANIZATIONS)} />
                </Panel>
            </div>

            <DataTable
                className="mb-3"
                title="Pending Allocation"
                extra={<span className="text-xs text-slate-500">{modeLabel} organizations</span>}
                dataSource={allocationRows}
                pageSize={5}
                scrollX={820}
                onRow={(r) => ({ onClick: () => navigate(orgPath(r.id)), style: { cursor: 'pointer' } })}
                columns={[
                    { title: 'Organzation Name', dataIndex: 'name' },
                    { title: 'Type', dataIndex: 'type' },
                    { title: 'Service Model', dataIndex: 'serviceModel' },
                    { title: 'Plan', dataIndex: 'plan', render: planName },
                    { title: 'Staus', dataIndex: 'status', align: 'center', render: (s) => <StatusTag status={s} /> },
                    { title: 'Created On', dataIndex: 'createdOn', render: formatDate },
                ]}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 max-w-[1000px]">
                <Panel title={`Top 5 ${modeLabel} Organzation By Claims`} extra={<Select size="small" value={topPeriod} onChange={setTopPeriod} options={PERIODS} style={{ width: 118 }} />}>
                    {!topOrgs.length && <p className="text-[13px] m-0 py-6 text-center" style={{ color: COLORS.textSecondary }}>No claims in this period.</p>}
                    <ul className="list-none p-0 m-0 flex flex-col gap-2.5">
                        {topOrgs.map((o) => (
                            <li key={o.id}>
                                <button type="button" onClick={() => navigate(orgPath(o.id))} className="w-full flex items-center justify-between text-[13px] hover:text-blue-700">
                                    <span className="truncate">{o.name}</span>
                                    <span className="font-medium">{formatNumber(o.periodClaims)}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </Panel>
                <Panel title="Claims Trend (MTD)" extra={<Select size="small" value={trendPeriod} onChange={setTrendPeriod} options={PERIODS} style={{ width: 118 }} />}>
                    <ThinLine data={trendData} height={190} />
                </Panel>
            </div>
        </div>
    );
};

export default OverviewDashboardPage;
