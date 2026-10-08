// Workflow/permission constants shared by the pages. The workflow configs
// themselves (stages, rules, triggers) live in the database
// (superadmin-service, GET /api/v1/workflows).

export const OPERATING_MODELS = ['SaaS-Insurer operates claim', 'IBima assist service workflow'];

// Mode key <-> the organization's `serviceModel` value.
export const modeOfOrg = (org) => (org?.serviceModel === 'Service Provider' ? 'serviceProvider' : 'saas');
export const SERVICE_MODEL_OF_MODE = { saas: 'SaaS', serviceProvider: 'Service Provider' };
export const MODE_LABEL = { saas: 'SaaS', serviceProvider: 'Service Provider' };
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
