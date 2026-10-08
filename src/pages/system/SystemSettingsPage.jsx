import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, Button, Modal, Form, Input, Select, Table, Tooltip, Spin, Result, App } from 'antd';
import dayjs from 'dayjs';
import PageTitle from '../../components/ui/PageTitle';
import StatusTag from '../../components/ui/StatusTag';
import DataTable from '../../components/ui/DataTable';
import OnOffSwitch from '../../components/ui/OnOffSwitch';
import { EditChip } from '../../components/ui/RowActions';
import { useCollection, useRemoteValue } from '../../store/DataStore';
import { integrationsApi, systemApi } from '../../api/superadminApi';
import { isMasterAdmin } from '../../auth/session';
import { COLORS } from '../../constants/theme';
import { formatLongDateTime, formatDateTime } from '../../utils/format';

const RETENTION = ['1 Year', '3 Years', '5 Years', '7 Years', '10 Years'];
const MASTER_ONLY = 'Only the master Super Admin can change system settings.';

const Card = ({ title, children, extra, className = '' }) => (
    <div className={`rounded-lg p-4 min-w-0 ${className}`} style={{ border: `1px solid ${COLORS.border}` }}>
        <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-lg font-semibold m-0 leading-tight" style={{ color: COLORS.headingBlue }}>{title}</h3>
            {extra}
        </div>
        {children}
    </div>
);

const ToggleRow = ({ label, checked, onChange, disabled }) => (
    <div className="flex items-center justify-between gap-3 text-[14px] py-1">
        <span>{label}</span>
        <OnOffSwitch checked={checked} onChange={onChange} disabled={disabled} ariaLabel={label} />
    </div>
);

// Second line of an integration card: what the last test found.
const integrationDetail = (it) => {
    if (!it.endpoint) return 'No endpoint configured yet';
    if (!it.lastSync) return `${it.environment} · not tested yet`;
    if (it.status === 'Failed') return `Last test failed: ${it.lastError}`;
    return `Response Time ${(it.responseMs / 1000).toFixed(1)} sec · ${dayjs(it.lastSync).format('DD MMM, hh:mm A')}`;
};

