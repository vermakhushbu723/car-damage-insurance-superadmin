import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
    organizationsApi, usersApi, adminUsersApi, plansApi, rolesApi, auditLogsApi, serviceModelsApi,
    workflowsApi, claimsApi, downloadsApi, integrationsApi, systemApi, reportsApi,
} from '../api/superadminApi';
import { getToken } from '../auth/session';

/**
 * App data layer -- everything comes from the database (superadmin-service).
 * Each collection is fetched the first time a page uses it and kept in
 * memory; pages change data through src/api/superadminApi.js and then call
 * upsert()/set()/reload() so every page sees the saved result.
 *
 * Arrays:  organizations, users, adminUsers, plans, roles, auditLogs,
 *          serviceModels, claims, downloads, integrations
 * Objects: workflows ({ saas, serviceProvider, options }), system, usage (report metrics)
 */
const LOADERS = {
    organizations: organizationsApi.list,
    users: usersApi.list,
    adminUsers: adminUsersApi.list,
    plans: plansApi.list,
    roles: async () => (await rolesApi.list()).roles,
    auditLogs: auditLogsApi.list,
    serviceModels: serviceModelsApi.list,
    claims: claimsApi.list,
    downloads: downloadsApi.list,
    integrations: integrationsApi.list,
    workflows: workflowsApi.list,
    system: systemApi.get,
    usage: reportsApi.usage,
};
const OBJECT_KEYS = ['workflows', 'system', 'usage'];
const KEYS = Object.keys(LOADERS);
const emptySlot = (key) => ({ items: OBJECT_KEYS.includes(key) ? null : [], loaded: false, loading: false, error: null });
const emptyState = () => Object.fromEntries(KEYS.map((k) => [k, emptySlot(k)]));

// Before the backend existed, sample data was kept in this localStorage key; drop it.
try {
    localStorage.removeItem('superadmin_data_v2');
} catch {
    /* storage blocked -- nothing to clean */
}

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
    const [remote, setRemote] = useState(emptyState);
    const inflight = useRef({});

    const patch = useCallback((key, p) => {
        setRemote((prev) => ({ ...prev, [key]: { ...prev[key], ...(typeof p === 'function' ? p(prev[key]) : p) } }));
    }, []);

    /** Fetches a collection (deduplicated while a request is running). */
    const reload = useCallback((key) => {
        if (!getToken()) return Promise.resolve(null);
        if (inflight.current[key]) return inflight.current[key];
        patch(key, { loading: true, error: null });
        const p = LOADERS[key]()
            .then((items) => {
                patch(key, { items, loaded: true, loading: false });
                return items;
            })
            .catch((err) => {
                patch(key, { loading: false, error: err.message, loaded: true });
                return null;
            })
            .finally(() => { delete inflight.current[key]; });
        inflight.current[key] = p;
        return p;
    }, [patch]);

    /** Forget everything (on logout, so the next admin never sees the previous one's data). */
    const clearAll = useCallback(() => setRemote(emptyState()), []);

    const value = useMemo(() => ({ remote, patch, reload, clearAll }), [remote, patch, reload, clearAll]);
    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

const useData = () => {
    const ctx = useContext(DataContext);
    if (!ctx) throw new Error('useData must be used inside <DataProvider>');
    return ctx;
};

function useAutoLoad(key) {
    const { remote, reload } = useData();
    const slot = remote[key];
    useEffect(() => {
        if (!slot.loaded && !slot.loading) reload(key);
    }, [key, slot.loaded, slot.loading, reload]);
    return slot;
}

const idOf = (key, item) => (key === 'roles' ? item.name : item.id);

/**
 * Array collection: { items, loading, loaded, error, reload, upsert, upsertMany }.
 * upsert(item) replaces the item with the same id (or adds it on top).
 */
export function useCollection(key) {
    const { patch, reload } = useData();
    const slot = useAutoLoad(key);
    const upsertMany = useCallback((items) => patch(key, (s) => {
        const byId = new Map(items.map((it) => [idOf(key, it), it]));
        const kept = s.items.map((it) => byId.get(idOf(key, it)) ?? it);
        const fresh = items.filter((it) => !s.items.some((x) => idOf(key, x) === idOf(key, it)));
        return { items: [...fresh, ...kept] };
    }), [key, patch]);
    const upsert = useCallback((item) => upsertMany([item]), [upsertMany]);
    const reloadThis = useCallback(() => reload(key), [key, reload]);
    return { items: slot.items, loading: slot.loading || !slot.loaded, loaded: slot.loaded, error: slot.error, reload: reloadThis, upsert, upsertMany };
}

/** Object value (workflows, system, usage): [value | null, set(value), { loading, error, reload }]. */
export function useRemoteValue(key) {
    const { patch, reload } = useData();
    const slot = useAutoLoad(key);
    const set = useCallback((value) => patch(key, (s) => ({ items: typeof value === 'function' ? value(s.items) : value })), [key, patch]);
    const reloadThis = useCallback(() => reload(key), [key, reload]);
    return [slot.items, set, { loading: slot.loading || !slot.loaded, error: slot.error, reload: reloadThis }];
}

/** Roles in the shape the pages use: { list: [names], matrices: { name: matrix }, items }. */
export function useRoles() {
    const { items, loading, reload, upsert } = useCollection('roles');
    return useMemo(() => ({
        list: items.map((r) => r.name),
        matrices: Object.fromEntries(items.map((r) => [r.name, r.permissions])),
        items,
        loading,
        reload,
        upsert,
    }), [items, loading, reload, upsert]);
}

export function useClearRemoteData() {
    return useData().clearAll;
}

/** Marks collections stale so the next page that uses them refetches (e.g. after an action that changes counts). */
export function useInvalidate() {
    const { patch } = useData();
    return useCallback((...keys) => keys.forEach((k) => patch(k, { loaded: false })), [patch]);
}

/**
 * Records a console-only action (e.g. a browser export) in the audit trail.
 * Everything that goes through the API is logged by the server itself.
 */
export function useAuditLog() {
    const { reload, remote } = useData();
    const loaded = remote.auditLogs.loaded;
    return useCallback((action, module, status = 'Success', detail) => {
        auditLogsApi.record({ action, module, status, ...(detail ? { detail } : {}) })
            .then(() => { if (loaded) reload('auditLogs'); })
            .catch(() => { /* audit is best-effort; never block the action itself */ });
    }, [reload, loaded]);
}
