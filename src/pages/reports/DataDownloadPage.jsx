import React, { useMemo, useState } from 'react';
import { Button, DatePicker, Select, Tooltip, App } from 'antd';
import {
    FileTextOutlined, TeamOutlined, SnippetsOutlined, CreditCardOutlined, AuditOutlined, ArrowDownOutlined, FilterOutlined, LoadingOutlined,
} from '@ant-design/icons';
import PageTitle from '../../components/ui/PageTitle';
import StatusTag from '../../components/ui/StatusTag';
import DataTable from '../../components/ui/DataTable';
import { useCollection } from '../../store/DataStore';
import { downloadsApi } from '../../api/superadminApi';
import { COLORS } from '../../constants/theme';
import { formatDateTime } from '../../utils/format';

const DATA_TILES = [
    { key: 'Claims', icon: <FileTextOutlined /> },
    { key: 'Users', icon: <TeamOutlined /> },
    { key: 'Survey', icon: <SnippetsOutlined /> },
    { key: 'Payments', icon: <CreditCardOutlined /> },
    { key: 'Audit Logs', icon: <AuditOutlined /> },
];
const FORMATS = [{ value: 'csv', label: 'CSV' }, { value: 'excel', label: 'Excel (CSV)' }];
const formatSize = (b = 0) => (b >= 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);

/**
 * Data Download -- pick a dataset, optional date range + organization and a
 * format; "Generate Download" builds the CSV on the server from the database,
 * saves it in Download History (kept 7 days) and downloads it.
 */
const DataDownloadPage = () => {
    const { message } = App.useApp();
    const { items: orgs } = useCollection('organizations');
    const { items: history, loading, upsert, error } = useCollection('downloads');
    const [dataType, setDataType] = useState('Claims');
    const [from, setFrom] = useState(null);
    const [to, setTo] = useState(null);
    const [org, setOrg] = useState(null);
    const [format, setFormat] = useState(null);
    const [generating, setGenerating] = useState(false);
    const [fetching, setFetching] = useState(null);

    const orgOptions = useMemo(() => orgs.map((o) => ({ value: o.id, label: `${o.name} (${o.id})` })), [orgs]);

    const generate = async () => {
        if (!format) return message.warning('Select a format first.');
        if (from && to && to.isBefore(from, 'day')) return message.error('End date is before start date.');
        setGenerating(true);
        try {
            const record = await downloadsApi.create({
                dataType,
                format,
                ...(from ? { from: from.startOf('day').toISOString() } : {}),
                ...(to ? { to: to.endOf('day').toISOString() } : {}),
                ...(org && dataType !== 'Audit Logs' ? { organizationId: org } : {}),
            });
            upsert(record);
            await downloadsApi.save(record);
            message.success(`${record.fileName} generated (${record.rows} rows).`);
        } catch (err) {
            if (err.status === 422) message.warning(err.message);
            else message.error(err.message);
        } finally {
            setGenerating(false);
        }
    };

    const redownload = async (row) => {
        if (row.status !== 'Ready') return message.error('This file has expired. Generate it again.');
        setFetching(row.id);
        try {
            await downloadsApi.save(row);
        } catch (err) {
            message.error(err.message);
        } finally {
            setFetching(null);
        }
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
                loading={loading}
                locale={{ emptyText: error ? `Could not load download history: ${error}` : 'No downloads yet.' }}
                pageSize={6}
                scrollX={960}
                columns={[
                    { title: 'File Name', dataIndex: 'fileName', width: 260 },
                    { title: 'Data Type', dataIndex: 'dataType' },
                    { title: 'Generated By', dataIndex: 'generatedBy' },
                    { title: 'Generated On', dataIndex: 'generatedOn', render: formatDateTime },
                    { title: 'Rows', dataIndex: 'rows', align: 'center' },
                    { title: 'File Size', dataIndex: 'sizeBytes', align: 'center', render: formatSize },
                    { title: 'Status', dataIndex: 'status', align: 'center', render: (s) => <StatusTag status={s} minWidth={76} /> },
                    {
                        title: 'Action', key: 'a', align: 'center',
                        render: (_, r) => (
                            <Tooltip title={r.status === 'Ready' ? 'Download' : 'Expired'}>
                                <button type="button" onClick={() => redownload(r)} disabled={fetching === r.id} aria-label={`Download ${r.fileName}`} className="p-1" style={{ color: r.status === 'Ready' ? COLORS.success : COLORS.textMuted, fontSize: 15 }}>
                                    {fetching === r.id ? <LoadingOutlined /> : <ArrowDownOutlined />}
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
