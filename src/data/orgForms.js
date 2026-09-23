// Organizations/Vendors creation forms, one config per Organization Type.
// `steps` is the left step list exactly as drawn in each reference frame;
// `section` points a step at its section index (null = step shown in the
// design without a section on this frame yet).
// Field `optionsFrom: 'insurers'` is filled at runtime with the live list
// of Insurer organizations.

export const INDIAN_STATES = [
    'Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh',
    'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab', 'Rajasthan',
    'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];
const LINES_OF_BUSINESS = ['Motor', 'Health', 'Property Fire', 'Marine', 'Engineering', 'Misc'];

const INSURER = {
    type: 'Insurer',
    nameField: 'companyName',
    steps: [
        { label: 'Company Details', section: 0 },
        { label: 'Primary Admin ( National Manager)', section: 1 },
        { label: 'Branding', section: 2 },
        { label: 'Access Lifecycle', section: null },
        { label: 'Role Hierarchy', section: null },
        { label: 'Sub-user creation — all roles', section: null },
    ],
    sections: [
        {
            title: 'COMPANY DETAILS',
            profileButton: true,
            fields: [
                { name: 'entityType', label: 'Type', type: 'select', placeholder: 'Broker/Insurer/Surveyor/Others', options: ['Broker', 'Insurer', 'Surveyor', 'Others'] },
                { name: 'ibimaId', label: 'Unique IBima Asist ID', type: 'auto', placeholder: 'Auto Generated' },
                { name: 'companyName', label: 'Company Name', placeholder: 'Eg. MS_1234567890', required: true },
                { name: 'cin', label: 'CIN', placeholder: 'Enter CIN Number' },
                { name: 'irdaiLicense', label: 'IRDAI License', placeholder: 'Eg. MS_1234567890' },
                { name: 'insurerType', label: 'Insurer Type', type: 'select', placeholder: 'General/Health/Life', options: ['General', 'Health', 'Life'] },
                { name: 'gst', label: 'GST', type: 'gst', placeholder: 'Enter GST Number' },
                { name: 'pan', label: 'PAN', type: 'pan', placeholder: 'Enter PAN Number' },
                { name: 'contactNumber', label: 'Contact Number', type: 'phone', placeholder: '+91 1234567890' },
                { name: 'officialEmail', label: 'Official Email', type: 'email', placeholder: 'Enter  Official Email', required: true },
                { name: 'registerAddress', label: 'Register Address', type: 'textarea', placeholder: 'Full Postal Address', span: 24 },
                { name: 'city', label: 'City', placeholder: 'Enter City' },
                { name: 'state', label: 'State', type: 'select', placeholder: 'Select State', options: INDIAN_STATES },
                { name: 'country', label: 'Country', placeholder: 'Enter Country' },
                { name: 'regionalOffice', label: 'Regional Office', type: 'select', placeholder: 'Select Regional Office', options: ['North', 'East', 'West', 'South', 'Central'] },
                { name: 'postalPin', label: 'Postal PIN Code', type: 'pin', placeholder: '6 Digit Pin', maxLength: 6 },
                { name: 'website', label: 'Website', type: 'url', placeholder: 'website URl' },
            ],
        },
        {
            title: 'SAAS ADMIN ( NATIONAL MANAGER)',
            fields: [
                { name: 'adminFullName', label: 'Admin full name', placeholder: 'Enter Admin Full Name', required: true },
                { name: 'adminType', label: 'Admin Type', type: 'select', placeholder: 'Select Admin', options: ['National Manager', 'Regional Manager', 'Organisation admin'] },
                { name: 'adminEmail', label: 'Admin email', type: 'email', placeholder: 'Enter Email ID', required: true },
                { name: 'adminContact', label: 'Admin Contact Number', type: 'phone', placeholder: 'Enter Admin Contact Number' },
                { name: 'designation', label: 'Designation', type: 'select', placeholder: 'Select Designation', options: ['National Manager', 'Head - Claims', 'VP - Operations', 'Chief Manager'] },
                { name: 'department', label: 'Department', type: 'select', placeholder: 'Select Department', options: ['Claims', 'Underwriting', 'Operations', 'IT'] },
                { name: 'adminId', label: 'Admin ID', type: 'auto', placeholder: 'Auto Generated' },
                { name: 'tempPassword', label: 'Temp password', type: 'password', placeholder: 'Enter Temp Password', rules: [{ min: 8, message: 'Minimum 8 characters' }] },
            ],
        },
        {
            title: 'BRANDING',
            layout: 'branding',
            fields: [
                { name: 'logo', label: '', type: 'dropzone', placeholder: 'UPLOAD LOGO', compact: true },
                { name: 'brandColor', label: 'PRIMARY BRAND COLOUR', type: 'color' },
            ],
        },
    ],
    initialValues: { brandColor: '#004AC6', entityType: 'Insurer', country: 'India' },
};

const BROKER = {
    type: 'Broker',
    nameField: 'firmName',
    steps: [
        { label: 'Firm Details', section: 0 },
        { label: 'Logo', section: 1 },
        { label: 'Empanelment', section: 2 },
        { label: 'Platform Access', section: 3 },
        { label: 'Role Hierarchy', section: 4 },
        { label: 'Primary Admin', section: 5 },
        { label: 'Sub User Creation', section: null },
    ],
    sections: [
        {
            title: 'FIRM DETAILS',
            profileButton: true,
            fields: [
                { name: 'firmName', label: 'Firm Name', placeholder: 'Enter Firm Name', required: true },
                { name: 'brokerType', label: 'Broker Type', type: 'select', placeholder: 'Broker Type', options: ['Direct Broker', 'Reinsurance Broker', 'Composite Broker'] },
                { name: 'irdaiBrokerLicense', label: 'IRDAI Broker License Number', placeholder: 'Enter IRDAI Broker License Number' },
                { name: 'licenseExpDate', label: 'License Exp Date', type: 'date', placeholder: 'License Exp Date' },
                { name: 'cin', label: 'CIN Number', placeholder: 'Enter CIN Number' },
                { name: 'pan', label: 'PAN', type: 'pan', placeholder: 'Enter PAN Number' },
                { name: 'gst', label: 'GST Number', type: 'gst', placeholder: 'Enter GST Number' },
                { name: 'officialEmail', label: 'Official Email ID', type: 'email', placeholder: 'Enter Official Email ID', required: true },
                { name: 'primaryContact', label: 'Primary Contact Number', type: 'phone', placeholder: 'Enter Primary  Contact Number' },
                { name: 'websiteUrl', label: 'Website URL', type: 'url', placeholder: 'Website Link' },
                { name: 'registerAddress', label: 'Register Address', placeholder: 'Enter Register Address' },
                { name: 'state', label: 'State', type: 'select', placeholder: 'Select State', options: INDIAN_STATES },
                { name: 'pin', label: 'PIN', type: 'pin', placeholder: '6 Digit Code', maxLength: 6 },
            ],
        },
        {
            title: 'LOGO',
            fields: [{ name: 'logo', label: '', type: 'dropzone', placeholder: 'Upload Logo In Png Or Jpeg Format', span: 24 }],
        },
        {
            title: 'EMPANELMENT',
            fields: [
                { name: 'linesOfBusiness', label: 'Lines of business', type: 'checkboxes', options: LINES_OF_BUSINESS, span: 24 },
                { name: 'empanelledInsurers', label: 'Empanelled Insurers', type: 'multiselect', placeholder: 'Multi Select', optionsFrom: 'insurers' },
            ],
        },
        {
            title: 'PLATFORM ACCESS',
            fields: [
                { name: 'platform', label: 'Platform', type: 'static', placeholder: 'Static — Web only' },
                { name: 'spacer', type: 'spacer' },
                { name: 'effectiveFrom', label: 'Effective from', type: 'date', placeholder: 'Date picker' },
                { name: 'expiryDate', label: 'Expiry date', type: 'date', placeholder: 'Date picker' },
            ],
        },
        {
            title: 'ROLE HIERARCHY',
            fields: [
                { name: 'roleHierarchy', label: '', type: 'switches', options: ['National Manager (HO)', 'Hub Manager', 'Regional Manager', 'Branch Manager', 'State Manager'] },
                { name: 'maxUsersPerRole', label: 'Max users per role', type: 'number', placeholder: 'Number' },
            ],
        },
        {
            title: 'PRIMARY ADMIN',
            fields: [
                { name: 'adminFullName', label: 'Admin full name', placeholder: 'Enter Full Name', required: true },
                { name: 'adminEmail', label: 'Admin email', type: 'email', placeholder: 'Enter Admin Email ID', required: true },
                { name: 'employeeId', label: 'Employee ID', placeholder: 'Enter Employee ID' },
                { name: 'designation', label: 'Designation', placeholder: 'Enter Designation' },
                { name: 'adminMobile', label: 'Admin mobile Number', type: 'phone', placeholder: 'Enter Admin Contact Number' },
                { name: 'linkedInsurers', label: 'Linked insurers', placeholder: 'Eg: Comapnyname@gmail.com' },
                { name: 'adminUserId', label: 'Admin User ID', type: 'auto', placeholder: 'Auto Generate' },
                { name: 'tempPassword', label: 'Temp password', type: 'password', placeholder: '••••••••••••••••', rules: [{ min: 8, message: 'Minimum 8 characters' }] },
            ],
        },
    ],
    initialValues: {
        linesOfBusiness: ['Engineering', 'Misc'],
        roleHierarchy: { 'National Manager (HO)': true, 'Hub Manager': true, 'Regional Manager': true, 'Branch Manager': true, 'State Manager': true },
    },
};

const SURVEYOR = {
    type: 'Surveyor',
    nameField: 'fullName',
    steps: [
        { label: 'Personal details', section: 0 },
        { label: 'Irdai license details', section: 1 },
        { label: 'Professional details', section: 2 },
        { label: 'Banking details', section: 3 },
        { label: 'Documents & photo', section: 4 },
        { label: 'Platform & app access', section: 5 },
    ],
    sections: [
        {
            title: 'PERSONAL DETAILS',
            fields: [
                { name: 'fullName', label: 'Full name', placeholder: 'Enter Full Name', required: true },
                { name: 'gender', label: 'Gender', type: 'select', placeholder: 'Gender', options: ['Male', 'Female', 'Other'] },
                { name: 'aadhaar', label: 'Aadhaar number', type: 'aadhaar', placeholder: 'Enter Aadhaar Number', maxLength: 14 },
                { name: 'dob', label: 'Date of birth', type: 'date', placeholder: 'DD-MM-YYYY' },
                { name: 'primaryContact', label: 'Primary Contact Number', type: 'phone', placeholder: 'Enter Primary Contact Number', required: true },
                { name: 'pan', label: 'PAN', type: 'pan', placeholder: 'Enter Pan Number' },
                { name: 'registerAddress', label: 'Register Address', placeholder: 'Enter Register Address' },
                { name: 'officialEmail', label: 'Official Email ID', type: 'email', placeholder: 'Enter Official Email ID' },
                { name: 'state', label: 'State', type: 'select', placeholder: 'Select State', options: INDIAN_STATES },
                { name: 'pin', label: 'PIN', type: 'pin', placeholder: '6 Digit Code', maxLength: 6 },
            ],
        },
        {
            title: 'IRDAI LICENSE DETAILS',
            fields: [
                { name: 'licenseNo', label: 'IRDAI surveyor license no', placeholder: 'Eg. MS_1234567890' },
                { name: 'licenseCertificate', label: 'License certificate upload', type: 'upload', placeholder: 'PDF or JPG; max 5MB', accept: '.pdf,.jpg,.jpeg' },
                { name: 'licenseIssueDate', label: 'License issue date', type: 'date', placeholder: 'DD-MM-YYYY' },
                { name: 'licenseExpiryDate', label: 'License expiry date', type: 'date', placeholder: 'DD-MM-YYYY' },
                { name: 'licenseCategory', label: 'License category', type: 'checkboxes', options: LINES_OF_BUSINESS, span: 24 },
            ],
        },
        {
            title: 'PROFESSIONAL DETAILS',
            fields: [
                { name: 'specialization', label: 'Specialization', type: 'checkboxes', options: ['Motor 2W', 'Motor 4W', 'Motor Commercial', 'Property Fire', 'Marin', 'Engineering', 'Misc'], span: 24 },
                { name: 'vehicleTypes', label: 'Vehicle types handled', type: 'checkboxes', options: ['2-Wheeler', '4-Wheeler', 'SUV', 'Commercial LCV', 'Commercial HCV', 'EV'], span: 24 },
                { name: 'yearsOfExperience', label: 'Years of experience', type: 'number', placeholder: 'Years of experience' },
                { name: 'empanelledInsurers', label: 'Empanelled insurers', type: 'multiselect', placeholder: 'Select From Active Insures: Min 1 Required', optionsFrom: 'insurers', required: true },
                { name: 'serviceStates', label: 'Service states', type: 'multiselect', placeholder: 'All India States', options: INDIAN_STATES },
                { name: 'serviceDistricts', label: 'Service districts', type: 'select', placeholder: 'Select District', options: ['Mumbai', 'Pune', 'Thane', 'Nagpur', 'New Delhi', 'Bengaluru Urban', 'Chennai', 'Kolkata'] },
                { name: 'maxConcurrentSurveys', label: 'Max concurrent surveys', type: 'select', placeholder: 'Enter Number', options: ['1', '2', '3', '5', '8', '10', '15', '20'] },
            ],
        },
        {
            title: 'BANKING DETAILS',
            fields: [
                { name: 'accountHolder', label: 'Account holder name', placeholder: 'Must Match PAN Records Exactly' },
                { name: 'bankName', label: 'Bank name', type: 'select', placeholder: 'Select Bank', options: ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Punjab National Bank', 'Kotak Mahindra Bank', 'Bank of Baroda'] },
                { name: 'accountNumber', label: 'Account number', validate: 'account', placeholder: 'Enter 9 Digit Account Number' },
                { name: 'ifsc', label: 'IFSC code', type: 'ifsc', placeholder: 'Enter IFSC Code' },
                { name: 'accountType', label: 'Account type', type: 'select', placeholder: 'Select Account Type', options: ['Savings', 'Current'] },
                { name: 'cancelledCheque', label: 'Cancelled cheque / passbook', type: 'upload', placeholder: 'PDF or JPG: Max 2 MB', accept: '.pdf,.jpg,.jpeg' },
            ],
        },
        {
            title: 'DOCUMENTS & PHOTO',
            fields: [
                { name: 'profilePhoto', label: 'Profile photo', type: 'upload', placeholder: 'JPG/PNG; max 1MB; face clearly visible; min 200×200px', accept: 'image/png,image/jpeg' },
                { name: 'idProof', label: 'ID proof', type: 'upload', placeholder: 'Aadhaar / Passport / Voter ID — PDF or JPG; max 3MB', accept: '.pdf,.jpg,.jpeg' },
                { name: 'addressProof', label: 'Address proof', type: 'upload', placeholder: 'Utility bill / Aadhaar / Bank statement — max 3MB; not older than 3 months', span: 24, accept: '.pdf,.jpg,.jpeg' },
            ],
        },
        {
            title: 'PLATFORM & APP ACCESS',
            fields: [
                { name: 'appPermissions', label: 'App permissions', type: 'checkboxes', options: ['Vehicle Survey', 'Pre-Inspection', 'Photo-Video Capture', 'Survey Report Submit', 'GPS Tracking'], span: 24 },
                { name: 'platform', label: 'Platform', type: 'select', placeholder: 'Select Platform', options: ['Mobile', 'Web', 'Both'] },
                { name: 'effectiveFrom', label: 'Effective from', type: 'date', placeholder: 'Select Date' },
                { name: 'platform', key: 'platformCards', label: '', type: 'platformCards', span: 24 },
                { name: 'userId', label: 'User ID', type: 'auto', placeholder: 'Auto Generated' },
                { name: 'tempPassword', label: 'Temp Password', type: 'password', placeholder: 'Enter Temp Password', rules: [{ min: 8, message: 'Minimum 8 characters' }] },
                { name: 'accountStatus', label: 'Account status', type: 'statusRadios', options: ['Active', 'Inactive', 'Suspended', 'License Expired'], span: 24 },
            ],
        },
    ],
    initialValues: {
        licenseCategory: ['Engineering', 'Misc'],
        specialization: ['Marin', 'Engineering', 'Misc'],
        vehicleTypes: ['Commercial HCV', 'EV'],
        appPermissions: ['GPS Tracking'],
        platform: 'Web',
        accountStatus: 'Active',
    },
};

const WORKSHOP = {
    type: 'Workshop',
    nameField: 'workshopName',
    steps: [
        { label: 'Workshop', section: 0 },
        { label: 'Empanelment', section: 1 },
        { label: 'Platform & Access', section: 2 },
        { label: 'Primery User', section: 3 },
    ],
    sections: [
        {
            title: 'WORKSHOP DETAILS',
            profileButton: true,
            fields: [
                { name: 'workshopName', label: 'Workshop / garage name', placeholder: 'Enter Workshop Name', required: true },
                { name: 'workshopType', label: 'Workshop type', type: 'select', placeholder: 'Select Workshop Type', options: ['Authorised', 'Multi-Brand', 'Body Shop'] },
                { name: 'brandOem', label: 'Brand / OEM authorised for', placeholder: 'Eg. Maruti, Hyundai' },
                { name: 'registrationGstNo', label: 'Registration no. / GST no.', placeholder: 'Enter Registration / GST No.' },
                { name: 'ownerName', label: 'Owner / proprietor name', placeholder: 'Enter Owner Name' },
                { name: 'pan', label: 'PAN', type: 'pan', placeholder: 'Eg: MSRTS7851G' },
                { name: 'primaryContactName', label: 'Primary contact name', placeholder: 'Enter Contact Name' },
                { name: 'officialEmail', label: 'Official Email ID', type: 'email', placeholder: 'Eg: Comapnyname@gmail.com', required: true },
                { name: 'mobileNumber', label: 'Mobile number', type: 'phone', placeholder: 'Eg: +91 1234567890' },
                { name: 'alternateMobile', label: 'Alternate mobile', type: 'phone', placeholder: 'Eg: +91 1234567890' },
                { name: 'workshopAddress', label: 'Workshop address', placeholder: 'Enter Workshop Address', span: 24 },
                { name: 'cityDistrict', label: 'City / District', placeholder: 'Enter City / District' },
                { name: 'googleMapsLink', label: 'Google Maps link / geo-location', type: 'url', placeholder: 'https://maps.google.com/...' },
            ],
        },
        {
            title: 'EMPANELMENT',
            fields: [
                { name: 'empanelledInsurers', label: 'Empanelled insurers', type: 'multiselect', placeholder: 'Select Insurers', optionsFrom: 'insurers' },
                { name: 'empanelmentCode', label: 'Empanelment code (per insurer)', type: 'select', placeholder: 'Select', options: ['Auto', 'Manual'] },
                { name: 'empanelmentCertificate', label: 'Empanelment valid upto', type: 'upload', placeholder: 'PDF or JPG; max 5MB', span: 24 },
            ],
        },
        {
            title: 'PLATFORM & APP ACCESS',
            fields: [
                { name: 'platform', label: 'Platform', type: 'select', placeholder: 'Select Platform', options: ['Mobile', 'Web', 'Both'] },
                { name: 'appPermissions', label: 'App permissions', type: 'multiselect', placeholder: 'Select Permissions', options: ['Job Card', 'Estimate', 'Photo Upload', 'Status Update'] },
                { name: 'effectiveFrom', label: 'Effective from', type: 'date', placeholder: 'Select Date' },
                { name: 'accountStatus', label: 'Account status', type: 'select', placeholder: 'Select Status', options: ['Active', 'Inactive', 'Suspended'] },
            ],
        },
        {
            title: 'PRIMARY USER — WORKSHOP IN-CHARGE',
            fields: [
                { name: 'inchargeName', label: 'In-charge name', placeholder: 'Enter Name', required: true },
                { name: 'inchargeMobile', label: 'Mobile', type: 'phone', placeholder: 'Eg: +91 1234567890' },
                { name: 'designation', label: 'Designation', placeholder: 'Enter Designation' },
                { name: 'employeeId', label: 'Employee ID', placeholder: 'Enter Employee ID' },
                { name: 'tempPassword', label: 'Temp PIN / password', type: 'password', placeholder: 'Enter Temp Password', span: 24 },
            ],
        },
    ],
    initialValues: {},
};

export const ORG_FORMS = { Insurer: INSURER, Broker: BROKER, Surveyor: SURVEYOR, Workshop: WORKSHOP };
