import React from 'react';
import { Navigate } from 'react-router-dom';
import { getSuperAdminSession } from './session';
import { ROUTES } from '../constants/routes';

/** Route guard for every authenticated page -- redirects to /login if there's no session. */
const RequireAuth = ({ children }) => {
    const session = getSuperAdminSession();
    if (!session) return <Navigate to={ROUTES.LOGIN} replace />;
    return children;
};

export default RequireAuth;
