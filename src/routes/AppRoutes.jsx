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

import InsurerListPage from '../pages/insurer/InsurerListPage';
import InsurerNewIdCreationPage from '../pages/insurer/InsurerNewIdCreationPage';

import InternalUserPage from '../pages/placeholders/InternalUserPage';
import BrokerPage from '../pages/placeholders/BrokerPage';
import SurveyorPage from '../pages/placeholders/SurveyorPage';
import WorkshopPage from '../pages/placeholders/WorkshopPage';
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

            <Route path={ROUTES.INSURER} element={<InsurerListPage />} />
            <Route path={ROUTES.INSURER_NEW} element={<InsurerNewIdCreationPage />} />

            <Route path={ROUTES.INTERNAL_USER} element={<InternalUserPage />} />
            <Route path={ROUTES.BROKER} element={<BrokerPage />} />
            <Route path={ROUTES.SURVEYOR} element={<SurveyorPage />} />
            <Route path={ROUTES.WORKSHOP} element={<WorkshopPage />} />
            <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
            <Route path={ROUTES.SUPPORT} element={<SupportPage />} />
        </Route>

        <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
);

export default AppRoutes;
