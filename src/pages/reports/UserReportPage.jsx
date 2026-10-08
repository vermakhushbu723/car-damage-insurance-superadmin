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
import { useCollection, useRemoteValue, useAuditLog } from '../../store/DataStore';
import { downloadsApi } from '../../api/superadminApi';
import { ROUTES } from '../../constants/routes';
import { COLORS } from '../../constants/theme';
import { formatNumber, formatDate, downloadCsv } from '../../utils/format';

const SLOT_LABELS = ['12 AM', '2 AM', '4 AM', '6 AM', '8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM', '8 PM', '10 PM'];
const ROLE_COLORS = ['#2563EB', '#7C3AED', '#F59E0B', '#0E8AA8', '#4F46E5', '#0284C7', '#16A34A', '#DC2626'];

/** 6-day x 12-slot grid of console sign-ins (last 90 days); darker = more sign-ins. */
const HeatMap = ({ heatmap }) => {
    const days = heatmap?.days ?? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (
        <div className="flex flex-col gap-1.5">
            {days.map((day, d) => (
                <div key={day} className="flex items-center gap-1">
                    <span className="text-[9px] w-6 shrink-0" style={{ color: COLORS.textMuted }}>{day}</span>
                    {Array.from({ length: 12 }, (_, s) => {
                        const v = heatmap?.values?.[d]?.[s] ?? 0;
                        const n = heatmap?.counts?.[d]?.[s] ?? 0;
                        return (
                            <Tooltip key={s} title={`${day} ${SLOT_LABELS[s]} · ${n} sign-in${n === 1 ? '' : 's'}`}>
                                <span className="flex-1 rounded-sm" style={{ height: 22, background: `rgba(11,76,208,${0.08 + v * 0.8})` }} />
                            </Tooltip>
                        );
                    })}
                </div>
            ))}
            <div className="flex justify-between pl-7 text-[9px]" style={{ color: COLORS.textMuted }}>
                <span>12 AM</span><span>6 AM</span><span>12 PM</span><span>6 PM</span>
            </div>
        </div>
    );
};

const trendOf = (now, before) => {
    if (!before) return { trend: now ? '100%' : '0%', down: false };
    return { trend: `${Math.abs(Math.round(((now - before) / before) * 100))}%`, down: now < before };
};

/**
 * User Report -- everything from the database: user KPIs (trend = new users
 * in the last 30 days vs the 30 before), growth, role split, a sign-in heat
 * map from the audit trail, and the claims table.
 */
