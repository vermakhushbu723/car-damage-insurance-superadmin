// Central route map -- every Link/navigate() call in the app should import
// from here instead of hardcoding a path string.
export const ROUTES = {
    LOGIN: '/login',
    HOME: '/dashboard',

    CLAIM_SAAS: '/claim/saas',
    CLAIM_SERVICE_PROVIDER: '/claim/service-provider',
    PREINSPECTION_SAAS: '/preinspection/saas',
    PREINSPECTION_SERVICE_PROVIDER: '/preinspection/service-provider',

    INTERNAL_USER: '/internal-user',
    INSURER: '/insurer',
    INSURER_NEW: '/insurer/new',
    BROKER: '/broker',
    SURVEYOR: '/surveyor',
    WORKSHOP: '/workshop',
    SETTINGS: '/settings',
    SUPPORT: '/support',
};
