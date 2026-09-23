// Seed data for the UI-only build (no backend yet). The store (see
// store/DataStore.jsx) copies these into localStorage on first load, and
// every page reads/writes through the store -- so adding an organization,
// activating a user, generating a download etc. all show up across pages.
// Swap the store's load/save for API calls once a backend exists.

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
const isoDaysAhead = (days) => isoDaysAgo(-days, 23, 59);

// ---------------------------------------------------------------------
// Plans
// ---------------------------------------------------------------------
export const SEED_PLANS = [
    { id: 'starter', name: 'Starter', price: 999, userLimit: 'Up To 10 Users', features: ['Claim Management', 'Basic Reports', 'Email Support'] },
    { id: 'professional', name: 'Professional', price: 2499, userLimit: 'Up To 50 Users', features: ['Claim Management', 'Basic Reports', 'Email Support & Chat Support', 'API Access'] },
    { id: 'enterprise', name: 'Enterprise', price: 4999, userLimit: 'Unlimited Users', features: ['All Professional Features', 'Priority Support', 'API Access', 'Custom Integrations'] },
    { id: 'custom', name: 'Custom', price: null, priceLabel: 'Custom Pricing', userLimit: 'Tailored For Your Business', features: ['All Features', 'Dedicated Support', 'Custom Integrations'] },
];

// ---------------------------------------------------------------------
// Organizations / Vendors
// ---------------------------------------------------------------------
export const ORG_TYPES = ['Insurer', 'Broker', 'Surveyor', 'Workshop'];
export const ORG_STATUSES = ['Active', 'Pending', 'Suspended', 'Expired'];
export const SERVICE_MODES = ['SaaS', 'Service Provider'];

const ORG_NAMES = [
    ['ABC General Insurance Ltd', 'Insurer'],
    ['XYZ Insurance Company', 'Insurer'],
    ['RighWay Brokers Pvt.Ltd', 'Broker'],
    ['Omkar Group', 'Broker'],
    ['Secure Drive Surveyors', 'Surveyor'],
    ['ABG Insurance', 'Insurer'],
    ['Global Insurance', 'Insurer'],
    ['XYZ Surveyors', 'Surveyor'],
    ['Tayl Assistants', 'Broker'],
    ['National Motor Assurance', 'Insurer'],
    ['Bharat Shield Insurance', 'Insurer'],
    ['Sahyog Insurance Brokers', 'Broker'],
    ['Precise Loss Assessors', 'Surveyor'],
    ['Apex Auto Works', 'Workshop'],
    ['Metro Car Care', 'Workshop'],
    ['Suraksha General Insurance', 'Insurer'],
    ['Kavach Brokers LLP', 'Broker'],
    ['TrueView Surveyors', 'Surveyor'],
    ['Speedline Motors Workshop', 'Workshop'],
    ['Pinnacle Insurance Co', 'Insurer'],
    ['Unity Risk Brokers', 'Broker'],
    ['Eagle Eye Assessors', 'Surveyor'],
    ['City Auto Garage', 'Workshop'],
    ['Liberty Motor Insurance', 'Insurer'],
    ['Assure Broking Services', 'Broker'],
    ['Accurate Survey Associates', 'Surveyor'],
    ['Prime Body Shop', 'Workshop'],
    ['Heritage General Insurance', 'Insurer'],
    ['Shubh Labh Brokers', 'Broker'],
    ['Clearview Loss Surveyors', 'Surveyor'],
    ['Royal Auto Service', 'Workshop'],
    ['Vishwas Insurance Ltd', 'Insurer'],
];

export const SEED_ORGANIZATIONS = ORG_NAMES.map(([name, type], i) => {
    // First few rows mirror the reference table (Active, Active, Pending, Active, Suspended).
    const status = ['Active', 'Active', 'Pending', 'Active', 'Suspended'][i] ?? pick(['Active', 'Active', 'Active', 'Pending', 'Suspended', 'Expired']);
    const serviceModel = pick(['SaaS', 'SaaS', 'Service Provider']);
    const expiresIn = status === 'Expired' ? -between(2, 40) : between(5, 300);
    return {
        id: `ORG-${1001 + i}`,
        name,
        type,
        users: between(6, 60),
        status,
        plan: i < 5 ? 'professional' : pick(['starter', 'professional', 'enterprise', 'enterprise', 'custom']),
        serviceModel,
        createdOn: isoDaysAgo(between(20, 500)),
        subscriptionExpiry: isoDaysAhead(expiresIn),
        claims: [12450, 9850, 8230, 6740, 5120][i] ?? between(400, 5000),
        form: {},
    };
});

