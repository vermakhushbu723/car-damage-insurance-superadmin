import React, { useRef, useState } from 'react';
import { Button, Checkbox, Switch, Upload, Table, Tag, App } from 'antd';
import { PlusOutlined, ArrowRightOutlined, UploadOutlined, FileTextOutlined } from '@ant-design/icons';
import SettingsSideNav from '../../components/settings/SettingsSideNav';
import SettingsSectionCard from '../../components/settings/SettingsSectionCard';
import RoleTabs from '../../components/settings/RoleTabs';
import PermissionMatrix from '../../components/settings/PermissionMatrix';
import { COLORS } from '../../constants/theme';

// Two independently-numbered nav groups, exactly matching the reference
// screenshots (the SUPER ADMIN list restarts at 1, it isn't items 8/9/10
// of the main list).
const MAIN_STEPS = [
    { key: 'general', label: 'General' },
    { key: 'userRoles', label: 'User & Roles' },
    { key: 'claimFlow', label: 'Claim Flow' },
    { key: 'autoAllocation', label: 'Auto Allocation' },
    { key: 'fraudRouting', label: 'Fraud Routing' },
    { key: 'dashboardConfig', label: 'Dashboard Config' },
    { key: 'bulkUploads', label: 'Bulk Uploads' },
];
const SUPER_ADMIN_STEPS = [
    { key: 'insurers', label: 'Insurers' },
    { key: 'platformDashboard', label: 'Platform Dashboard' },
    { key: 'globalDefaults', label: 'Global Defaults' },
];

// Badge numbers transcribed literally from each section's own reference
// screenshot -- some don't line up with the section's position in the nav
// list above (e.g. Bulk Uploads is nav position 7 but its own card shows
// badge "6", Platform Dashboard is SUPER ADMIN position 2 but shows badge
// "1"). Reproduced as shown rather than "corrected" -- see the
// no-invented-screens-from-mockups memory on not touching the reference UI.
const SECTION_BADGES = {
    general: 1,
    userRoles: 2,
    claimFlow: 3,
    autoAllocation: 4,
    fraudRouting: 5,
    dashboardConfig: 6,
    bulkUploads: 6,
    platformDashboard: 1,
    globalDefaults: 5,
};

const CLAIM_FLOW_TOGGLES = ['Recommendation page', 'Payment approval flow', 'Auto approval', 'Fraud QC routing'];
const APPROVAL_TOGGLES = ['ILA Approval', 'FLA Approval', 'Payment Approval'];

const DASHBOARD_WIDGET_GROUPS = [
    { title: 'CSM Dashboard', checked: 'Total intimation', options: ['Total intimation', 'New today', 'Pending allocation', 'Survey link sent'] },
    { title: 'Handler dashboard', checked: 'Assigned claims', options: ['Assigned claims', 'Pending ILA', 'Pending FLA', 'TAT breach'] },
    { title: 'SCM dashboard', checked: 'Claims (state)', options: ['Claims (state)', 'Pending review', 'Fraud triggered', 'SLA risk'] },
    { title: 'RCM dashboard', checked: 'Claims (region)', options: ['Claims (region)', 'SLA breaches', 'Fraud density', 'Handler performance'] },
];

const PLATFORM_DASHBOARD_STATS = [
    { label: 'Total insurer', value: '03' },
    { label: 'Active Insurers', value: '02' },
    { label: 'Total Claims', value: '18,420' },
    { label: 'Avg TAT', value: '4.2Days' },
    { label: 'Avg Fraud Rate', value: '2.8%' },
    { label: 'AI Accuracy', value: '91%' },
];

const ROLE_TEMPLATES = ['Handler Template', 'Surveyor', 'Manager Template'];

const INSURERS_ROWS = [
    { id: 1, name: 'General Insurance', code: 'ACM-1042', mode: 'Insurer SaaS', status: 'Active' },
    { id: 2, name: 'New India Assurance', code: 'NIA-2210', mode: 'Insurer SaaS', status: 'Active' },
    { id: 3, name: 'ABC Insurance Pvt. Ltd.', code: 'ABC-3387', mode: 'Service Provider', status: 'Pending' },
];

/** Plain read-only "label: value" box, used on the General step's Company Profile / Auto Allocation's mapped fields. */
const ReadonlyField = ({ label, value }) => (
    <div
        className="flex items-center justify-between rounded-lg px-4"
        style={{ height: 44, background: '#fff', border: `1px solid ${COLORS.border}` }}
    >
        <span className="text-sm" style={{ color: COLORS.textSecondary }}>{label}</span>
        <span className="text-sm font-semibold" style={{ color: COLORS.textPrimary }}>{value}</span>
    </div>
);

