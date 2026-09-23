import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, App } from 'antd';
import FormSection from '../../components/forms/FormSection';
import StepNav from '../../components/forms/StepNav';
import FieldGrid from '../../components/forms/FieldRenderer';
import useScrollSpy from '../../components/forms/useScrollSpy';
import PageTitle from '../../components/ui/PageTitle';
import { useCollection, useAuditLog } from '../../store/DataStore';
import { ROUTES } from '../../constants/routes';
import { USER_ROLES, ADMIN_ROLES, BRANCHES } from '../../data/seed';

const nextId = (list, prefix, start) => {
    const nums = list.map((x) => Number(String(x.id).replace(/\D/g, ''))).filter(Number.isFinite);
    return `${prefix}-${Math.max(start, ...nums) + 1}`;
};

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
    const log = useAuditLog();
    const { items: users, add: addUser } = useCollection('users');
    const { items: admins, add: addAdmin } = useCollection('adminUsers');
    const { items: orgs } = useCollection('organizations');
    const [form] = Form.useForm();
    const [refs, active, scrollTo] = useScrollSpy();

    const orgOptions = useMemo(() => orgs.map((o) => o.name), [orgs]);
    const generatedId = isAdmin ? nextId(admins, 'ADM', 100) : nextId(users, 'USR', 1000);

    const sections = isAdmin
        ? [
            {
                title: 'ADMIN DETAILS',
                fields: [
                    { name: 'name', label: 'Full Name', placeholder: 'Enter Full Name', required: true },
                    { name: 'id', label: 'Admin ID', type: 'auto', placeholder: 'Auto Generated' },
                    { name: 'email', label: 'Email Address', type: 'email', placeholder: 'Enter Email Address', required: true },
                    { name: 'phone', label: 'Mobile Number', type: 'phone', placeholder: '+91 1234567890' },
                ],
            },
            {
                title: 'ROLE & SECURITY',
                fields: [
                    { name: 'role', label: 'Admin Role', type: 'select', placeholder: 'Select Role', options: ADMIN_ROLES, required: true },
                    { name: 'tempPassword', label: 'Temp Password', type: 'password', placeholder: 'Enter Temp Password', required: true, rules: [{ min: 8, message: 'Minimum 8 characters' }] },
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
                    { name: 'userId', label: 'User ID', type: 'auto', placeholder: 'Auto Generated' },
                    { name: 'email', label: 'Email Address', type: 'email', placeholder: 'Enter Email Address', required: true },
                    { name: 'phone', label: 'Mobile Number', type: 'phone', placeholder: '+91 1234567890', required: true },
                    { name: 'branch', label: 'Branch/Office', type: 'select', placeholder: 'Select Branch', options: BRANCHES },
                    { name: 'password', label: 'Set Password', type: 'password', placeholder: 'Set Password', required: true, rules: [{ min: 8, message: 'Minimum 8 characters' }] },
                ],
            },
            {
                title: 'ACCOUNT STATUS',
                fields: [{ name: 'status', label: '', type: 'statusRadios', options: ['Active', 'Inactive', 'Pending'], span: 24 }],
            },
        ];

    const steps = sections.map((s, i) => ({ label: s.title.charAt(0) + s.title.slice(1).toLowerCase(), section: i }));

    const onFinish = (v) => {
        const now = new Date().toISOString();
        if (isAdmin) {
            addAdmin({ id: generatedId, name: v.name, email: v.email, phone: v.phone, role: v.role, status: v.status, mfa: v.mfa === 'Enabled', lastLogin: null });
        } else {
            addUser({
                id: generatedId, userId: generatedId, name: v.name, email: v.email, phone: v.phone, organization: v.organization,
                role: v.role, status: v.status, branch: v.branch ?? '—', platform: v.platform, lastLogin: null, createdOn: now,
            });
        }
        log('Created', 'Users');
        message.success(`${v.name} added (${generatedId}).`);
        navigate(isAdmin ? ROUTES.ADMIN_USERS : ROUTES.USERS);
    };

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
                    initialValues={isAdmin ? { id: generatedId, status: 'Active', mfa: 'Enabled' } : { userId: generatedId, status: 'Active', platform: 'Both' }}
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
                        <Button type="primary" htmlType="submit">Create Now</Button>
                    </div>
                </Form>
            </div>
        </div>
    );
};

export default UserCreatePage;
