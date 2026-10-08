import { useMemo } from 'react';
import dayjs from 'dayjs';
import { useCollection } from '../store/DataStore';
import { ROUTES } from '../constants/routes';

const MODE_LABEL = { saas: 'SaaS', serviceProvider: 'Service Provider' };

/**
 * System alerts computed from the database: subscriptions/contracts expiring
 * in 30 days, expired ones, users not active, IDs pending activation.
 * `mode` = 'saas' | 'serviceProvider' limits them to that mode's organizations;
 * null = every organization this admin can see.
 */
export default function useSystemAlerts(mode = null) {
    const { items: orgs } = useCollection('organizations');
    const { items: users } = useCollection('users');

    return useMemo(() => {
        const label = mode ? MODE_LABEL[mode] : '';
        const scoped = mode ? orgs.filter((o) => o.serviceModel === label) : orgs;
        const ids = new Set(scoped.map((o) => o.id));
        const now = dayjs();
        const isExpired = (o) => o.status === 'Expired' || (o.subscriptionExpiry && dayjs(o.subscriptionExpiry).isBefore(now));
        const expiring = scoped.filter((o) => !isExpired(o) && o.status !== 'Suspended' && o.subscriptionExpiry && dayjs(o.subscriptionExpiry).diff(now, 'day') <= 30).length;
        const expired = scoped.filter(isExpired).length;
        const pending = scoped.filter((o) => o.status === 'Pending').length;
        const inactiveUsers = users.filter((u) => ids.has(u.organizationId) && u.status !== 'Active').length;
        const term = mode === 'serviceProvider' ? 'Contract' : 'Subscription';
        const prefix = label ? `${label} ` : '';
        return [
            { id: 'expiring', icon: 'warning', count: expiring, text: `${expiring} ${prefix}${term}${expiring === 1 ? '' : 's'} Will Expire In 30 Days`, to: mode === 'serviceProvider' ? ROUTES.ORGANIZATIONS : ROUTES.SAAS_PLANS },
            { id: 'expired', icon: 'info', count: expired, text: `${expired} ${prefix}Organization${expired === 1 ? ' Has' : 's Have'} Expired ${term}`, to: ROUTES.ORGANIZATIONS },
            { id: 'inactive', icon: 'warning', count: inactiveUsers, text: `${inactiveUsers} User${inactiveUsers === 1 ? ' Is' : 's Are'} Not Active`, to: ROUTES.USER_ACTIVATION },
            { id: 'pending', icon: 'info', count: pending, text: `${pending} ${prefix}ID${pending === 1 ? ' Is' : 's Are'} Pending Activation`, to: ROUTES.ORGANIZATIONS },
        ];
    }, [orgs, users, mode]);
}
