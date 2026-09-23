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
import { DonutWithLegend, ThinLine } from '../../components/charts/Charts';
import { useCollection } from '../../store/DataStore';
import { COLORS } from '../../constants/theme';
import { ROUTES, orgPath } from '../../constants/routes';
import { SYSTEM_ALERTS, CLAIMS_TREND, PERIOD_MULTIPLIER } from '../../data/analytics';
import { TODAY } from '../../data/seed';
import { formatDate, formatNumber } from '../../utils/format';

const PERIODS = Object.keys(CLAIMS_TREND).map((p) => ({ value: p, label: p }));
const ALERT_ROUTES = { 'saas-plans': ROUTES.SAAS_PLANS, organizations: ROUTES.ORGANIZATIONS, 'user-activation': ROUTES.USER_ACTIVATION, 'saas-usage': ROUTES.SAAS_USAGE };
const pct = (n, total) => `${String(n).padStart(2, '0')}(${total ? Math.round((n / total) * 100) : 0}%)`;

/**
 * Overview dashboard, opened from the hub's "As SaaS" / "As Service
 * Provider" buttons (?mode=saas|service-provider). KPIs, subscription
 * status and the organization donut are computed live from the store;
 * the Pending Allocation table lists organizations in the selected mode.
 */
const OverviewDashboardPage = () => {
    const navigate = useNavigate();
    const [params, setParams] = useSearchParams();
    const mode = params.get('mode') === 'service-provider' ? 'serviceProvider' : 'saas';
    const modeLabel = mode === 'saas' ? 'SaaS' : 'Service Provider';
    const { items: orgs } = useCollection('organizations');
    const { items: users } = useCollection('users');
    const { items: plans } = useCollection('plans');
    const [topPeriod, setTopPeriod] = useState('This Month');
    const [trendPeriod, setTrendPeriod] = useState('This Month');

    const planName = (id) => plans.find((p) => p.id === id)?.name ?? '—';

    const m = useMemo(() => {
        const now = dayjs(TODAY);
        const isExpired = (o) => o.status === 'Expired' || dayjs(o.subscriptionExpiry).isBefore(now);
        const active = orgs.filter((o) => o.status === 'Active');
        const expiring = orgs.filter((o) => !isExpired(o) && o.status !== 'Suspended' && dayjs(o.subscriptionExpiry).diff(now, 'day') <= 30);
        const expired = orgs.filter(isExpired);
        const suspended = orgs.filter((o) => o.status === 'Suspended');
        const live = orgs.filter((o) => !isExpired(o) && o.status !== 'Suspended');
        return {
            activeSaas: active.filter((o) => o.serviceModel === 'SaaS').length,
            activeSp: active.filter((o) => o.serviceModel === 'Service Provider').length,
            active: active.length,
            expiring: expiring.length,
            expired: expired.length,
            suspended: suspended.length,
            saasLive: live.filter((o) => o.serviceModel === 'SaaS').length,
            spLive: live.filter((o) => o.serviceModel === 'Service Provider').length,
        };
    }, [orgs]);

    const donut = [
        { label: 'SaaS', value: m.saasLive, color: '#1F6FEB', display: pct(m.saasLive, orgs.length) },
        { label: 'Service Provider', value: m.spLive, color: '#35B44A', display: pct(m.spLive, orgs.length) },
        { label: 'Suspended', value: m.suspended, color: '#F03E3E', display: pct(m.suspended, orgs.length) },
        { label: 'Expired', value: m.expired, color: '#D9D9D9', display: pct(m.expired, orgs.length) },
    ];

    const allocationRows = useMemo(
        () => orgs.filter((o) => o.serviceModel === modeLabel).sort((a, b) => b.createdOn.localeCompare(a.createdOn)),
        [orgs, modeLabel],
    );

    const topOrgs = useMemo(
        () => [...orgs].sort((a, b) => b.claims - a.claims).slice(0, 5).map((o) => ({ ...o, periodClaims: Math.round(o.claims * PERIOD_MULTIPLIER[topPeriod]) })),
        [orgs, topPeriod],
    );

    const stats = [
        { label: 'Total Organizations', value: orgs.length, icon: <AppstoreOutlined />, tone: 'blue', trend: '12%', to: ROUTES.ORGANIZATIONS },
        { label: 'Active SaaS', value: m.activeSaas, icon: <SafetyCertificateOutlined />, tone: 'green', trend: '8%', to: ROUTES.ORGANIZATIONS },
        { label: 'Active Service Provider', value: m.activeSp, icon: <ToolOutlined />, tone: 'indigo', trend: '10%', to: ROUTES.ORGANIZATIONS },
        { label: 'Total Users', value: formatNumber(users.length), icon: <TeamOutlined />, tone: 'orange', trend: '15%', to: ROUTES.USERS },
        { label: 'Total Claims', value: '86,420', icon: <ShoppingOutlined />, tone: 'red', trend: '10%', to: ROUTES.CLAIM_REPORT },
        { label: 'Total Revenue(MTD)', value: '1,24,85,000', icon: <DollarOutlined />, tone: 'teal', trend: '9%', to: ROUTES.SAAS_PLANS },
    ];

    return (
        <div>
            <PageTitle
                title="Dashboard"
                extra={<ModeToggle value={mode} onChange={(v) => setParams({ mode: v === 'saas' ? 'saas' : 'service-provider' })} />}
            />

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-3">
                {stats.map((s) => <StatCard key={s.label} {...s} onClick={() => navigate(s.to)} />)}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-[1.05fr_0.8fr_1.3fr] gap-3 mb-3">
                <Panel title="System Alerts" extra={<button type="button" className="text-xs" style={{ color: COLORS.primary }} onClick={() => navigate(ROUTES.AUDIT_LOGS)}>View All</button>}>
                    <ul className="list-none p-0 m-0 flex flex-col gap-3.5">
                        {SYSTEM_ALERTS.map((a) => (
                            <li key={a.id} className="flex items-start gap-2 text-xs">
                                {a.icon === 'warning'
                                    ? <WarningOutlined style={{ color: '#B45309', fontSize: 15, marginTop: 1 }} />
                                    : <InfoCircleOutlined style={{ color: COLORS.primary, fontSize: 15, marginTop: 1 }} />}
                                <span className="flex-1" style={{ color: COLORS.textPrimary }}>{a.text}</span>
                                <button type="button" className="shrink-0 text-[11px]" style={{ color: COLORS.primary }} onClick={() => navigate(ALERT_ROUTES[a.target])}>View Details</button>
                            </li>
                        ))}
                    </ul>
                </Panel>

                <Panel title="SaaS Subscription Status">
                    <div className="flex flex-col gap-4">
                        {[
                            ['Active', m.active, COLORS.success],
                            ['Expiring In 30 Days', m.expiring, COLORS.warning],
                            ['Expired', m.expired, COLORS.danger],
                            ['Suspended', m.suspended, COLORS.textPrimary],
                        ].map(([label, value, color]) => (
                            <button key={label} type="button" onClick={() => navigate(ROUTES.SAAS_PLANS)} className="flex items-center justify-between text-[13px] font-semibold">
                                <span style={{ color }}>{label}</span>
                                <span style={{ color: COLORS.textPrimary }}>{String(value).padStart(2, '0')}</span>
                            </button>
                        ))}
                    </div>
                </Panel>

                <Panel title="Organization Overview" className="lg:col-span-2 xl:col-span-1">
                    <DonutWithLegend segments={donut} centerValue={orgs.length} size={150} onSegmentClick={() => navigate(ROUTES.ORGANIZATIONS)} />
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
                <Panel title="Top 5 Organzation By Claims" extra={<Select size="small" value={topPeriod} onChange={setTopPeriod} options={PERIODS} style={{ width: 118 }} />}>
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
                    <ThinLine data={CLAIMS_TREND[trendPeriod]} height={190} />
                </Panel>
            </div>
        </div>
    );
};

export default OverviewDashboardPage;
