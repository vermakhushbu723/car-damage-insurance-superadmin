// Chart/aggregate data for the dashboard + report screens. These are
// time-series and platform-wide totals a real backend would compute, so
// they're static here (tables/lists on the same pages are live store data).

export const TREND_AUG = [
    { label: 'Aug 26', value: 1000 },
    { label: '', value: 2300 },
    { label: 'Aug 27', value: 2250 },
    { label: '', value: 3000 },
    { label: 'Aug 28', value: 3300 },
    { label: '', value: 3900 },
    { label: 'Aug 29', value: 4150 },
    { label: 'Aug 30', value: 4050 },
    { label: 'Aug 31', value: 3600 },
];

export const DAU_MAU = [
    { label: 'Aug 26', dau: 1000, mau: 1400 },
    { label: '', dau: 2300, mau: 2700 },
    { label: 'Aug 27', dau: 2250, mau: 2900 },
    { label: '', dau: 3000, mau: 3400 },
    { label: 'Aug 28', dau: 3300, mau: 3800 },
    { label: '', dau: 3900, mau: 4300 },
    { label: 'Aug 29', dau: 4150, mau: 4500 },
    { label: 'Aug 30', dau: 4050, mau: 4600 },
    { label: 'Aug 31', dau: 3600, mau: 4700 },
];

// Claims Trend (MTD) on the overview dashboard, keyed by the card's period select.
export const CLAIMS_TREND = {
    'This Month': [
        { label: '01 May', value: 1200 }, { label: '02 May', value: 4400 }, { label: '', value: 3700 },
        { label: '03 May', value: 5400 }, { label: '04 May', value: 5000 }, { label: '06 May', value: 4600 },
        { label: '07 May', value: 6900 }, { label: '08 May', value: 6000 }, { label: '09 May', value: 7400 }, { label: '', value: 7900 },
    ],
    'Last Month': [
        { label: '01 Apr', value: 900 }, { label: '05 Apr', value: 2600 }, { label: '09 Apr', value: 3100 },
        { label: '13 Apr', value: 4200 }, { label: '17 Apr', value: 3900 }, { label: '21 Apr', value: 5200 },
        { label: '25 Apr', value: 5800 }, { label: '30 Apr', value: 6300 },
    ],
    'This Year': [
        { label: 'Jan', value: 2100 }, { label: 'Feb', value: 3300 }, { label: 'Mar', value: 4100 },
        { label: 'Apr', value: 6300 }, { label: 'May', value: 7900 }, { label: 'Jun', value: 7200 },
        { label: 'Jul', value: 7600 }, { label: 'Aug', value: 7950 },
    ],
};
export const PERIOD_MULTIPLIER = { 'This Month': 1, 'Last Month': 0.86, 'This Year': 8.4 };

export const SETTLEMENT_BY_REGION = [
    { label: 'North', value: 3000 },
    { label: 'East', value: 2400 },
    { label: 'West', value: 4450 },
    { label: 'South', value: 3300 },
    { label: 'Central', value: 5000 },
];

export const CLAIM_REPORT_STATS = [
    { key: 'total', label: 'Total Claims', value: 12482, trend: '12%', tone: 'blue' },
    { key: 'new', label: 'New Claims', value: 2146, trend: '8%', tone: 'purple' },
    { key: 'survey', label: 'Pending Survey', value: 1842, trend: '10%', tone: 'orange' },
    { key: 'assessment', label: 'Under Assessment', value: 2984, trend: '15%', tone: 'teal' },
    { key: 'settlement', label: 'Settlement', value: 8942, trend: '10%', tone: 'green' },
    { key: 'rejected', label: 'Rejected', value: 568, trend: '9%', tone: 'red' },
];

export const ROLE_DISTRIBUTION = [
    { label: 'Intimation', value: 12, pct: '56%', color: '#2563EB' },
    { label: 'Survey', value: 30, pct: '44%', color: '#7C3AED' },
    { label: 'AI ILA', value: 20, pct: '66%', color: '#F59E0B' },
    { label: 'ILA', value: 25, pct: '03%', color: '#0E8AA8' },
    { label: 'FLA', value: 15, pct: '03%', color: '#4F46E5' },
    { label: 'Recommendation', value: 8, pct: '03%', color: '#0284C7' },
];

export const SAAS_USAGE_STATS = [
    { key: 'orgs', label: 'Active Organizations', value: '156', trend: '6.8%', tone: 'blue' },
    { key: 'users', label: 'Active Users', value: '3,248', trend: '10.2%', tone: 'purple' },
    { key: 'sessions', label: 'Sessons', value: '18,420', trend: '12.5%', tone: 'orange' },
    { key: 'api', label: 'API Usage', value: '84,652', trend: '9.4%', tone: 'teal' },
    { key: 'storage', label: 'Storage Used', value: '248 GB', trend: '14.2%', tone: 'green' },
    { key: 'adoption', label: 'Feature Adoption', value: '76.3%', trend: '8.6%', tone: 'red' },
];

export const MODULE_USAGE = [
    { module: 'Claims Management', users: 2642, sessions: 10420, usage: 92, trend: 'up' },
    { module: 'Survey Module', users: 2710, sessions: 12420, usage: 84, trend: 'up' },
    { module: 'AI ILA', users: 1842, sessions: 8920, usage: 77, trend: 'up' },
    { module: 'Reports', users: 1584, sessions: 7620, usage: 64, trend: 'flat' },
    { module: 'Audit Logs', users: 1129, sessions: 5520, usage: 48, trend: 'flat' },
    { module: 'Data Download', users: 842, sessions: 3420, usage: 30, trend: 'down' },
    { module: 'Workflow Configuration', users: 612, sessions: 2210, usage: 26, trend: 'flat' },
    { module: 'Password Reset', users: 398, sessions: 940, usage: 12, trend: 'down' },
];

export const CLAIMS_BY_REGION = [
    { label: 'Claims Management', value: 620 },
    { label: 'Survey Module', value: 540 },
    { label: 'AI ILA', value: 430 },
    { label: 'Reports', value: 380 },
    { label: 'Audit Logs', value: 260 },
    { label: 'Data Download', value: 200 },
];

// Users Active Heat Map: 6 weekdays x 12 two-hour slots, 0..1 intensity.
export const HEATMAP_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const HEATMAP = HEATMAP_DAYS.map((_, d) =>
    Array.from({ length: 12 }, (_, s) => {
        const workHours = s >= 4 && s <= 9 ? 0.55 : 0.12;
        const weekendDip = d === 5 ? 0.45 : 1;
        return Math.min(1, (workHours + ((d * 7 + s * 3) % 10) / 30) * weekendDip);
    }),
);

export const SYSTEM_ALERTS = [
    { id: 'a1', icon: 'warning', text: '2 SaaS Subscriptions Will Expire In 30 Days', target: 'saas-plans' },
    { id: 'a2', icon: 'info', text: '1 Organization Has Expired Subscripion', target: 'organizations' },
    { id: 'a3', icon: 'warning', text: '4 Users Have Inactive Status For More Then 30 Days', target: 'user-activation' },
    { id: 'a4', icon: 'info', text: 'Storage Usage Exceeded 80% For 3 Organizations', target: 'saas-usage' },
];
