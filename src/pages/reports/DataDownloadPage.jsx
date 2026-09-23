import React, { useMemo, useState } from 'react';
import { Button, DatePicker, Select, Tooltip, App } from 'antd';
import {
    FileTextOutlined, TeamOutlined, SnippetsOutlined, CreditCardOutlined, AuditOutlined, ArrowDownOutlined, FilterOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import PageTitle from '../../components/ui/PageTitle';
import StatusTag from '../../components/ui/StatusTag';
import DataTable from '../../components/ui/DataTable';
import { useCollection, useAuditLog, newId } from '../../store/DataStore';
import { COLORS } from '../../constants/theme';
import { formatDateTime, formatDate, downloadCsv } from '../../utils/format';

const DATA_TILES = [
    { key: 'Claims', icon: <FileTextOutlined /> },
    { key: 'Users', icon: <TeamOutlined /> },
    { key: 'Survey', icon: <SnippetsOutlined /> },
    { key: 'Payments', icon: <CreditCardOutlined /> },
    { key: 'Audit Logs', icon: <AuditOutlined /> },
];
const FORMATS = [{ value: 'csv', label: 'CSV' }, { value: 'excel', label: 'Excel (CSV)' }];

/**
 * Data Download -- pick a dataset, optional date range + organization
 * filter and a format, then "Generate Download" builds a real CSV from the
 * live store, downloads it and records it in Download History (where it
 * can be downloaded again until it expires).
 */
const DataDownloadPage = () => {
    const { message } = App.useApp();
    const log = useAuditLog();
    const { items: claims } = useCollection('claims');
    const { items: users } = useCollection('users');
    const { items: auditLogs } = useCollection('auditLogs');
    const { items: history, add } = useCollection('downloads');
    const [dataType, setDataType] = useState('Claims');
    const [from, setFrom] = useState(null);
    const [to, setTo] = useState(null);
    const [org, setOrg] = useState(null);
    const [format, setFormat] = useState(null);
    const [generating, setGenerating] = useState(false);

    const orgOptions = useMemo(() => [...new Set([...claims.map((c) => c.organization), ...users.map((u) => u.organization)])].sort().map((o) => ({ value: o, label: o })), [claims, users]);

    // dataset -> { rows, columns, dateField }
    const buildDataset = (type) => {
        switch (type) {
            case 'Users':
                return { rows: users, dateField: 'createdOn', columns: [
                    { title: 'User ID', dataIndex: 'userId' }, { title: 'Name', dataIndex: 'name' }, { title: 'Email', dataIndex: 'email' },
                    { title: 'Phone', dataIndex: 'phone' }, { title: 'Organization', dataIndex: 'organization' }, { title: 'Role', dataIndex: 'role' },
                    { title: 'Status', dataIndex: 'status' }, { title: 'Branch', dataIndex: 'branch' }, { title: 'Created On', value: (r) => formatDateTime(r.createdOn) },
                ] };
            case 'Audit Logs':
                return { rows: auditLogs, dateField: 'timestamp', columns: [
                    { title: 'Time stamp', value: (r) => formatDateTime(r.timestamp) }, { title: 'User', dataIndex: 'user' }, { title: 'Role', dataIndex: 'role' },
                    { title: 'Action', dataIndex: 'action' }, { title: 'IP/Device', value: (r) => `${r.ip} / ${r.device}` }, { title: 'Module', dataIndex: 'module' }, { title: 'Status', dataIndex: 'status' },
                ] };
            case 'Survey':
                return { rows: claims.filter((c) => ['Survey', 'ILA', 'FLA'].includes(c.status)), dateField: 'intimationDate', columns: [
                    { title: 'Claim ID', dataIndex: 'id' }, { title: 'Customer', dataIndex: 'customer' }, { title: 'Stage', dataIndex: 'status' },
                    { title: 'Branch', dataIndex: 'branch' }, { title: 'Region', dataIndex: 'region' }, { title: 'Intimation Date', value: (r) => formatDate(r.intimationDate) },
                ] };
            case 'Payments':
                return { rows: claims.filter((c) => c.status === 'Settled'), dateField: 'intimationDate', columns: [
                    { title: 'Claim ID', dataIndex: 'id' }, { title: 'Customer', dataIndex: 'customer' }, { title: 'Amount (INR)', dataIndex: 'amount' },
                    { title: 'Organization', dataIndex: 'organization' }, { title: 'Date', value: (r) => formatDate(r.intimationDate) },
                ] };
            default:
                return { rows: claims, dateField: 'intimationDate', columns: [
                    { title: 'Claim ID', dataIndex: 'id' }, { title: 'Customer', dataIndex: 'customer' }, { title: 'Claim Type', dataIndex: 'claimType' },
                    { title: 'Handler', dataIndex: 'handler' }, { title: 'Amount', dataIndex: 'amount' }, { title: 'Status', dataIndex: 'status' },
                    { title: 'Organization', dataIndex: 'organization' }, { title: 'Intimation Date', value: (r) => formatDate(r.intimationDate) },
                ] };
        }
    };

    const filteredRows = (type, range, orgName) => {
        const ds = buildDataset(type);
        const rows = ds.rows.filter((r) => {
            const d = dayjs(r[ds.dateField]);
            if (range?.from && d.isBefore(dayjs(range.from).startOf('day'))) return false;
            if (range?.to && d.isAfter(dayjs(range.to).endOf('day'))) return false;
            if (orgName && r.organization && r.organization !== orgName) return false;
            return true;
        });
        return { rows, columns: ds.columns };
    };

    const generate = () => {
        if (!format) return message.warning('Select a format first.');
        if (from && to && to.isBefore(from)) return message.error('End date is before start date.');
        const { rows, columns } = filteredRows(dataType, { from, to }, org);
        if (!rows.length) return message.warning('No records for this selection -- widen the date range or clear the filter.');
        setGenerating(true);
        setTimeout(() => {
            const period = from || to ? `${(from ?? dayjs('2025-01-01')).format('MMM_DD')}_to_${(to ?? dayjs()).format('MMM_DD')}` : dayjs().format('MMM_YYYY');
            const fileName = `${dataType.replace(/\s+/g, '_')}_${period}.csv`;
            downloadCsv(fileName, rows, columns);
            const sizeKb = Math.max(1, Math.round((rows.length * columns.length * 14) / 1024));
            add({
                id: newId('DL'), fileName, dataType, generatedBy: 'Super Admin', generatedOn: new Date().toISOString(),
                size: sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`, status: 'Ready',
                params: { from: from?.toISOString() ?? null, to: to?.toISOString() ?? null, org },
            });
            log('Downloaded', 'Data');
            setGenerating(false);
            message.success(`${fileName} generated (${rows.length} rows).`);
        }, 400);
    };

    const redownload = (row) => {
        if (row.status !== 'Ready') return message.error('This file has expired. Generate it again.');
        const { rows, columns } = filteredRows(row.dataType, row.params, row.params?.org);
        downloadCsv(row.fileName, rows, columns);
        log('Downloaded', 'Data');
    };

    const stepTitle = 'text-base font-semibold m-0 mb-3';

    return (
        <div>
            <PageTitle
                title="Data Download"
                extra={(
                    <div className="flex flex-wrap items-end gap-2">
                        <div>
                            <span className="block text-sm font-semibold mb-1">Select Format</span>
                            <Select value={format} onChange={setFormat} placeholder="Select Format" options={FORMATS} style={{ width: 150 }} />
                        </div>
                        <Button type="primary" loading={generating} onClick={generate}>Generate Download</Button>
                    </div>
                )}
            />

            <div className="rounded-lg grid grid-cols-1 md:grid-cols-[1.3fr_1.2fr_0.8fr] mb-3" style={{ border: `1px solid ${COLORS.border}` }}>
                <div className="p-4 md:border-r" style={{ borderColor: COLORS.border }}>
                    <h3 className={stepTitle}>1. Select Data</h3>
                    <div className="flex flex-wrap gap-2.5">
                        {DATA_TILES.map((t) => {
                            const active = dataType === t.key;
                            return (
                                <button
                                    key={t.key}
                                    type="button"
                                    onClick={() => setDataType(t.key)}
                                    className="flex flex-col items-center justify-center gap-1 rounded-md text-[11px] transition-colors"
                                    style={{ width: 66, height: 62, color: COLORS.primary, background: active ? COLORS.bgSoftBlue : '#F8FAFC', border: `1px solid ${active ? COLORS.primary : COLORS.border}` }}
                                >
                                    <span style={{ fontSize: 18 }}>{t.icon}</span>
                                    {t.key}
                                </button>
                            );
                        })}
                    </div>
                </div>
                <div className="p-4 md:border-r" style={{ borderColor: COLORS.border }}>
                    <h3 className={stepTitle}>2. Select Date Range</h3>
                    <div className="flex items-center gap-2">
                        <DatePicker value={from} onChange={setFrom} format="DD MMMM YYYY" placeholder="01 June 2026" className="flex-1" />
                        <span style={{ color: COLORS.textMuted }}>—</span>
                        <DatePicker value={to} onChange={setTo} format="DD MMMM YYYY" placeholder="04 June 2026" className="flex-1" disabledDate={(d) => from && d.isBefore(from, 'day')} />
                    </div>
                </div>
                <div className="p-4">
                    <h3 className={stepTitle}>3. Select</h3>
                    <Select
                        value={org}
                        onChange={setOrg}
                        allowClear
                        placeholder="Select"
                        suffixIcon={<FilterOutlined />}
                        options={orgOptions}
                        showSearch={{ optionFilterProp: 'label' }}
                        className="w-full"
                        disabled={dataType === 'Audit Logs'}
                    />
                    <p className="text-[11px] mt-1.5 mb-0" style={{ color: COLORS.textSecondary }}>Organization filter (optional)</p>
                </div>
            </div>

            <DataTable
                title="Download History"
                dataSource={history}
                pageSize={6}
                scrollX={960}
                columns={[
                    { title: 'File Name', dataIndex: 'fileName', width: 260 },
                    { title: 'Data Type', dataIndex: 'dataType' },
                    { title: 'Generated By', dataIndex: 'generatedBy' },
                    { title: 'Generated On', dataIndex: 'generatedOn', render: formatDateTime },
                    { title: 'File Size', dataIndex: 'size', align: 'center' },
                    { title: 'Status', dataIndex: 'status', align: 'center', render: (s) => <StatusTag status={s} minWidth={76} /> },
                    {
                        title: 'Action', key: 'a', align: 'center',
                        render: (_, r) => (
                            <Tooltip title={r.status === 'Ready' ? 'Download' : 'Expired'}>
                                <button type="button" onClick={() => redownload(r)} aria-label={`Download ${r.fileName}`} className="p-1" style={{ color: r.status === 'Ready' ? COLORS.success : COLORS.textMuted, fontSize: 15 }}>
                                    <ArrowDownOutlined />
                                </button>
                            </Tooltip>
                        ),
                    },
                ]}
            />
        </div>
    );
};

export default DataDownloadPage;
