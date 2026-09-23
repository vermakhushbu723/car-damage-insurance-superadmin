import React, { useMemo, useState } from 'react';
import { Button, Input, Select, Tabs, Dropdown, App } from 'antd';
import { SearchOutlined, DownOutlined } from '@ant-design/icons';
import PageTitle from '../../components/ui/PageTitle';
import StatusTag from '../../components/ui/StatusTag';
import DataTable from '../../components/ui/DataTable';
import UserCell from '../../components/ui/UserCell';
import { useCollection, useAuditLog } from '../../store/DataStore';
import { USER_ROLES, USER_STATUSES } from '../../data/seed';
import { COLORS } from '../../constants/theme';
import { formatDateTime, matchesQuery, formatNumber } from '../../utils/format';

const EMPTY = { q: '', org: 'All', role: 'All', status: 'All' };
const withAll = (list, label) => [{ value: 'All', label }, ...list.map((v) => ({ value: v, label: v }))];

// Activation dropdown actions -> resulting status.
const ACTIONS = [
    { key: 'Active', label: 'Activate' },
    { key: 'Inactive', label: 'Deactivate' },
    { key: 'Suspended', label: 'Suspend' },
    { key: 'Pending', label: 'Mark Pending' },
];

/**
 * User Activation -- status tabs with live counts, row checkboxes for bulk
 * activation, and a per-row "Activate ▾" menu. Works on the same users
 * collection as the Users page, so changes show up there immediately.
 */
const UserActivationPage = () => {
    const { message } = App.useApp();
    const log = useAuditLog();
    const { items: users, update, updateMany } = useCollection('users');
    const [draft, setDraft] = useState(EMPTY);
    const [applied, setApplied] = useState(EMPTY);
    const [tab, setTab] = useState('All');
    const [selected, setSelected] = useState([]);

    const orgNames = useMemo(() => [...new Set(users.map((u) => u.organization))].sort(), [users]);
    const filtered = useMemo(() => users.filter((u) =>
        matchesQuery(u, draft.q, ['name', 'email', 'userId', 'organization'])
        && (applied.org === 'All' || u.organization === applied.org)
        && (applied.role === 'All' || u.role === applied.role)
        && (applied.status === 'All' || u.status === applied.status)), [users, draft.q, applied]);
    const rows = tab === 'All' ? filtered : filtered.filter((u) => u.status === tab);
    const count = (s) => filtered.filter((u) => u.status === s).length;

    const setStatus = (ids, status) => {
        if (ids.length === 1) update(ids[0], { status });
        else updateMany(ids, { status });
        log('Updated', 'Users');
        const label = ACTIONS.find((a) => a.key === status)?.label ?? status;
        message.success(`${label}: ${ids.length} user${ids.length > 1 ? 's' : ''} updated.`);
        setSelected((s) => s.filter((id) => !ids.includes(id)));
    };

    const tabItems = [
        { key: 'All', label: `All (${formatNumber(filtered.length)})` },
        { key: 'Pending', label: `Pending Activation (${formatNumber(count('Pending'))})` },
        { key: 'Active', label: `Active (${formatNumber(count('Active'))})` },
        { key: 'Inactive', label: `Inactive (${formatNumber(count('Inactive'))})` },
        { key: 'Suspended', label: `Suspended (${formatNumber(count('Suspended'))})` },
    ];

    return (
        <div>
            <PageTitle title="User Activation" />

            <div className="filter-bar flex flex-wrap items-center gap-2 mb-2">
                <Input className="w-full sm:flex-1 sm:min-w-[220px] sm:max-w-[420px]" placeholder="Search Users........" suffix={<SearchOutlined />} allowClear value={draft.q} onChange={(e) => setDraft({ ...draft, q: e.target.value })} />
                <Select className="w-[calc(50%-4px)] sm:w-[150px]" value={draft.org} onChange={(v) => setDraft({ ...draft, org: v })} options={withAll(orgNames, 'Organisation All')} popupMatchSelectWidth={false} />
                <Select className="w-[calc(50%-4px)] sm:w-[130px]" value={draft.role} onChange={(v) => setDraft({ ...draft, role: v })} options={withAll(USER_ROLES, 'Role All')} popupMatchSelectWidth={false} />
                <Select className="w-[calc(50%-4px)] sm:w-[130px]" value={draft.status} onChange={(v) => setDraft({ ...draft, status: v })} options={withAll(USER_STATUSES, 'Status All')} />
                <Button type="primary" onClick={() => setApplied(draft)}>Apply Filters</Button>
                {selected.length > 0 && (
                    <Dropdown menu={{ items: ACTIONS, onClick: ({ key }) => setStatus(selected, key) }} trigger={['click']}>
                        <Button>Bulk Action ({selected.length}) <DownOutlined /></Button>
                    </Dropdown>
                )}
            </div>

            <Tabs className="page-tabs" activeKey={tab} onChange={setTab} items={tabItems} />

            <DataTable
                dataSource={rows}
                scrollX={880}
                rowSelection={{ selectedRowKeys: selected, onChange: setSelected }}
                locale={{ emptyText: 'No users in this view.' }}
                columns={[
                    { title: 'Users Name', dataIndex: 'name', width: 200, render: (n) => <UserCell name={n} /> },
                    { title: 'Organization', dataIndex: 'organization' },
                    { title: 'Staus', dataIndex: 'status', align: 'center', render: (s) => <StatusTag status={s} /> },
                    { title: 'Created On', dataIndex: 'createdOn', align: 'center', render: formatDateTime },
                    {
                        title: 'Activation', key: 'act', align: 'center', width: 150,
                        render: (_, r) => (
                            <Dropdown menu={{ items: ACTIONS.filter((a) => a.key !== r.status), onClick: ({ key }) => setStatus([r.id], key) }} trigger={['click']}>
                                <button type="button" className="inline-flex items-center gap-2 rounded-md px-3 py-1 text-[13px] font-medium" style={{ background: COLORS.primarySoft, color: COLORS.primary }}>
                                    {r.status === 'Active' ? 'Activated' : 'Activate'} <DownOutlined style={{ fontSize: 10 }} />
                                </button>
                            </Dropdown>
                        ),
                    },
                ]}
            />
        </div>
    );
};

export default UserActivationPage;
