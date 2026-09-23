import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tooltip } from 'antd';
import { DatabaseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import PageTitle from '../../components/ui/PageTitle';
import StatCard from '../../components/ui/StatCard';
import Panel from '../../components/ui/Panel';
import StatusTag from '../../components/ui/StatusTag';
import DataTable from '../../components/ui/DataTable';
import DetailsModal from '../../components/ui/DetailsModal';
import { AreaTrend, DonutWithLegend } from '../../components/charts/Charts';
import { useCollection } from '../../store/DataStore';
import { TREND_AUG, ROLE_DISTRIBUTION, HEATMAP, HEATMAP_DAYS } from '../../data/analytics';
import { ROUTES } from '../../constants/routes';
import { COLORS } from '../../constants/theme';
import { formatNumber, formatDate } from '../../utils/format';

const SLOT_LABELS = ['12 AM', '2 AM', '4 AM', '6AM', '8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM', '8 PM', '10 PM'];

/** 6-day x 12-slot activity grid; darker = more active users. */
const HeatMap = () => (
    <div className="flex flex-col gap-1.5">
        {HEATMAP.map((row, d) => (
            <div key={HEATMAP_DAYS[d]} className="flex items-center gap-1">
                <span className="text-[9px] w-6 shrink-0" style={{ color: COLORS.textMuted }}>{HEATMAP_DAYS[d]}</span>
                {row.map((v, s) => (
                    <Tooltip key={s} title={`${HEATMAP_DAYS[d]} ${SLOT_LABELS[s]} · ${Math.round(v * 420)} active users`}>
                        <span className="flex-1 rounded-sm" style={{ height: 22, background: `rgba(11,76,208,${0.08 + v * 0.8})` }} />
                    </Tooltip>
                ))}
            </div>
        ))}
        <div className="flex justify-between pl-7 text-[9px]" style={{ color: COLORS.textMuted }}>
            <span>12 AM</span><span>6AM</span><span>12 PM</span><span>6 PM</span>
        </div>
    </div>
);

/** User Report -- KPIs from the live users collection, charts from analytics, claim table from claims. */
const UserReportPage = () => {
    const navigate = useNavigate();
    const { items: users } = useCollection('users');
    const { items: claims } = useCollection('claims');
    const [viewing, setViewing] = useState(null);

    const kpi = useMemo(() => ({
        total: users.length,
        active: users.filter((u) => u.status === 'Active').length,
        inactive: users.filter((u) => u.status !== 'Active').length,
        fresh: users.filter((u) => dayjs().diff(dayjs(u.createdOn), 'day') <= 30).length,
    }), [users]);

    const donut = ROLE_DISTRIBUTION.map((r) => ({ ...r, display: `${r.value}(${r.pct})` }));

    return (
        <div>
            <PageTitle title="User Report" />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                <StatCard label="Total Users" value={formatNumber(kpi.total)} icon={<DatabaseOutlined />} tone="blue" trend="12%" trendLabel="VS Last 30 Days" onClick={() => navigate(ROUTES.USERS)} />
                <StatCard label="Active Users" value={formatNumber(kpi.active)} icon={<DatabaseOutlined />} tone="green" trend="12%" trendLabel="VS Last 30 Days" onClick={() => navigate(ROUTES.USERS)} />
                <StatCard label="Inactive Users" value={formatNumber(kpi.inactive)} icon={<DatabaseOutlined />} tone="slate" trend="12%" trendLabel="VS Last 30 Days" onClick={() => navigate(ROUTES.USER_ACTIVATION)} />
                <StatCard label="New Users" value={formatNumber(kpi.fresh)} icon={<DatabaseOutlined />} tone="purple" trend="12%" trendLabel="VS Last 30 Days" onClick={() => navigate(ROUTES.USERS)} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-[1fr_1.3fr_1fr] gap-3 mb-3">
                <Panel title="Users Growth" extra={<button type="button" className="text-xs" style={{ color: COLORS.primary }} onClick={() => navigate(ROUTES.USERS)}>View All</button>}>
                    <AreaTrend data={TREND_AUG} series={[{ key: 'value', name: 'Users', color: COLORS.primary }]} height={200} />
                </Panel>
                <Panel title="Role Distrubution">
                    <DonutWithLegend segments={donut} centerValue={kpi.total} centerLabel="Total Users" size={160} />
                </Panel>
                <Panel title="Users Active Heat Map" className="lg:col-span-2 xl:col-span-1">
                    <HeatMap />
                </Panel>
            </div>

            <DataTable
                title="Claim Details"
                dataSource={claims}
                pageSize={5}
                scrollX={860}
                onRow={(r) => ({ onClick: () => setViewing(r), style: { cursor: 'pointer' } })}
                columns={[
                    { title: 'Claim ID', dataIndex: 'id' },
                    { title: 'Customer Name', dataIndex: 'customer' },
                    { title: 'Claim Type', dataIndex: 'claimType' },
                    { title: 'Ammount', dataIndex: 'amount', align: 'center', render: formatNumber },
                    { title: 'SLA', dataIndex: 'slaDays', align: 'center', render: (d) => `${d} Days` },
                    { title: 'Staus', dataIndex: 'status', align: 'center', render: (s) => <StatusTag status={s} /> },
                ]}
            />

            <DetailsModal
                open={!!viewing}
                title={viewing ? `Claim ${viewing.id}` : ''}
                onClose={() => setViewing(null)}
                items={viewing ? [
                    { label: 'Customer', value: viewing.customer },
                    { label: 'Status', value: <StatusTag status={viewing.status} size="sm" /> },
                    { label: 'Claim Type', value: viewing.claimType },
                    { label: 'Amount', value: `₹ ${formatNumber(viewing.amount)}` },
                    { label: 'Handler', value: viewing.handler },
                    { label: 'Intimation Date', value: formatDate(viewing.intimationDate) },
                ] : []}
            />
        </div>
    );
};

export default UserReportPage;