/** API Integration tab: connection cards (Test / Configure) + integrations table (Edit). */
const ApiIntegrationTab = () => {
    const { message } = App.useApp();
    const master = isMasterAdmin();
    const { items: integrations, loading, upsert } = useCollection('integrations');
    const [, , { reload: reloadSystem }] = useRemoteValue('system');
    const [testing, setTesting] = useState(null);
    const [editing, setEditing] = useState(null);
    const [saving, setSaving] = useState(false);
    const [form] = Form.useForm();

    // Real check: the server calls the endpoint and reports Connected / Warning / Failed.
    const test = async (it) => {
        if (!it.endpoint) return message.info(`Configure an endpoint for ${it.name} first.`);
        setTesting(it.id);
        try {
            const result = await integrationsApi.test(it.id);
            upsert(result);
            reloadSystem();
            const secs = (result.responseMs / 1000).toFixed(1);
            if (result.status === 'Connected') message.success(`${it.name}: connected (${secs} sec).`);
            else if (result.status === 'Warning') message.warning(`${it.name}: ${result.lastError}.`);
            else message.error(`${it.name}: ${result.lastError}.`);
        } catch (err) {
            message.error(err.message);
        } finally {
            setTesting(null);
        }
    };

    const save = async () => {
        const v = await form.validateFields();
        setSaving(true);
        try {
            upsert(await integrationsApi.update(editing.id, { endpoint: v.endpoint, type: v.type, environment: v.environment, ...(v.apiKey ? { apiKey: v.apiKey } : {}) }));
            reloadSystem();
            message.success(`${editing.name} configuration saved. Click Test to check it.`);
            setEditing(null);
        } catch (err) {
            message.error(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <h2 className="text-xl font-bold m-0" style={{ color: COLORS.headingBlue }}>API Integration</h2>
            <p className="text-[14px] font-semibold mt-1 mb-3">External System connections used by IBima Assist</p>

            {loading && <div className="py-10 flex justify-center"><Spin /></div>}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mb-3">
                {integrations.map((it) => (
                    <Card key={it.id} title={it.name} extra={<StatusTag status={it.status} size="sm" minWidth={0} />}>
                        <p className="text-[14px] m-0">{it.description}</p>
                        <p className="text-[13px] m-0 mt-1 mb-4" style={{ color: it.status === 'Failed' ? COLORS.danger : COLORS.textPrimary }}>{integrationDetail(it)}</p>
                        <div className="flex gap-2">
                            <Button loading={testing === it.id} disabled={!it.endpoint} onClick={() => test(it)} style={{ minWidth: 110, borderColor: COLORS.primary, color: COLORS.primary }}>Test</Button>
                            <Tooltip title={master ? '' : MASTER_ONLY}>
                                <Button type="primary" disabled={!master} onClick={() => setEditing(it)} style={{ minWidth: 110 }}>Configure</Button>
                            </Tooltip>
                        </div>
                    </Card>
                ))}
            </div>

            <DataTable
                className="table-blue-head"
                pagination={false}
                scrollX={880}
                dataSource={integrations}
                loading={loading}
                columns={[
                    { title: 'Intigration', dataIndex: 'name', render: (n) => <span className="font-medium">{n}</span> },
                    { title: 'Type', dataIndex: 'type' },
                    { title: 'Environment', dataIndex: 'environment' },
                    { title: 'Sync', dataIndex: 'lastSync', render: (d) => (d ? formatLongDateTime(d) : '—') },
                    { title: 'Status', dataIndex: 'status', align: 'center', render: (s) => <StatusTag status={s} /> },
                    { title: 'Action', key: 'a', align: 'center', render: (_, r) => (master ? <EditChip onClick={() => setEditing(r)} /> : '—') },
                ]}
            />

            <Modal open={!!editing} title={`Configure — ${editing?.name ?? ''}`} okText="Save" confirmLoading={saving} onOk={save} onCancel={() => setEditing(null)} destroyOnHidden>
                <Form form={form} layout="vertical" requiredMark={false} preserve={false} initialValues={editing ? { endpoint: editing.endpoint, type: editing.type, environment: editing.environment } : undefined}>
                    <Form.Item name="endpoint" label="Endpoint URL" rules={[{ required: true, message: 'Enter the endpoint URL' }, { type: 'url', message: 'Enter a valid URL (https://...)' }]}><Input placeholder="https://..." /></Form.Item>
                    <Form.Item name="apiKey" label="API Key / Token" extra={editing?.hasApiKey ? 'A key is saved. Leave empty to keep it.' : 'Sent as a Bearer token when testing.'}>
                        <Input.Password placeholder={editing?.hasApiKey ? '•••••••• (saved)' : 'Optional'} autoComplete="off" />
                    </Form.Item>
                    <Form.Item name="type" label="Type"><Select options={['Reset API', 'API', 'Gateway', 'Webhook'].map((v) => ({ value: v, label: v }))} /></Form.Item>
                    <Form.Item name="environment" label="Environment"><Select options={['Production', 'UAT', 'Sandbox'].map((v) => ({ value: v, label: v }))} /></Form.Item>
                </Form>
            </Modal>
        </>
    );
};

/** Saves one or more system switches; returns true when saved. */
function useSystemSettingsSaver() {
    const { message } = App.useApp();
    const [, setSys] = useRemoteValue('system');
    const [saving, setSaving] = useState(null);
    const save = async (patch, success) => {
        setSaving(Object.keys(patch)[0]);
        try {
            const updated = await systemApi.updateSettings(patch);
            setSys(updated);
            const last = updated.activity[0];
            message.success(last?.status === 'Approval Log' ? `${last.activity} — sent for approval.` : success);
            return true;
        } catch (err) {
            message.error(err.message);
            return false;
        } finally {
            setSaving(null);
        }
    };
    return [save, saving];
}

/** System Update tab: current/latest version, update policy, maintenance mode, deployment history. */
const SystemUpdateTab = ({ sys }) => {
    const { message, modal } = App.useApp();
    const master = isMasterAdmin();
    const [, setSys] = useRemoteValue('system');
    const [save, saving] = useSystemSettingsSaver();
    const [updating, setUpdating] = useState(false);
    const [historyOpen, setHistoryOpen] = useState(false);

    const runUpdate = async () => {
        setUpdating(true);
        try {
            const result = await systemApi.update();
            setSys(result);
            message.success(result.message);
        } catch (err) {
            message.error(err.message);
        } finally {
            setUpdating(false);
        }
    };

    const checkUpdate = () => {
        if (!sys.upToDate && sys.maintenanceApproval && !sys.maintenanceMode) {
            modal.confirm({
                title: 'Maintenance approval required',
                content: 'Update Policy requires Maintenance Mode during updates. Turn on Maintenance Mode and continue? Only the master Super Admin can sign in while it is on.',
                okText: 'Enable & Update',
                onOk: async () => {
                    if (await save({ maintenanceMode: true }, 'Maintenance mode ON.')) await runUpdate();
                },
            });
        } else runUpdate();
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
                    <span className="rounded-full px-3 py-1 text-xs font-medium" style={sys.upToDate ? { background: '#D1EEDD', color: '#1E8E4E' } : { background: '#FDEBC8', color: '#E89A0C' }}>
                        {sys.upToDate ? 'Up to Date' : 'Update Available'}
                    </span>
                </div>
                <div className="rounded-md mt-3 p-4 flex flex-wrap items-center justify-between gap-3" style={{ background: COLORS.bgBanner }}>
                    <div>
                        <p className="text-[15px] font-semibold m-0">Latest Available: {sys.latestVersion}</p>
                        {sys.latestReleaseDate && <p className="text-xs font-semibold m-0 mt-0.5">Release Date {sys.latestReleaseDate}</p>}
                    </div>
                    <Tooltip title={master ? '' : MASTER_ONLY}>
                        <Button type="primary" loading={updating} disabled={!master} onClick={checkUpdate}>{sys.upToDate ? 'Check/Update' : `Update to ${sys.latestVersion}`}</Button>
                    </Tooltip>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                <Card title="Update Policy">
                    <ToggleRow label="Maintenance approval required" checked={sys.maintenanceApproval} disabled={!master || saving === 'maintenanceApproval'} onChange={(v) => save({ maintenanceApproval: v }, `Maintenance approval ${v ? 'ON' : 'OFF'}.`)} />
                    <ToggleRow label="Auto security patches" checked={sys.autoSecurityPatches} disabled={!master || saving === 'autoSecurityPatches'} onChange={(v) => save({ autoSecurityPatches: v }, `Auto security patches ${v ? 'ON' : 'OFF'}.`)} />
                </Card>
                <Card title="Maintenance Mode">
                    <p className="text-[14px] m-0">Restrict Access during planned updates</p>
                    <div className="flex items-center justify-between mt-2">
                        <span className="text-[14px] font-medium" style={{ color: sys.maintenanceMode ? COLORS.danger : COLORS.textPrimary }}>{sys.maintenanceMode ? 'ON' : 'OFF'}</span>
                        <OnOffSwitch
                            checked={sys.maintenanceMode}
                            disabled={!master || saving === 'maintenanceMode'}
                            onChange={(v) => save({ maintenanceMode: v }, v ? 'Maintenance mode ON. Only the master Super Admin can sign in now.' : 'Maintenance mode OFF.')}
                            ariaLabel="Maintenance mode"
                        />
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

/** Audit & Compliance tab: audit switches + retention; every change lands in the activity table. */
const AuditComplianceTab = ({ sys }) => {
    const master = isMasterAdmin();
    const [save, saving] = useSystemSettingsSaver();

    return (
        <>
            <h2 className="text-xl font-bold m-0" style={{ color: COLORS.headingBlue }}>Audit &amp; Compliance</h2>
            <p className="text-[14px] font-semibold mt-1 mb-3 max-w-md">Configure audit controls and monitor compliance - sensitive activities</p>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mb-3">
                <Card title="Audit Login">
                    <p className="text-[14px] m-0">Record user and system activites</p>
                    <p className="text-[14px] m-0 mt-2">Capture admin action</p>
                    <div className="flex justify-end mt-2">
                        <OnOffSwitch checked={sys.auditLogin} disabled={!master || saving === 'auditLogin'} onChange={(v) => save({ auditLogin: v }, `Audit login ${v ? 'enabled' : 'disabled'}.`)} ariaLabel="Audit login" />
                    </div>
                </Card>
                <Card title="Audit Retention">
                    <p className="text-[14px] m-0 mb-3 max-w-[300px]">Audit retention period for audit records</p>
                    <Select
                        className="w-full"
                        value={sys.retention}
                        disabled={!master}
                        loading={saving === 'retention'}
                        options={RETENTION.map((v) => ({ value: v, label: v }))}
                        onChange={(v) => save({ retention: v }, `Retention policy changed to ${v}. Older audit records are removed automatically.`)}
                    />
                </Card>
                <Card title="Compilance Control">
                    <ToggleRow label="Input activity loging" checked={sys.inputActivityLogging} disabled={!master || saving === 'inputActivityLogging'} onChange={(v) => save({ inputActivityLogging: v }, `Input activity logging ${v ? 'ON' : 'OFF'}.`)} />
                    <ToggleRow label="Config change approval" checked={sys.configChangeApproval} disabled={!master || saving === 'configChangeApproval'} onChange={(v) => save({ configChangeApproval: v }, `Config change approval ${v ? 'ON' : 'OFF'}.`)} />
                </Card>
            </div>

            <DataTable
                className="table-blue-head"
                pageSize={6}
                scrollX={860}
                dataSource={sys.activity}
                locale={{ emptyText: 'No activity yet.' }}
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

/** System Settings -- the active tab lives in ?tab= so each tab is linkable. */
const SystemSettingsPage = () => {
    const [params, setParams] = useSearchParams();
    const [sys, , { loading, error, reload }] = useRemoteValue('system');
    const tabs = [
        { key: 'api', label: 'API Integration', children: <ApiIntegrationTab /> },
        { key: 'update', label: 'System Update', children: sys && <SystemUpdateTab sys={sys} /> },
        { key: 'audit', label: 'Audit & Compliance', children: sys && <AuditComplianceTab sys={sys} /> },
    ];
    const tab = tabs.some((t) => t.key === params.get('tab')) ? params.get('tab') : 'api';
    return (
        <div>
            <PageTitle title="System Settings" className="mb-2" />
            {error && !sys && <Result status="error" title="Could not load system settings" subTitle={error} extra={<Button onClick={reload}>Retry</Button>} />}
            {loading && !sys && !error && <div className="py-24 flex justify-center"><Spin /></div>}
            {sys && <Tabs className="page-tabs" activeKey={tab} onChange={(k) => setParams({ tab: k })} items={tabs} />}
        </div>
    );
};

export default SystemSettingsPage;
