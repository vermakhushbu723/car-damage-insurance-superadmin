// Sample data for the modules that do NOT have a backend yet (claims,
// service models, downloads, integrations, system settings). Organizations,
// users, admin users, plans, roles and audit logs come from the database
// via superadmin-service -- see store/DataStore.jsx. The enum lists below
// (types, statuses, roles, branches) feed dropdowns everywhere.

// Deterministic pseudo-random so the seed looks varied but is stable.
let seed = 42;
const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
};
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const between = (min, max) => Math.floor(min + rand() * (max - min + 1));

// Build an ISO timestamp `daysAgo` days before the "today" the mockups use.
const TODAY = new Date('2026-09-23T10:30:00');
const isoDaysAgo = (daysAgo, hour = between(8, 19), minute = between(0, 59)) => {
    const d = new Date(TODAY);
    d.setDate(d.getDate() - daysAgo);
    d.setHours(hour, minute, 0, 0);
    return d.toISOString();
};

// ---------------------------------------------------------------------
// Organizations / Vendors
// ---------------------------------------------------------------------
export const ORG_TYPES = ['Insurer', 'Broker', 'Surveyor', 'Workshop'];
export const ORG_STATUSES = ['Active', 'Pending', 'Suspended', 'Expired'];
export const SERVICE_MODES = ['SaaS', 'Service Provider'];

// ---------------------------------------------------------------------
// Users (field users across organizations) + Admin users
// ---------------------------------------------------------------------
const FIRST = ['Neha', 'Rohit', 'Raj', 'Manish', 'Priya', 'Amit', 'Sneha', 'Vikram', 'Anjali', 'Karan', 'Pooja', 'Arjun', 'Kavita', 'Suresh', 'Divya', 'Rahul', 'Meera', 'Sanjay', 'Isha', 'Deepak'];
const LAST = ['Verma', 'Sharma', 'Kumar', 'Singh', 'Patel', 'Iyer', 'Reddy', 'Joshi', 'Gupta', 'Nair', 'Mehta', 'Das'];
export const USER_ROLES = ['Manager', 'Surveyor', 'Admin', 'Claim Handler', 'Call Center', 'TCT', 'Sr TCT', 'National Manager'];
export const USER_STATUSES = ['Active', 'Pending', 'Inactive', 'Suspended'];
export const BRANCHES = ['Mumbai HQ', 'Delhi Branch', 'Banglore', 'Pune Branch', 'Kolkata Branch', 'Chennai Branch', 'Hyderabad Branch'];

export const ADMIN_ROLES = ['Super Admin', 'Organisation admin', 'Support admin', 'Reporting admin'];
// ---------------------------------------------------------------------
// Service models
// ---------------------------------------------------------------------
export const SERVICE_TYPES = ['Claims', 'Policy', 'Survey', 'Customer Service'];
export const APPLICABLE_FOR = ['Motor', 'Health', 'All', 'Motor, Health'];
export const SEED_SERVICE_MODELS = [
    ['Motor Claims', 'Claims', 'Motor', 'Active', 48],
    ['Health Claims', 'Claims', 'Health', 'Pending', 24],
    ['Policy Renewal', 'Policy', 'All', 'Suspended', 12],
    ['Survey and Inspection', 'Survey', 'Motor', 'Active', 72],
    ['Customer support', 'Customer Service', 'All', 'Pending', 24],
    ['Claim Settlement', 'Claims', 'Motor, Health', 'Suspended', 48],
    ['Endorsement', 'Policy', 'All', 'Active', 24],
    ['Motor Claims - Commercial', 'Claims', 'Motor', 'Pending', 48],
    ['Fire Claims', 'Claims', 'All', 'Active', 72],
    ['Marine Survey', 'Survey', 'All', 'Active', 96],
    ['Pre-Inspection', 'Survey', 'Motor', 'Active', 24],
    ['Grievance Desk', 'Customer Service', 'All', 'Active', 48],
].map(([name, serviceType, applicableFor, status, sla], i) => ({
    id: `SM-${101 + i}`,
    name,
    serviceType,
    applicableFor,
    status,
    sla,
    workingHours: '09:00 AM - 06:00 PM',
    escalationAfter: '24 Hours',
    escalationTo: 'Senior Claims Manager',
    priority: pick(['High', 'Medium', 'Low']),
    description: '',
    lastUploaded: i < 4 ? isoDaysAgo(between(1, 20)) : isoDaysAgo(between(60, 400)),
}));

