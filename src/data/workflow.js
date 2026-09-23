// Claim Workflow & Role Configuration -- one config per operating mode.
// The page swaps between these with the "SaaS Mode / As Service Provider"
// toggle; every stat, stepper node, banner, stage rule and default form
// value on that screen comes from here.

const rule = (stage, role, systemRule) => ({ stage, role, systemRule, enabled: false, view: false, edit: false, approve: false });

const TRIGGERS = [
    { id: 't1', trigger: 'Claim Registered', stage: 'Intimation', recipient: 'Insure/Handler', channels: 'Whatsapp+email', status: 'Active' },
    { id: 't2', trigger: 'Surveyor Assigned', stage: 'Surveyor Allocation', recipient: 'Surveyor', channels: 'SMS+Whatsapp', status: 'Active' },
    { id: 't3', trigger: 'Documents Pending', stage: 'Claim Details', recipient: 'Customer/Workshop', channels: 'Letter+Email', status: 'Active' },
    { id: 't4', trigger: 'ILA Submitted', stage: 'AI ILA', recipient: 'Handler/TCT', channels: 'In - app', status: 'Active' },
    { id: 't5', trigger: 'Recommendation Ready', stage: 'Recommendation', recipient: 'Approver', channels: 'In- app+email', status: 'Active' },
];

export const WORKFLOW_MODES = {
    saas: {
        key: 'saas',
        journeyTitle: 'Claim Journey - SaaS',
        banner: 'SaaS: Surveyor Allocation, Recommendation & Approval Are Enabled. Fee Bill Is Not Applicable',
        stats: { roles: 12, users: 126, permissionRules: 184 },
        stages: ['Intimation', 'Handler Allocation', 'Surveyor Allocation', 'Claim Details', 'AI ILA', 'Handler ILA', 'FLA', 'Recommendation', 'Approval', 'Settlement'],
        rules: [
            rule('Intimation', 'Call Center', 'Insurer Control'),
            rule('Handler Allocation', 'National Manager', 'Insurer Control'),
            rule('Surveyor Allocation', 'Internal Surveyor', 'Insurer Control'),
            rule('Claim Details', 'Claim Handler', 'Insurer Control'),
            rule('AI ILA', 'TCT', 'Insurer Control'),
            rule('Handler ILA', 'Claim Handler', 'Insurer Control'),
            rule('FLA', 'Sr TCT', 'Insurer Control'),
            rule('Recommendation', 'National Manager', 'Insurer Control'),
            rule('Approval', 'HO/Admin', 'Insurer Control'),
            rule('Settlement', 'HO/Admin', 'Insurer Control'),
        ],
        overview: {
            operatingModel: 'SaaS-Insurer operates claim',
            insurer: 'ABC General Insurance',
            adminProfile: 'HO/National Manager',
            feeBillModel: 'Not Applicable-SaaS',
        },
        triggers: TRIGGERS,
    },
    serviceProvider: {
        key: 'serviceProvider',
        journeyTitle: 'Claim Journey - As Service Provider',
        banner: 'As Service Provider: Surveyor Allocation, Recommendation And Payment Approval Are Hidden. Fee Bill Is Enabled.',
        stats: { roles: 7, users: 126, permissionRules: 184 },
        stages: ['Intimation', 'Handler Allocation', 'Claim Details', 'AI ILA', 'Handler ILA', 'FLA', 'Fee Bill'],
        rules: [
            rule('Intimation', 'Call Center', 'Vendor service stage'),
            rule('Handler Allocation', 'National Manager', 'Vendor service stage'),
            rule('Claim Details', 'Claim Handler', 'Vendor service stage'),
            rule('AI ILA', 'AI assesment', 'Vendor service stage'),
            rule('Handler ILA', 'Claim Handler', 'Vendor service stage'),
            rule('FLA', 'Sr Technical reviewer', 'Vendor service stage'),
            rule('Fee Bill', 'National Manager', 'Vendor service stage'),
        ],
        overview: {
            operatingModel: 'IBima assist service workflow',
            insurer: 'ABC General Insurance',
            adminProfile: 'HO/National Manager',
            feeBillModel: 'Automatic-based on product model',
        },
        triggers: TRIGGERS,
    },
};

export const OPERATING_MODELS = ['SaaS-Insurer operates claim', 'IBima assist service workflow'];
export const ADMIN_PROFILES = ['HO/National Manager', 'Regional Manager', 'Branch Manager'];
export const FEE_BILL_MODELS = ['Automatic-based on product model', 'Manual entry', 'Not Applicable-SaaS'];
export const CHANNEL_OPTIONS = ['Whatsapp', 'email', 'SMS', 'Letter', 'In - app'];
export const AUTO_ROLES = ['TCT', 'Sr TCT', 'Claim Handler', 'Internal Surveyor', 'National Manager', 'HO/Admin'];

// Roles & Permission matrix (Page/Module rows x action columns).
export const PERMISSION_PAGES = [
    'Dashboard', 'Claim Intimation', 'Handler Allocation', 'Surveyor Assignment', 'Claim Details', 'AI ILA',
    'Handler ILA', 'FLA', 'Payment Recommendation', 'Approval', 'Survey Fee Bill', 'Document/DMS',
    'Requirement Letters', 'Communication History', 'Fraud Triggers', 'TAT & SLA', 'Workshop Empanelment',
    'Vendor Empanelment', 'Reports & Analytics', 'Data Download', 'Users & Roles', 'System Configuration', 'Audit Logs',
];
export const PERMISSION_ACTIONS = ['view', 'edit', 'create', 'approve', 'download'];
export const PERMISSION_ACTION_LABELS = { view: 'View', edit: 'Edit', create: 'Create', approve: 'Approve/Action', download: 'Download' };

export const buildPermissionMatrix = (allOn = true) =>
    Object.fromEntries(PERMISSION_PAGES.map((p) => [p, Object.fromEntries(PERMISSION_ACTIONS.map((a) => [a, allOn]))]));
