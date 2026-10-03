// Signed-in super admin session: the API token plus who is signed in
// (returned by POST /api/v1/auth/login). Stored in localStorage so a reload
// keeps you signed in until the token expires.
const STORAGE_KEY = 'superadmin_session_v2';

export function setSuperAdminSession({ token, expiresIn, admin, permissions }) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            token,
            admin,
            permissions,
            expiresAt: Date.now() + (expiresIn ?? 0) * 1000,
        }));
        // The pre-backend demo session; never valid again.
        localStorage.removeItem('superadmin_session');
    } catch {
        /* ignore quota / disabled-storage errors */
    }
}

/** The session, or null when signed out or the token has expired. */
export function getSuperAdminSession() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const session = JSON.parse(raw);
        if (!session?.token || !session.expiresAt || session.expiresAt <= Date.now()) return null;
        return session;
    } catch {
        return null;
    }
}

/** Refreshes the stored admin/permissions (GET /auth/me) without touching the token. */
export function updateSessionProfile({ admin, permissions }) {
    const session = getSuperAdminSession();
    if (!session) return;
    setSuperAdminSession({ ...session, admin, permissions, expiresIn: (session.expiresAt - Date.now()) / 1000 });
}

export function clearSuperAdminSession() {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch {
        /* ignore */
    }
}

export const getToken = () => getSuperAdminSession()?.token ?? null;
export const getCurrentAdmin = () => getSuperAdminSession()?.admin ?? null;
/** Master super admin (role Super Admin, all scopes): manages admin users and roles. */
export const isMasterAdmin = () => Boolean(getCurrentAdmin()?.isMaster);

export const SCOPE_TITLE = { all: 'Super Admin', saas: 'SaaS Super Admin', serviceProvider: 'Service Provider Super Admin' };

/** 'all' | 'saas' | 'serviceProvider' for the signed-in super admin (set on their account in the database). */
export const getAdminScope = () => getCurrentAdmin()?.scope ?? 'all';

/** The mode a page must use: a scoped admin's own mode, otherwise the requested one. */
export const scopedMode = (requested) => {
    const scope = getAdminScope();
    return scope === 'all' ? requested : scope;
};
