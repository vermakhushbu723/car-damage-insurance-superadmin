import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Input, Select, App } from 'antd';
import { SearchOutlined, SafetyCertificateOutlined, ReloadOutlined } from '@ant-design/icons';
import PageTitle from '../../components/ui/PageTitle';
import StatusTag from '../../components/ui/StatusTag';
import DataTable from '../../components/ui/DataTable';
import UserCell from '../../components/ui/UserCell';
import DetailsModal from '../../components/ui/DetailsModal';
import { ViewButton } from '../../components/ui/RowActions';
import CredentialsModal from '../../components/organizations/CredentialsModal';
import { organizationsApi, usersApi } from '../../api/superadminApi';
import { getCurrentAdmin, SCOPE_TITLE } from '../../auth/session';
import { ROUTES, orgPath } from '../../constants/routes';
import { COLORS } from '../../constants/theme';
import { USER_STATUSES } from '../../data/options';
import { formatDateTime, matchesQuery } from '../../utils/format';

const EMPTY = { q: '', org: 'All', status: 'All' };
const withAll = (list, label) => [{ value: 'All', label }, ...list];

/** A temporary password the backend accepts (letters + digits, 12 chars). */
function tempPassword() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    const bytes = crypto.getRandomValues(new Uint8Array(10));
    return `${Array.from(bytes, (b) => chars[b % chars.length]).join('')}@${(bytes[0] % 90) + 10}`;
}

/**
 * Admin Users (Service Provider). The console has one Super Admin (the card on
 * top); the list is every organization's admin login (ORG-xxxx-ADM and any
 * other "Admin" issued for an organization). They sign in to the Admin portal
 * and manage their own organization's users. "+ Add Admin" issues a new admin
 * for an organization; status changes and resets reach the Admin portal too.
 */
