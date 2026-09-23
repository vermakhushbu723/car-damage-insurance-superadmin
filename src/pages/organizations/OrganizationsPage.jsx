import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Select, App } from 'antd';
import { SearchOutlined, BankOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import PageTitle from '../../components/ui/PageTitle';
import StatCard from '../../components/ui/StatCard';
import StatusTag from '../../components/ui/StatusTag';
import DataTable from '../../components/ui/DataTable';
import { ViewButton } from '../../components/ui/RowActions';
import { useCollection, useAuditLog } from '../../store/DataStore';
import { ROUTES, orgPath } from '../../constants/routes';
import { ORG_TYPES, ORG_STATUSES, SERVICE_MODES } from '../../data/seed';
import { formatDate, matchesQuery } from '../../utils/format';

const EMPTY_FILTERS = { q: '', status: 'All', type: 'All', plan: 'All', serviceModel: 'All' };
const opts = (list, allLabel) => [{ value: 'All', label: allLabel }, ...list.map((v) => ({ value: v, label: v }))];

/**
 * Organizations/Vendors list. Filters are drafted in the bar and applied
 * with "Apply Filters" (search applies as you type); stat cards act as
 * quick status filters. "Edit & Modify" turns Status/Subscription into
 * inline dropdowns; the eye opens the organization's profile form.
 */
const OrganizationsPage = () => {
    const navigate = useNavigate();
    const { message } = App.useApp();
    const log = useAuditLog();
    const { items: orgs, update } = useCollection('organizations');
    const { items: plans } = useCollection('plans');
    const [draft, setDraft] = useState(EMPTY_FILTERS);
    const [applied, setApplied] = useState(EMPTY_FILTERS);
    const [editing, setEditing] = useState(false);

    const planOptions = plans.map((p) => ({ value: p.id, label: p.name }));
    const planName = (id) => plans.find((p) => p.id === id)?.name ?? '—';

    const rows = useMemo(() => orgs.filter((o) =>
        matchesQuery(o, draft.q, ['name', 'type', 'id'])
        && (applied.status === 'All' || o.status === applied.status)
        && (applied.type === 'All' || o.type === applied.type)
        && (applied.plan === 'All' || o.plan === applied.plan)
        && (applied.serviceModel === 'All' || o.serviceModel === applied.serviceModel)), [orgs, draft.q, applied]);

    const count = (s) => orgs.filter((o) => o.status === s).length;
    const quickStatus = (status) => {
        const next = { ...draft, status };
        setDraft(next);
        setApplied(next);
    };

    const setField = (id, field, value, label) => {
        update(id, { [field]: value });
        log('Updated', 'Organizations');
        message.success(`${label} updated.`);
    };

    const moreFilters = (
        <Select
            className="w-full sm:w-[150px]"
            value={draft.plan !== 'All' ? `plan:${draft.plan}` : draft.serviceModel !== 'All' ? `mode:${draft.serviceModel}` : 'All'}
            onChange={(v) => {
                if (v === 'All') return setDraft({ ...draft, plan: 'All', serviceModel: 'All' });
                const [kind, val] = v.split(':');
                setDraft({ ...draft, plan: kind === 'plan' ? val : 'All', serviceModel: kind === 'mode' ? val : 'All' });
            }}
            options={[
                { value: 'All', label: 'More Filters' },
                { label: 'Subscription', options: plans.map((p) => ({ value: `plan:${p.id}`, label: p.name })) },
                { label: 'Service Model', options: SERVICE_MODES.map((s) => ({ value: `mode:${s}`, label: s })) },
            ]}
        />
    );

    return (
        <div>
            <PageTitle
                title="Organizations/Vendors"
                extra={<Button type="primary" className="min-w-[150px]" onClick={() => setEditing((e) => !e)}>{editing ? 'Done Editing' : 'Edit & Modify'}</Button>}
            />

            <div className="filter-bar flex flex-wrap items-center gap-2 mb-3">
                <Input
                    className="w-full sm:flex-1 sm:min-w-[220px] sm:max-w-[420px]"
                    placeholder="Search Organzations/Vendors"
                    suffix={<SearchOutlined />}
                    value={draft.q}
                    onChange={(e) => setDraft({ ...draft, q: e.target.value })}
                    allowClear
                />
                <Select className="w-[calc(50%-4px)] sm:w-[130px]" value={draft.status} onChange={(v) => setDraft({ ...draft, status: v })} options={opts(ORG_STATUSES, 'Status All')} />
                <Select className="w-[calc(50%-4px)] sm:w-[130px]" value={draft.type} onChange={(v) => setDraft({ ...draft, type: v })} options={opts(ORG_TYPES, 'Type All')} />
                {moreFilters}
                <Button type="primary" onClick={() => setApplied(draft)}>Apply Filters</Button>
                <Button type="primary" className="sm:ml-auto" onClick={() => navigate(ROUTES.ORGANIZATION_NEW)}>+ Add Organizations</Button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                <StatCard label="Total Organizations" value={orgs.length} icon={<BankOutlined />} tone="blue" onClick={() => quickStatus('All')} active={applied.status === 'All'} />
                <StatCard label="Active" value={count('Active')} icon={<CheckCircleOutlined />} tone="green" onClick={() => quickStatus('Active')} active={applied.status === 'Active'} />
                <StatCard label="Pending" value={count('Pending')} icon={<ClockCircleOutlined />} tone="orange" onClick={() => quickStatus('Pending')} active={applied.status === 'Pending'} />
                <StatCard label="Suspended" value={count('Suspended')} icon={<CloseCircleOutlined />} tone="red" onClick={() => quickStatus('Suspended')} active={applied.status === 'Suspended'} />
            </div>

            <DataTable
                dataSource={rows}
                pageSize={8}
                scrollX={880}
                locale={{ emptyText: 'No organizations match these filters.' }}
                columns={[
                    { title: 'Organzation Name', dataIndex: 'name', sorter: (a, b) => a.name.localeCompare(b.name) },
                    { title: 'Type', dataIndex: 'type' },
                    { title: 'Users', dataIndex: 'users', align: 'center', sorter: (a, b) => a.users - b.users },
                    {
                        title: 'Staus', dataIndex: 'status', align: 'center', width: 150,
                        render: (s, r) => (editing
                            ? <Select size="small" value={s} style={{ width: 120 }} options={ORG_STATUSES.map((v) => ({ value: v, label: v }))} onChange={(v) => setField(r.id, 'status', v, 'Status')} />
                            : <StatusTag status={s} />),
                    },
                    {
                        title: 'Subscription', dataIndex: 'plan', width: 160,
                        render: (p, r) => (editing
                            ? <Select size="small" value={p} style={{ width: 130 }} options={planOptions} onChange={(v) => setField(r.id, 'plan', v, 'Subscription')} />
                            : planName(p)),
                    },
                    { title: 'Created On', dataIndex: 'createdOn', render: formatDate, sorter: (a, b) => a.createdOn.localeCompare(b.createdOn) },
                    { title: 'Action', key: 'action', align: 'center', width: 80, render: (_, r) => <ViewButton onClick={() => navigate(orgPath(r.id))} /> },
                ]}
            />
        </div>
    );
};

export default OrganizationsPage;
