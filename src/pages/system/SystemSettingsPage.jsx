import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, Button, Modal, Form, Input, Select, Table, App } from 'antd';
import dayjs from 'dayjs';
import PageTitle from '../../components/ui/PageTitle';
import StatusTag from '../../components/ui/StatusTag';
import DataTable from '../../components/ui/DataTable';
import OnOffSwitch from '../../components/ui/OnOffSwitch';
import { EditChip } from '../../components/ui/RowActions';
import { useCollection, useStoreValue, useAuditLog, newId } from '../../store/DataStore';
import { COLORS } from '../../constants/theme';
import { formatLongDateTime, formatDateTime } from '../../utils/format';

const RETENTION = ['1 Year', '3 Years', '5 Years', '7 Years', '10 Years'];

const Card = ({ title, children, extra, className = '' }) => (
    <div className={`rounded-lg p-4 min-w-0 ${className}`} style={{ border: `1px solid ${COLORS.border}` }}>
        <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-lg font-semibold m-0 leading-tight" style={{ color: COLORS.headingBlue }}>{title}</h3>
            {extra}
        </div>
        {children}
    </div>
);

const ToggleRow = ({ label, checked, onChange }) => (
    <div className="flex items-center justify-between gap-3 text-[14px] py-1">
        <span>{label}</span>
        <OnOffSwitch checked={checked} onChange={onChange} ariaLabel={label} />
    </div>
);

/** API Integration tab: connection cards (Test / Configure) + integrations table (Edit). */
const ApiIntegrationTab = () => {
    const { message } = App.useApp();
    const log = useAuditLog();
    const { items: integrations, update } = useCollection('integrations');
    const [testing, setTesting] = useState(null);
    const [editing, setEditing] = useState(null);
    const [form] = Form.useForm();

    const test = (it) => {
        setTesting(it.id);
        setTimeout(() => {
            const ms = it.id === 'comm-gateway' ? 2400 : 180 + Math.round(Math.random() * 300);
            const status = ms > 2000 ? 'Warning' : 'Connected';
            update(it.id, {
                status,
                lastSync: new Date().toISOString(),
                ...(it.id === 'vehicle-rc' ? { detail: `Last sync Today ${dayjs().format('hh:mm A')}` } : {}),
                ...(it.id === 'comm-gateway' ? { detail: `Response Time ${(ms / 1000).toFixed(1)} sec` } : {}),
            });
            log('Updated', 'System', status === 'Connected' ? 'Success' : 'Failed');
            setTesting(null);
            if (status === 'Connected') message.success(`${it.name}: connection OK (${ms} ms).`);
            else message.warning(`${it.name}: slow response (${(ms / 1000).toFixed(1)} sec).`);
        }, 900);
    };

    const openEdit = (it) => setEditing(it);

    const save = async () => {
        const v = await form.validateFields();
        update(editing.id, v);
        log('Updated', 'System');
        message.success(`${editing.name} configuration saved.`);
        setEditing(null);
    };

    return (
        <>
            <h2 className="text-xl font-bold m-0" style={{ color: COLORS.headingBlue }}>API Integration</h2>
            <p className="text-[14px] font-semibold mt-1 mb-3">External System connections used by IBima Assist</p>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mb-3">
                {integrations.map((it) => (
                    <Card key={it.id} title={it.name} extra={<StatusTag status={it.status} size="sm" minWidth={0} />}>
                        <p className="text-[14px] m-0">{it.description}</p>
                        <p className="text-[14px] m-0 mt-1 mb-4">{it.detail}</p>
                        <div className="flex gap-2">
                            <Button loading={testing === it.id} onClick={() => test(it)} style={{ minWidth: 110, borderColor: COLORS.primary, color: COLORS.primary }}>Test</Button>
                            <Button type="primary" onClick={() => openEdit(it)} style={{ minWidth: 110 }}>Configure</Button>
                        </div>
                    </Card>
                ))}
            </div>

            <DataTable
                className="table-blue-head"
                pagination={false}
                scrollX={880}
                dataSource={integrations}
                columns={[
                    { title: 'Intigration', dataIndex: 'name', render: (n) => <span className="font-medium">{n}</span> },
                    { title: 'Type', dataIndex: 'type' },
                    { title: 'Environment', dataIndex: 'environment' },
                    { title: 'Sync', dataIndex: 'lastSync', render: formatLongDateTime },
                    { title: 'Status', dataIndex: 'status', align: 'center', render: (s) => <StatusTag status={s} /> },
                    { title: 'Action', key: 'a', align: 'center', render: (_, r) => <EditChip onClick={() => openEdit(r)} /> },
                ]}
            />

            <Modal open={!!editing} title={`Configure — ${editing?.name ?? ''}`} okText="Save" onOk={save} onCancel={() => setEditing(null)} destroyOnHidden>
                <Form form={form} layout="vertical" requiredMark={false} preserve={false} initialValues={editing ?? undefined}>
                    <Form.Item name="endpoint" label="Endpoint URL" rules={[{ required: true }, { type: 'url', message: 'Enter a valid URL' }]}><Input /></Form.Item>
                    <Form.Item name="apiKey" label="API Key / Token"><Input.Password placeholder="••••••••" autoComplete="off" /></Form.Item>
                    <Form.Item name="type" label="Type"><Select options={['Reset API', 'API', 'Gateway', 'Webhook'].map((v) => ({ value: v, label: v }))} /></Form.Item>
                    <Form.Item name="environment" label="Environment"><Select options={['Production', 'UAT', 'Sandbox'].map((v) => ({ value: v, label: v }))} /></Form.Item>
                </Form>
            </Modal>
        </>
    );
};

