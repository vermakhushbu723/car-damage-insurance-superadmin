import {
    AppstoreOutlined,
    UserOutlined,
    SafetyCertificateOutlined,
    TeamOutlined,
    PieChartOutlined,
    ShopOutlined,
    SettingOutlined,
    CustomerServiceOutlined,
} from '@ant-design/icons';
import { ROUTES } from './routes';

// The sidebar (see components/layout/Sidebar.jsx). "Dashboard" always routes
// back to the module/mode picker hub -- everything else is a shared page
// regardless of which dashboard variant (Claim/Preinspection x SaaS/Service
// Provider) got you there.
export const SIDEBAR_ITEMS = [
    { key: 'dashboard', label: 'Dashboard', icon: AppstoreOutlined, path: ROUTES.HOME },
    { key: 'internal-user', label: 'Internal User', icon: UserOutlined, path: ROUTES.INTERNAL_USER },
    { key: 'insurer', label: 'Insurer', icon: SafetyCertificateOutlined, path: ROUTES.INSURER },
    { key: 'broker', label: 'Broker', icon: TeamOutlined, path: ROUTES.BROKER },
    { key: 'surveyor', label: 'Surveyor', icon: PieChartOutlined, path: ROUTES.SURVEYOR },
    { key: 'workshop', label: 'Workshop', icon: ShopOutlined, path: ROUTES.WORKSHOP },
];

// Rendered separately, pinned toward the bottom of the sidebar (see the gap
// in the reference design between Workshop and Settings).
export const SIDEBAR_FOOTER_ITEMS = [
    { key: 'settings', label: 'Settings', icon: SettingOutlined, path: ROUTES.SETTINGS },
    { key: 'support', label: 'Support', icon: CustomerServiceOutlined, path: ROUTES.SUPPORT },
];

// A route is "on the Dashboard" (sidebar's Dashboard item highlighted) if it
// matches the hub itself or any of the 4 module/mode dashboard variants.
const DASHBOARD_PREFIXES = [ROUTES.HOME, '/claim/', '/preinspection/'];
export function isDashboardRoute(pathname) {
    return DASHBOARD_PREFIXES.some((p) => pathname === p || pathname.startsWith(p));
}