const SubHeading = ({ title, subtitle, action }) => (
    <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
            <p className="text-base font-bold m-0" style={{ color: COLORS.textPrimary }}>{title}</p>
            <p className="text-sm m-0 mt-0.5" style={{ color: COLORS.textSecondary }}>{subtitle}</p>
        </div>
        {action}
    </div>
);

const SettingsPage = () => {
    const { message } = App.useApp();
    const [activeKey, setActiveKey] = useState('general');
    const [activeRole, setActiveRole] = useState('Insurer Admin');
    const [selectedTemplates, setSelectedTemplates] = useState(['Handler Template', 'Manager Template']);
    const sectionRefs = useRef({});

    const scrollToStep = (key) => {
        setActiveKey(key);
        sectionRefs.current[key]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const toggleTemplate = (name) => {
        setSelectedTemplates((prev) => (prev.includes(name) ? prev.filter((t) => t !== name) : [...prev, name]));
    };

    return (
        <div className="p-4 md:p-8">
            <h1 className="text-3xl font-extrabold mb-6" style={{ color: COLORS.headingBlue }}>SETTINGS</h1>

            <div className="flex gap-8 items-start">
                <SettingsSideNav mainSteps={MAIN_STEPS} superAdminSteps={SUPER_ADMIN_STEPS} activeKey={activeKey} onStepClick={scrollToStep} />

                <div className="flex-1 min-w-0">
                    {/* 1 -- General */}
                    <SettingsSectionCard ref={(el) => (sectionRefs.current.general = el)} badge={SECTION_BADGES.general} title="GENERAL">
                        <div className="rounded-xl p-5 mb-4" style={{ background: COLORS.bgApp }}>
                            <p className="font-bold text-base mb-3" style={{ color: COLORS.textPrimary }}>Company Profile</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <ReadonlyField label="Company Name" value="General Insurance" />
                                <ReadonlyField label="Insurer Code" value="ACM-1042" />
                            </div>
                        </div>
                        <div className="rounded-xl p-5" style={{ background: COLORS.bgApp }}>
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <p className="font-bold text-base m-0" style={{ color: COLORS.textPrimary }}>Platform Mode</p>
                                    <p className="text-sm m-0" style={{ color: COLORS.textSecondary }}>Set by super admin. Drives which features are mandatory below.</p>
                                </div>
                                <span className="text-base font-bold" style={{ color: COLORS.textPrimary }}>Insurer SaaS</span>
                            </div>
                            <div className="flex flex-col gap-2">
                                <ReadonlyField label="Recommendation Page" value="Mandatory" />
                                <ReadonlyField label="Payment approval" value="On" />
                                <ReadonlyField label="TCT / SR TCT roles" value="Enabled" />
                            </div>
                        </div>
                    </SettingsSectionCard>

                    {/* 2 -- User & Roles */}
                    <SettingsSectionCard ref={(el) => (sectionRefs.current.userRoles = el)} badge={SECTION_BADGES.userRoles} title="USER & ROLES" modeBadge="Insurer SaaS Mode">
                        <SubHeading
                            title="Users & Roles"
                            subtitle="Click a cell to cycle none, view, edit"
                            action={(
                                <div className="flex gap-3">
                                    <Button onClick={() => message.success('Changes saved.')}>Save Changes</Button>
                                    <Button type="primary" icon={<PlusOutlined />}>Add User <ArrowRightOutlined /></Button>
                                </div>
                            )}
                        />
                        <RoleTabs activeRole={activeRole} onSelect={setActiveRole} />
                        <PermissionMatrix />
                    </SettingsSectionCard>

                    {/* 3 -- Claim Flow */}
                    <SettingsSectionCard ref={(el) => (sectionRefs.current.claimFlow = el)} badge={SECTION_BADGES.claimFlow} title="CLAIM FLOW" modeBadge="Insurer SaaS Mode">
                        <SubHeading title="Claim Flow" subtitle="Toggle stages of the claim lifecycle" />
                        <div className="rounded-xl p-5 flex flex-col gap-4" style={{ background: COLORS.bgApp }}>
                            {CLAIM_FLOW_TOGGLES.map((label) => (
                                <div key={label} className="flex items-center justify-between">
                                    <span className="text-base font-bold" style={{ color: COLORS.textPrimary }}>{label}</span>
                                    <Switch defaultChecked />
                                </div>
                            ))}
                            <p className="font-bold text-base mt-2 mb-0" style={{ color: COLORS.primary }}>Approval Enablement</p>
                            {APPROVAL_TOGGLES.map((label) => (
                                <div key={label} className="flex items-center justify-between">
                                    <span className="text-base font-bold" style={{ color: COLORS.textPrimary }}>{label}</span>
                                    <Switch defaultChecked />
                                </div>
                            ))}
                        </div>
                    </SettingsSectionCard>

                    {/* 4 -- Auto Allocation */}
                    <SettingsSectionCard ref={(el) => (sectionRefs.current.autoAllocation = el)} badge={SECTION_BADGES.autoAllocation} title="AUTO ALLOCATION" modeBadge="Insurer SaaS Mode">
                        <SubHeading title="Auto Allocation" subtitle="Routing Rules For New Claims" />
                        <div className="rounded-xl p-5 grid grid-cols-1 md:grid-cols-2 gap-4" style={{ background: COLORS.bgApp }}>
                            <ReadonlyField label="Loss Location PIN" value="Auto-Mapped" />
                            <ReadonlyField label="Workshop PIN" value="Auto-Mapped" />
                            <ReadonlyField label="Handler Mapping" value="By Region" />
                            <ReadonlyField label="Load Capacity" value="25" />
                        </div>
                    </SettingsSectionCard>

                    {/* 5 -- Fraud Routing */}
                    <SettingsSectionCard ref={(el) => (sectionRefs.current.fraudRouting = el)} badge={SECTION_BADGES.fraudRouting} title="FRAUD ROUTING" modeBadge="Insurer SaaS Mode">
                        <SubHeading title="Fraud Routing" subtitle="Where Flagged Claims Go" />
                        <div className="rounded-xl p-5" style={{ background: COLORS.bgApp }}>
                            <p className="font-bold text-base mb-3" style={{ color: COLORS.textPrimary }}>No Fraud Triger</p>
                            <div className="flex items-center gap-8 mb-4">
                                <Checkbox defaultChecked><span className="font-semibold" style={{ color: COLORS.primary }}>Auto-Approve</span></Checkbox>
                                <Checkbox><span className="font-semibold" style={{ color: COLORS.textSecondary }}>Send To CSM</span></Checkbox>
                            </div>
                            <div className="rounded-lg p-4" style={{ background: '#EDEDED' }}>
                                <p className="font-bold text-base m-0" style={{ color: COLORS.textPrimary }}>Fraud Triggered</p>
                                <p className="text-sm m-0" style={{ color: COLORS.textSecondary }}>Always Routes To SCM QC Bucket. Not Configurable</p>
                            </div>
                        </div>
                    </SettingsSectionCard>

                    {/* 6 -- Dashboard Config */}
                    <SettingsSectionCard ref={(el) => (sectionRefs.current.dashboardConfig = el)} badge={SECTION_BADGES.dashboardConfig} title="DASHBOARD CONFIG" modeBadge="Insurer SaaS Mode">
                        <SubHeading
                            title="Dashboard Config"
                            subtitle="Choose Widgets Per Role"
                            action={<Button type="primary" icon={<PlusOutlined />}>Add More</Button>}
                        />
                        <div className="rounded-xl p-5 flex flex-col gap-5" style={{ background: COLORS.bgApp }}>
                            {DASHBOARD_WIDGET_GROUPS.map((group) => (
                                <div key={group.title}>
                                    <p className="font-bold text-base mb-2" style={{ color: COLORS.textPrimary }}>{group.title}</p>
                                    <div className="flex flex-wrap gap-6">
                                        {group.options.map((opt) => (
                                            <Checkbox key={opt} defaultChecked={opt === group.checked}>
                                                <span className="font-semibold" style={{ color: opt === group.checked ? COLORS.primary : COLORS.textSecondary }}>{opt}</span>
                                            </Checkbox>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SettingsSectionCard>

                    {/* 7 -- Bulk Uploads */}
                    <SettingsSectionCard ref={(el) => (sectionRefs.current.bulkUploads = el)} badge={SECTION_BADGES.bulkUploads} title="BULK UPLOADS" modeBadge="Insurer SaaS Mode">
                        <SubHeading title="Bulk Uploads" subtitle="Mapping Via Excel" />
                        <div className="rounded-xl p-5 grid grid-cols-1 md:grid-cols-2 gap-5" style={{ background: COLORS.bgApp }}>
                            {['Workshop Mapping', 'Handler Mapping'].map((label) => (
                                <div key={label} className="rounded-xl p-6 flex flex-col items-center text-center gap-2" style={{ background: '#EDEDED' }}>
                                    <FileTextOutlined style={{ fontSize: 32, color: COLORS.primary }} />
                                    <p className="font-bold text-base m-0" style={{ color: COLORS.textPrimary }}>{label}</p>
                                    <p className="text-sm m-0" style={{ color: COLORS.textSecondary }}>Bulk XL Upload</p>
                                    <Upload showUploadList={false} beforeUpload={() => false} onChange={() => message.success(`${label} file selected.`)}>
                                        <Button icon={<UploadOutlined />}>Upload File</Button>
                                    </Upload>
                                </div>
                            ))}
                        </div>
                    </SettingsSectionCard>

                    {/* SUPER ADMIN 1 -- Insurers (no reference screenshot for this one --
                        kept minimal and consistent with the app's existing table style
                        rather than inventing new UI patterns). */}
                    <SettingsSectionCard ref={(el) => (sectionRefs.current.insurers = el)} badge={1} title="INSURERS" modeBadge="Super Admin">
                        <SubHeading title="Insurers" subtitle="Every insurer on the platform" />
                        <Table
                            size="small"
                            pagination={false}
                            rowKey="id"
                            dataSource={INSURERS_ROWS}
                            columns={[
                                { title: 'Company Name', dataIndex: 'name' },
                                { title: 'Insurer Code', dataIndex: 'code' },
                                { title: 'Mode', dataIndex: 'mode' },
                                {
                                    title: 'Status', dataIndex: 'status',
                                    render: (v) => (
                                        <Tag style={{ borderRadius: 6, border: 'none', color: v === 'Active' ? COLORS.success : COLORS.textMuted, background: v === 'Active' ? COLORS.successBg : COLORS.pendingBadgeBg }}>
                                            {v}
                                        </Tag>
                                    ),
                                },
                            ]}
                        />
                    </SettingsSectionCard>

                    {/* SUPER ADMIN 2 -- Platform Dashboard */}
                    <SettingsSectionCard ref={(el) => (sectionRefs.current.platformDashboard = el)} badge={SECTION_BADGES.platformDashboard} title="PLATFORM DASHBOARD" modeBadge="Insurer SaaS Mode">
                        <SubHeading title="Platform Dashboard" subtitle="Config For The Super Admin Home" />
                        <div className="rounded-xl p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" style={{ background: COLORS.bgApp }}>
                            {PLATFORM_DASHBOARD_STATS.map((stat) => (
                                <div key={stat.label} className="rounded-xl p-5" style={{ background: '#EDEDED' }}>
                                    <p className="text-base font-semibold m-0" style={{ color: COLORS.textPrimary }}>{stat.label}</p>
                                    <p className="text-3xl font-extrabold m-0 mt-1" style={{ color: COLORS.textPrimary }}>{stat.value}</p>
                                </div>
                            ))}
                        </div>
                    </SettingsSectionCard>

                    {/* SUPER ADMIN 3 -- Global Defaults */}
                    <SettingsSectionCard ref={(el) => (sectionRefs.current.globalDefaults = el)} badge={SECTION_BADGES.globalDefaults} title="GLOBAL DEFAULTS" modeBadge="Insurer SaaS Mode">
                        <SubHeading title="Global Defaults" subtitle="Applied To Every New Insurer" />
                        <div className="rounded-xl p-5" style={{ background: COLORS.bgApp }}>
                            <p className="font-bold text-base mb-3" style={{ color: COLORS.textPrimary }}>Default Role Template For New Insurers</p>
                            <div className="flex flex-wrap gap-3">
                                {ROLE_TEMPLATES.map((tmpl) => {
                                    const isActive = selectedTemplates.includes(tmpl);
                                    return (
                                        <button
                                            key={tmpl}
                                            type="button"
                                            onClick={() => toggleTemplate(tmpl)}
                                            className="text-sm font-semibold rounded-lg"
                                            style={{
                                                padding: '9px 18px',
                                                border: `1.5px solid ${isActive ? COLORS.primary : COLORS.border}`,
                                                background: isActive ? COLORS.bgSoftBlue : '#fff',
                                                color: isActive ? COLORS.primary : COLORS.textPrimary,
                                            }}
                                        >
                                            {tmpl}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </SettingsSectionCard>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
