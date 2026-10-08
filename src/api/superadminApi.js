import { api, fetchFile } from './client';

// One function per superadmin-service endpoint (see
// ai-damage-assessment-service/superadmin-service/README.md).
const enc = encodeURIComponent;

export const authApi = {
    login: (identifier, password) => api.post('/auth/login', { identifier, password }, { auth: false }),
    me: () => api.get('/auth/me'),
    logout: () => api.post('/auth/logout'),
    changePassword: (currentPassword, newPassword) => api.post('/auth/change-password', { currentPassword, newPassword }),
};

export const organizationsApi = {
    list: () => api.get('/organizations'),
    get: (id) => api.get(`/organizations/${enc(id)}`),
    create: (body) => api.post('/organizations', body),
    update: (id, patch) => api.patch(`/organizations/${enc(id)}`, patch),
};

export const plansApi = {
    list: () => api.get('/plans'),
    update: (id, patch) => api.patch(`/plans/${enc(id)}`, patch),
    assign: (id, organizationIds) => api.post(`/plans/${enc(id)}/assign`, { organizationIds }),
};

export const adminUsersApi = {
    list: () => api.get('/admin-users'),
    create: (body) => api.post('/admin-users', body),
    update: (id, patch) => api.patch(`/admin-users/${enc(id)}`, patch),
    resetPassword: (id) => api.post(`/admin-users/${enc(id)}/reset-password`, {}),
};

export const usersApi = {
    list: () => api.get('/users'),
    create: (body) => api.post('/users', body),
    update: (id, patch) => api.patch(`/users/${enc(id)}`, patch),
    bulkStatus: (ids, status) => api.post('/users/bulk-status', { ids, status }),
    verify: (userId, email, phone) => api.post('/users/verify', { userId, email, phone }),
    resetLink: (id) => api.post(`/users/${enc(id)}/reset-link`),
    resetPassword: (id, password, reason) => api.post(`/users/${enc(id)}/reset-password`, { password, reason }),
};

export const rolesApi = {
    list: () => api.get('/roles'),
    create: (name, copyFrom) => api.post('/roles', { name, ...(copyFrom ? { copyFrom } : {}) }),
    savePermissions: (name, permissions) => api.put(`/roles/${enc(name)}/permissions`, { permissions }),
};

export const passwordResetApi = {
    check: (token) => api.get(`/password-reset/${enc(token)}`, { auth: false }),
    confirm: (token, password) => api.post('/password-reset/confirm', { token, password }, { auth: false }),
};

export const auditLogsApi = {
    list: () => api.get('/audit-logs'),
    record: (entry) => api.post('/audit-logs', entry),
};

export const serviceModelsApi = {
    list: () => api.get('/service-models'),
    create: (body) => api.post('/service-models', body),
    update: (id, patch) => api.patch(`/service-models/${enc(id)}`, patch),
};

export const workflowsApi = {
    list: () => api.get('/workflows'),
    update: (mode, patch) => api.patch(`/workflows/${enc(mode)}`, patch),
    activate: (mode) => api.post(`/workflows/${enc(mode)}/activate`),
    addTrigger: (mode, body) => api.post(`/workflows/${enc(mode)}/triggers`, body),
    updateTrigger: (mode, id, patch) => api.patch(`/workflows/${enc(mode)}/triggers/${enc(id)}`, patch),
};

export const claimsApi = {
    list: () => api.get('/claims'),
};

export const downloadsApi = {
    list: () => api.get('/downloads'),
    create: (body) => api.post('/downloads', body),
    /** Fetches the generated CSV (with the login token) and saves it in the browser. */
    save: async (download) => {
        const blob = await fetchFile(`/downloads/${enc(download.id)}/file`);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = download.fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    },
};

export const reportsApi = {
    usage: () => api.get('/reports/usage'),
};

export const integrationsApi = {
    list: () => api.get('/integrations'),
    update: (id, patch) => api.patch(`/integrations/${enc(id)}`, patch),
    test: (id) => api.post(`/integrations/${enc(id)}/test`),
};

export const systemApi = {
    get: () => api.get('/system'),
    updateSettings: (patch) => api.patch('/system/settings', patch),
    update: () => api.post('/system/update'),
};
