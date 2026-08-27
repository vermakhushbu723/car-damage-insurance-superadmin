import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Row, Col, Button, App } from 'antd';
import { MobileOutlined, DesktopOutlined, CustomerServiceOutlined } from '@ant-design/icons';
import FormSectionCard from '../../components/insurer/FormSectionCard';
import StepNav from '../../components/insurer/StepNav';
import PlatformOptionCard from '../../components/internalUser/PlatformOptionCard';
import StatusOptionCard from '../../components/internalUser/StatusOptionCard';
import { COLORS } from '../../constants/theme';
import { ROUTES } from '../../constants/routes';

const STEPS = ['Platform', 'Role Assignment', 'User Profile Details', 'Organization', 'Account Status'];

const PLATFORM_OPTIONS = [
    { key: 'mobile', label: 'Mob Application', icon: <MobileOutlined /> },
    { key: 'web', label: 'Web Portal', icon: <DesktopOutlined /> },
    { key: 'omni', label: 'Omni-Channel (Both)', icon: <CustomerServiceOutlined /> },
];

const FieldLabel = ({ children }) => (
    <span className="block text-sm font-semibold mb-1.5" style={{ color: COLORS.textPrimary }}>{children}</span>
);

/**
 * "Internal User > As SaaS" creation form -- same shell (numbered
 * FormSectionCard sections + click-to-scroll StepNav + trailing "Create
 * Now" button) as InsurerNewIdCreationPage, just a different field set.
 * UI-only for now: "Create Now" just logs the payload and returns to the
 * list (see components/insurer's shared pieces for the reused chrome).
 */