// ---------------------------------------------------------------------
// Claims (Claim Report / User Report tables)
// ---------------------------------------------------------------------
export const CLAIM_STAGES = ['AI ILA', 'Survey', 'ILA', 'FLA', 'Settled', 'Rejected'];
export const REGIONS = ['North', 'East', 'West', 'South', 'Central'];
export const CLAIM_TYPES = ['Motor Vehicle', 'Two Wheeler', 'Commercial Vehicle'];
export const HANDLERS = ['Rajive', 'Suresh', 'Kavita', 'Arjun', 'Meera'];
export const PRODUCT_TYPES = ['Pvt Car', 'Commercial Vehicle', 'Two Wheelers'];
const REGION_STATES = {
    North: ['Delhi', 'Punjab', 'Haryana', 'Uttar Pradesh', 'Rajasthan'],
    East: ['West Bengal', 'Odisha', 'Bihar', 'Assam', 'Jharkhand'],
    West: ['Maharashtra', 'Gujarat', 'Goa'],
    South: ['Karnataka', 'Tamil Nadu', 'Kerala', 'Telangana', 'Andhra Pradesh'],
    Central: ['Madhya Pradesh', 'Chhattisgarh'],
};
const PRODUCT_BY_CLAIM_TYPE = { 'Motor Vehicle': 'Pvt Car', 'Two Wheeler': 'Two Wheelers', 'Commercial Vehicle': 'Commercial Vehicle' };
export const CLAIM_STATES = [...new Set(Object.values(REGION_STATES).flat())].sort();

/** Fills a claim's `state` (inside its region) and `productType` (from its claim type) when missing. */
export const withClaimLocation = (c, i) => ({
    ...c,
    state: c.state ?? REGION_STATES[c.region]?.[i % REGION_STATES[c.region].length] ?? 'Maharashtra',
    productType: c.productType ?? PRODUCT_BY_CLAIM_TYPE[c.claimType] ?? 'Pvt Car',
});

// Claims are sample data until the claims backend is connected to this console.
const CLAIM_ORGANIZATIONS = ['ABC General Insurance Ltd', 'XYZ Insurance Company', 'Global Insurance', 'Bharat Shield Insurance', 'National Motor Assurance'];

export const SEED_CLAIMS = Array.from({ length: 42 }, (_, i) => ({
    id: `CLM-${25648 + i}`,
    customer: i < 5 ? 'Rohit Sharma' : `${pick(FIRST)} ${pick(LAST)}`,
    claimType: i < 5 ? 'Motor Vehicle' : pick(CLAIM_TYPES),
    handler: i < 5 ? 'Rajive' : pick(HANDLERS),
    amount: i < 5 ? 85000 : between(8, 250) * 1000,
    slaDays: i < 5 ? 2 : between(1, 7),
    status: ['AI ILA', 'Survey', 'ILA', 'AI ILA', 'Survey'][i] ?? pick(CLAIM_STAGES),
    intimationDate: isoDaysAgo(between(0, 25)),
    branch: pick(BRANCHES),
    region: pick(REGIONS),
    organization: pick(CLAIM_ORGANIZATIONS),
})).map(withClaimLocation);

