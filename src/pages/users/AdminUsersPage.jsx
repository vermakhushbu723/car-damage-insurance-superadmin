import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Select, Switch, App } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import PageTitle from '../../components/ui/PageTitle';
import StatusTag from '../../components/ui/StatusTag';
import DataTable from '../../components/ui/DataTable';
import UserCell from '../../components/ui/UserCell';
import DetailsModal from '../../components/ui/DetailsModal';
import { ViewButton } from '../../components/ui/RowActions';
import { useCollection, useAuditLog } from '../../store/DataStore';
import { ROUTES } from '../../constants/routes';
import { ADMIN_ROLES } from '../../data/seed';
import { COLORS } from '../../constants/theme';
import { formatDateTime, matchesQuery } from '../../utils/format';

const ADMIN_STATUSES = ['Active', 'Pending', 'Suspended'];
const EMPTY = { q: '', role: 'All', status: 'All', mfa: 'All' };
const withAll = (list, label) => [{ value: 'All', label }, ...list.map((v) => ({ value: v, label: v }))];

const RoleChip = ({ role }) => (
    <span className="inline-block rounded-md px-3 py-1 text-[13px] whitespace-nowrap" style={{ background: '#EEF3FB', color: COLORS.textPrimary, minWidth: 130, textAlign: 'center' }}>{role}</span>
);

/** Admin Users -- platform administrators (role chip, MFA column). Same list pattern as Users. */
const AdminUsersPage = () => {
    const navigate = useNavigate();
    const { message } = App.useApp();
    const log = useAuditLog();
    const { items: admins, update } = useCollection('adminUsers');
    const [draft, setDraft] = useState(EMPTY);
    const [applied, setApplied] = useState(EMPTY);
    const [editing, setEditing] = useState(false);
    const [viewing, setViewing] = useState(null);

    const rows = useMemo(() => admins.filter((a) =>
        matchesQuery(a, draft.q, ['name', 'email', 'role'])
        && (applied.role === 'All' || a.role === applied.role)
        && (applied.status === 'All' || a.status === applied.status)
        && (applied.mfa === 'All' || (applied.mfa === 'Enabled') === a.mfa)), [admins, draft.q, applied]);

    const change = (id, patch, label) => {
        update(id, patch);
        log('Updated', 'Users');
        message.success(`${label} updated.`);
    };

    return (
        <div>
            <PageTitle title="Admin Users" extra={<Button type="primary" className="min-w-[150px]" onClick={() => setEditing((e) => !e)}>{editing ? 'Done Editing' : 'Edit & Modify'}</Button>} />

            <div className="filter-bar flex flex-wrap items-center gap-2 mb-3">
                <Input className="w-full sm:flex-1 sm:min-w-[220px] sm:max-w-[420px]" placeholder="Search Admin Users...." suffix={<SearchOutlined />} allowClear value={draft.q} onChange={(e) => setDraft({ ...draft, q: e.target.value })} />
                <Select className="w-[calc(50%-4px)] sm:w-[140px]" value={draft.role} onChange={(v) => setDraft({ ...draft, role: v })} options={withAll(ADMIN_ROLES, 'Role All')} popupMatchSelectWidth={false} />
                <Select className="w-[calc(50%-4px)] sm:w-[130px]" value={draft.status} onChange={(v) => setDraft({ ...draft, status: v })} options={withAll(ADMIN_STATUSES, 'Status All')} />
                <Select
                    className="w-[calc(50%-4px)] sm:w-[140px]"
                    value={draft.mfa}
                    onChange={(v) => setDraft({ ...draft, mfa: v })}
                    options={[{ value: 'All', label: 'More Filters' }, { value: 'Enabled', label: 'MFA Enabled' }, { value: 'Disabled', label: 'MFA Disabled' }]}
                />
                <Button type="primary" onClick={() => setApplied(draft)}>Apply Filters</Button>
                <Button type="primary" className="sm:ml-auto min-w-[150px]" onClick={() => navigate(ROUTES.ADMIN_USER_NEW)}>+ Add Admin User</Button>
            </div>

            <DataTable
                dataSource={rows}
                pageSize={9}
                scrollX={1050}
                locale={{ emptyText: 'No admin users match these filters.' }}
                columns={[
                    { title: 'Admin User', dataIndex: 'name', width: 180, render: (n) => <UserCell name={n} /> },
                    { title: 'Email', dataIndex: 'email' },
                    {
                        title: 'Role', dataIndex: 'role', align: 'center',
                        render: (r, row) => (editing ? <Select size="small" value={r} style={{ width: 150 }} options={ADMIN_ROLES.map((v) => ({ value: v, label: v }))} onChange={(v) => change(row.id, { role: v }, 'Role')} /> : <RoleChip role={r} />),
                    },
                    {
                        title: 'Status', dataIndex: 'status', align: 'center',
                        render: (s, row) => (editing ? <Select size="small" value={s} style={{ width: 110 }} options={ADMIN_STATUSES.map((v) => ({ value: v, label: v }))} onChange={(v) => change(row.id, { status: v }, 'Status')} /> : <StatusTag status={s} />),
                    },
                    { title: 'Last Login', dataIndex: 'lastLogin', render: formatDateTime },
                    {
                        title: 'MFA', dataIndex: 'mfa',
                        render: (m, row) => (editing
                            ? <Switch size="small" checked={m} checkedChildren="On" unCheckedChildren="Off" onChange={(v) => change(row.id, { mfa: v }, 'MFA')} />
                            : (m ? 'Enabled' : 'Disabled')),
                    },
                    { title: 'Action', key: 'a', align: 'center', width: 70, render: (_, r) => <ViewButton onClick={() => setViewing(r)} /> },
                ]}
            />

            <DetailsModal
                open={!!viewing}
                title={viewing?.name}
                onClose={() => setViewing(null)}
                items={viewing ? [
                    { label: 'Admin ID', value: viewing.id },
                    { label: 'Status', value: <StatusTag status={viewing.status} size="sm" /> },
                    { label: 'Email', value: viewing.email, span: 2 },
                    { label: 'Phone', value: viewing.phone },
                    { label: 'Role', value: viewing.role },
                    { label: 'MFA', value: viewing.mfa ? 'Enabled' : 'Disabled' },
                    { label: 'Last Login', value: formatDateTime(viewing.lastLogin) },
                ] : []}
            />
        </div>
    );
};

export default AdminUsersPage;