const InternalUserCreationPage = () => {
    const navigate = useNavigate();
    const { message } = App.useApp();
    const [form] = Form.useForm();
    const [activeStep, setActiveStep] = useState(1);
    const [platform, setPlatform] = useState('omni');
    const [accountStatus, setAccountStatus] = useState('active');
    const sectionRefs = useRef([]);

    const scrollToStep = (step) => {
        setActiveStep(step);
        sectionRefs.current[step - 1]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const handleFinish = (values) => {
        console.log('New internal user payload:', { ...values, platform, accountStatus });
        message.success('Internal user created successfully.');
        navigate(ROUTES.INTERNAL_USER);
    };

    return (
        <div className="p-4 md:p-8">
            <h1 className="text-3xl font-extrabold m-0" style={{ color: COLORS.headingBlue }}>As SaaS</h1>
            <p className="text-sm mt-1 mb-6" style={{ color: COLORS.textPrimary }}>
                Setup a new user with secure access to the motor insurance platform
            </p>

            <div className="flex gap-8 items-start">
                <StepNav steps={STEPS} activeStep={activeStep} onStepClick={scrollToStep} />

                <Form form={form} layout="vertical" onFinish={handleFinish} className="flex-1 min-w-0" requiredMark={false}>
                    {/* Step 1 -- Platform */}
                    <FormSectionCard ref={(el) => (sectionRefs.current[0] = el)} step={1} title="PLATFORM">
                        <p className="text-sm mt-0 mb-4" style={{ color: COLORS.textSecondary }}>Enter The basic information of employee</p>
                        <div className="flex flex-wrap gap-4">
                            {PLATFORM_OPTIONS.map((opt) => (
                                <PlatformOptionCard
                                    key={opt.key}
                                    icon={opt.icon}
                                    label={opt.label}
                                    selected={platform === opt.key}
                                    onSelect={() => setPlatform(opt.key)}
                                />
                            ))}
                        </div>
                    </FormSectionCard>

                    {/* Step 2 -- Role Assignment */}
                    <FormSectionCard ref={(el) => (sectionRefs.current[1] = el)} step={2} title="ROLE ASSIGNMENT">
                        <p className="text-sm mt-0 mb-4" style={{ color: COLORS.textSecondary }}>Enter The basic information of employee</p>
                        <Row gutter={16}>
                            <Col xs={24} md={12}>
                                <Form.Item name="internalRole" label={<FieldLabel>Internal</FieldLabel>}>
                                    <Input size="large" placeholder="Eg. MS_1234567890" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="externalInsurerRole" label={<FieldLabel>External - Insurer</FieldLabel>}>
                                    <Input size="large" placeholder="Enter Employee Name" />
                                </Form.Item>
                            </Col>
                        </Row>
                    </FormSectionCard>

                    {/* Step 3 -- User Profile Details */}
                    <FormSectionCard ref={(el) => (sectionRefs.current[2] = el)} step={3} title="USER PROFILE DETAILS">
                        <p className="text-sm mt-0 mb-4" style={{ color: COLORS.textSecondary }}>Assign role, level &amp; reporting manager</p>
                        <Row gutter={16}>
                            <Col xs={24} md={12}>
                                <Form.Item name="userId" label={<FieldLabel>User ID</FieldLabel>} rules={[{ required: true }]}>
                                    <Input size="large" placeholder="Eg. MS_1234567890" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="branchOffice" label={<FieldLabel>Branch/Office</FieldLabel>}>
                                    <Input size="large" placeholder="Enter Employee Name" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="mobileNumber" label={<FieldLabel>Mobile Number</FieldLabel>}>
                                    <Input size="large" prefix="+91 " placeholder="1234567890" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="emailAddress" label={<FieldLabel>Email Address</FieldLabel>} rules={[{ type: 'email' }]}>
                                    <Input size="large" placeholder="Enter Employee Name" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="password" label={<FieldLabel>Set Password</FieldLabel>} rules={[{ required: true }]}>
                                    <Input.Password size="large" placeholder="Set Password" />
                                </Form.Item>
                            </Col>
                        </Row>
                    </FormSectionCard>

                    {/* Step 4 -- Organization */}
                    <FormSectionCard ref={(el) => (sectionRefs.current[3] = el)} step={4} title="ORGANIZATION">
                        <p className="text-sm mt-0 mb-4" style={{ color: COLORS.textSecondary }}>Assign role, level &amp; reporting manager</p>
                        <Row gutter={16}>
                            <Col xs={24} md={12}>
                                <Form.Item name="businessEntity" label={<FieldLabel>Business Entity</FieldLabel>}>
                                    <Input size="large" placeholder="Architectural Savvy" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="fullName" label={<FieldLabel>Full Name</FieldLabel>}>
                                    <Input size="large" placeholder="Metropolitan HQ" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="region" label={<FieldLabel>Region</FieldLabel>}>
                                    <Input size="large" placeholder="India" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="stateProvince" label={<FieldLabel>State/Province</FieldLabel>}>
                                    <Input size="large" placeholder="Maharashtra" />
                                </Form.Item>
                            </Col>
                        </Row>
                    </FormSectionCard>

                    {/* Step 5 -- Account Status */}
                    <FormSectionCard ref={(el) => (sectionRefs.current[4] = el)} step={5} title="ACCOUNT STATUS">
                        <p className="text-sm mt-0 mb-4" style={{ color: COLORS.textSecondary }}>Assign role, level &amp; reporting manager</p>
                        <div className="flex flex-wrap gap-4">
                            <StatusOptionCard
                                label="Active"
                                description="Users Can Access The System"
                                tone="positive"
                                selected={accountStatus === 'active'}
                                onSelect={() => setAccountStatus('active')}
                            />
                            <StatusOptionCard
                                label="Inactive"
                                description="Access Restricted"
                                tone="neutral"
                                selected={accountStatus === 'inactive'}
                                onSelect={() => setAccountStatus('inactive')}
                            />
                        </div>
                    </FormSectionCard>

                    <div className="flex justify-end">
                        <Button type="primary" size="large" htmlType="submit">Create Now</Button>
                    </div>
                </Form>
            </div>
        </div>
    );
};

export default InternalUserCreationPage;
