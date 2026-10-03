import { api } from './client';

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
