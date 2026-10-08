import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BankOutlined, TeamOutlined, LineChartOutlined, ApiOutlined, HddOutlined, BarChartOutlined,
    ArrowUpOutlined, ArrowDownOutlined, ArrowRightOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import PageTitle from '../../components/ui/PageTitle';
import StatCard from '../../components/ui/StatCard';
import Panel from '../../components/ui/Panel';
import DataTable from '../../components/ui/DataTable';
import { AreaTrend, ProgressBars } from '../../components/charts/Charts';
import { useCollection, useRemoteValue } from '../../store/DataStore';
import { ORG_MODULES } from '../../data/orgForms';
import { claimsByRegion } from '../../utils/claimStats';
import { ROUTES } from '../../constants/routes';
import { COLORS } from '../../constants/theme';
import { formatNumber } from '../../utils/format';

const TREND = {
    up: <ArrowUpOutlined style={{ color: COLORS.success }} />,
    flat: <ArrowRightOutlined style={{ color: COLORS.textMuted }} />,
    down: <ArrowDownOutlined style={{ color: COLORS.danger }} />,
};

const formatBytes = (b = 0) => (b >= 1024 ** 3 ? `${(b / 1024 ** 3).toFixed(1)} GB` : b >= 1024 ** 2 ? `${(b / 1024 ** 2).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);
const change = (now, before) => (before ? Math.round(((now - before) / before) * 1000) / 10 : now ? 100 : 0);
const trendProps = (pct) => ({ trend: `${Math.abs(pct)}%`, trendDown: pct < 0 });

/**
 * SaaS Report Usage -- organizations/users/claims from the database, plus
 * activity metrics from GET /reports/usage (sign-ins, API requests, module
 * usage from the audit trail, database size). Trends compare the last 30
 * days with the 30 before.
 */
const SaasUsageReportPage = () => {
    const navigate = useNavigate();
    const { items: orgs } = useCollection('organizations');
    const { items: users } = useCollection('users');
    const { items: claims } = useCollection('claims');
    const [usage, , { loading }] = useRemoteValue('usage');

    const stats = useMemo(() => {
        const now = dayjs();
        const inWindow = (iso, from, to) => {
            const d = dayjs(iso);
            return d.isAfter(now.subtract(from, 'day')) && !d.isAfter(now.subtract(to, 'day'));
        };
        const activeOrgs = orgs.filter((o) => o.status === 'Active');
        const activeUsers = users.filter((u) => u.status === 'Active');
        // Feature adoption = share of the platform modules the active organizations have switched on.
        const adoption = activeOrgs.length
            ? Math.round((activeOrgs.reduce((n, o) => n + (o.settings?.modules?.length ?? 0), 0) / (activeOrgs.length * ORG_MODULES.length)) * 1000) / 10
            : 0;
        return [
            { key: 'orgs', label: 'Active Organizations', icon: <BankOutlined />, tone: 'blue', value: formatNumber(activeOrgs.length),
                ...trendProps(change(orgs.filter((o) => inWindow(o.createdOn, 30, 0)).length, orgs.filter((o) => inWindow(o.createdOn, 60, 30)).length)) },
            { key: 'users', label: 'Active Users', icon: <TeamOutlined />, tone: 'purple', value: formatNumber(activeUsers.length),
                ...trendProps(change(users.filter((u) => inWindow(u.createdOn, 30, 0)).length, users.filter((u) => inWindow(u.createdOn, 60, 30)).length)) },
            { key: 'sessions', label: 'Sessons', icon: <LineChartOutlined />, tone: 'orange', value: formatNumber(usage?.sessions.last30 ?? 0), ...trendProps(usage?.sessions.change ?? 0) },
            { key: 'api', label: 'API Usage', icon: <ApiOutlined />, tone: 'teal', value: formatNumber(usage?.apiRequests.last30 ?? 0), ...trendProps(usage?.apiRequests.change ?? 0) },
            { key: 'storage', label: 'Storage Used', icon: <HddOutlined />, tone: 'green', value: formatBytes(usage?.storageBytes), trend: null },
            { key: 'adoption', label: 'Feature Adoption', icon: <BarChartOutlined />, tone: 'red', value: `${adoption}%`, trend: null },
        ];
    }, [orgs, users, usage]);

    const regions = useMemo(() => claimsByRegion(claims), [claims]);

    return (
        <div>
            <PageTitle title="SaaS Report Usage" />

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-3">
                {stats.map((s) => (
                    <StatCard key={s.key} label={s.label} value={s.value} tone={s.tone} icon={s.icon} trend={s.trend} trendDown={s.trendDown} trendLabel="Vs Last 30 Days" />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-3 mb-3 xl:max-w-[1100px]">
                <Panel title="DAU vs MAU Trend" extra={<button type="button" className="text-xs" style={{ color: COLORS.primary }} onClick={() => navigate(ROUTES.USER_REPORT)}>View All</button>}>
                    <AreaTrend
                        data={usage?.dauMau ?? []}
                        series={[{ key: 'mau', name: 'MAU', color: '#93B4F5' }, { key: 'dau', name: 'DAU', color: COLORS.primary }]}
                        height={220}
                    />
                    <p className="text-[11px] m-0 mt-1" style={{ color: COLORS.textSecondary }}>Distinct admins signed in per day (DAU) and in the 30 days up to that day (MAU).</p>
                </Panel>
                <Panel title="Claims By Region">
                    <ProgressBars data={regions} />
                    <button type="button" className="text-[13px] mt-4" style={{ color: COLORS.primary }} onClick={() => navigate(ROUTES.CLAIM_REPORT)}>View Regionwise Report</button>
                </Panel>
            </div>

            <DataTable
                title="Module Usage Table"
                extra={<span className="text-xs text-slate-500">Last 30 days, from the audit trail</span>}
                rowKey="module"
                dataSource={usage?.moduleUsage ?? []}
                loading={loading}
                pageSize={6}
                scrollX={700}
                locale={{ emptyText: 'No activity in the last 30 days.' }}
                columns={[
                    { title: 'Module', dataIndex: 'module' },
                    { title: 'Users', dataIndex: 'users', render: formatNumber, sorter: (a, b) => a.users - b.users },
                    { title: 'Sessions', dataIndex: 'sessions', align: 'center', render: formatNumber, sorter: (a, b) => a.sessions - b.sessions },
                    { title: 'Usage %', dataIndex: 'usage', align: 'center', render: (u) => `${u}%`, sorter: (a, b) => a.usage - b.usage, defaultSortOrder: 'descend' },
                    { title: 'Trend', dataIndex: 'trend', align: 'center', render: (t) => TREND[t] },
                ]}
            />
        </div>
    );
};

export default SaasUsageReportPage;
