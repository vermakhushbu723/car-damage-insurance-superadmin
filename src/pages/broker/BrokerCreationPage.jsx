import React, { useRef, useState } from 'react';
import { Form, Input, Select, DatePicker, InputNumber, Switch, Upload, Row, Col, Button, App } from 'antd';
import { UploadOutlined, LinkOutlined } from '@ant-design/icons';
import FormSectionCard from '../../components/insurer/FormSectionCard';
import StepNav from '../../components/insurer/StepNav';
import FieldLabel from '../../components/common/FieldLabel';
import { COLORS } from '../../constants/theme';

const STEPS = ['Firm Details', 'Logo', 'Empanelment', 'Platform Access', 'Role Hierarchy', 'Primary Admin', 'Sub User Creation'];

const BROKER_TYPE_OPTIONS = ['Direct Broker', 'Reinsurance Broker', 'Composite Broker'].map((v) => ({ value: v, label: v }));
const ROLE_OPTIONS = ['National Manager', 'Regional Manager', 'Branch Manager'].map((v) => ({ value: v, label: v }));
const GEOGRAPHY_OPTIONS = ['North-West', 'South-Central', 'East', 'North-East'].map((v) => ({ value: v, label: v }));

const ROLE_TOGGLES = [
    { key: 'nationalManager', label: 'National Manager (HO)' },
    { key: 'hubManager', label: 'Hub Manager' },
    { key: 'regionalManager', label: 'Regional Manager' },
    { key: 'branchManager', label: 'Branch Manager' },
    { key: 'stateManager', label: 'State Manager' },
];

/**
 * "Broker" sidebar page -- the exact screen from the reference screenshot
 * ("BROKER — Survey & Claims System"), reached directly (no invented list
 * page -- see no-invented-screens-from-mockups memory). Same shell as the
 * other creation forms in this app.
 */
