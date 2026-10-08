import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, App, Result } from 'antd';
import FormSection from '../../components/forms/FormSection';
import StepNav from '../../components/forms/StepNav';
import FieldGrid from '../../components/forms/FieldRenderer';
import useScrollSpy from '../../components/forms/useScrollSpy';
import PageTitle from '../../components/ui/PageTitle';
import { useCollection, useRoles } from '../../store/DataStore';
import { usersApi, adminUsersApi } from '../../api/superadminApi';
import { isMasterAdmin, getAdminScope } from '../../auth/session';
import CredentialsModal from '../../components/organizations/CredentialsModal';
import { ROUTES } from '../../constants/routes';
import { USER_ROLES, BRANCHES } from '../../data/options';

const SCOPE_OPTIONS = [
    { value: 'all', label: 'All (SaaS + Service Provider)' },
    { value: 'saas', label: 'SaaS only' },
    { value: 'serviceProvider', label: 'Service Provider only' },
];

/**
 * "+ Add User" (Users) and "+ Add Admin User" (Admin Users) -- same
 * section-card form shell as the organization forms (the earlier Internal
 * User screen's Platform / Role / Profile / Status sections). Saving adds
 * the record to the store and returns to the list.
 */
const UserCreatePage = ({ variant = 'user' }) => {
    const isAdmin = variant === 'admin';
    const navigate = useNavigate();
    const { message } = App.useApp();
    const { upsert: upsertUser } = useCollection('users');
    const { upsert: upsertAdmin } = useCollection('adminUsers');
    const { items: orgs, reload: reloadOrgs } = useCollection('organizations');
    const roles = useRoles();
    const [form] = Form.useForm();
    const [refs, active, scrollTo] = useScrollSpy();
    const [saving, setSaving] = useState(false);
    const [credentials, setCredentials] = useState(null);

    // Active organizations only; value = organization ID.
    const orgOptions = useMemo(
        () => orgs.filter((o) => o.status === 'Active').map((o) => ({ value: o.id, label: `${o.name} (${o.id})` })),
        [orgs],
    );

    const sections = isAdmin
        ? [
            {
                title: 'ADMIN DETAILS',
                fields: [
                    { name: 'name', label: 'Full Name', placeholder: 'Enter Full Name', required: true },
                    { name: 'id', label: 'Admin ID', type: 'auto', placeholder: 'Auto Generated on save' },
                    { name: 'email', label: 'Email Address', type: 'email', placeholder: 'Enter Email Address', required: true },
                    { name: 'phone', label: 'Mobile Number', type: 'phone', placeholder: '+91 1234567890' },
                ],
            },
            {
                title: 'ROLE & SECURITY',
                fields: [
                    { name: 'role', label: 'Admin Role', type: 'select', placeholder: 'Select Role', options: roles.list, required: true },
                    { name: 'scope', label: 'Manages', type: 'select', placeholder: 'Select Scope', options: SCOPE_OPTIONS, required: true },
                    { name: 'tempPassword', label: 'Temp Password', type: 'password', placeholder: 'Leave empty to auto-generate', rules: [{ min: 8, message: 'Minimum 8 characters' }, { pattern: /(?=.*\d)(?=.*[A-Za-z])/, message: 'Use letters and numbers' }] },
                    { name: 'mfa', label: 'MFA', type: 'statusRadios', options: ['Enabled', 'Disabled'], span: 24 },
                ],
            },
            {
                title: 'ACCOUNT STATUS',
                fields: [{ name: 'status', label: '', type: 'statusRadios', options: ['Active', 'Pending', 'Suspended'], span: 24 }],
            },
        ]
        : [
            {
                title: 'PLATFORM',
                fields: [{ name: 'platform', label: '', type: 'platformCards', span: 24 }],
            },
            {
                title: 'ROLE ASSIGNMENT',
                fields: [
                    { name: 'organization', label: 'Organization', type: 'select', placeholder: 'Select Organization', options: orgOptions, required: true },
                    { name: 'role', label: 'Role', type: 'select', placeholder: 'Select Role', options: USER_ROLES, required: true },
                ],
            },
            {
                title: 'USER PROFILE DETAILS',
                fields: [
                    { name: 'name', label: 'Full Name', placeholder: 'Enter Full Name', required: true },
                    { name: 'userId', label: 'User ID', type: 'auto', placeholder: 'Auto Generated on save' },
                    { name: 'email', label: 'Email Address', type: 'email', placeholder: 'Enter Email Address', required: true },
                    { name: 'phone', label: 'Mobile Number', type: 'phone', placeholder: '+91 1234567890', required: true },
                    { name: 'branch', label: 'Branch/Office', type: 'select', placeholder: 'Select Branch', options: BRANCHES },
                    { name: 'password', label: 'Set Password', type: 'password', placeholder: 'Leave empty to auto-generate', rules: [{ min: 8, message: 'Minimum 8 characters' }, { pattern: /(?=.*\d)(?=.*[A-Za-z])/, message: 'Use letters and numbers' }] },
                ],
            },
            {
                title: 'ACCOUNT STATUS',
                fields: [{ name: 'status', label: '', type: 'statusRadios', options: ['Active', 'Inactive', 'Pending'], span: 24 }],
            },
        ];

    const steps = sections.map((s, i) => ({ label: s.title.charAt(0) + s.title.slice(1).toLowerCase(), section: i }));

    const onFinish = async (v) => {
        setSaving(true);
        try {
            if (isAdmin) {
                const { admin, credentials: c } = await adminUsersApi.create({
                    name: v.name, email: v.email, phone: v.phone || undefined, role: v.role, scope: v.scope,
                    status: v.status, mfa: v.mfa === 'Enabled', password: v.tempPassword || undefined,
                });
                upsertAdmin(admin);
                setCredentials({
                    title: 'Admin user created',
                    fileName: admin.id,
                    note: `${admin.name} signs in to this console with the email (or mobile number) and this password.`,
                    rows: [['Admin', `${admin.name} (${admin.id})`], ['Role', admin.role], ['Login ID', c.loginId], ['Password', c.password, 'password']],
                });
            } else {
                const { user, credentials: c } = await usersApi.create({
                    organizationId: v.organization, name: v.name, email: v.email, phone: v.phone, role: v.role,
                    branch: v.branch || undefined, platform: v.platform, status: v.status, password: v.password || undefined,
                });
                upsertUser(user);
                reloadOrgs(); // organization user counts changed
                setCredentials({
                    title: 'User created',
                    fileName: user.id,
                    note: `${user.name} must change this password at first login.`,
                    rows: [['User', `${user.name}`], ['Organization', user.organization], ['User ID', c.loginId], ['Password', c.password, 'password']],
                });
            }
        } catch (err) {
            message.error(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (isAdmin && !isMasterAdmin()) {
        return <Result status="403" title="Only the master Super Admin can add admin users." extra={<Button onClick={() => navigate(ROUTES.ADMIN_USERS)}>Back to Admin Users</Button>} />;
    }

    return (
        <div>
            <PageTitle title={isAdmin ? 'Add Admin User' : 'Add User'} subtitle="Setup a new user with secure access to the motor insurance platform" />
            <div className="flex gap-6 items-start">
                <StepNav steps={steps} activeIndex={active} onStepClick={scrollTo} />
                <Form
                    form={form}
                    layout="vertical"
                    requiredMark={false}
                    className="flex-1 min-w-0 max-w-[900px]"
                    initialValues={isAdmin ? { status: 'Active', mfa: 'Enabled', scope: getAdminScope() } : { status: 'Active', platform: 'Both' }}
                    onFinish={onFinish}
                    onFinishFailed={() => message.error('Please fix the highlighted fields.')}
                    scrollToFirstError
                >
                    {sections.map((s, i) => (
                        <FormSection key={s.title} ref={(el) => { refs.current[i] = el; }} step={i + 1} title={s.title}>
                            <FieldGrid fields={s.fields} />
                        </FormSection>
                    ))}
                    <div className="flex justify-end gap-3 mb-4">
                        <Button onClick={() => navigate(-1)}>Cancel</Button>
                        <Button type="primary" htmlType="submit" loading={saving}>Create Now</Button>
                    </div>
                </Form>
            </div>
            <CredentialsModal data={credentials} onClose={() => navigate(isAdmin ? ROUTES.ADMIN_USERS : ROUTES.USERS)} />
        </div>
    );
};

export default UserCreatePage;
