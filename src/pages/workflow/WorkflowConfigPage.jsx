import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button, Tabs, Form, Select, Modal, Input, Checkbox, App } from 'antd';
import {
    BankOutlined, TeamOutlined, UserOutlined, SafetyOutlined, FileAddOutlined, UserSwitchOutlined, FileSearchOutlined,
    FileTextOutlined, RobotOutlined, AuditOutlined, CheckSquareOutlined, SolutionOutlined, SafetyCertificateOutlined,
    WalletOutlined, DollarOutlined, ArrowRightOutlined,
} from '@ant-design/icons';
import PageTitle from '../../components/ui/PageTitle';
import StatCard from '../../components/ui/StatCard';
import StatusTag from '../../components/ui/StatusTag';
import DataTable from '../../components/ui/DataTable';
import OnOffSwitch from '../../components/ui/OnOffSwitch';
import ModeToggle from '../../components/ui/ModeToggle';
import { EditChip } from '../../components/ui/RowActions';
import { useStoreValue, useCollection, useAuditLog, newId } from '../../store/DataStore';
import { OPERATING_MODELS, ADMIN_PROFILES, FEE_BILL_MODELS, CHANNEL_OPTIONS, AUTO_ROLES } from '../../data/workflow';
import { COLORS } from '../../constants/theme';

const STAGE_ICONS = {
    Intimation: <FileAddOutlined />,
    'Handler Allocation': <UserSwitchOutlined />,
    'Surveyor Allocation': <FileSearchOutlined />,
    'Claim Details': <FileTextOutlined />,
    'AI ILA': <RobotOutlined />,
    'Handler ILA': <AuditOutlined />,
    FLA: <CheckSquareOutlined />,
    Recommendation: <SolutionOutlined />,
    Approval: <SafetyCertificateOutlined />,
    Settlement: <WalletOutlined />,
    'Fee Bill': <DollarOutlined />,
};

/** Claim journey stepper: circles + arrows; the selected stage is filled blue, disabled stages are faded. */
const JourneyStepper = ({ stages, rules, selected, onSelect }) => (
    <div className="overflow-x-auto pb-1">
        <div className="flex items-start min-w-max px-1">
            {stages.map((stage, i) => {
                const active = stage === selected;
                const enabled = rules.find((r) => r.stage === stage)?.enabled;
                return (
                    <React.Fragment key={stage}>
                        <button type="button" onClick={() => onSelect(stage)} className="flex flex-col items-center gap-1.5 shrink-0" style={{ width: 92 }}>
                            <span
                                className="flex items-center justify-center rounded-full transition-colors"
                                style={{
                                    width: 50, height: 50, fontSize: 20,
                                    background: active ? COLORS.primary : enabled ? '#DCE6FA' : '#F1F3F6',
                                    color: active ? '#fff' : enabled ? COLORS.primary : '#D3D8E0',
                                }}
                            >
                                {STAGE_ICONS[stage] ?? <FileTextOutlined />}
                            </span>
                            <span className="text-xs text-center leading-tight" style={{ color: active ? COLORS.primary : COLORS.textPrimary, fontWeight: active ? 600 : 400 }}>{stage}</span>
                        </button>
                        {i < stages.length - 1 && <ArrowRightOutlined className="shrink-0" style={{ color: '#CBD5E1', fontSize: 12, marginTop: 19 }} />}
                    </React.Fragment>
                );
            })}
        </div>
    </div>
);

/**
 * Claim Workflow & Role Configuration. The "SaaS Mode / As Service
 * Provider" toggle swaps the whole config (stages, stats, banner, rules,
 * defaults -- see data/workflow.js); edits are saved per mode in the store.
 */