/** System Update tab: current/latest version, update policy, maintenance mode, deployment history. */
const SystemUpdateTab = () => {
    const { message, modal } = App.useApp();
    const log = useAuditLog();
    const [sys, setSys] = useStoreValue('system');
    const [updating, setUpdating] = useState(false);
    const [historyOpen, setHistoryOpen] = useState(false);
    const upToDate = sys.currentVersion === sys.latestVersion;

    const set = (patch, activity) => {
        setSys((prev) => ({
            ...prev,
            ...patch,
            complianceLog: activity ? [{ id: newId('C'), date: new Date().toISOString(), user: 'Super Admin', activity, module: 'System Update', status: 'Success' }, ...prev.complianceLog] : prev.complianceLog,
        }));
        log('Updated', 'System');
    };

    const checkUpdate = () => {
        if (upToDate) {
            setUpdating(true);
            setTimeout(() => {
                setUpdating(false);
                message.success(`You're on the latest version (${sys.currentVersion}).`);
            }, 700);
            return;
        }
        const run = () => {
            setUpdating(true);
            setTimeout(() => {
                const now = new Date().toISOString();
                set({
                    currentVersion: sys.latestVersion,
                    deployments: [{ version: sys.latestVersion, date: now, by: 'Super Admin', status: 'Success' }, ...sys.deployments],
                }, `Updated to ${sys.latestVersion}`);
                setUpdating(false);
                message.success(`Updated to ${sys.latestVersion}.`);
            }, 1200);
        };
        if (sys.maintenanceApproval && !sys.maintenanceMode) {
            modal.confirm({
                title: 'Maintenance approval required',
                content: 'Update Policy requires maintenance approval. Turn on Maintenance Mode and continue with the update?',
                okText: 'Enable & Update',
                onOk: () => {
                    set({ maintenanceMode: true }, 'Maintenance mode ON');
                    run();
                },
            });
        } else run();
    };

    const last = sys.deployments[0];

    return (
        <>
            <h2 className="text-xl font-bold m-0" style={{ color: COLORS.headingBlue }}>System Update</h2>
            <p className="text-[14px] font-semibold mt-1 mb-3 max-w-md">Control Platforms Version updates maintenance and development history</p>

            <div className="rounded-lg p-4 mb-4" style={{ border: `1px solid ${COLORS.border}` }}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                        <h3 className="text-xl font-semibold m-0" style={{ color: COLORS.headingBlue }}>Current Version</h3>
                        <p className="text-[15px] font-semibold m-0 mt-1">IBima Assist Enterprise {sys.currentVersion}</p>
                        <p className="text-xs font-semibold m-0 mt-0.5">{sys.environment}</p>
                    </div>
                    <span className="rounded-full px-3 py-1 text-xs font-medium" style={upToDate ? { background: '#D1EEDD', color: '#1E8E4E' } : { background: '#FDEBC8', color: '#E89A0C' }}>
                        {upToDate ? 'Up to Date' : 'Update Available'}
                    </span>
                </div>
                <div className="rounded-md mt-3 p-4 flex flex-wrap items-center justify-between gap-3" style={{ background: COLORS.bgBanner }}>
                    <div>
                        <p className="text-[15px] font-semibold m-0">Latest Available: {sys.latestVersion}</p>
                        <p className="text-xs font-semibold m-0 mt-0.5">Release Date {sys.latestReleaseDate}</p>
                    </div>
                    <Button type="primary" loading={updating} onClick={checkUpdate}>{upToDate ? 'Check/Update' : `Update to ${sys.latestVersion}`}</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                <Card title="Update Policy">
                    <ToggleRow label="Maintenance approval required" checked={sys.maintenanceApproval} onChange={(v) => set({ maintenanceApproval: v }, `Maintenance approval ${v ? 'ON' : 'OFF'}`)} />
                    <ToggleRow label="Auto security patches" checked={sys.autoSecurityPatches} onChange={(v) => set({ autoSecurityPatches: v }, `Auto security patches ${v ? 'ON' : 'OFF'}`)} />
                </Card>
                <Card title="Maintenance Mode">
                    <p className="text-[14px] m-0">Restrict Access during planned updates</p>
                    <div className="flex items-center justify-between mt-2">
                        <span className="text-[14px] font-medium" style={{ color: sys.maintenanceMode ? COLORS.danger : COLORS.textPrimary }}>{sys.maintenanceMode ? 'ON' : 'OFF'}</span>
                        <OnOffSwitch checked={sys.maintenanceMode} onChange={(v) => set({ maintenanceMode: v }, `Maintenance mode ${v ? 'ON' : 'OFF'}`)} ariaLabel="Maintenance mode" />
                    </div>
                </Card>
                <Card title="Deployment History" extra={<span className="text-[15px] font-medium">{last?.version}</span>}>
                    <p className="text-[14px] m-0">Last successful development</p>
                    <p className="text-[14px] m-0 mt-1 mb-3">{last ? dayjs(last.date).format('DD MMMM YYYY - hh:mm A') : '—'}</p>
                    <Button type="primary" onClick={() => setHistoryOpen(true)} style={{ minWidth: 130 }}>View</Button>
                </Card>
            </div>

            <Modal open={historyOpen} title="Deployment History" footer={null} onCancel={() => setHistoryOpen(false)} width={620}>
                <Table
                    size="small"
                    rowKey={(r) => `${r.version}-${r.date}`}
                    pagination={false}
                    dataSource={sys.deployments}
                    scroll={{ x: 480 }}
                    columns={[
                        { title: 'Version', dataIndex: 'version' },
                        { title: 'Deployed On', dataIndex: 'date', render: formatDateTime },
                        { title: 'By', dataIndex: 'by' },
                        { title: 'Status', dataIndex: 'status', render: (s) => <StatusTag status={s} size="sm" /> },
                    ]}
                />
            </Modal>
        </>
    );
};