const BrokerCreationPage = () => {
    const { message } = App.useApp();
    const [form] = Form.useForm();
    const [activeStep, setActiveStep] = useState(1);
    const sectionRefs = useRef([]);

    const scrollToStep = (step) => {
        setActiveStep(step);
        sectionRefs.current[step - 1]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const handleFinish = (values) => {
        console.log('New broker payload:', values);
        message.success('Broker created successfully.');
        form.resetFields();
        setActiveStep(1);
    };

    return (
        <div className="p-4 md:p-8">
            <h1 className="text-2xl font-extrabold m-0" style={{ color: COLORS.headingBlue }}>BROKER — Survey &amp; Claims System</h1>

            <div className="flex gap-8 items-start mt-6">
                <StepNav steps={STEPS} activeStep={activeStep} onStepClick={scrollToStep} />

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleFinish}
                    className="flex-1 min-w-0"
                    requiredMark={false}
                    initialValues={{
                        nationalManager: true, hubManager: true, regionalManager: true, branchManager: true, stateManager: true,
                    }}
                >
                    {/* Step 1 -- Firm Details */}
                    <FormSectionCard ref={(el) => (sectionRefs.current[0] = el)} step={1} title="FIRM DETAILS">
                        <Row gutter={16}>
                            <Col xs={24} md={12}>
                                <Form.Item name="broker" label={<FieldLabel>Broker</FieldLabel>}>
                                    <Input size="large" placeholder="Eg. MS_1234567890" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="brokerType" label={<FieldLabel>Broker Type</FieldLabel>}>
                                    <Select size="large" placeholder="Broker Type" options={BROKER_TYPE_OPTIONS} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="irdaiBrokerLicenseNumber" label={<FieldLabel>IRDAI Broker License Number</FieldLabel>}>
                                    <Input size="large" placeholder="Eg. MS_1234567890" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="licenseExpDate" label={<FieldLabel>License Exp Date</FieldLabel>}>
                                    <DatePicker size="large" style={{ width: '100%' }} format="DD-MM-YYYY" placeholder="License Exp Date" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="cinNumber" label={<FieldLabel>CIN Number</FieldLabel>}>
                                    <Input size="large" placeholder="Eg. MS_1234567890" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="pan" label={<FieldLabel>PAN</FieldLabel>}>
                                    <Input size="large" placeholder="Eg: MSRTS7851G" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="gstNumber" label={<FieldLabel>GST Number</FieldLabel>}>
                                    <Input size="large" placeholder="Eg: Comapnyname@gmail.com" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="officialEmail" label={<FieldLabel>Official Email ID</FieldLabel>}>
                                    <Input size="large" placeholder="Eg: +91 1234567890" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="primaryContactNumber" label={<FieldLabel>Primary Contact Number</FieldLabel>}>
                                    <Input size="large" placeholder="Operating State" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="websiteUrl" label={<FieldLabel>Website URL</FieldLabel>}>
                                    <Input size="large" placeholder="Website Link" suffix={<LinkOutlined style={{ color: COLORS.textMuted }} />} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="registerAddress" label={<FieldLabel>Register Address</FieldLabel>}>
                                    <Input size="large" placeholder="Eg: Comapnyname@gmail.com" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="state" label={<FieldLabel>State</FieldLabel>}>
                                    <Input size="large" placeholder="Eg: +91 1234567890" />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item name="pin" label={<FieldLabel>PIN</FieldLabel>}>
                                    <Input size="large" placeholder="6 Digit Code" />
                                </Form.Item>
                            </Col>
                        </Row>
                    </FormSectionCard>

                    {/* Step 2 -- Logo */}
                    <FormSectionCard ref={(el) => (sectionRefs.current[1] = el)} step={2} title="LOGO">
                        <Upload.Dragger showUploadList={{ showRemoveIcon: true }} maxCount={1} beforeUpload={() => false} style={{ padding: '32px 0' }}>
                            <p className="m-0 flex justify-center" style={{ color: COLORS.primary, fontSize: 28 }}><UploadOutlined /></p>
                            <p className="m-0 mt-2 text-sm font-semibold" style={{ color: COLORS.textPrimary }}>Upload Logo In Png Or Jpeg Format</p>
                        </Upload.Dragger>
                    </FormSectionCard>

                    {/* Step 3 -- Empanelment */}
                    <FormSectionCard ref={(el) => (sectionRefs.current[2] = el)} step={3} title="EMPANELMENT">
                        <Row gutter={16}>
                            <Col xs={24} md={12}>
                                <Form.Item name="linesOfBusiness" label={<FieldLabel>Lines of business</FieldLabel>}>
                                    <Input size="large" placeholder="Eg. MS_1234567890" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="empanelledInsurers" label={<FieldLabel>Empanelled insurers</FieldLabel>}>
                                    <Select size="large" placeholder="Broker Type" options={BROKER_TYPE_OPTIONS} />
                                </Form.Item>
                            </Col>
                        </Row>
                    </FormSectionCard>

                    {/* Step 4 -- Platform Access */}
                    <FormSectionCard ref={(el) => (sectionRefs.current[3] = el)} step={4} title="PLATFORM ACCESS">
                        <Row gutter={16}>
                            <Col span={24}>
                                <Form.Item name="platform" label={<FieldLabel>Platform</FieldLabel>}>
                                    <Input size="large" placeholder="Static — Web only" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="effectiveFrom" label={<FieldLabel>Effective from</FieldLabel>}>
                                    <DatePicker size="large" style={{ width: '100%' }} placeholder="Date picker" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="expiryDate" label={<FieldLabel>Expiry date</FieldLabel>}>
                                    <DatePicker size="large" style={{ width: '100%' }} placeholder="Date picker" />
                                </Form.Item>
                            </Col>
                        </Row>
                    </FormSectionCard>

                    {/* Step 5 -- Role Hierarchy */}
                    <FormSectionCard ref={(el) => (sectionRefs.current[4] = el)} step={5} title="ROLE HIERARCHY">
                        <Row gutter={[16, 16]}>
                            {ROLE_TOGGLES.map((toggle) => (
                                <Col xs={24} md={12} key={toggle.key}>
                                    <Form.Item name={toggle.key} valuePropName="checked" className="!mb-0">
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-semibold" style={{ color: COLORS.textPrimary }}>{toggle.label}</span>
                                            <Switch defaultChecked />
                                        </div>
                                    </Form.Item>
                                </Col>
                            ))}
                            <Col xs={24} md={12}>
                                <Form.Item name="maxUsersPerRole" label={<FieldLabel>Max users per role</FieldLabel>} className="mt-3">
                                    <InputNumber size="large" style={{ width: '100%' }} placeholder="Number" />
                                </Form.Item>
                            </Col>
                        </Row>
                    </FormSectionCard>

                    {/* Step 6 -- Primary Admin */}
                    <FormSectionCard ref={(el) => (sectionRefs.current[5] = el)} step={6} title="PRIMARY ADMIN">
                        <Row gutter={16}>
                            <Col span={24}>
                                <Form.Item name="adminFullName" label={<FieldLabel>Admin full name</FieldLabel>}>
                                    <Input size="large" placeholder="Eg. MS_1234567890" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="employeeId" label={<FieldLabel>Employee ID</FieldLabel>}>
                                    <Input size="large" placeholder="Eg: Comapnyname@gmail.com" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="adminEmail" label={<FieldLabel>Admin email</FieldLabel>}>
                                    <Input size="large" placeholder="Eg: +91 1234567890" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="adminMobileNumber" label={<FieldLabel>Admin mobile Number</FieldLabel>}>
                                    <Input size="large" placeholder="Operating State" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="designation" label={<FieldLabel>Designation</FieldLabel>}>
                                    <Input size="large" placeholder="Website Link" suffix={<LinkOutlined style={{ color: COLORS.textMuted }} />} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="linkedInsurers" label={<FieldLabel>Linked insurers</FieldLabel>}>
                                    <Input size="large" placeholder="Eg: Comapnyname@gmail.com" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="tempPassword" label={<FieldLabel>Temp password</FieldLabel>}>
                                    <Input.Password size="large" placeholder="Temp password" />
                                </Form.Item>
                            </Col>
                        </Row>
                    </FormSectionCard>

                    {/* Step 7 -- Sub-user Creation */}
                    <FormSectionCard ref={(el) => (sectionRefs.current[6] = el)} step={7} title="SUB-USER CREATION">
                        <Row gutter={16}>
                            <Col xs={24} md={12}>
                                <Form.Item name="subUserRole" label={<FieldLabel>Role</FieldLabel>}>
                                    <Select size="large" placeholder="Select Role" options={ROLE_OPTIONS} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="parentUser" label={<FieldLabel>Parent user</FieldLabel>}>
                                    <Input size="large" placeholder="Website Link" suffix={<LinkOutlined style={{ color: COLORS.textMuted }} />} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="geographyAssignment" label={<FieldLabel>Geography assignment</FieldLabel>}>
                                    <Select size="large" placeholder="Select" options={GEOGRAPHY_OPTIONS} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="moduleAccess" label={<FieldLabel>Module access</FieldLabel>}>
                                    <Input size="large" placeholder="Website Link" suffix={<LinkOutlined style={{ color: COLORS.textMuted }} />} />
                                </Form.Item>
                            </Col>
                        </Row>
                    </FormSectionCard>

                    <div className="flex justify-end">
                        <Button type="primary" size="large" htmlType="submit">Create Now</Button>
                    </div>
                </Form>
            </div>
        </div>
    );
};

export default BrokerCreationPage;