// ---------------------------------------------------------------------
// Audit logs
// ---------------------------------------------------------------------
export const AUDIT_ACTIONS = ['Updated', 'Created', 'Downloaded', 'Login', 'Logout', 'Verified', 'Exported', 'Deleted'];
export const AUDIT_MODULES = ['Claims', 'Users', 'Reports', 'System', 'Data', 'Organizations', 'Settings'];
// ---------------------------------------------------------------------
// Data downloads
// ---------------------------------------------------------------------
export const DATA_TYPES = ['Claims', 'Users', 'Survey', 'Payments', 'Audit Logs'];
export const SEED_DOWNLOADS = [
    ['Claims_Sep_01_to_04.csv', 'Claims', 'Ready'],
    ['Users_Aug_2026.xlsx', 'Users', 'Ready'],
    ['Audit_Log_Aug_2026.zip', 'Audit Logs', 'Expired'],
    ['Claims_Sep_01_to_04.csv', 'Claims', 'Ready'],
    ['Users_Aug_2026.xlsx', 'Users', 'Ready'],
    ['Data Audit_Log_Aug_2026.zip', 'Audit Logs', 'Expired'],
    ['Payments_Aug_2026.csv', 'Payments', 'Ready'],
    ['Survey_Jul_2026.xlsx', 'Survey', 'Expired'],
    ['Claims_Jul_2026.csv', 'Claims', 'Expired'],
    ['Users_Jul_2026.xlsx', 'Users', 'Expired'],
].map(([fileName, dataType, status], i) => ({
    id: `DL-${301 + i}`,
    fileName,
    dataType,
    generatedBy: 'Manish Singh',
    generatedOn: isoDaysAgo(19 + i * 3, 10, 30),
    size: '4.2 MB',
    status,
}));

// ---------------------------------------------------------------------
// System settings
// ---------------------------------------------------------------------
export const SEED_INTEGRATIONS = [
    { id: 'policy-los', name: 'Policy/LOS API', description: 'Policy - Customer & Claim Data', detail: 'RESET API - Production', type: 'Reset API', environment: 'Production', endpoint: 'https://api.insurer.example/policy', status: 'Connected', lastSync: isoDaysAgo(3, 10, 12) },
    { id: 'vehicle-rc', name: 'Vehicle/RC Verification', description: 'Vehicle & Registration Verification', detail: 'Last sync Today 10:45 AM', type: 'API', environment: 'Production', endpoint: 'https://api.vahan.example/rc', status: 'Connected', lastSync: isoDaysAgo(3, 10, 12) },
    { id: 'comm-gateway', name: 'Communication Gateway', description: 'SMS/Email/Whatsapp', detail: 'Response Time 2.4 sec', type: 'Gateway', environment: 'Production', endpoint: 'https://gateway.example/send', status: 'Warning', lastSync: isoDaysAgo(3, 10, 12) },
];

export const SEED_SYSTEM = {
    currentVersion: 'v2.4.1',
    latestVersion: 'v2.4.2',
    latestReleaseDate: '19 september 2026',
    environment: 'Production Environment',
    maintenanceApproval: false,
    autoSecurityPatches: false,
    maintenanceMode: false,
    deployments: [
        { version: 'v2.4.1', date: isoDaysAgo(5, 2, 15), by: 'System', status: 'Success' },
        { version: 'v2.4.0', date: isoDaysAgo(40, 1, 30), by: 'Super Admin', status: 'Success' },
        { version: 'v2.3.5', date: isoDaysAgo(92, 3, 5), by: 'Super Admin', status: 'Success' },
    ],
    auditLogin: false,
    retention: '7 Years',
    inputActivityLogging: false,
    configChangeApproval: false,
    complianceLog: [
        { id: 'c1', date: isoDaysAgo(3, 10, 24), user: 'Super Admin', activity: 'Updated API Configuration', module: 'API Integration', status: 'Success' },
        { id: 'c2', date: isoDaysAgo(3, 10, 24), user: 'System', activity: 'Security Patch', module: 'System Update', status: 'Success' },
        { id: 'c3', date: isoDaysAgo(3, 10, 24), user: 'Super Admin', activity: 'Change Retention policy', module: 'Compilance', status: 'Approval Log' },
    ],
};

export { isoDaysAgo, TODAY };
