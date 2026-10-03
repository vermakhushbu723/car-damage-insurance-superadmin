import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
    SEED_SERVICE_MODELS, SEED_CLAIMS, SEED_DOWNLOADS, SEED_INTEGRATIONS, SEED_SYSTEM, withClaimLocation,
} from '../data/seed';
import { WORKFLOW_MODES } from '../data/workflow';
import {
    organizationsApi, usersApi, adminUsersApi, plansApi, rolesApi, auditLogsApi,
} from '../api/superadminApi';
import { getToken } from '../auth/session';

/**
 * App data layer.
 *
 * REMOTE collections live in the database (superadmin-service) and are
 * fetched on first use: organizations, users, adminUsers, plans, roles,
 * auditLogs. Pages change them through src/api/superadminApi.js and then
 * call upsert()/reload() so every page sees the saved data.
 *
 * LOCAL collections (workflow, service models, claims, downloads, system
 * settings) have no backend yet and still persist in localStorage.
 */
const STORAGE_KEY = 'superadmin_data_v2';

const REMOTE_LOADERS = {
    organizations: organizationsApi.list,
    users: usersApi.list,
    adminUsers: adminUsersApi.list,
    plans: plansApi.list,
    roles: async () => (await rolesApi.list()).roles,
    auditLogs: auditLogsApi.list,
};
const REMOTE_KEYS = Object.keys(REMOTE_LOADERS);
const emptyRemote = () => Object.fromEntries(REMOTE_KEYS.map((k) => [k, { items: [], loaded: false, loading: false, error: null }]));

const buildLocalSeed = () => ({
    serviceModels: SEED_SERVICE_MODELS,
    claims: SEED_CLAIMS,
    downloads: SEED_DOWNLOADS,
    integrations: SEED_INTEGRATIONS,
    system: SEED_SYSTEM,
    workflow: WORKFLOW_MODES,
});
const LOCAL_KEYS = Object.keys(buildLocalSeed());

// Backfills fields added after a browser already saved its data, so
// existing sessions keep their edits instead of being reset to the seed.
const migrate = (state) => ({
    ...state,
    claims: state.claims.map(withClaimLocation),
    // Older saves seeded every stage as disabled ("0 of 7 stages enabled").
    workflow: Object.fromEntries(Object.entries(state.workflow).map(([mode, cfg]) => [
        mode,
        cfg.rules.every((r) => !r.enabled) ? { ...cfg, rules: WORKFLOW_MODES[mode]?.rules ?? cfg.rules } : cfg,
    ])),
});

const loadLocal = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const saved = JSON.parse(raw);
            // Keys that moved to the database (organizations, users, ...) are dropped.
            const local = Object.fromEntries(LOCAL_KEYS.filter((k) => k in saved).map((k) => [k, saved[k]]));
            return migrate({ ...buildLocalSeed(), ...local });
        }
    } catch {
        /* corrupt/blocked storage -- fall back to seed */
    }
    return buildLocalSeed();
};

const DataContext = createContext(null);

let idCounter = Date.now();
export const newId = (prefix) => `${prefix}-${(idCounter++).toString(36).toUpperCase()}`;

