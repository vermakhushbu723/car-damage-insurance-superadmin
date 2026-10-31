import React from 'react';
import PageTitle from '../../components/ui/PageTitle';
import ModeToggle from '../../components/ui/ModeToggle';
import { EDITION_MODE } from '../../auth/session';
import { useCollection } from '../../store/DataStore';
import ServiceProviderDashboard from './ServiceProviderDashboard';

/**
 * Dashboard of the Service Provider super admin console. The data store
 * only holds Service Provider organizations, users and claims, so the page
 * passes them straight to the Figma "SUPER ADMIN DASHBOARD SCREEN" layout.
 */
const OverviewDashboardPage = () => {
    const { items: orgs } = useCollection('organizations');
    const { items: users } = useCollection('users');
    const { items: claims } = useCollection('claims');

    return (
        <ServiceProviderDashboard
            orgs={orgs}
            users={users}
            claims={claims}
            title={<PageTitle title="Super Admin Dashboard" extra={<ModeToggle value={EDITION_MODE} />} />}
        />
    );
};

export default OverviewDashboardPage;
