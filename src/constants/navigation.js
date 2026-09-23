import {
    AppstoreOutlined,
    BankOutlined,
    CrownOutlined,
    TeamOutlined,
    UserOutlined,
    SafetyOutlined,
    LockOutlined,
    UserAddOutlined,
    ToolOutlined,
    ApartmentOutlined,
    FileTextOutlined,
    IdcardOutlined,
    FileSearchOutlined,
    DownloadOutlined,
    AuditOutlined,
    SettingOutlined,
} from '@ant-design/icons';
import { ROUTES } from './routes';

// Sidebar, grouped exactly as the reference design's section headings.
// `null` title = ungrouped (Dashboard sits above the first heading).
export const SIDEBAR_GROUPS = [
    {
        title: null,
        items: [{ key: 'dashboard', label: 'Dashboard', icon: AppstoreOutlined, path: ROUTES.HOME }],
    },
    {
        title: 'ORGANIZATIONS MANAGEMENT',
        items: [
            { key: 'organizations', label: 'Organzitions/Vendors', icon: BankOutlined, path: ROUTES.ORGANIZATIONS },
            { key: 'saas-plans', label: 'SaaS Plans & Subscription', icon: CrownOutlined, path: ROUTES.SAAS_PLANS },
            { key: 'admin-users', label: 'Admin Users', icon: TeamOutlined, path: ROUTES.ADMIN_USERS },
        ],
    },
    {
        title: 'USER MANAGEMENT',
        items: [
            { key: 'users', label: 'Users', icon: UserOutlined, path: ROUTES.USERS },
            { key: 'roles', label: 'Roles & Permissions', icon: SafetyOutlined, path: ROUTES.ROLES },
            { key: 'password-reset', label: 'Password Reset', icon: LockOutlined, path: ROUTES.PASSWORD_RESET },
            { key: 'user-activation', label: 'User Activation', icon: UserAddOutlined, path: ROUTES.USER_ACTIVATION },
        ],
    },
    {
        title: 'SERVICE CONFIGURATION',
        items: [
            { key: 'service-models', label: 'Service Model', icon: ToolOutlined, path: ROUTES.SERVICE_MODELS },
            { key: 'workflow', label: 'Workflow Configuration', icon: ApartmentOutlined, path: ROUTES.WORKFLOW },
        ],
    },
    {
        title: 'REPORTS & ANALYTICS',
        items: [
            { key: 'claim-report', label: 'Claim Report', icon: FileTextOutlined, path: ROUTES.CLAIM_REPORT },
            { key: 'user-report', label: 'User Report', icon: IdcardOutlined, path: ROUTES.USER_REPORT },
            { key: 'saas-usage', label: 'SaaS  Usage Report', icon: FileSearchOutlined, path: ROUTES.SAAS_USAGE },
            { key: 'data-download', label: 'Data Download', icon: DownloadOutlined, path: ROUTES.DATA_DOWNLOAD },
        ],
    },
    {
        title: 'SYSTEM',
        items: [
            { key: 'audit-logs', label: 'Audit Logs', icon: AuditOutlined, path: ROUTES.AUDIT_LOGS },
            { key: 'system-settings', label: 'System Setings', icon: SettingOutlined, path: ROUTES.SYSTEM_SETTINGS },
        ],
    },
];

export const ALL_NAV_ITEMS = SIDEBAR_GROUPS.flatMap((g) => g.items);

// Active-item matching: exact path or any nested path (e.g. /users/new
// keeps "Users" highlighted, /dashboard/overview keeps "Dashboard").
export function isNavItemActive(item, pathname) {
    return pathname === item.path || pathname.startsWith(`${item.path}/`);
}
