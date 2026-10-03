import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Form, Input, Button, Modal, Alert, App, Typography } from 'antd';
import { LockOutlined, CheckCircleOutlined } from '@ant-design/icons';
import PageTitle from '../../components/ui/PageTitle';
import { usersApi } from '../../api/superadminApi';
import { formatDateTime } from '../../utils/format';
import { COLORS } from '../../constants/theme';

const CHECKS = ['Search User By User ID', 'Verify Registered Contact Details', 'Send Secure Reset Link', 'Manual Reset With Audit Trail'];

/**
 * Password Reset: look a user up by User ID (see the Users page eye/details
 * for IDs, e.g. USR-1001), confirm the registered email + mobile match,
 * then either send a reset link or set a new password manually. Every
 * outcome is written to Audit Logs.
 */
const PasswordResetPage = () => {
    const [params] = useSearchParams();
    const { message } = App.useApp();
    const [form] = Form.useForm();
    const [manualForm] = Form.useForm();
    const [verified, setVerified] = useState(null);
    const [error, setError] = useState('');
    const [manualOpen, setManualOpen] = useState(false);
    const [sending, setSending] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [resetting, setResetting] = useState(false);
    const [link, setLink] = useState(null); // { link, expiresAt, email } after "Send Link"

    const verify = async () => {
        const v = await form.validateFields();
        setVerifying(true);
        try {
            const user = await usersApi.verify(v.userId.trim(), v.email.trim(), v.phone.trim());
            setError('');
            setVerified(user);
            message.success(`${user.name} verified.`);
        } catch (err) {
            setVerified(null);
            setError(err.status === 404 ? `No user found with User ID "${v.userId.trim()}".` : err.message);
        } finally {
            setVerifying(false);
        }
    };

    const sendLink = async () => {
        setSending(true);
        try {
            setLink(await usersApi.resetLink(verified.id));
        } catch (err) {
            message.error(err.message);
        } finally {
            setSending(false);
        }
    };

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(link.link);
            message.success('Reset link copied.');
        } catch {
            message.error('Copy failed -- select the link and copy it manually.');
        }
    };

    const resetManually = async () => {
        const v = await manualForm.validateFields();
        setResetting(true);
        try {
            await usersApi.resetPassword(verified.id, v.password, v.reason.trim());
            message.success(`Password reset for ${verified.name}. They must change it at next login. Logged to Audit Trail.`);
            setManualOpen(false);
            manualForm.resetFields();
        } catch (err) {
            message.error(err.message);
        } finally {
            setResetting(false);
        }
    };

    // Any edit to the lookup fields invalidates a previous verification.
    const onValuesChange = () => {
        if (verified) setVerified(null);
        if (error) setError('');
    };

    return (
        <div>
            <PageTitle title="Password Reset" className="mb-5" />

            <div className="grid grid-cols-1 lg:grid-cols-[minmax(260px,0.9fr)_1.6fr] rounded-lg overflow-hidden max-w-[1150px]" style={{ border: `1px solid ${COLORS.border}` }}>
                {/* Left info panel */}
                <div className="relative overflow-hidden p-5 lg:min-h-[440px]" style={{ background: COLORS.bgSoftBlue }}>
                    <div className="flex items-center justify-center rounded-md" style={{ width: 64, height: 64, background: '#AFC4EC', color: COLORS.primary, fontSize: 28 }}>
                        <LockOutlined />
                    </div>
                    <h2 className="text-xl font-bold mt-8 mb-2" style={{ color: COLORS.headingBlue }}>Password Reset</h2>
                    <p className="text-[13px] m-0 mb-4">Reset Or Send A Secure Password Reset Link To An IBima Assist User.</p>
                    <ul className="list-none p-0 m-0 flex flex-col gap-3 relative z-10">
                        {CHECKS.map((c, i) => (
                            <li key={c} className="flex items-center gap-2 text-[13px]">
                                <CheckCircleOutlined style={{ color: (i === 0 && verified) || (i === 1 && verified) ? COLORS.success : COLORS.textPrimary }} />
                                {c}
                            </li>
                        ))}
                    </ul>
                    <div className="absolute rounded-full hidden lg:block" style={{ width: 340, height: 340, right: -170, bottom: -170, background: '#7FA2E6' }} />
                </div>

                {/* Right form */}
                <div className="p-5">
                    <h2 className="text-xl font-bold m-0" style={{ color: COLORS.headingBlue }}>Reset User Password</h2>
                    <p className="text-[13px] mt-1 mb-4">Enter The Registered User Details To Continue.</p>

                    <Form form={form} layout="vertical" requiredMark={false} onValuesChange={onValuesChange} initialValues={{ userId: params.get('userId') ?? '' }}>
                        <Form.Item name="userId" label={<span className="text-[15px] font-semibold" style={{ color: COLORS.headingBlue }}>User ID</span>} rules={[{ required: true, message: 'Enter the User ID (e.g. USR-1001)' }]}>
                            <Input placeholder="Enter User ID" style={{ height: 40 }} />
                        </Form.Item>
                        <Form.Item name="email" label={<span className="text-[15px] font-semibold" style={{ color: COLORS.headingBlue }}>Registered Email Address</span>} rules={[{ required: true, type: 'email', message: 'Enter the registered email' }]}>
                            <Input placeholder="Username@Companyname.Com" style={{ height: 40 }} />
                        </Form.Item>
                        <Form.Item name="phone" label={<span className="text-[15px] font-semibold" style={{ color: COLORS.headingBlue }}>Registered Contact Number</span>} rules={[{ required: true, pattern: /^(\+91[\s-]?)?\d{10}$/, message: 'Enter the 10-digit registered number' }]}>
                            <Input placeholder="+91 1234567890" style={{ height: 40 }} />
                        </Form.Item>
                    </Form>

                    {error && <Alert type="error" showIcon title={error} className="mb-3" />}
                    {verified && <Alert type="success" showIcon title={`Verified: ${verified.name} · ${verified.organization} · ${verified.role}`} className="mb-3" />}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                        <Button onClick={verify} loading={verifying} style={{ height: 42, background: COLORS.primarySoft, color: COLORS.primary, border: 'none', fontWeight: 600 }}>Verify User</Button>
                        <Button type="primary" disabled={!verified} loading={sending} onClick={sendLink} style={{ height: 42, fontWeight: 600 }}>Send  Link</Button>
                        <Button disabled={!verified} onClick={() => setManualOpen(true)} style={{ height: 42, background: verified ? COLORS.primarySoft : undefined, color: verified ? COLORS.primary : undefined, border: 'none', fontWeight: 600 }}>Reset Manually</Button>
                    </div>
                    {!verified && <p className="text-[11px] mt-2 mb-0" style={{ color: COLORS.textSecondary }}>Verify the user first to enable Send Link / Reset Manually.</p>}
                </div>
            </div>

            <Modal open={manualOpen} title={`Reset password — ${verified?.name ?? ''}`} okText="Reset Password" confirmLoading={resetting} onOk={resetManually} onCancel={() => setManualOpen(false)} destroyOnHidden>
                <Form form={manualForm} layout="vertical" requiredMark={false}>
                    <Form.Item name="password" label="New Password" rules={[{ required: true }, { min: 8, message: 'Minimum 8 characters' }, { pattern: /(?=.*\d)(?=.*[A-Za-z])/, message: 'Use letters and numbers' }]}>
                        <Input.Password autoComplete="new-password" />
                    </Form.Item>
                    <Form.Item
                        name="confirm"
                        label="Confirm Password"
                        dependencies={['password']}
                        rules={[{ required: true }, ({ getFieldValue }) => ({ validator: (_, v) => (!v || v === getFieldValue('password') ? Promise.resolve() : Promise.reject(new Error('Passwords do not match'))) })]}
                    >
                        <Input.Password autoComplete="new-password" />
                    </Form.Item>
                    <Form.Item name="reason" label="Reason (for audit trail)" rules={[{ required: true, message: 'Add a reason' }]}>
                        <Input.TextArea rows={2} placeholder="e.g. User locked out, verified over phone" />
                    </Form.Item>
                </Form>
            </Modal>
            <Modal
                open={!!link}
                title="Secure reset link created"
                onCancel={() => setLink(null)}
                footer={[
                    <Button key="copy" type="primary" onClick={copyLink}>Copy Link</Button>,
                    <Button key="close" onClick={() => setLink(null)}>Close</Button>,
                ]}
            >
                {link && (
                    <>
                        <p className="text-[13px] mt-0">
                            Share this one-time link with <b>{verified?.name}</b> ({link.email}). It works once and expires on <b>{formatDateTime(link.expiresAt)}</b>.
                        </p>
                        <Typography.Paragraph copyable={{ text: link.link }} className="text-[12px] break-all rounded-md p-2" style={{ background: COLORS.bgField }}>
                            {link.link}
                        </Typography.Paragraph>
                        {!link.emailSent && (
                            <Alert type="info" showIcon title="Email delivery is not configured on the server yet, so the link was not emailed automatically." />
                        )}
                    </>
                )}
            </Modal>
        </div>
    );
};

export default PasswordResetPage;
