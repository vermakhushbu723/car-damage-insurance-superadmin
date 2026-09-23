import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Select, App } from 'antd';
import { SearchOutlined, TeamOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import PageTitle from '../../components/ui/PageTitle';
import StatCard from '../../components/ui/StatCard';
import StatusTag from '../../components/ui/StatusTag';
import DataTable from '../../components/ui/DataTable';
import UserCell from '../../components/ui/UserCell';
import DetailsModal from '../../components/ui/DetailsModal';
import { ViewButton } from '../../components/ui/RowActions';
import { useCollection, useAuditLog } from '../../store/DataStore';
import { ROUTES } from '../../constants/routes';
import { USER_ROLES, USER_STATUSES } from '../../data/seed';
import { formatDateTime, matchesQuery, formatNumber } from '../../utils/format';

const EMPTY = { q: '', org: 'All', role: 'All', status: 'All' };
const withAll = (list, label) => [{ value: 'All', label }, ...list.map((v) => ({ value: v, label: v }))];

/**
 * Users list (field users across all organizations). Same filter/apply +
 * "Edit & Modify" (inline Role/Status) pattern as Organizations/Vendors;
 * the eye opens the user's details, incl. the User ID Password Reset needs.
 */
const UsersPage = () => {
    const navigate = useNavigate();
    const { message } = App.useApp();
    const log = useAuditLog();
    const { items: users, update } = useCollection('users');
    const [draft, setDraft] = useState(EMPTY);
    const [applied, setApplied] = useState(EMPTY);
    const [editing, setEditing] = useState(false);
    const [viewing, setViewing] = useState(null);

    const orgNames = useMemo(() => [...new Set(users.map((u) => u.organization))].sort(), [users]);
    const rows = useMemo(() => users.filter((u) =>
        matchesQuery(u, draft.q, ['name', 'email', 'userId', 'organization', 'branch'])
        && (applied.org === 'All' || u.organization === applied.org)
        && (applied.role === 'All' || u.role === applied.role)
        && (applied.status === 'All' || u.status === applied.status)), [users, draft.q, applied]);

    const count = (s) => users.filter((u) => u.status === s).length;
    const quick = (status) => {
        const next = { ...draft, status };
        setDraft(next);
        setApplied(next);
    };
    const change = (id, patch, label) => {
        update(id, patch);
        log('Updated', 'Users');
        message.success(`${label} updated.`);
    };

    return (
        <div>
            <PageTitle title="Users" extra={<Button type="primary" className="min-w-[150px]" onClick={() => setEditing((e) => !e)}>{editing ? 'Done Editing' : 'Edit & Modify'}</Button>} />

            <div className="filter-bar flex flex-wrap items-center gap-2 mb-3">
                <Input className="w-full sm:flex-1 sm:min-w-[220px] sm:max-w-[420px]" placeholder="Search Users........" suffix={<SearchOutlined />} allowClear value={draft.q} onChange={(e) => setDraft({ ...draft, q: e.target.value })} />
                <Select className="w-[calc(50%-4px)] sm:w-[150px]" value={draft.org} onChange={(v) => setDraft({ ...draft, org: v })} options={withAll(orgNames, 'Organisation All')} popupMatchSelectWidth={false} />
                <Select className="w-[calc(50%-4px)] sm:w-[130px]" value={draft.role} onChange={(v) => setDraft({ ...draft, role: v })} options={withAll(USER_ROLES, 'Role All')} popupMatchSelectWidth={false} />
                <Select className="w-[calc(50%-4px)] sm:w-[130px]" value={draft.status} onChange={(v) => setDraft({ ...draft, status: v })} options={withAll(USER_STATUSES, 'Status All')} />
                <Button type="primary" onClick={() => setApplied(draft)}>Apply Filters</Button>
                <Button type="primary" className="sm:ml-auto min-w-[150px]" onClick={() => navigate(ROUTES.USER_NEW)}>+ Add User</Button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                <StatCard label="Total Users" value={formatNumber(users.length)} icon={<TeamOutlined />} tone="blue" onClick={() => quick('All')} active={applied.status === 'All'} />
                <StatCard label="Active Users" value={formatNumber(count('Active'))} icon={<CheckCircleOutlined />} tone="green" onClick={() => quick('Active')} active={applied.status === 'Active'} />
                <StatCard label="Inactive Users" value={formatNumber(count('Inactive'))} icon={<ClockCircleOutlined />} tone="orange" onClick={() => quick('Inactive')} active={applied.status === 'Inactive'} />
                <StatCard label="Pending Users" value={formatNumber(count('Pending'))} icon={<CloseCircleOutlined />} tone="red" onClick={() => quick('Pending')} active={applied.status === 'Pending'} />
            </div>

            <DataTable
                dataSource={rows}
                scrollX={960}
                locale={{ emptyText: 'No users match these filters.' }}
                columns={[
                    { title: 'Users Name', dataIndex: 'name', width: 200, render: (n) => <UserCell name={n} />, sorter: (a, b) => a.name.localeCompare(b.name) },
                    { title: 'Organization', dataIndex: 'organization' },
                    {
                        title: 'Role', dataIndex: 'role',
                        render: (r, row) => (editing ? <Select size="small" value={r} style={{ width: 130 }} options={USER_ROLES.map((v) => ({ value: v, label: v }))} onChange={(v) => change(row.id, { role: v }, 'Role')} /> : r),
                    },
                    {
                        title: 'Staus', dataIndex: 'status', align: 'center',
                        render: (s, row) => (editing ? <Select size="small" value={s} style={{ width: 110 }} options={USER_STATUSES.map((v) => ({ value: v, label: v }))} onChange={(v) => change(row.id, { status: v }, 'Status')} /> : <StatusTag status={s} />),
                    },
                    { title: 'Branch', dataIndex: 'branch', align: 'center' },
                    { title: 'Last Login', dataIndex: 'lastLogin', render: formatDateTime, sorter: (a, b) => a.lastLogin.localeCompare(b.lastLogin) },
                    { title: 'Action', key: 'a', align: 'center', width: 70, render: (_, r) => <ViewButton onClick={() => setViewing(r)} /> },
                ]}
            />

            <DetailsModal
                open={!!viewing}
                title={viewing?.name}
                onClose={() => setViewing(null)}
                items={viewing ? [
                    { label: 'User ID', value: viewing.userId },
                    { label: 'Status', value: <StatusTag status={viewing.status} size="sm" /> },
                    { label: 'Email', value: viewing.email, span: 2 },
                    { label: 'Phone', value: viewing.phone },
                    { label: 'Platform', value: viewing.platform },
                    { label: 'Organization', value: viewing.organization },
                    { label: 'Role', value: viewing.role },
                    { label: 'Branch', value: viewing.branch },
                    { label: 'Created On', value: formatDateTime(viewing.createdOn) },
                    { label: 'Last Login', value: formatDateTime(viewing.lastLogin), span: 2 },
                ] : []}
                footer={viewing && (
                    <Button onClick={() => navigate(`${ROUTES.PASSWORD_RESET}?userId=${viewing.userId}`)}>Reset Password</Button>
                )}
            />
        </div>
    );
};

export default UsersPage;
