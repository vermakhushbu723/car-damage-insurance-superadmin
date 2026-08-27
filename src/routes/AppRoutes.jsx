import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import RequireAuth from '../auth/RequireAuth';
import AppLayout from '../components/layout/AppLayout';

import LoginPage from '../pages/auth/LoginPage';
import HomeDashboardPage from '../pages/home/HomeDashboardPage';

import ClaimSaasDashboardPage from '../pages/dashboards/ClaimSaasDashboardPage';
import ClaimServiceProviderDashboardPage from '../pages/dashboards/ClaimServiceProviderDashboardPage';
import PreinspectionSaasDashboardPage from '../pages/dashboards/PreinspectionSaasDashboardPage';
import PreinspectionServiceProviderDashboardPage from '../pages/dashboards/PreinspectionServiceProviderDashboardPage';

import InsurerNewIdCreationPage from '../pages/insurer/InsurerNewIdCreationPage';
import InternalUserCreationPage from '../pages/internalUser/InternalUserCreationPage';
import BrokerCreationPage from '../pages/broker/BrokerCreationPage';
import SurveyorCreationPage from '../pages/surveyor/SurveyorCreationPage';
import WorkshopCreationPage from '../pages/workshop/WorkshopCreationPage';

import SettingsPage from '../pages/placeholders/SettingsPage';
import SupportPage from '../pages/placeholders/SupportPage';

const AppRoutes = () => (
    <Routes>
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />

        <Route
            element={(
                <RequireAuth>
                    <AppLayout />
                </RequireAuth>
            )}
        >
            <Route path={ROUTES.HOME} element={<HomeDashboardPage />} />

            <Route path={ROUTES.CLAIM_SAAS} element={<ClaimSaasDashboardPage />} />
            <Route path={ROUTES.CLAIM_SERVICE_PROVIDER} element={<ClaimServiceProviderDashboardPage />} />
            <Route path={ROUTES.PREINSPECTION_SAAS} element={<PreinspectionSaasDashboardPage />} />
            <Route path={ROUTES.PREINSPECTION_SERVICE_PROVIDER} element={<PreinspectionServiceProviderDashboardPage />} />

            {/* Every one of these sidebar items opens its reference-screenshot
                form directly -- no invented list page in between (see
                no-invented-screens-from-mockups memory). */}
            <Route path={ROUTES.INSURER} element={<InsurerNewIdCreationPage />} />
            <Route path={ROUTES.INSURER_NEW} element={<Navigate to={ROUTES.INSURER} replace />} />

            <Route path={ROUTES.INTERNAL_USER} element={<InternalUserCreationPage />} />
            <Route path={ROUTES.INTERNAL_USER_NEW} element={<Navigate to={ROUTES.INTERNAL_USER} replace />} />

            <Route path={ROUTES.BROKER} element={<BrokerCreationPage />} />
            <Route path={ROUTES.SURVEYOR} element={<SurveyorCreationPage />} />
            <Route path={ROUTES.WORKSHOP} element={<WorkshopCreationPage />} />
            <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
            <Route path={ROUTES.SUPPORT} element={<SupportPage />} />
        </Route>

        <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
);

export default AppRoutes;
