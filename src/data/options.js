// Fixed option lists for dropdowns and filters (no records here -- all data
// comes from the database via superadmin-service). They mirror the values
// the API accepts (superadmin-service/src/constants.js).

export const ORG_TYPES = ['Insurer', 'Broker', 'Surveyor', 'Workshop'];
export const ORG_STATUSES = ['Active', 'Pending', 'Suspended', 'Expired'];
export const SERVICE_MODES = ['SaaS', 'Service Provider'];

export const USER_ROLES = ['Manager', 'Surveyor', 'Admin', 'Claim Handler', 'Call Center', 'TCT', 'Sr TCT', 'National Manager'];
export const USER_STATUSES = ['Active', 'Pending', 'Inactive', 'Suspended'];
export const BRANCHES = ['Mumbai HQ', 'Delhi Branch', 'Banglore', 'Pune Branch', 'Kolkata Branch', 'Chennai Branch', 'Hyderabad Branch'];

export const SERVICE_TYPES = ['Claims', 'Policy', 'Survey', 'Customer Service'];
export const APPLICABLE_FOR = ['Motor', 'Health', 'All', 'Motor, Health'];

export const CLAIM_STAGES = ['Intimation', 'Survey', 'AI ILA', 'ILA', 'FLA', 'Settled', 'Rejected'];
export const REGIONS = ['North', 'East', 'West', 'South', 'Central'];
export const PRODUCT_TYPES = ['Pvt Car', 'Commercial Vehicle', 'Two Wheelers'];
const REGION_STATES = {
    North: ['Delhi', 'Punjab', 'Haryana', 'Uttar Pradesh', 'Rajasthan'],
    East: ['West Bengal', 'Odisha', 'Bihar', 'Assam', 'Jharkhand'],
    West: ['Maharashtra', 'Gujarat', 'Goa'],
    South: ['Karnataka', 'Tamil Nadu', 'Kerala', 'Telangana', 'Andhra Pradesh'],
    Central: ['Madhya Pradesh', 'Chhattisgarh'],
};
export const CLAIM_STATES = [...new Set(Object.values(REGION_STATES).flat())].sort();
// Handlers come from the claims themselves (Claim Report adds every handler it finds).
export const HANDLERS = [];

export const AUDIT_ACTIONS = ['Updated', 'Created', 'Downloaded', 'Login', 'Logout', 'Verified', 'Exported', 'Deleted'];
export const AUDIT_MODULES = ['Claims', 'Users', 'Reports', 'System', 'Data', 'Organizations', 'Settings'];
