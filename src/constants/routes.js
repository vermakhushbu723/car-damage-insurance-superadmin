// Central route map -- every Link/navigate() call in the app should import
// from here instead of hardcoding a path string.
export const ROUTES = {
    LOGIN: '/login',
    HOME: '/dashboard',
    OVERVIEW: '/dashboard/overview',

    ORGANIZATIONS: '/organizations',
    ORGANIZATION_NEW: '/organizations/new',
    ORGANIZATION_VIEW: '/organizations/:id',
    SAAS_PLANS: '/saas-plans',
    ADMIN_USERS: '/admin-users',
    ADMIN_USER_NEW: '/admin-users/new',

    USERS: '/users',
    USER_NEW: '/users/new',
    ROLES: '/roles-permissions',
    PASSWORD_RESET: '/password-reset',
    USER_ACTIVATION: '/user-activation',

    SERVICE_MODELS: '/service-models',
    SERVICE_MODEL_NEW: '/service-models/new',
    SERVICE_MODEL_VIEW: '/service-models/:id',
    WORKFLOW: '/workflow-configuration',

    CLAIM_REPORT: '/reports/claims',
    USER_REPORT: '/reports/users',
    SAAS_USAGE: '/reports/saas-usage',
    DATA_DOWNLOAD: '/data-download',

    AUDIT_LOGS: '/audit-logs',
    SYSTEM_SETTINGS: '/system-settings',
};

export const orgPath = (id) => `/organizations/${id}`;
export const serviceModelPath = (id) => `/service-models/${id}`;