// ---------------------------------------------------------------------
// Users (field users across organizations) + Admin users
// ---------------------------------------------------------------------
const FIRST = ['Neha', 'Rohit', 'Raj', 'Manish', 'Priya', 'Amit', 'Sneha', 'Vikram', 'Anjali', 'Karan', 'Pooja', 'Arjun', 'Kavita', 'Suresh', 'Divya', 'Rahul', 'Meera', 'Sanjay', 'Isha', 'Deepak'];
const LAST = ['Verma', 'Sharma', 'Kumar', 'Singh', 'Patel', 'Iyer', 'Reddy', 'Joshi', 'Gupta', 'Nair', 'Mehta', 'Das'];
export const USER_ROLES = ['Manager', 'Surveyor', 'Admin', 'Claim Handler', 'Call Center', 'TCT', 'Sr TCT', 'National Manager'];
export const USER_STATUSES = ['Active', 'Pending', 'Inactive', 'Suspended'];
export const BRANCHES = ['Mumbai HQ', 'Delhi Branch', 'Banglore', 'Pune Branch', 'Kolkata Branch', 'Chennai Branch', 'Hyderabad Branch'];

const makePerson = (i) => {
    const first = i === 0 ? 'Neha' : pick(FIRST);
    const last = i === 0 ? 'Verma' : pick(LAST);
    return { name: `${first} ${last}`, email: `${first}.${last}${i ? i : ''}@companyname.com`.toLowerCase() };
};

export const SEED_USERS = Array.from({ length: 46 }, (_, i) => {
    const p = makePerson(i);
    const org = SEED_ORGANIZATIONS[i % 12];
    return {
        id: `USR-${1001 + i}`,
        userId: `USR-${1001 + i}`,
        name: p.name,
        email: p.email,
        phone: `+91 98${between(10000000, 99999999)}`,
        organization: org.name,
        role: pick(USER_ROLES),
        status: ['Active', 'Pending', 'Suspended', 'Active', 'Pending', 'Suspended', 'Active', 'Pending'][i] ?? pick(['Active', 'Active', 'Active', 'Pending', 'Inactive', 'Suspended']),
        branch: pick(BRANCHES),
        lastLogin: isoDaysAgo(between(0, 30)),
        createdOn: isoDaysAgo(between(30, 400)),
        platform: pick(['Mobile', 'Web', 'Both']),
    };
});

export const ADMIN_ROLES = ['Super Admin', 'Organisation admin', 'Support admin', 'Reporting admin'];
export const SEED_ADMIN_USERS = Array.from({ length: 21 }, (_, i) => {
    const p = makePerson(i + 3);
    return {
        id: `ADM-${101 + i}`,
        name: i < 9 ? 'Neha Verma' : p.name,
        email: i < 9 ? 'Neha.verma@companyname.com' : p.email,
        role: ['Super Admin', 'Organisation admin', 'Support admin', 'Reporting admin', 'Support admin', 'Super Admin', 'Organisation admin', 'Support admin', 'Reporting admin'][i] ?? pick(ADMIN_ROLES),
        status: ['Active', 'Pending', 'Suspended', 'Active', 'Pending', 'Suspended', 'Active', 'Pending', 'Suspended'][i] ?? pick(['Active', 'Active', 'Pending', 'Suspended']),
        lastLogin: isoDaysAgo(between(0, 45)),
        mfa: rand() > 0.3,
        phone: `+91 99${between(10000000, 99999999)}`,
    };
});

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
    organization: pick(SEED_ORGANIZATIONS.slice(0, 10)).name,
}));

// ---------------------------------------------------------------------
// Audit logs
// ---------------------------------------------------------------------
export const AUDIT_ACTIONS = ['Updated', 'Created', 'Downloaded', 'Login', 'Exported', 'Deleted'];
export const AUDIT_MODULES = ['Claims', 'Users', 'Reports', 'System', 'Data', 'Organizations', 'Settings'];
export const SEED_AUDIT_LOGS = Array.from({ length: 48 }, (_, i) => ({
    id: `LOG-${5001 + i}`,
    timestamp: isoDaysAgo(Math.floor(i / 3), 10, 42 - (i % 3)),
    user: i < 6 ? 'Raj Kumar' : pick(['Raj Kumar', 'Neha Verma', 'Manish Singh', 'Super Admin']),
    role: pick(['Super Admin', 'Organisation admin', 'Support admin', 'Reporting admin']),
    action: ['Updated', 'Created', 'Downloaded', 'Login', 'Exported', 'Updated'][i] ?? pick(AUDIT_ACTIONS),
    ip: i < 6 ? '192.168.1.45' : `192.168.${between(0, 3)}.${between(2, 220)}`,
    device: pick(['Chrome / Windows', 'Chrome / Windows', 'Safari / macOS', 'Edge / Windows', 'Chrome / Android']),
    module: ['Claims', 'Users', 'Reports', 'System', 'Data', 'Claims'][i] ?? pick(AUDIT_MODULES),
    status: rand() > 0.9 ? 'Failed' : 'Success',
}));

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