export const DataProvider = ({ children }) => {
    const [local, setLocal] = useState(loadLocal);
    const [remote, setRemote] = useState(emptyRemote);
    const inflight = useRef({});

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(local));
        } catch {
            /* ignore quota / disabled-storage errors */
        }
    }, [local]);

    const setKey = useCallback((key, updater) => {
        setLocal((prev) => ({ ...prev, [key]: typeof updater === 'function' ? updater(prev[key]) : updater }));
    }, []);

    const patchRemote = useCallback((key, patch) => {
        setRemote((prev) => ({ ...prev, [key]: { ...prev[key], ...(typeof patch === 'function' ? patch(prev[key]) : patch) } }));
    }, []);

    /** Fetches a remote collection (deduplicated while a request is running). */
    const reload = useCallback((key) => {
        if (!getToken()) return Promise.resolve([]);
        if (inflight.current[key]) return inflight.current[key];
        patchRemote(key, { loading: true, error: null });
        const p = REMOTE_LOADERS[key]()
            .then((items) => {
                patchRemote(key, { items, loaded: true, loading: false });
                return items;
            })
            .catch((err) => {
                patchRemote(key, { loading: false, error: err.message, loaded: true });
                return [];
            })
            .finally(() => { delete inflight.current[key]; });
        inflight.current[key] = p;
        return p;
    }, [patchRemote]);

    /** Clears database-backed data (on logout, so the next admin never sees the previous one's data). */
    const clearRemote = useCallback(() => setRemote(emptyRemote()), []);
    const resetLocal = useCallback(() => setLocal(buildLocalSeed()), []);

    const value = useMemo(
        () => ({ local, remote, setKey, patchRemote, reload, clearRemote, resetLocal }),
        [local, remote, setKey, patchRemote, reload, clearRemote, resetLocal],
    );
    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

const useData = () => {
    const ctx = useContext(DataContext);
    if (!ctx) throw new Error('useData must be used inside <DataProvider>');
    return ctx;
};

const idOf = (key, item) => (key === 'roles' ? item.name : item.id);

/**
 * Remote: { items, loading, loaded, error, reload, upsert, upsertMany }
 *   upsert(item) replaces the item with the same id (or adds it on top).
 * Local:  { items, add, update, updateMany, remove } (localStorage-backed).
 */
export function useCollection(key) {
    const { local, remote, setKey, patchRemote, reload } = useData();
    const isRemote = REMOTE_KEYS.includes(key);
    const slot = isRemote ? remote[key] : null;

    // Remote collections load the first time a page uses them.
    useEffect(() => {
        if (isRemote && !slot.loaded && !slot.loading) reload(key);
    }, [isRemote, key, slot?.loaded, slot?.loading, reload]); // eslint-disable-line react-hooks/exhaustive-deps

    const upsertMany = useCallback((items) => patchRemote(key, (s) => {
        const byId = new Map(items.map((it) => [idOf(key, it), it]));
        const kept = s.items.map((it) => byId.get(idOf(key, it)) ?? it);
        const fresh = items.filter((it) => !s.items.some((x) => idOf(key, x) === idOf(key, it)));
        return { items: [...fresh, ...kept] };
    }), [key, patchRemote]);
    const upsert = useCallback((item) => upsertMany([item]), [upsertMany]);
    const reloadThis = useCallback(() => reload(key), [key, reload]);

    const add = useCallback((item) => setKey(key, (list) => [item, ...list]), [key, setKey]);
    const update = useCallback((id, patch) => setKey(key, (list) => list.map((it) => (it.id === id ? { ...it, ...(typeof patch === 'function' ? patch(it) : patch) } : it))), [key, setKey]);
    const updateMany = useCallback((ids, patch) => setKey(key, (list) => list.map((it) => (ids.includes(it.id) ? { ...it, ...patch } : it))), [key, setKey]);
    const remove = useCallback((id) => setKey(key, (list) => list.filter((it) => it.id !== id)), [key, setKey]);

    if (isRemote) {
        return { items: slot.items, loading: slot.loading || !slot.loaded, loaded: slot.loaded, error: slot.error, reload: reloadThis, upsert, upsertMany };
    }
    return { items: local[key], add, update, updateMany, remove };
}

/** Roles from the database in the shape the pages use: { list: [names], matrices: { name: matrix }, items }. */
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

/** Plain value (object) slot, e.g. system settings or workflow config (local). */
export function useStoreValue(key) {
    const { local, setKey } = useData();
    const set = useCallback((updater) => setKey(key, updater), [key, setKey]);
    return [local[key], set];
}

export function useResetData() {
    return useData().resetLocal;
}

export function useClearRemoteData() {
    return useData().clearRemote;
}

/**
 * Records an admin action in the database audit trail. Actions that go
 * through superadmin-service are logged by the server itself; this is for
 * the rest (exports, downloads, local settings).
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