const AdminUsersPage = () => {
    const navigate = useNavigate();
    const { message } = App.useApp();
    const me = getCurrentAdmin();
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [draft, setDraft] = useState(EMPTY);
    const [applied, setApplied] = useState(EMPTY);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(null);
    const [viewing, setViewing] = useState(null);
    const [credentials, setCredentials] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            setData(await organizationsApi.admins());
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => { load(); }, [load]);

    const admins = useMemo(() => data?.admins ?? [], [data]);
    const orgOptions = useMemo(() => {
        const seen = new Map(admins.map((a) => [a.organizationId, a.organization]));
        return [...seen].map(([value, name]) => ({ value, label: `${name} (${value})` }));
    }, [admins]);

    const rows = useMemo(() => admins.filter((a) =>
        matchesQuery(a, draft.q, ['id', 'name', 'email', 'phone', 'organization', 'organizationId'])
        && (applied.org === 'All' || a.organizationId === applied.org)
        && (applied.status === 'All' || a.status === applied.status)), [admins, draft.q, applied]);

    const setStatus = async (admin, status) => {
        setSaving(admin.id);
        try {
            await usersApi.update(admin.id, { status });
            setData((d) => ({ ...d, admins: d.admins.map((a) => (a.id === admin.id ? { ...a, status } : a)) }));
            if (viewing?.id === admin.id) setViewing({ ...viewing, status });
            message.success(`${admin.name}: status ${status}.`);
        } catch (err) {
            message.error(err.message);
        } finally {
            setSaving(null);
        }
    };

    const resetPassword = async (admin) => {
        const password = tempPassword();
        try {
            await usersApi.resetPassword(admin.id, password, 'Reset from Super Admin > Admin Users');
            setViewing(null);
            setCredentials({
                title: 'Password reset',
                fileName: admin.id,
                note: `Share the new temporary password with ${admin.name}. They change it at the next Admin portal sign-in.`,
                rows: [['Admin', `${admin.name} (${admin.id})`], ['Organization', admin.organization], ['Login ID', admin.id], ['Temporary Password', password, 'password']],
            });
        } catch (err) {
            message.error(err.message);
        }
    };

    return (
        <div>
            <PageTitle
                title="Admin Users"
                extra={<Button type="primary" className="min-w-[150px]" onClick={() => setEditing((e) => !e)}>{editing ? 'Done Editing' : 'Edit & Modify'}</Button>}
            />

            {me && (
                <div className="flex flex-wrap items-center gap-3 rounded-lg px-4 py-3 mb-3" style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}` }}>
                    <span className="w-10 h-10 rounded-md flex items-center justify-center text-lg" style={{ background: '#EDE9FE', color: '#6D28D9' }}><SafetyCertificateOutlined /></span>
                    <div className="min-w-0">
                        <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: COLORS.textSecondary }}>Super Admin (only one)</div>
                        <div className="font-semibold" style={{ color: COLORS.textPrimary }}>{me.name} <span className="font-normal text-xs" style={{ color: COLORS.textSecondary }}>({me.id} · {me.email})</span></div>
                    </div>
                    <span className="sm:ml-auto text-xs" style={{ color: COLORS.textSecondary }}>{SCOPE_TITLE[me.scope] ?? 'Super Admin'} · manages all organizations and their admins</span>
                </div>
            )}

            <div className="filter-bar flex flex-wrap items-center gap-2 mb-3">
                <Input className="w-full sm:flex-1 sm:min-w-[220px] sm:max-w-[420px]" placeholder="Search admin, login ID, email, mobile, organization" suffix={<SearchOutlined />} allowClear value={draft.q} onChange={(e) => setDraft({ ...draft, q: e.target.value })} />
                <Select className="w-full sm:w-[230px]" value={draft.org} onChange={(v) => setDraft({ ...draft, org: v })} options={withAll(orgOptions, 'Organization All')} popupMatchSelectWidth={false} showSearch optionFilterProp="label" />
                <Select className="w-[calc(50%-4px)] sm:w-[130px]" value={draft.status} onChange={(v) => setDraft({ ...draft, status: v })} options={withAll(USER_STATUSES.map((v) => ({ value: v, label: v })), 'Status All')} />
                <Button type="primary" onClick={() => setApplied(draft)}>Apply Filters</Button>
                <Button icon={<ReloadOutlined />} onClick={load} loading={loading} aria-label="Refresh" />
                <Button type="primary" className="sm:ml-auto min-w-[150px]" onClick={() => navigate(ROUTES.ADMIN_USER_NEW)}>+ Add Admin</Button>
            </div>

            {data?.adminPortal === 'unavailable' && <Alert className="mb-3" type="warning" showIcon message="The Admin portal is not reachable right now: last sign-in times may be missing." />}

            <DataTable
                title={`Organization Admins (${admins.length})`}
                dataSource={rows}
                loading={loading}
                locale={{ emptyText: error ? `Could not load admins: ${error}` : admins.length ? 'No admins match these filters.' : 'No organization admins yet. Each new organization gets its admin login.' }}
                pageSize={9}
                scrollX={1150}
                columns={[
                    {
                        title: 'Admin', dataIndex: 'name', width: 200, sorter: (a, b) => a.name.localeCompare(b.name),
                        render: (n) => <UserCell name={n} />,
                    },
                    {
                        title: 'Login ID', dataIndex: 'id', width: 160,
                        render: (v, r) => <span className="font-medium">{v}{r.primary && <span className="ml-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: '#DBEAFE', color: '#1E40AF' }}>MAIN</span>}</span>,
                    },
                    {
                        title: 'Organization', dataIndex: 'organization', sorter: (a, b) => a.organization.localeCompare(b.organization),
                        render: (o, r) => (
                            <Button type="link" size="small" className="!px-0" onClick={() => navigate(orgPath(r.organizationId))}>
                                {o} <span className="text-[11px] ml-1" style={{ color: COLORS.textSecondary }}>({r.organizationId} · {r.organizationType})</span>
                            </Button>
                        ),
                    },
                    { title: 'Email', dataIndex: 'email' },
                    { title: 'Mobile', dataIndex: 'phone', render: (v) => v || '—' },
                    {
                        title: 'Status', dataIndex: 'status', align: 'center', width: 140,
                        render: (s, r) => (editing
                            ? <Select size="small" value={s} disabled={saving === r.id} loading={saving === r.id} style={{ width: 115 }} options={USER_STATUSES.map((v) => ({ value: v, label: v }))} onChange={(v) => setStatus(r, v)} />
                            : <StatusTag status={s} />),
                    },
                    { title: 'Last Login', dataIndex: 'lastLogin', render: formatDateTime },
                    { title: 'Action', key: 'a', align: 'center', width: 70, render: (_, r) => <ViewButton onClick={() => setViewing(r)} /> },
                ]}
            />

            <DetailsModal
                open={!!viewing}
                title={viewing?.name}
                onClose={() => setViewing(null)}
                items={viewing ? [
                    { label: 'Login ID', value: viewing.id },
                    { label: 'Status', value: <StatusTag status={viewing.status} size="sm" /> },
                    { label: 'Organization', value: `${viewing.organization} (${viewing.organizationId})`, span: 2 },
                    { label: 'Email', value: viewing.email, span: 2 },
                    { label: 'Mobile', value: viewing.phone },
                    { label: 'Signs in on', value: 'Admin Portal' },
                    { label: 'Last Login', value: formatDateTime(viewing.lastLogin) },
                    { label: 'Created On', value: formatDateTime(viewing.createdOn) },
                ] : []}
                footer={viewing ? (
                    <div className="flex flex-wrap justify-end gap-2">
                        <Button onClick={() => navigate(orgPath(viewing.organizationId))}>Open Organization</Button>
                        <Button type="primary" onClick={() => resetPassword(viewing)}>Reset Password</Button>
                    </div>
                ) : null}
            />
            <CredentialsModal data={credentials} onClose={() => setCredentials(null)} />
        </div>
    );
};

export default AdminUsersPage;
