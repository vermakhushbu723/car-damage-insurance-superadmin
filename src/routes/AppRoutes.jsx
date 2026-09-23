import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import RequireAuth from '../auth/RequireAuth';
import AppLayout from '../components/layout/AppLayout';

import LoginPage from '../pages/auth/LoginPage';
import HomeDashboardPage from '../pages/dashboard/HomeDashboardPage';
import OverviewDashboardPage from '../pages/dashboard/OverviewDashboardPage';

import OrganizationsPage from '../pages/organizations/OrganizationsPage';
import OrganizationFormPage from '../pages/organizations/OrganizationFormPage';
import SaasPlansPage from '../pages/plans/SaasPlansPage';
import AdminUsersPage from '../pages/users/AdminUsersPage';

import UsersPage from '../pages/users/UsersPage';
import UserCreatePage from '../pages/users/UserCreatePage';
import RolesPermissionsPage from '../pages/users/RolesPermissionsPage';
import PasswordResetPage from '../pages/users/PasswordResetPage';
import UserActivationPage from '../pages/users/UserActivationPage';

import ServiceModelsPage from '../pages/service/ServiceModelsPage';
import ServiceModelFormPage from '../pages/service/ServiceModelFormPage';
import WorkflowConfigPage from '../pages/workflow/WorkflowConfigPage';

import ClaimReportPage from '../pages/reports/ClaimReportPage';
import UserReportPage from '../pages/reports/UserReportPage';
import SaasUsageReportPage from '../pages/reports/SaasUsageReportPage';
import DataDownloadPage from '../pages/reports/DataDownloadPage';

import AuditLogsPage from '../pages/system/AuditLogsPage';
import SystemSettingsPage from '../pages/system/SystemSettingsPage';

// Paths from the previous sidebar design, redirected so old bookmarks still land somewhere sensible.
const LEGACY_REDIRECTS = [
    ['/claim/*', `${ROUTES.OVERVIEW}?mode=saas`],
    ['/preinspection/*', `${ROUTES.OVERVIEW}?mode=saas`],
    ['/insurer/*', `${ROUTES.ORGANIZATION_NEW}?type=Insurer`],
    ['/broker', `${ROUTES.ORGANIZATION_NEW}?type=Broker`],
    ['/surveyor', `${ROUTES.ORGANIZATION_NEW}?type=Surveyor`],
    ['/workshop', `${ROUTES.ORGANIZATION_NEW}?type=Workshop`],
    ['/internal-user/*', ROUTES.USER_NEW],
    ['/settings', ROUTES.SYSTEM_SETTINGS],
    ['/support', ROUTES.HOME],
];

const AppRoutes = () => (
    <Routes>
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />

        <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
            <Route path={ROUTES.HOME} element={<HomeDashboardPage />} />
            <Route path={ROUTES.OVERVIEW} element={<OverviewDashboardPage />} />

            <Route path={ROUTES.ORGANIZATIONS} element={<OrganizationsPage />} />
            <Route path={ROUTES.ORGANIZATION_NEW} element={<OrganizationFormPage key="new" />} />
            <Route path={ROUTES.ORGANIZATION_VIEW} element={<OrganizationFormPage />} />
            <Route path={ROUTES.SAAS_PLANS} element={<SaasPlansPage />} />
            <Route path={ROUTES.ADMIN_USERS} element={<AdminUsersPage />} />
            <Route path={ROUTES.ADMIN_USER_NEW} element={<UserCreatePage key="admin" variant="admin" />} />

            <Route path={ROUTES.USERS} element={<UsersPage />} />
            <Route path={ROUTES.USER_NEW} element={<UserCreatePage key="user" variant="user" />} />
            <Route path={ROUTES.ROLES} element={<RolesPermissionsPage />} />
            <Route path={ROUTES.PASSWORD_RESET} element={<PasswordResetPage />} />
            <Route path={ROUTES.USER_ACTIVATION} element={<UserActivationPage />} />

            <Route path={ROUTES.SERVICE_MODELS} element={<ServiceModelsPage />} />
            <Route path={ROUTES.SERVICE_MODEL_NEW} element={<ServiceModelFormPage key="new" />} />
            <Route path={ROUTES.SERVICE_MODEL_VIEW} element={<ServiceModelFormPage />} />
            <Route path={ROUTES.WORKFLOW} element={<WorkflowConfigPage />} />

            <Route path={ROUTES.CLAIM_REPORT} element={<ClaimReportPage />} />
            <Route path={ROUTES.USER_REPORT} element={<UserReportPage />} />
            <Route path={ROUTES.SAAS_USAGE} element={<SaasUsageReportPage />} />
            <Route path={ROUTES.DATA_DOWNLOAD} element={<DataDownloadPage />} />

            <Route path={ROUTES.AUDIT_LOGS} element={<AuditLogsPage />} />
            <Route path={ROUTES.SYSTEM_SETTINGS} element={<SystemSettingsPage />} />

            {LEGACY_REDIRECTS.map(([from, to]) => <Route key={from} path={from} element={<Navigate to={to} replace />} />)}
        </Route>

        <Route path="/" element={<Navigate to={ROUTES.HOME} replace />} />
        <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
);

export default AppRoutes;
