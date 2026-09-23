import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BankOutlined, TeamOutlined, LineChartOutlined, ApiOutlined, HddOutlined, BarChartOutlined,
    ArrowUpOutlined, ArrowDownOutlined, ArrowRightOutlined,
} from '@ant-design/icons';
import PageTitle from '../../components/ui/PageTitle';
import StatCard from '../../components/ui/StatCard';
import Panel from '../../components/ui/Panel';
import DataTable from '../../components/ui/DataTable';
import { AreaTrend, ProgressBars } from '../../components/charts/Charts';
import { useCollection } from '../../store/DataStore';
import { SAAS_USAGE_STATS, DAU_MAU, CLAIMS_BY_REGION, MODULE_USAGE } from '../../data/analytics';
import { ROUTES } from '../../constants/routes';
import { COLORS } from '../../constants/theme';
import { formatNumber } from '../../utils/format';

const ICONS = { orgs: <BankOutlined />, users: <TeamOutlined />, sessions: <LineChartOutlined />, api: <ApiOutlined />, storage: <HddOutlined />, adoption: <BarChartOutlined /> };
const TREND = {
    up: <ArrowUpOutlined style={{ color: COLORS.success }} />,
    flat: <ArrowRightOutlined style={{ color: COLORS.textMuted }} />,
    down: <ArrowDownOutlined style={{ color: COLORS.danger }} />,
};

/** SaaS Report Usage -- platform usage KPIs, DAU vs MAU, per-module usage. */
const SaasUsageReportPage = () => {
    const navigate = useNavigate();
    const { items: orgs } = useCollection('organizations');
    const { items: users } = useCollection('users');

    // First two tiles reflect the live store; the rest are platform telemetry.
    const live = {
        orgs: formatNumber(orgs.filter((o) => o.status === 'Active').length),
        users: formatNumber(users.filter((u) => u.status === 'Active').length),
    };

    return (
        <div>
            <PageTitle title="SaaS Report Usage" />

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-3">
                {SAAS_USAGE_STATS.map((s) => (
                    <StatCard key={s.key} label={s.label} value={live[s.key] ?? s.value} tone={s.tone} icon={ICONS[s.key]} trend={s.trend} trendLabel="Vs Last 30 Days" />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-3 mb-3 xl:max-w-[1100px]">
                <Panel title="DAU vs MAU Trend" extra={<button type="button" className="text-xs" style={{ color: COLORS.primary }} onClick={() => navigate(ROUTES.USER_REPORT)}>View All</button>}>
                    <AreaTrend
                        data={DAU_MAU}
                        series={[{ key: 'mau', name: 'MAU', color: '#93B4F5' }, { key: 'dau', name: 'DAU', color: COLORS.primary }]}
                        height={220}
                    />
                </Panel>
                <Panel title="Claims By Region">
                    <ProgressBars data={CLAIMS_BY_REGION} />
                    <button type="button" className="text-[13px] mt-4" style={{ color: COLORS.primary }} onClick={() => navigate(ROUTES.CLAIM_REPORT)}>View Regionwise Report</button>
                </Panel>
            </div>

            <DataTable
                title="Module Usage Table"
                rowKey="module"
                dataSource={MODULE_USAGE}
                pageSize={6}
                scrollX={700}
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