const WorkflowConfigPage = () => {
    const { message, modal } = App.useApp();
    const log = useAuditLog();
    const [params, setParams] = useSearchParams();
    const mode = params.get('mode') === 'service-provider' ? 'serviceProvider' : 'saas';
    const [workflow, setWorkflow] = useStoreValue('workflow');
    const { items: orgs } = useCollection('organizations');
    const cfg = workflow[mode];

    const [tab, setTab] = useState('overview');
    const [selectedStage, setSelectedStage] = useState(cfg.stages[0]);
    const [triggerModal, setTriggerModal] = useState(null); // null | 'new' | trigger
    const [manageOpen, setManageOpen] = useState(false);
    const [overviewForm] = Form.useForm();
    const [triggerForm] = Form.useForm();
    const [draftRules, setDraftRules] = useState(null); // unsaved stage-rule edits

    const rules = draftRules ?? cfg.rules;
    const stageSelected = cfg.stages.includes(selectedStage) ? selectedStage : cfg.stages[0];
    const insurerOptions = useMemo(() => orgs.filter((o) => o.type === 'Insurer').map((o) => ({ value: o.name, label: o.name })), [orgs]);

    // Load the mode's saved Business Model values whenever the mode flips.
    useEffect(() => {
        overviewForm.setFieldsValue(cfg.overview);
    }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

    const patchMode = (patch) => setWorkflow((prev) => ({ ...prev, [mode]: { ...prev[mode], ...patch } }));

    const switchMode = (next) => {
        if (next === mode) return;
        const go = () => {
            setDraftRules(null);
            setParams(next === 'saas' ? {} : { mode: 'service-provider' });
        };
        if (draftRules) {
            modal.confirm({ title: 'Discard unsaved stage rules?', okText: 'Discard', onOk: go });
        } else go();
    };

    const setRule = (stage, key, value) => {
        setDraftRules(rules.map((r) => (r.stage === stage ? { ...r, [key]: value, ...(key === 'enabled' && !value ? { view: false, edit: false, approve: false } : {}) } : r)));
    };

    const saveRules = () => {
        if (!draftRules) return message.info('No changes to save.');
        patchMode({ rules: draftRules });
        setDraftRules(null);
        log('Updated', 'Settings');
        message.success('Stage rules saved.');
    };

    const saveConfiguration = () => {
        const overview = overviewForm.getFieldsValue();
        patchMode({ overview: { ...cfg.overview, ...overview }, ...(draftRules ? { rules: draftRules } : {}) });
        setDraftRules(null);
        log('Updated', 'Settings');
        message.success(`${mode === 'saas' ? 'SaaS' : 'Service Provider'} configuration saved.`);
    };

    const activateConfiguration = () => {
        modal.confirm({
            title: 'Activate this configuration?',
            content: `The ${mode === 'saas' ? 'SaaS' : 'Service Provider'} workflow (${cfg.stages.length} stages) will apply to ${overviewForm.getFieldValue('insurer') || 'the selected insurer'}.`,
            okText: 'Activate',
            onOk: () => {
                saveConfiguration();
                patchMode({ activatedAt: new Date().toISOString() });
                message.success('Configuration activated.');
            },
        });
    };

    const openTrigger = (t) => setTriggerModal(t);
    // Channels are stored as "Whatsapp+email"; the modal edits them as a checkbox list.
    const triggerInitial = !triggerModal || triggerModal === 'new'
        ? { status: 'Active', channels: [] }
        : { ...triggerModal, channels: triggerModal.channels.split(/\s*\+\s*/).map((c) => (/^in\s*-\s*app$/i.test(c) ? 'In - app' : c)) };

    const saveTrigger = async () => {
        const v = await triggerForm.validateFields();
        const record = { ...v, channels: v.channels.join('+') };
        const triggers = triggerModal === 'new'
            ? [...cfg.triggers, { id: newId('TRG'), ...record }]
            : cfg.triggers.map((t) => (t.id === triggerModal.id ? { ...t, ...record } : t));
        patchMode({ triggers });
        log(triggerModal === 'new' ? 'Created' : 'Updated', 'Settings');
        message.success(`Trigger "${v.trigger}" saved.`);
        setTriggerModal(null);
    };

    const enabledCount = cfg.rules.filter((r) => r.enabled).length;
    const stats = [
        { label: 'Active Workflow Stages', value: cfg.stages.length, icon: <BankOutlined />, tone: 'blue' },
        { label: 'Active Roles', value: cfg.stats.roles, icon: <TeamOutlined />, tone: 'green' },
        { label: 'Users', value: cfg.stats.users, icon: <UserOutlined />, tone: 'orange' },
        { label: 'Permission Rules', value: cfg.stats.permissionRules, icon: <SafetyOutlined />, tone: 'red' },
    ];

    const overviewTab = (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div className="rounded-lg" style={{ border: `1px solid ${COLORS.border}` }}>
                <div className="px-4 py-2.5 text-base font-medium" style={{ borderBottom: `1px solid ${COLORS.border}` }}>Business Model</div>
                {/* padding on a wrapper: antd's own .ant-form reset beats Tailwind utilities on the Form itself */}
                <div className="p-4">
                <Form form={overviewForm} layout="vertical" initialValues={cfg.overview}>
                    <Form.Item name="operatingModel" label={<b>Operating Model</b>}>
                        <Select options={OPERATING_MODELS.map((v) => ({ value: v, label: v }))} />
                    </Form.Item>
                    <Form.Item name="insurer" label={<b>Insurer/Partner</b>}>
                        <Select showSearch={{ optionFilterProp: 'label' }} options={insurerOptions} placeholder="ABC General Insurance" />
                    </Form.Item>
                    <Form.Item name="adminProfile" label={<b>Admin Profile</b>}>
                        <Select options={ADMIN_PROFILES.map((v) => ({ value: v, label: v }))} />
                    </Form.Item>
                    <Form.Item name="feeBillModel" label={<b>FCE Bill Model</b>} className="mb-0">
                        <Select disabled={mode === 'saas'} options={FEE_BILL_MODELS.map((v) => ({ value: v, label: v }))} />
                    </Form.Item>
                </Form>
                </div>
            </div>
            <div className="rounded-lg flex flex-col" style={{ border: `1px solid ${COLORS.border}` }}>
                <div className="px-4 py-2 flex items-center justify-between" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                    <span className="text-base font-medium">Automatic Role Activation</span>
                    <Button size="small" onClick={() => setManageOpen(true)} style={{ background: COLORS.primarySoft, color: COLORS.primary, border: 'none', fontWeight: 600 }}>Manage</Button>
                </div>
                <div className="p-3 flex-1 flex flex-col">
                    <div className="rounded-md px-3 py-2 text-[11px]" style={{ background: COLORS.bgBanner }}>
                        TCT Sr TCT Are Automatically Activated As A Role Defination. Their Page Access Reminds Permission Controlled
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                        {(cfg.autoRoles ?? ['TCT', 'Sr TCT']).map((r) => <StatusTag key={r} status={r} size="sm" minWidth={0} />)}
                    </div>
                    {cfg.activatedAt && <p className="text-[11px] mt-3 mb-0" style={{ color: COLORS.success }}>Activated {new Date(cfg.activatedAt).toLocaleString('en-IN')}</p>}
                    <div className="flex-1" />
                    <div className="flex justify-end mt-6">
                        <Button type="primary" size="large" onClick={activateConfiguration} style={{ fontSize: 15 }}>Activate configuration</Button>
                    </div>
                </div>
            </div>
        </div>
    );

    const ruleSwitch = (key) => (_, r) => (
        <OnOffSwitch checked={r[key]} disabled={key !== 'enabled' && !r.enabled} onChange={(v) => setRule(r.stage, key, v)} ariaLabel={`${r.stage} ${key}`} />
    );

    const stageRuleTab = (
        <>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3 px-1">
                <h3 className="text-base font-semibold m-0" style={{ color: COLORS.headingBlue }}>
                    Stage Wise Access Rules
                    {draftRules && <span className="ml-2 text-[11px] font-medium" style={{ color: COLORS.warning }}>Unsaved changes</span>}
                </h3>
                <Button type="primary" onClick={saveRules}>Save Rules</Button>
            </div>
            <DataTable
                className="table-blue-head"
                rowKey="stage"
                pagination={false}
                scrollX={900}
                dataSource={rules}
                rowClassName={(r) => (r.stage === stageSelected ? 'bg-blue-50' : '')}
                onRow={(r) => ({ onClick: () => setSelectedStage(r.stage) })}
                columns={[
                    { title: 'Stage', dataIndex: 'stage', render: (s) => <span className="font-medium">{s}</span> },
                    { title: 'Enabled', key: 'enabled', align: 'center', render: ruleSwitch('enabled') },
                    { title: 'Primary Role', dataIndex: 'role' },
                    { title: 'View', key: 'view', align: 'center', render: ruleSwitch('view') },
                    { title: 'Edit', key: 'edit', align: 'center', render: ruleSwitch('edit') },
                    { title: 'Approve', key: 'approve', align: 'center', render: ruleSwitch('approve') },
                    { title: 'System Rule', dataIndex: 'systemRule', align: 'center' },
                ]}
            />
        </>
    );

    const triggersTab = (
        <>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3 px-1">
                <h3 className="text-base font-semibold m-0" style={{ color: COLORS.headingBlue }}>Communication Triggers</h3>
                <Button type="primary" onClick={() => openTrigger('new')}>Add Role</Button>
            </div>
            <DataTable
                className="table-blue-head"
                pagination={false}
                scrollX={900}
                dataSource={cfg.triggers}
                columns={[
                    { title: 'Trigger', dataIndex: 'trigger', render: (s) => <span className="font-medium">{s}</span> },
                    { title: 'Stage', dataIndex: 'stage' },
                    { title: 'Recipient', dataIndex: 'recipient' },
                    { title: 'Channels', dataIndex: 'channels' },
                    { title: 'Status', dataIndex: 'status', align: 'center', render: (s) => <StatusTag status={s} minWidth={70} /> },
                    { title: 'Action', key: 'a', align: 'center', render: (_, r) => <EditChip onClick={() => openTrigger(r)} /> },
                ]}
            />
        </>
    );

    return (
        <div>
            <PageTitle title="Claim Workflow & Role Configuration" extra={<ModeToggle value={mode} onChange={switchMode} />} />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                {stats.map((s) => <StatCard key={s.label} {...s} />)}
            </div>

            <div className="rounded-lg mb-4" style={{ border: `1px solid ${COLORS.border}` }}>
                <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                    <span className="text-sm font-semibold" style={{ color: COLORS.headingBlue }}>{cfg.journeyTitle}</span>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            size="small"
                            onClick={() => (mode === 'saas' ? message.info('Already showing the full insurer workflow.') : switchMode('saas'))}
                            style={{ background: COLORS.primarySoft, color: COLORS.primary, border: 'none', fontWeight: 600 }}
                        >
                            Full - Insurer Workflow
                        </Button>
                        <Button size="small" type="primary" onClick={saveConfiguration} style={{ fontWeight: 600 }}>Save Configuration</Button>
                    </div>
                </div>
                <div className="p-3 md:p-4">
                    <div className="rounded-md px-4 py-2 text-[13px] mb-4" style={{ background: COLORS.bgBanner, color: COLORS.textPrimary }}>{cfg.banner}</div>
                    <JourneyStepper stages={cfg.stages} rules={rules} selected={stageSelected} onSelect={setSelectedStage} />
                    <p className="text-[11px] mt-2 mb-0" style={{ color: COLORS.textSecondary }}>
                        {enabledCount} of {cfg.stages.length} stages enabled · Selected: <b>{stageSelected}</b> — {cfg.rules.find((r) => r.stage === stageSelected)?.role}
                    </p>
                </div>
            </div>

            <Tabs
                className="page-tabs"
                activeKey={tab}
                onChange={setTab}
                items={[
                    { key: 'overview', label: 'Configuration Overview', children: overviewTab },
                    { key: 'rules', label: 'Stage Rule', children: stageRuleTab },
                    { key: 'triggers', label: 'Communication Triggers', children: triggersTab },
                ]}
            />

            <Modal open={!!triggerModal} title={triggerModal === 'new' ? 'Add Communication Trigger' : 'Edit Communication Trigger'} okText="Save" onOk={saveTrigger} onCancel={() => setTriggerModal(null)} destroyOnHidden>
                <Form form={triggerForm} layout="vertical" requiredMark={false} preserve={false} initialValues={triggerInitial}>
                    <Form.Item name="trigger" label="Trigger" rules={[{ required: true, whitespace: true }]}><Input placeholder="e.g. Claim Registered" /></Form.Item>
                    <Form.Item name="stage" label="Stage" rules={[{ required: true }]}>
                        <Select options={[...new Set([...cfg.stages, ...cfg.triggers.map((t) => t.stage)])].map((s) => ({ value: s, label: s }))} />
                    </Form.Item>
                    <Form.Item name="recipient" label="Recipient" rules={[{ required: true, whitespace: true }]}><Input placeholder="e.g. Insure/Handler" /></Form.Item>
                    <Form.Item name="channels" label="Channels" rules={[{ required: true, type: 'array', min: 1, message: 'Pick at least one channel' }]}>
                        <Checkbox.Group options={CHANNEL_OPTIONS} />
                    </Form.Item>
                    <Form.Item name="status" label="Status"><Select options={['Active', 'Inactive'].map((v) => ({ value: v, label: v }))} /></Form.Item>
                </Form>
            </Modal>

            <Modal open={manageOpen} title="Automatic Role Activation" okText="Done" onOk={() => setManageOpen(false)} onCancel={() => setManageOpen(false)}>
                <p className="text-xs mb-3" style={{ color: COLORS.textSecondary }}>Roles switched On are activated automatically when this workflow is activated.</p>
                <div className="flex flex-col gap-3">
                    {AUTO_ROLES.map((r) => {
                        const list = cfg.autoRoles ?? ['TCT', 'Sr TCT'];
                        return (
                            <label key={r} className="flex items-center justify-between text-[13px]">
                                {r}
                                <OnOffSwitch checked={list.includes(r)} onChange={(v) => patchMode({ autoRoles: v ? [...list, r] : list.filter((x) => x !== r) })} />
                            </label>
                        );
                    })}
                </div>
            </Modal>
        </div>
    );
};

export default WorkflowConfigPage;
