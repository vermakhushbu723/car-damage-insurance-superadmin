// UI-only session flag -- there's no backend yet (see LoginPage.jsx), so
// this just remembers "someone signed in" for RequireAuth to check.
// Swap for a real token/session once a backend exists.
const STORAGE_KEY = 'superadmin_session';

export function setSuperAdminSession(session) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {
        /* ignore quota / disabled-storage errors */
    }
}

export function getSuperAdminSession() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function clearSuperAdminSession() {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch {
        /* ignore */
    }
}

// SaaS and Service Provider each have their own super admin. Until real
// accounts exist, the sign-in email decides the scope:
//   saas.admin@ibima.com -> SaaS only, sp.admin@ibima.com -> Service Provider only,
//   anything else        -> master super admin (both modes).
export const SCOPE_ACCOUNTS = { 'saas.admin@ibima.com': 'saas', 'sp.admin@ibima.com': 'serviceProvider' };
export const SCOPE_TITLE = { all: 'Super Admin', saas: 'SaaS Super Admin', serviceProvider: 'Service Provider Super Admin' };

export const scopeForLogin = (identifier = '') => SCOPE_ACCOUNTS[identifier.trim().toLowerCase()] ?? 'all';

/** 'all' | 'saas' | 'serviceProvider' for the signed-in super admin. */
export const getAdminScope = () => getSuperAdminSession()?.scope ?? 'all';

/** The mode a page must use: a scoped admin's own mode, otherwise the requested one. */
export const scopedMode = (requested) => {
    const scope = getAdminScope();
    return scope === 'all' ? requested : scope;
};
