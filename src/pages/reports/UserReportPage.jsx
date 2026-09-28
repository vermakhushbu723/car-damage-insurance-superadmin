import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tooltip, Dropdown, Button, App } from 'antd';
import { DatabaseOutlined, DownloadOutlined, DownOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import PageTitle from '../../components/ui/PageTitle';
import StatCard from '../../components/ui/StatCard';
import Panel from '../../components/ui/Panel';
import StatusTag from '../../components/ui/StatusTag';
import DataTable from '../../components/ui/DataTable';
import DetailsModal from '../../components/ui/DetailsModal';
import { AreaTrend, DonutWithLegend } from '../../components/charts/Charts';
import { useCollection, useAuditLog, newId } from '../../store/DataStore';
import { TREND_AUG, ROLE_DISTRIBUTION, HEATMAP, HEATMAP_DAYS } from '../../data/analytics';
import { ROUTES } from '../../constants/routes';
import { COLORS } from '../../constants/theme';
import { formatNumber, formatDate, formatDateTime, downloadCsv } from '../../utils/format';

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

const USER_EXPORT_COLUMNS = [
    { title: 'User ID', dataIndex: 'userId' }, { title: 'Name', dataIndex: 'name' }, { title: 'Email', dataIndex: 'email' },
    { title: 'Phone', dataIndex: 'phone' }, { title: 'Organization', dataIndex: 'organization' }, { title: 'Role', dataIndex: 'role' },
    { title: 'Branch', dataIndex: 'branch' }, { title: 'Platform', dataIndex: 'platform' }, { title: 'Status', dataIndex: 'status' },
    { title: 'Last Login', value: (r) => formatDateTime(r.lastLogin) }, { title: 'Created On', value: (r) => formatDate(r.createdOn) },
];
const CLAIM_EXPORT_COLUMNS = [
    { title: 'Claim ID', dataIndex: 'id' }, { title: 'Customer Name', dataIndex: 'customer' }, { title: 'Claim Type', dataIndex: 'claimType' },
    { title: 'Amount', dataIndex: 'amount' }, { title: 'SLA', value: (r) => `${r.slaDays} Days` }, { title: 'Status', dataIndex: 'status' },
];
const REPORTS = {
    users: { label: 'User List (CSV)', prefix: 'User_Report' },
    summary: { label: 'User Summary (CSV)', prefix: 'User_Summary' },
    claims: { label: 'Claim Details (CSV)', prefix: 'User_Report_Claims' },
};

/** User Report -- KPIs from the live users collection, charts from analytics, claim table from claims. */
const UserReportPage = () => {
    const navigate = useNavigate();
    const { message } = App.useApp();
    const log = useAuditLog();
    const { items: users } = useCollection('users');
    const { items: claims } = useCollection('claims');
    const { add: addDownload } = useCollection('downloads');
    const [viewing, setViewing] = useState(null);

    const kpi = useMemo(() => ({
        total: users.length,
        active: users.filter((u) => u.status === 'Active').length,
        inactive: users.filter((u) => u.status !== 'Active').length,
        fresh: users.filter((u) => dayjs().diff(dayjs(u.createdOn), 'day') <= 30).length,
    }), [users]);

    const donut = ROLE_DISTRIBUTION.map((r) => ({ ...r, display: `${r.value}(${r.pct})` }));

    // "Download Report": builds the CSV from live data and records it in Data Download + Audit Logs.
    const downloadReport = (kind) => {
        const fileName = `${REPORTS[kind].prefix}_${dayjs().format('YYYY_MM_DD')}.csv`;
        let rows;
        let columns;
        if (kind === 'users') {
            rows = users;
            columns = USER_EXPORT_COLUMNS;
        } else if (kind === 'claims') {
            rows = claims;
            columns = CLAIM_EXPORT_COLUMNS;
        } else {
            rows = [
                { metric: 'Total Users', value: kpi.total },
                { metric: 'Active Users', value: kpi.active },
                { metric: 'Inactive Users', value: kpi.inactive },
                { metric: 'New Users (30 days)', value: kpi.fresh },
                ...ROLE_DISTRIBUTION.map((r) => ({ metric: `Role - ${r.label}`, value: `${r.value} (${r.pct})` })),
            ];
            columns = [{ title: 'Metric', dataIndex: 'metric' }, { title: 'Value', dataIndex: 'value' }];
        }
        downloadCsv(fileName, rows, columns);
        const sizeKb = Math.max(1, Math.round((rows.length * columns.length * 14) / 1024));
        addDownload({ id: newId('DL'), fileName, dataType: kind === 'claims' ? 'Claims' : 'Users', generatedBy: 'Super Admin', generatedOn: new Date().toISOString(), size: `${sizeKb} KB`, status: 'Ready' });
        log('Downloaded', 'Reports');
        message.success(`${fileName} downloaded (${rows.length} rows).`);
    };

    return (
        <div>
            <PageTitle
                title="User Report"
                extra={(
                    <Dropdown
                        trigger={['click']}
                        menu={{ items: Object.entries(REPORTS).map(([key, r]) => ({ key, label: r.label })), onClick: ({ key }) => downloadReport(key) }}
                    >
                        <Button type="primary" icon={<DownloadOutlined />}>
                            Download Report <DownOutlined className="text-[10px]" />
                        </Button>
                    </Dropdown>
                )}
            />

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
