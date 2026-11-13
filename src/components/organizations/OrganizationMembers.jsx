import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Button, Input, Segmented, Select } from 'antd';
import { CrownOutlined, ReloadOutlined, SearchOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons';
import DataTable from '../ui/DataTable';
import StatusTag from '../ui/StatusTag';
import { organizationsApi } from '../../api/superadminApi';
import { formatDate, formatDateTime, matchesQuery } from '../../utils/format';
import { COLORS } from '../../constants/theme';

const SEARCH_FIELDS = ['id', 'name', 'email', 'phone', 'role', 'branch', 'createdBy'];

/**
 * "Admins & Users" of one organization (organization view page): its admin
 * login(s) and every user that belongs to it -- the ones issued in this console
 * and the ones its admin created in the Admin portal (Create Users). Searchable
 * by ID, name, email, mobile, role, branch or who created them.
 */
const OrganizationMembers = ({ orgId }) => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [q, setQ] = useState('');
    const [show, setShow] = useState('All');
    const [role, setRole] = useState('All');

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            setData(await organizationsApi.members(orgId));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [orgId]);
    useEffect(() => { load(); }, [load]);

    const rows = useMemo(() => {
        if (!data) return [];
        const all = [
            ...data.admins.map((a) => ({ ...a, kind: 'Admin', role: 'Organization Admin', createdBy: '—' })),
            ...data.users.map((u) => ({ ...u, kind: 'User' })),
        ];
        return all.filter((r) => (show === 'All' || (show === 'Admins' ? r.kind === 'Admin' : r.kind === 'User'))
            && (role === 'All' || r.role === role)
            && matchesQuery(r, q, SEARCH_FIELDS));
    }, [data, q, show, role]);

    const roles = useMemo(() => [...new Set((data?.users ?? []).map((u) => u.role).filter(Boolean))].sort(), [data]);
    const admins = data?.admins.length ?? 0;
    const users = data?.users.length ?? 0;

    return (
        <section id="members" className="mb-6 scroll-mt-20">
            <div className="grid grid-cols-3 gap-3 mb-3 max-w-[640px]">
                <Count icon={<TeamOutlined />} label="Total Members" value={admins + users} tone="#2563EB" active={show === 'All'} onClick={() => setShow('All')} />
                <Count icon={<CrownOutlined />} label="Admins" value={admins} tone="#7C3AED" active={show === 'Admins'} onClick={() => setShow('Admins')} />
                <Count icon={<UserOutlined />} label="Users" value={users} tone="#059669" active={show === 'Users'} onClick={() => setShow('Users')} />
            </div>

            {data?.adminPortal === 'unavailable' && (
                <Alert className="mb-3" type="warning" showIcon message="The Admin portal is not reachable right now, so users created by this organization's admin are not listed. Only logins issued here are shown." />
            )}
            {error && <Alert className="mb-3" type="error" showIcon message={`Could not load members: ${error}`} action={<Button size="small" onClick={load}>Retry</Button>} />}

            <DataTable
                title={`Admins & Users of ${data?.organization.name ?? orgId}`}
                extra={(
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                        <Input
                            className="w-full sm:w-[260px]"
                            placeholder="Search ID, name, email, mobile, role"
                            suffix={<SearchOutlined />}
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            allowClear
                        />
                        <Segmented size="middle" value={show} onChange={setShow} options={['All', 'Admins', 'Users']} />
                        <Select className="w-[160px]" value={role} onChange={setRole} options={[{ value: 'All', label: 'Role All' }, ...roles.map((r) => ({ value: r, label: r }))]} />
                        <Button icon={<ReloadOutlined />} onClick={load} loading={loading} aria-label="Refresh" />
                    </div>
                )}
                dataSource={rows}
                loading={loading}
                rowKey={(r) => `${r.kind}:${r.id}`}
                pageSize={8}
                scrollX={1100}
                locale={{ emptyText: q || show !== 'All' || role !== 'All' ? 'No members match this search.' : 'No admins or users in this organization yet.' }}
                columns={[
                    {
                        title: 'Login ID', dataIndex: 'id', width: 150,
                        render: (v, r) => (
                            <span className="font-medium">
                                {v}
                                {r.kind === 'Admin' && <span className="ml-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: '#EDE9FE', color: '#5B21B6' }}>ADMIN</span>}
                            </span>
                        ),
                    },
                    { title: 'Name', dataIndex: 'name', sorter: (a, b) => a.name.localeCompare(b.name) },
                    { title: 'Role', dataIndex: 'role' },
                    { title: 'Email', dataIndex: 'email', render: (v) => v || '—' },
                    { title: 'Mobile', dataIndex: 'phone', render: (v) => v || '—' },
                    { title: 'Branch', dataIndex: 'branch', render: (v) => v || '—' },
                    { title: 'Created By', dataIndex: 'createdBy', render: (v) => v || '—' },
                    { title: 'Status', dataIndex: 'status', align: 'center', render: (s) => <StatusTag status={s} size="sm" minWidth={70} /> },
                    { title: 'Last Login', dataIndex: 'lastLogin', render: formatDateTime },
                    { title: 'Created On', dataIndex: 'createdOn', render: formatDate, sorter: (a, b) => String(a.createdOn).localeCompare(String(b.createdOn)) },
                ]}
            />
        </section>
    );
};

const Count = ({ icon, label, value, tone, active, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left cursor-pointer transition-shadow hover:shadow-md"
        style={{ background: COLORS.bgCard, border: `1px solid ${active ? tone : COLORS.border}`, boxShadow: active ? `0 0 0 1px ${tone}` : undefined }}
    >
        <span className="w-9 h-9 rounded-md flex items-center justify-center text-base" style={{ background: `${tone}1A`, color: tone }}>{icon}</span>
        <span>
            <span className="block text-lg font-bold leading-tight" style={{ color: COLORS.textPrimary }}>{value}</span>
            <span className="block text-[11px]" style={{ color: COLORS.textSecondary }}>{label}</span>
        </span>
    </button>
);

export default OrganizationMembers;
