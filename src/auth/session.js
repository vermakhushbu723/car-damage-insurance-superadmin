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
