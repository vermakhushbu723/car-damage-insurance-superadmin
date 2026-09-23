import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { App } from 'antd';
import {
    DatabaseOutlined, FileAddOutlined, LoadingOutlined, SnippetsOutlined, WalletOutlined, CloseOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import PageTitle from '../../components/ui/PageTitle';
import StatCard from '../../components/ui/StatCard';
import Panel from '../../components/ui/Panel';
import StatusTag from '../../components/ui/StatusTag';
import DataTable from '../../components/ui/DataTable';
import DetailsModal from '../../components/ui/DetailsModal';
import ReportFilters from '../../components/ui/ReportFilters';
import { AreaTrend, DonutWithLegend, SimpleBars } from '../../components/charts/Charts';
import { useCollection, useAuditLog } from '../../store/DataStore';
import { BRANCHES, REGIONS, CLAIM_TYPES, CLAIM_STAGES, HANDLERS } from '../../data/seed';
import { TREND_AUG, SETTLEMENT_BY_REGION, CLAIM_REPORT_STATS } from '../../data/analytics';
import { ROUTES } from '../../constants/routes';
import { COLORS } from '../../constants/theme';
import { formatDate, formatNumber, downloadCsv } from '../../utils/format';

const FILTERS = [
    { key: 'branch', label: 'Branch', allLabel: 'All Branches', options: BRANCHES },
    { key: 'region', label: 'Region', allLabel: 'All Regions', options: REGIONS },
    { key: 'claimType', label: 'Claim Type', allLabel: 'All Types', options: CLAIM_TYPES },
    { key: 'status', label: 'Status', allLabel: 'All Status', options: CLAIM_STAGES },
    { key: 'handler', label: 'Handler', allLabel: 'All', options: HANDLERS },
];
const EMPTY = { branch: 'All', region: 'All', claimType: 'All', status: 'All', handler: 'All' };
const STAT_ICONS = { total: <DatabaseOutlined />, new: <FileAddOutlined />, survey: <LoadingOutlined />, assessment: <SnippetsOutlined />, settlement: <WalletOutlined />, rejected: <CloseOutlined /> };
const EXPORT_COLUMNS = [
    { title: 'Claim ID', dataIndex: 'id' }, { title: 'Customer Name', dataIndex: 'customer' }, { title: 'Claim Type', dataIndex: 'claimType' },
    { title: 'Handler', dataIndex: 'handler' }, { title: 'Amount', dataIndex: 'amount' }, { title: 'SLA', value: (r) => `${r.slaDays} Days` },
    { title: 'Status', dataIndex: 'status' }, { title: 'Branch', dataIndex: 'branch' }, { title: 'Region', dataIndex: 'region' },
    { title: 'Intimation Date', value: (r) => formatDate(r.intimationDate) },
];

/**
 * Claim Report -- filters (date range + 5 dropdowns) drive the Claim Details
 * table and its CSV export; Refresh Report re-applies the draft filters.
 * KPI tiles and charts are platform aggregates (data/analytics.js).
 */
const ClaimReportPage = () => {
    const navigate = useNavigate();
    const { message } = App.useApp();
    const log = useAuditLog();
    const { items: claims } = useCollection('claims');
    const { items: orgs } = useCollection('organizations');
    const [range, setRange] = useState(null);
    const [draft, setDraft] = useState(EMPTY);
    const [applied, setApplied] = useState({ ...EMPTY, range: null });
    const [refreshing, setRefreshing] = useState(false);
    const [viewing, setViewing] = useState(null);

    const rows = useMemo(() => claims.filter((c) => {
        if (applied.range) {
            const d = dayjs(c.intimationDate);
            if (d.isBefore(applied.range[0].startOf('day')) || d.isAfter(applied.range[1].endOf('day'))) return false;
        }
        return FILTERS.every((f) => applied[f.key] === 'All' || c[f.key] === applied[f.key]);
    }), [claims, applied]);

    const refresh = () => {
        setRefreshing(true);
        setTimeout(() => {
            setApplied({ ...draft, range });
            setRefreshing(false);
            message.success('Report refreshed.');
        }, 350);
    };

    const exportRows = (format) => {
        downloadCsv(`Claim_Report_${dayjs().format('YYYY_MM_DD')}.csv`, rows, EXPORT_COLUMNS);
        log('Exported', 'Reports');
        message.success(`${rows.length} claims exported${format === 'excel' ? ' (opens in Excel)' : ''}.`);
    };

    const orgDonut = useMemo(() => {
        const total = orgs.length || 1;
        const saas = orgs.filter((o) => o.serviceModel === 'SaaS' && !['Suspended', 'Expired'].includes(o.status)).length;
        const sp = orgs.filter((o) => o.serviceModel === 'Service Provider' && !['Suspended', 'Expired'].includes(o.status)).length;
        const susp = orgs.filter((o) => o.status === 'Suspended').length;
        const exp = orgs.filter((o) => o.status === 'Expired').length;
        const fmt = (n) => `${String(n).padStart(2, '0')}(${Math.round((n / total) * 100)}%)`;
        return [
            { label: 'SaaS', value: saas, color: '#1F6FEB', display: fmt(saas) },
            { label: 'Service Provider', value: sp, color: '#35B44A', display: fmt(sp) },
            { label: 'Suspended', value: susp, color: '#F03E3E', display: fmt(susp) },
            { label: 'Expired', value: exp, color: '#D9D9D9', display: fmt(exp) },
        ];
    }, [orgs]);

    return (
        <div>
            <PageTitle title="Claim Report" className="mb-2" />

            <ReportFilters
                range={range}
                onRangeChange={setRange}
                filters={FILTERS}
                values={draft}
                onChange={setDraft}
                onExport={exportRows}
                onRefresh={refresh}
                refreshing={refreshing}
            />

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-3">
                {CLAIM_REPORT_STATS.map((s) => (
                    <StatCard key={s.key} label={s.label} value={formatNumber(s.value)} tone={s.tone} icon={STAT_ICONS[s.key]} trend={s.trend} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-[1fr_1.35fr_0.95fr] gap-3 mb-3">
                <Panel title="System Alerts" extra={<button type="button" className="text-xs" style={{ color: COLORS.primary }} onClick={() => navigate(ROUTES.AUDIT_LOGS)}>View All</button>}>
                    <AreaTrend data={TREND_AUG} series={[{ key: 'value', name: 'Alerts', color: COLORS.primary }]} height={210} />
                </Panel>
                <Panel title="Organization Overview">
                    <DonutWithLegend segments={orgDonut} centerValue={orgs.length} size={160} onSegmentClick={() => navigate(ROUTES.ORGANIZATIONS)} />
                </Panel>
                <Panel title="Settlement Performance By Region" className="lg:col-span-2 xl:col-span-1">
                    <SimpleBars data={SETTLEMENT_BY_REGION} height={210} />
                </Panel>
            </div>

            <DataTable
                title="Claim Details"
                extra={<span className="text-xs text-slate-500">{rows.length} claims</span>}
                dataSource={rows}
                pageSize={5}
                scrollX={1100}
                locale={{ emptyText: 'No claims match these filters.' }}
                columns={[
                    { title: 'Claim ID', dataIndex: 'id' },
                    { title: 'Customer Name', dataIndex: 'customer' },
                    { title: 'Claim Type', dataIndex: 'claimType' },
                    { title: 'Handler', dataIndex: 'handler' },
                    { title: 'Ammount', dataIndex: 'amount', align: 'center', render: formatNumber, sorter: (a, b) => a.amount - b.amount },
                    { title: 'SLA', dataIndex: 'slaDays', align: 'center', render: (d) => `${d} Days` },
                    { title: 'Staus', dataIndex: 'status', align: 'center', render: (s) => <StatusTag status={s} /> },
                    { title: 'Intimation Date', dataIndex: 'intimationDate', render: formatDate, sorter: (a, b) => a.intimationDate.localeCompare(b.intimationDate) },
                    { title: 'Action', key: 'a', align: 'center', render: (_, r) => <button type="button" className="text-[13px] font-medium" style={{ color: COLORS.primary }} onClick={() => setViewing(r)}>View</button> },
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
                    { label: 'SLA', value: `${viewing.slaDays} Days` },
                    { label: 'Branch', value: viewing.branch },
                    { label: 'Region', value: viewing.region },
                    { label: 'Organization', value: viewing.organization },
                    { label: 'Intimation Date', value: formatDate(viewing.intimationDate) },
                ] : []}
            />
        </div>
    );
};

export default ClaimReportPage;
