// UI-only mock data -- this app has no backend yet, so every dashboard's
// numbers/table rows come from here. Swap for real API data later without
// touching the page components (they only consume the shapes below).

export const CLAIMS_TABLE_ROWS = [
    { id: 'CL-9082', claimId: '#CL-9082', customerName: 'Rahul Sharma', insurerName: 'Comprehensive', state: 'Maharashtra', religion: 'Comprehensive', amount: 4250, status: 'Approved', date: 'Oct 24th 2023' },
    { id: 'CL-9083', claimId: '#CL-9083', customerName: 'Priya Patel', insurerName: 'Comprehensive', state: 'Maharashtra', religion: 'Comprehensive', amount: 4250, status: 'Pending', date: 'Oct 24th 2023' },
    { id: 'CL-9084', claimId: '#CL-9084', customerName: 'Amit Kumar', insurerName: 'Comprehensive', state: 'Delhi', religion: 'Comprehensive', amount: 4250, status: 'Approved', date: 'Oct 24th 2023' },
    { id: 'CL-9085', claimId: '#CL-9085', customerName: 'Sneha Reddy', insurerName: 'Comprehensive', state: 'Karnataka', religion: 'Comprehensive', amount: 4250, status: 'Rejected', date: 'Oct 24th 2023' },
    { id: 'CL-9086', claimId: '#CL-9086', customerName: 'Vikram Iyer', insurerName: 'Comprehensive', state: 'Tamil Nadu', religion: 'Comprehensive', amount: 4250, status: 'Approved', date: 'Oct 24th 2023' },
    { id: 'CL-9087', claimId: '#CL-9087', customerName: 'Neha Joshi', insurerName: 'Comprehensive', state: 'Gujarat', religion: 'Comprehensive', amount: 4250, status: 'Approved', date: 'Oct 24th 2023' },
];

// Claims-centric dashboard (Claim > As SaaS)
export const CLAIM_SAAS_STATS = [
    { key: 'total', label: 'Total Claims', value: '1,248', trend: '+12% From Last Month', trendType: 'up' },
    { key: 'approved', label: 'Approved Claims', value: '856', badge: '68.5% Approval Rate' },
    { key: 'pending', label: 'Pending Claims', value: '192', badge: 'Average 2.4 Days Delay', badgeType: 'danger' },
];

export const CLAIM_SAAS_STATUS_BREAKDOWN = [
    { key: 'approved', label: 'Approved', percent: 68, count: 856, color: 'chartNavy' },
    { key: 'rejected', label: 'Rejected', percent: 22, count: 276, color: 'chartPink' },
    { key: 'pending', label: 'Pending', percent: 10, count: 116, color: 'warning' },
];

export const CLAIM_SAAS_DISTRIBUTION = {
    total: '1.2k',
    title: 'Insurer wise distrubation Data',
    segments: [
        { key: 'collision', label: 'Collision (52%)', value: 624, color: 'chartNavy' },
        { key: 'theft', label: 'Theft (28%)', value: 336, color: 'chartBlue' },
        { key: 'natural', label: 'Natural Dis. (20%)', value: 240, color: 'chartPink' },
    ],
};

// Partner-centric dashboard (Claim > Service Provider, Preinspection > both)
export function partnerStats({ othersCount = 18 } = {}) {
    return [
        { key: 'insurer', label: 'Total Insurer', value: '15', trend: '+12% From Last Month', trendType: 'up' },
        { key: 'broker', label: 'Total Broker', value: '50', badge: '68.5% Approval Rate' },
        { key: 'others', label: 'Others', value: String(othersCount), badge: 'Average 2.4 Days Delay', badgeType: 'danger' },
    ];
}

export function partnerStatusBreakdown({ includePending = true } = {}) {
    const base = [
        { key: 'active', label: 'Active', percent: 68, count: 856, color: 'chartNavy' },
        { key: 'inactive', label: 'Inactive', percent: 22, count: 276, color: 'chartPink' },
    ];
    if (includePending) base.push({ key: 'pending', label: 'Pending', percent: 10, count: 116, color: 'warning' });
    return base;
}

export const PARTNER_DISTRIBUTION = {
    total: '1.2k',
    title: 'Total distrubation Data',
    segments: [
        { key: 'insurer', label: 'Total Insurer', value: 624, color: 'chartNavy' },
        { key: 'broker', label: 'Total Broker', value: 336, color: 'chartBlue' },
        { key: 'others', label: 'Others', value: 240, color: 'chartPink' },
    ],
};
