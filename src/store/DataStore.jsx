import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
    SEED_ORGANIZATIONS, SEED_USERS, SEED_ADMIN_USERS, SEED_SERVICE_MODELS, SEED_PLANS, SEED_CLAIMS,
    SEED_AUDIT_LOGS, SEED_DOWNLOADS, SEED_INTEGRATIONS, SEED_SYSTEM,
} from '../data/seed';
import { WORKFLOW_MODES, buildPermissionMatrix } from '../data/workflow';
import { ADMIN_ROLES } from '../data/seed';

/**
 * Tiny client-side data layer for the UI-only build. Everything lives in one
 * state object persisted to localStorage, so changes made on one page
 * (e.g. activating a user) show up on every other page and survive a
 * reload. Bump STORAGE_KEY's version when the seed shape changes.
 * To wire a backend later, replace loadState/saveState + the mutators.
 */
const STORAGE_KEY = 'superadmin_data_v2';

const buildSeed = () => ({
    organizations: SEED_ORGANIZATIONS,
    users: SEED_USERS,
    adminUsers: SEED_ADMIN_USERS,
    serviceModels: SEED_SERVICE_MODELS,
    plans: SEED_PLANS,
    claims: SEED_CLAIMS,
    auditLogs: SEED_AUDIT_LOGS,
    downloads: SEED_DOWNLOADS,
    integrations: SEED_INTEGRATIONS,
    system: SEED_SYSTEM,
    workflow: WORKFLOW_MODES,
    roles: {
        list: ADMIN_ROLES,
        matrices: Object.fromEntries(ADMIN_ROLES.map((r) => [r, buildPermissionMatrix(true)])),
    },
});

const loadState = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return { ...buildSeed(), ...JSON.parse(raw) };
    } catch {
        /* corrupt/blocked storage -- fall back to seed */
    }
    return buildSeed();
};

const DataContext = createContext(null);

let idCounter = Date.now();
export const newId = (prefix) => `${prefix}-${(idCounter++).toString(36).toUpperCase()}`;

export const DataProvider = ({ children }) => {
    const [state, setState] = useState(loadState);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch {
            /* ignore quota / disabled-storage errors */
        }
    }, [state]);

    const setKey = useCallback((key, updater) => {
        setState((prev) => ({ ...prev, [key]: typeof updater === 'function' ? updater(prev[key]) : updater }));
    }, []);

    const resetAll = useCallback(() => setState(buildSeed()), []);

    const value = useMemo(() => ({ state, setKey, resetAll }), [state, setKey, resetAll]);
    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

const useData = () => {
    const ctx = useContext(DataContext);
    if (!ctx) throw new Error('useData must be used inside <DataProvider>');
    return ctx;
};

/** Array collection with add/update/remove helpers. New items go to the top. */
export function useCollection(key) {
    const { state, setKey } = useData();
    const items = state[key];
    const add = useCallback((item) => setKey(key, (list) => [item, ...list]), [key, setKey]);
    const update = useCallback((id, patch) => setKey(key, (list) => list.map((it) => (it.id === id ? { ...it, ...(typeof patch === 'function' ? patch(it) : patch) } : it))), [key, setKey]);
    const updateMany = useCallback((ids, patch) => setKey(key, (list) => list.map((it) => (ids.includes(it.id) ? { ...it, ...patch } : it))), [key, setKey]);
    const remove = useCallback((id) => setKey(key, (list) => list.filter((it) => it.id !== id)), [key, setKey]);
    return { items, add, update, updateMany, remove };
}

/** Plain value (object) slot, e.g. system settings or workflow config. */
export function useStoreValue(key) {
    const { state, setKey } = useData();
    const set = useCallback((updater) => setKey(key, updater), [key, setKey]);
    return [state[key], set];
}

export function useResetData() {
    return useData().resetAll;
}

/**
 * Appends an entry to Audit Logs -- call after any meaningful admin action
 * so the Audit Logs page reflects what actually happened in this session.
 */
export function useAuditLog() {
    const { setKey } = useData();
    return useCallback((action, module, status = 'Success') => {
        const ua = navigator.userAgent;
        const browser = /Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : 'Browser';
        const os = /Windows/.test(ua) ? 'Windows' : /Mac OS/.test(ua) ? 'macOS' : /Android/.test(ua) ? 'Android' : /iPhone|iPad/.test(ua) ? 'iOS' : 'Linux';
        setKey('auditLogs', (list) => [{
            id: newId('LOG'),
            timestamp: new Date().toISOString(),
            user: 'Super Admin',
            role: 'Super Admin',
            action,
            ip: '192.168.1.45',
            device: `${browser} / ${os}`,
            module,
            status,
        }, ...list]);
    }, [setKey]);
}
