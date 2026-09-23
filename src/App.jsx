import React, { useEffect } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { ALL_NAV_ITEMS } from './constants/navigation';
import { ROUTES } from './constants/routes';

const APP_NAME = 'IBima Assist Super Admin';

// Pages that aren't sidebar items (or need a more specific name than their parent item).
const EXTRA_TITLES = [
    [ROUTES.LOGIN, 'Login'],
    [ROUTES.OVERVIEW, 'Dashboard'],
    [ROUTES.ORGANIZATION_NEW, 'Add Organization'],
    [ROUTES.USER_NEW, 'Add User'],
    [ROUTES.ADMIN_USER_NEW, 'Add Admin User'],
    [ROUTES.SERVICE_MODEL_NEW, 'Add Service Model'],
];

// Clean tab names (the sidebar keeps the design's own spelling).
const TITLE_FIXES = {
    'Organzitions/Vendors': 'Organizations/Vendors',
    'SaaS  Usage Report': 'SaaS Usage Report',
    'System Setings': 'System Settings',
};

function pageTitle(pathname) {
    const exact = EXTRA_TITLES.find(([path]) => path === pathname);
    if (exact) return exact[1];
    const item = ALL_NAV_ITEMS.find((i) => pathname === i.path || pathname.startsWith(`${i.path}/`));
    return item ? TITLE_FIXES[item.label] ?? item.label : null;
}

/** Keeps the browser tab title in sync with the current page, e.g. "Users | IBima Assist Super Admin". */
const DocumentTitle = () => {
    const { pathname } = useLocation();
    useEffect(() => {
        const name = pageTitle(pathname);
        document.title = name ? `${name} | ${APP_NAME}` : APP_NAME;
    }, [pathname]);
    return null;
};

const App = () => (
    <BrowserRouter>
        <DocumentTitle />
        <AppRoutes />
    </BrowserRouter>
);

export default App;
