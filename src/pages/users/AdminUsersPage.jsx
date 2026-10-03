import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Select, Switch, Tooltip, App } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import PageTitle from '../../components/ui/PageTitle';
import StatusTag from '../../components/ui/StatusTag';
import DataTable from '../../components/ui/DataTable';
import UserCell from '../../components/ui/UserCell';
import DetailsModal from '../../components/ui/DetailsModal';
import { ViewButton } from '../../components/ui/RowActions';
import { useCollection, useRoles } from '../../store/DataStore';
import { adminUsersApi } from '../../api/superadminApi';
import { isMasterAdmin, SCOPE_TITLE } from '../../auth/session';
import CredentialsModal from '../../components/organizations/CredentialsModal';
import { ROUTES } from '../../constants/routes';
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
    const { items: admins, loading, upsert, error } = useCollection('adminUsers');
    const roles = useRoles();
    const master = isMasterAdmin();
    const [saving, setSaving] = useState(null);
    const [credentials, setCredentials] = useState(null);
    const [draft, setDraft] = useState(EMPTY);
    const [applied, setApplied] = useState(EMPTY);
    const [editing, setEditing] = useState(false);
    const [viewing, setViewing] = useState(null);

    const rows = useMemo(() => admins.filter((a) =>
        matchesQuery(a, draft.q, ['name', 'email', 'role'])
        && (applied.role === 'All' || a.role === applied.role)
        && (applied.status === 'All' || a.status === applied.status)
        && (applied.mfa === 'All' || (applied.mfa === 'Enabled') === a.mfa)), [admins, draft.q, applied]);

    const change = async (id, patch, label) => {
        setSaving(id);
        try {
            const updated = await adminUsersApi.update(id, patch);
            upsert(updated);
            if (viewing?.id === id) setViewing(updated);
            message.success(`${label} updated.`);
        } catch (err) {
            message.error(err.message);
        } finally {
            setSaving(null);
        }
    };

    const resetPassword = async (admin) => {
        try {
            const res = await adminUsersApi.resetPassword(admin.id);
            setViewing(null);
            setCredentials({
                title: 'Password reset',
                fileName: admin.id,
                note: `Share the new temporary password with ${admin.name}.`,
                rows: [['Admin', `${admin.name} (${admin.id})`], ['Login ID', res.loginId], ['Temporary Password', res.password, 'password']],
            });
        } catch (err) {
            message.error(err.message);
        }
    };

    return (
        <div>
            <PageTitle title="Admin Users" extra={(
                <Tooltip title={master ? '' : 'Only the master Super Admin can change admin users.'}>
                    <Button type="primary" className="min-w-[150px]" disabled={!master} onClick={() => setEditing((e) => !e)}>{editing ? 'Done Editing' : 'Edit & Modify'}</Button>
                </Tooltip>
            )} />

            <div className="filter-bar flex flex-wrap items-center gap-2 mb-3">
                <Input className="w-full sm:flex-1 sm:min-w-[220px] sm:max-w-[420px]" placeholder="Search Admin Users...." suffix={<SearchOutlined />} allowClear value={draft.q} onChange={(e) => setDraft({ ...draft, q: e.target.value })} />
                <Select className="w-[calc(50%-4px)] sm:w-[140px]" value={draft.role} onChange={(v) => setDraft({ ...draft, role: v })} options={withAll(roles.list, 'Role All')} popupMatchSelectWidth={false} />
                <Select className="w-[calc(50%-4px)] sm:w-[130px]" value={draft.status} onChange={(v) => setDraft({ ...draft, status: v })} options={withAll(ADMIN_STATUSES, 'Status All')} />
                <Select
                    className="w-[calc(50%-4px)] sm:w-[140px]"
                    value={draft.mfa}
                    onChange={(v) => setDraft({ ...draft, mfa: v })}
                    options={[{ value: 'All', label: 'More Filters' }, { value: 'Enabled', label: 'MFA Enabled' }, { value: 'Disabled', label: 'MFA Disabled' }]}
                />
                <Button type="primary" onClick={() => setApplied(draft)}>Apply Filters</Button>
                <Button type="primary" className="sm:ml-auto min-w-[150px]" disabled={!master} title={master ? undefined : 'Only the master Super Admin can add admin users.'} onClick={() => navigate(ROUTES.ADMIN_USER_NEW)}>+ Add Admin User</Button>
            </div>

            <DataTable
                dataSource={rows}
                loading={loading}
                locale={{ emptyText: error ? `Could not load admin users: ${error}` : 'No admin users match these filters.' }}
                pageSize={9}
                scrollX={1050}
                columns={[
                    { title: 'Admin User', dataIndex: 'name', width: 180, render: (n) => <UserCell name={n} /> },
                    { title: 'Email', dataIndex: 'email' },
                    {
                        title: 'Role', dataIndex: 'role', align: 'center',
                        render: (r, row) => (editing ? <Select size="small" value={r} disabled={saving === row.id} style={{ width: 150 }} options={roles.list.map((v) => ({ value: v, label: v }))} onChange={(v) => change(row.id, { role: v }, 'Role')} /> : <RoleChip role={r} />),
                    },
                    {
                        title: 'Status', dataIndex: 'status', align: 'center',
                        render: (s, row) => (editing ? <Select size="small" value={s} disabled={saving === row.id} style={{ width: 110 }} options={ADMIN_STATUSES.map((v) => ({ value: v, label: v }))} onChange={(v) => change(row.id, { status: v }, 'Status')} /> : <StatusTag status={s} />),
                    },
                    { title: 'Last Login', dataIndex: 'lastLogin', render: formatDateTime },
                    {
                        title: 'MFA', dataIndex: 'mfa',
                        render: (m, row) => (editing
                            ? <Switch size="small" checked={m} disabled={saving === row.id} checkedChildren="On" unCheckedChildren="Off" onChange={(v) => change(row.id, { mfa: v }, 'MFA')} />
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
                    { label: 'Scope', value: SCOPE_TITLE[viewing.scope] },
                    { label: 'MFA', value: viewing.mfa ? 'Enabled' : 'Disabled' },
                    { label: 'Last Login', value: formatDateTime(viewing.lastLogin) },
                    { label: 'Created On', value: formatDateTime(viewing.createdOn) },
                ] : []}
                footer={viewing && master ? <Button onClick={() => resetPassword(viewing)}>Reset Password</Button> : null}
            />
            <CredentialsModal data={credentials} onClose={() => setCredentials(null)} />
        </div>
    );
};

export default AdminUsersPage;
