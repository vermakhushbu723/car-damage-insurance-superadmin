import { getToken, clearSuperAdminSession } from '../auth/session';

// Same-origin by default: Vite (dev/preview) and nginx (production) proxy
// /api to superadmin-service. Override with VITE_API_BASE_URL if the API
// ever lives on another host.
const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/$/, '');

/** Error thrown for any non-2xx response; `.message` is the server's readable reason. */
export class ApiError extends Error {
    constructor(status, message, data) {
        super(message);
        this.status = status;
        this.data = data;
    }
}

/**
 * fetch wrapper: JSON in/out, Bearer token, readable errors. A 401 on an
 * authenticated call means the session is gone (expired, or the admin was
 * suspended) -- clear it and go back to the login page.
 */
export async function request(method, path, body, { auth = true } = {}) {
    const headers = { Accept: 'application/json' };
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    const token = auth ? getToken() : null;
    if (token) headers.Authorization = `Bearer ${token}`;

    let res;
    try {
        res = await fetch(`${API_BASE}${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
    } catch {
        throw new ApiError(0, 'Cannot reach the server. Check your internet connection and try again.');
    }

    let data = null;
    const text = await res.text();
    if (text) {
        try {
            data = JSON.parse(text);
        } catch {
            data = null;
        }
    }

    if (!res.ok) {
        if (res.status === 401 && auth && token) {
            clearSuperAdminSession();
            if (!window.location.pathname.startsWith('/login')) window.location.replace('/login?expired=1');
        }
        const message = data?.detail || (res.status >= 500 ? 'Server error, please try again.' : `Request failed (${res.status}).`);
        throw new ApiError(res.status, message, data);
    }
    return data;
}

export const api = {
    get: (path, opts) => request('GET', path, undefined, opts),
    post: (path, body, opts) => request('POST', path, body ?? {}, opts),
    patch: (path, body, opts) => request('PATCH', path, body, opts),
    put: (path, body, opts) => request('PUT', path, body, opts),
    del: (path, opts) => request('DELETE', path, undefined, opts),
};