const UserReportPage = () => {
    const navigate = useNavigate();
    const { message } = App.useApp();
    const log = useAuditLog();
    const { items: users, loading } = useCollection('users');
    const { items: claims, loading: claimsLoading } = useCollection('claims');
    const { upsert: upsertDownload } = useCollection('downloads');
    const [usage] = useRemoteValue('usage');
    const [viewing, setViewing] = useState(null);
    const [downloading, setDownloading] = useState(false);

    const kpi = useMemo(() => {
        const now = dayjs();
        const createdIn = (list, from, to) => list.filter((u) => {
            const d = dayjs(u.createdOn);
            return d.isAfter(now.subtract(from, 'day')) && !d.isAfter(now.subtract(to, 'day'));
        }).length;
        const active = users.filter((u) => u.status === 'Active');
        const inactive = users.filter((u) => u.status !== 'Active');
        return {
            total: users.length,
            active: active.length,
            inactive: inactive.length,
            fresh: createdIn(users, 30, 0),
            trends: {
                total: trendOf(createdIn(users, 30, 0), createdIn(users, 60, 30)),
                active: trendOf(createdIn(active, 30, 0), createdIn(active, 60, 30)),
                inactive: trendOf(createdIn(inactive, 30, 0), createdIn(inactive, 60, 30)),
                fresh: trendOf(createdIn(users, 30, 0), createdIn(users, 60, 30)),
            },
        };
    }, [users]);

    // Total users at the end of each of the last 9 days.
    const growth = useMemo(() => Array.from({ length: 9 }, (_, i) => {
        const day = dayjs().subtract(8 - i, 'day').endOf('day');
        return { label: day.format('DD MMM'), value: users.filter((u) => !dayjs(u.createdOn).isAfter(day)).length };
    }), [users]);

    const donut = useMemo(() => {
        const byRole = users.reduce((m, u) => m.set(u.role, (m.get(u.role) ?? 0) + 1), new Map());
        return [...byRole.entries()].sort((a, b) => b[1] - a[1]).map(([role, n], i) => ({
            label: role, value: n, color: ROLE_COLORS[i % ROLE_COLORS.length], display: `${n}(${Math.round((n / users.length) * 100)}%)`,
        }));
    }, [users]);

    // User list / claims are generated on the server (and kept in Data Download); the summary is built here.
    const downloadReport = async (kind) => {
        if (kind === 'summary') {
            const rows = [
                { metric: 'Total Users', value: kpi.total },
                { metric: 'Active Users', value: kpi.active },
                { metric: 'Inactive Users', value: kpi.inactive },
                { metric: 'New Users (30 days)', value: kpi.fresh },
                ...donut.map((r) => ({ metric: `Role - ${r.label}`, value: r.display })),
            ];
            downloadCsv(`User_Summary_${dayjs().format('YYYY_MM_DD')}.csv`, rows, [{ title: 'Metric', dataIndex: 'metric' }, { title: 'Value', dataIndex: 'value' }]);
            log('Exported', 'Reports', 'Success', 'User summary CSV');
            return message.success('User summary downloaded.');
        }
        setDownloading(true);
        try {
            const record = await downloadsApi.create({ dataType: kind === 'claims' ? 'Claims' : 'Users', format: 'csv' });
            upsertDownload(record);
            await downloadsApi.save(record);
            message.success(`${record.fileName} downloaded (${record.rows} rows). Also kept in Data Download.`);
        } catch (err) {
            message.error(err.message);
        } finally {
            setDownloading(false);
        }
    };

    const t = kpi.trends;
    return (
        <div>
            <PageTitle
                title="User Report"
                extra={(
                    <Dropdown
                        trigger={['click']}
                        menu={{
                            items: [
                                { key: 'users', label: 'User List (CSV)' },
                                { key: 'summary', label: 'User Summary (CSV)' },
                                { key: 'claims', label: 'Claim Details (CSV)' },
                            ],
                            onClick: ({ key }) => downloadReport(key),
                        }}
                    >
                        <Button type="primary" icon={<DownloadOutlined />} loading={downloading}>
                            Download Report <DownOutlined className="text-[10px]" />
                        </Button>
                    </Dropdown>
                )}
            />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                <StatCard label="Total Users" value={formatNumber(kpi.total)} icon={<DatabaseOutlined />} tone="blue" trend={t.total.trend} trendDown={t.total.down} trendLabel="VS Last 30 Days" onClick={() => navigate(ROUTES.USERS)} />
                <StatCard label="Active Users" value={formatNumber(kpi.active)} icon={<DatabaseOutlined />} tone="green" trend={t.active.trend} trendDown={t.active.down} trendLabel="VS Last 30 Days" onClick={() => navigate(ROUTES.USERS)} />
                <StatCard label="Inactive Users" value={formatNumber(kpi.inactive)} icon={<DatabaseOutlined />} tone="slate" trend={t.inactive.trend} trendDown={t.inactive.down} trendLabel="VS Last 30 Days" onClick={() => navigate(ROUTES.USER_ACTIVATION)} />
                <StatCard label="New Users" value={formatNumber(kpi.fresh)} icon={<DatabaseOutlined />} tone="purple" trend={t.fresh.trend} trendDown={t.fresh.down} trendLabel="VS Last 30 Days" onClick={() => navigate(ROUTES.USERS)} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-[1fr_1.3fr_1fr] gap-3 mb-3">
                <Panel title="Users Growth" extra={<button type="button" className="text-xs" style={{ color: COLORS.primary }} onClick={() => navigate(ROUTES.USERS)}>View All</button>}>
                    <AreaTrend data={growth} series={[{ key: 'value', name: 'Users', color: COLORS.primary }]} height={200} />
                </Panel>
                <Panel title="Role Distrubution">
                    {donut.length
                        ? <DonutWithLegend segments={donut} centerValue={kpi.total} centerLabel="Total Users" size={160} />
                        : <p className="text-[13px] m-0 py-10 text-center" style={{ color: COLORS.textSecondary }}>{loading ? 'Loading…' : 'No users yet.'}</p>}
                </Panel>
                <Panel title="Users Active Heat Map" className="lg:col-span-2 xl:col-span-1">
                    <HeatMap heatmap={usage?.heatmap} />
                </Panel>
            </div>

            <DataTable
                title="Claim Details"
                dataSource={claims}
                loading={claimsLoading}
                pageSize={5}
                scrollX={860}
                locale={{ emptyText: 'No claims yet. Claims appear here when the claim systems send them.' }}
                onRow={(r) => ({ onClick: () => setViewing(r), style: { cursor: 'pointer' } })}
                columns={[
                    { title: 'Claim ID', dataIndex: 'id' },
                    { title: 'Customer Name', dataIndex: 'customer' },
                    { title: 'Claim Type', dataIndex: 'claimType', render: (v) => v || '—' },
                    { title: 'Ammount', dataIndex: 'amount', align: 'center', render: formatNumber },
                    { title: 'SLA', dataIndex: 'slaDays', align: 'center', render: (d) => (d == null ? '—' : `${d} Days`) },
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
                    { label: 'Organization', value: viewing.organization },
                    { label: 'Intimation Date', value: formatDate(viewing.intimationDate) },
                ] : []}
            />
        </div>
    );
};

export default UserReportPage;