/** Audit & Compliance tab: audit toggles + retention; every change is appended to the activity table. */
const AuditComplianceTab = () => {
    const log = useAuditLog();
    const { message } = App.useApp();
    const [sys, setSys] = useStoreValue('system');

    const set = (patch, activity, status = 'Success') => {
        // With "Config change approval" on, compliance changes are logged as pending approval.
        const finalStatus = sys.configChangeApproval && !('configChangeApproval' in patch) ? 'Approval Log' : status;
        setSys((prev) => ({
            ...prev,
            ...patch,
            complianceLog: [{ id: newId('C'), date: new Date().toISOString(), user: 'Super Admin', activity, module: 'Compilance', status: finalStatus }, ...prev.complianceLog],
        }));
        log('Updated', 'Settings');
        message.success(finalStatus === 'Approval Log' ? `${activity} — sent for approval.` : `${activity}.`);
    };

    return (
        <>
            <h2 className="text-xl font-bold m-0" style={{ color: COLORS.headingBlue }}>Audit &amp; Compliance</h2>
            <p className="text-[14px] font-semibold mt-1 mb-3 max-w-md">Configure audit controls and monitor compliance - sensitive activities</p>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mb-3">
                <Card title="Audit Login">
                    <p className="text-[14px] m-0">Record user and system activites</p>
                    <p className="text-[14px] m-0 mt-2">Capture admin action</p>
                    <div className="flex justify-end mt-2">
                        <OnOffSwitch checked={sys.auditLogin} onChange={(v) => set({ auditLogin: v }, `Audit login ${v ? 'enabled' : 'disabled'}`)} ariaLabel="Audit login" />
                    </div>
                </Card>
                <Card title="Audit Retention">
                    <p className="text-[14px] m-0 mb-3 max-w-[300px]">Audit retention period for audit records</p>
                    <Select className="w-full" value={sys.retention} options={RETENTION.map((v) => ({ value: v, label: v }))} onChange={(v) => set({ retention: v }, `Change Retention policy to ${v}`)} />
                </Card>
                <Card title="Compilance Control">
                    <ToggleRow label="Input activity loging" checked={sys.inputActivityLogging} onChange={(v) => set({ inputActivityLogging: v }, `Input activity logging ${v ? 'ON' : 'OFF'}`)} />
                    <ToggleRow label="Config change approval" checked={sys.configChangeApproval} onChange={(v) => set({ configChangeApproval: v }, `Config change approval ${v ? 'ON' : 'OFF'}`)} />
                </Card>
            </div>

            <DataTable
                className="table-blue-head"
                pageSize={6}
                scrollX={860}
                dataSource={sys.complianceLog}
                columns={[
                    { title: 'Date & Time', dataIndex: 'date', render: formatLongDateTime },
                    { title: 'User', dataIndex: 'user' },
                    { title: 'Activity', dataIndex: 'activity' },
                    { title: 'Module', dataIndex: 'module' },
                    { title: 'Status', dataIndex: 'status', align: 'center', render: (s) => <StatusTag status={s} minWidth={110} /> },
                ]}
            />
        </>
    );
};

const TABS = [
    { key: 'api', label: 'API Integration', children: <ApiIntegrationTab /> },
    { key: 'update', label: 'System Update', children: <SystemUpdateTab /> },
    { key: 'audit', label: 'Audit & Compliance', children: <AuditComplianceTab /> },
];

/** System Settings -- the active tab lives in ?tab= so each tab is linkable. */
const SystemSettingsPage = () => {
    const [params, setParams] = useSearchParams();
    const tab = TABS.some((t) => t.key === params.get('tab')) ? params.get('tab') : 'api';
    return (
        <div>
            <PageTitle title="System Settings" className="mb-2" />
            <Tabs className="page-tabs" activeKey={tab} onChange={(k) => setParams({ tab: k })} items={TABS} />
        </div>
    );
};

export default SystemSettingsPage;
