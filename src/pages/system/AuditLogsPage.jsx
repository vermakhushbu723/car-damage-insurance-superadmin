import React, { useMemo, useState } from 'react';
import { App } from 'antd';
import dayjs from 'dayjs';
import PageTitle from '../../components/ui/PageTitle';
import StatusTag from '../../components/ui/StatusTag';
import DataTable from '../../components/ui/DataTable';
import ReportFilters from '../../components/ui/ReportFilters';
import { useCollection, useAuditLog } from '../../store/DataStore';
import { AUDIT_ACTIONS, AUDIT_MODULES } from '../../data/seed';
import { formatDateTime, downloadCsv } from '../../utils/format';

const EMPTY = { user: 'All', role: 'All', module: 'All', action: 'All', status: 'All' };

/**
 * Audit Logs -- every admin action taken in this app is appended here
 * (see useAuditLog), on top of the seeded history. Filters apply on
 * "Refresh Report"; Export downloads the filtered rows as CSV.
 */
const AuditLogsPage = () => {
    const { message } = App.useApp();
    const log = useAuditLog();
    const { items: logs } = useCollection('auditLogs');
    const [range, setRange] = useState(null);
    const [draft, setDraft] = useState(EMPTY);
    const [applied, setApplied] = useState({ ...EMPTY, range: null });
    const [refreshing, setRefreshing] = useState(false);

    const filters = useMemo(() => [
        { key: 'user', label: 'Users', allLabel: 'All Users', options: [...new Set(logs.map((l) => l.user))].sort() },
        { key: 'role', label: 'Roles', allLabel: 'All Roles', options: [...new Set(logs.map((l) => l.role))].sort() },
        { key: 'module', label: 'Module', allLabel: 'All Modules', options: AUDIT_MODULES },
        { key: 'action', label: 'Action', allLabel: 'All Action', options: AUDIT_ACTIONS },
        { key: 'status', label: 'Status', allLabel: 'All', options: ['Success', 'Failed'] },
    ], [logs]);

    const rows = useMemo(() => logs.filter((l) => {
        if (applied.range) {
            const d = dayjs(l.timestamp);
            if (d.isBefore(applied.range[0].startOf('day')) || d.isAfter(applied.range[1].endOf('day'))) return false;
        }
        return ['user', 'role', 'module', 'action', 'status'].every((k) => applied[k] === 'All' || l[k] === applied[k]);
    }), [logs, applied]);

    const refresh = () => {
        setRefreshing(true);
        setTimeout(() => {
            setApplied({ ...draft, range });
            setRefreshing(false);
        }, 300);
    };

    const exportRows = () => {
        downloadCsv(`Audit_Logs_${dayjs().format('YYYY_MM_DD')}.csv`, rows, [
            { title: 'Time stamp', value: (r) => formatDateTime(r.timestamp) }, { title: 'User', dataIndex: 'user' }, { title: 'Role', dataIndex: 'role' },
            { title: 'Action', dataIndex: 'action' }, { title: 'IP/Devices', value: (r) => `${r.ip} / ${r.device}` }, { title: 'Module', dataIndex: 'module' }, { title: 'Status', dataIndex: 'status' },
        ]);
        log('Exported', 'Data');
        message.success(`${rows.length} log entries exported.`);
    };

    return (
        <div>
            <PageTitle title="Audit Logs" className="mb-2" />
            <ReportFilters
                range={range}
                onRangeChange={setRange}
                filters={filters}
                values={draft}
                onChange={setDraft}
                onExport={exportRows}
                onRefresh={refresh}
                refreshing={refreshing}
            />
            <DataTable
                title="Audit Logs Details"
                extra={<span className="text-xs text-slate-500">{rows.length} entries</span>}
                dataSource={rows}
                pageSize={6}
                scrollX={980}
                locale={{ emptyText: 'No log entries match these filters.' }}
                columns={[
                    { title: 'Time stamp', dataIndex: 'timestamp', render: formatDateTime, sorter: (a, b) => a.timestamp.localeCompare(b.timestamp), defaultSortOrder: 'descend' },
                    { title: 'Users', dataIndex: 'user' },
                    { title: 'Action', dataIndex: 'action' },
                    { title: 'IP/Devices', key: 'ip', align: 'center', render: (_, r) => `${r.ip} / ${r.device}` },
                    { title: 'Module', dataIndex: 'module' },
                    { title: 'Status', dataIndex: 'status', align: 'center', render: (s) => <StatusTag status={s} /> },
                ]}
            />
        </div>
    );
};

export default AuditLogsPage;
