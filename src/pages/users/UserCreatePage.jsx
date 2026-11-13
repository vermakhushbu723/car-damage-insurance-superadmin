import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, App } from 'antd';
import FormSection from '../../components/forms/FormSection';
import StepNav from '../../components/forms/StepNav';
import FieldGrid from '../../components/forms/FieldRenderer';
import useScrollSpy from '../../components/forms/useScrollSpy';
import PageTitle from '../../components/ui/PageTitle';
import { useCollection } from '../../store/DataStore';
import { usersApi } from '../../api/superadminApi';
import CredentialsModal, { NOT_CONNECTED, signInOn } from '../../components/organizations/CredentialsModal';
import { ROUTES } from '../../constants/routes';
import { USER_ROLES, BRANCHES } from '../../data/options';

/**
 * "+ Add User" (Users) and "+ Add Admin" (Admin Users: an organization's admin, role fixed) -- same
 * section-card form shell as the organization forms (the earlier Internal
 * User screen's Platform / Role / Profile / Status sections). Saving adds
 * the record to the store and returns to the list.
 */
const UserCreatePage = ({ variant = 'user' }) => {
    const isAdmin = variant === 'admin';
    const navigate = useNavigate();
    const { message } = App.useApp();
    const { upsert: upsertUser } = useCollection('users');
    const { items: orgs, reload: reloadOrgs } = useCollection('organizations');
    const [form] = Form.useForm();
    const [refs, active, scrollTo] = useScrollSpy();
    const [saving, setSaving] = useState(false);
    const [credentials, setCredentials] = useState(null);

    // Active organizations only; value = organization ID.
    const orgOptions = useMemo(
        () => orgs.filter((o) => o.status === 'Active').map((o) => ({ value: o.id, label: `${o.name} (${o.id})` })),
        [orgs],
    );

    const sections = [
            {
                title: 'PLATFORM',
                fields: [{ name: 'platform', label: '', type: 'platformCards', span: 24 }],
            },
            {
                title: 'ROLE ASSIGNMENT',
                fields: [
                    { name: 'organization', label: 'Organization', type: 'select', placeholder: 'Select Organization', options: orgOptions, required: true },
                    isAdmin
                        ? { name: 'role', label: 'Role', type: 'select', options: ['Admin'], disabled: true }
                        : { name: 'role', label: 'Role', type: 'select', placeholder: 'Select Role', options: USER_ROLES, required: true },
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
            {
                const { user, credentials: c } = await usersApi.create({
                    organizationId: v.organization, name: v.name, email: v.email, phone: v.phone, role: isAdmin ? 'Admin' : v.role,
                    branch: v.branch || undefined, platform: v.platform, status: v.status, password: v.password || undefined,
                });
                upsertUser(user);
                reloadOrgs(); // organization user counts changed
                setCredentials({
                    title: isAdmin ? 'Organization admin created' : 'User created',
                    fileName: user.id,
                    note: c.portal ? `${user.name} signs in with the User ID (or email) and this password, and must change it at first login.` : NOT_CONNECTED,
                    rows: [['User', `${user.name}`], ['Organization', user.organization], ['User ID', c.loginId], ['Password', c.password, 'password'], ['Sign In As', signInOn(c.portal)]],
                });
            }
        } catch (err) {
            message.error(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <PageTitle title={isAdmin ? 'Add Organization Admin' : 'Add User'} subtitle={isAdmin ? 'An admin login for one organization: it signs in to the Admin portal and manages that organization\'s users.' : 'Setup a new user with secure access to the motor insurance platform'} />
            <div className="flex gap-6 items-start">
                <StepNav steps={steps} activeIndex={active} onStepClick={scrollTo} />
                <Form
                    form={form}
                    layout="vertical"
                    requiredMark={false}
                    className="flex-1 min-w-0 max-w-[900px]"
                    initialValues={isAdmin ? { status: 'Active', platform: 'Web', role: 'Admin' } : { status: 'Active', platform: 'Both' }}
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
