import React, { useRef, useState } from 'react';
import { Form, Input, Select, DatePicker, Row, Col, Button, App } from 'antd';
import FormSectionCard from '../../components/insurer/FormSectionCard';
import StepNav from '../../components/insurer/StepNav';
import FieldLabel from '../../components/common/FieldLabel';
import UploadField from '../../components/common/UploadField';
import { COLORS } from '../../constants/theme';

const STEPS = ['Workshop', 'Empanelment', 'Platform & Access', 'Primery User'];

/**
 * "Workshop" sidebar page -- the exact screen from the reference
 * screenshot ("WORKSHOP — Survey & Claims System | Field Specification"),
 * reached directly (no invented list page in between -- see
 * no-invented-screens-from-mockups memory). Same shell as
 * InsurerNewIdCreationPage/InternalUserCreationPage.
 */
const WorkshopCreationPage = () => {
    const { message } = App.useApp();
    const [form] = Form.useForm();
    const [activeStep, setActiveStep] = useState(1);
    const sectionRefs = useRef([]);

    const scrollToStep = (step) => {
        setActiveStep(step);
        sectionRefs.current[step - 1]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const handleFinish = (values) => {
        console.log('New workshop payload:', values);
        message.success('Workshop created successfully.');
        form.resetFields();
        setActiveStep(1);
    };

    return (
        <div className="p-4 md:p-8">
            <h1 className="text-2xl font-extrabold m-0" style={{ color: COLORS.headingBlue }}>
                WORKSHOP — Survey &amp; Claims System | Field Specification
            </h1>

            <div className="flex gap-8 items-start mt-6">
                <StepNav steps={STEPS} activeStep={activeStep} onStepClick={scrollToStep} />

                <Form form={form} layout="vertical" onFinish={handleFinish} className="flex-1 min-w-0" requiredMark={false}>
                    {/* Step 1 -- Workshop Details */}
                    <FormSectionCard ref={(el) => (sectionRefs.current[0] = el)} step={1} title="WORKSHOP DETAILS">
                        <Row gutter={16}>
                            <Col xs={24} md={12}>
                                <Form.Item name="workshopName" label={<FieldLabel>Workshop / garage name</FieldLabel>}>
                                    <Input size="large" placeholder="Eg. MS_1234567890" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="workshopType" label={<FieldLabel>Workshop type</FieldLabel>}>
                                    <Select size="large" placeholder="Gender" options={['Authorised', 'Multi-Brand', 'Body Shop'].map((v) => ({ value: v, label: v }))} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="brandOemAuthorisedFor" label={<FieldLabel>Brand / OEM authorised for</FieldLabel>}>
                                    <Input size="large" placeholder="Aadhaar number" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="registrationGstNo" label={<FieldLabel>Registration no. / GST no.</FieldLabel>}>
                                    <DatePicker size="large" style={{ width: '100%' }} format="DD-MM-YYYY" placeholder="DD-MM-YYYY" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="ownerName" label={<FieldLabel>Owner / proprietor name</FieldLabel>}>
                                    <Input size="large" placeholder="Operating State" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="pan" label={<FieldLabel>PAN</FieldLabel>}>
                                    <Input size="large" placeholder="Eg: MSRTS7851G" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="primaryContactName" label={<FieldLabel>Primary contact name</FieldLabel>}>
                                    <Input size="large" placeholder="Eg: Comapnyname@gmail.com" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="officialEmail" label={<FieldLabel>Official Email ID</FieldLabel>}>
                                    <Input size="large" placeholder="Eg: +91 1234567890" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="mobileNumber" label={<FieldLabel>Mobile number</FieldLabel>}>
                                    <Input size="large" placeholder="Eg: +91 1234567890" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="alternateMobile" label={<FieldLabel>Alternate mobile</FieldLabel>}>
                                    <Input size="large" placeholder="6 Digit Code" />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item name="workshopAddress" label={<FieldLabel>Workshop address</FieldLabel>}>
                                    <Input size="large" placeholder="6 Digit Code" />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item name="cityDistrict" label={<FieldLabel>City / District</FieldLabel>}>
                                    <Input size="large" placeholder="6 Digit Code" />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item name="googleMapsLink" label={<FieldLabel>Google Maps link / geo-location</FieldLabel>}>
                                    <Input size="large" placeholder="6 Digit Code" />
                                </Form.Item>
                            </Col>
                        </Row>
                    </FormSectionCard>

                    {/* Step 2 -- Empanelment */}
                    <FormSectionCard ref={(el) => (sectionRefs.current[1] = el)} step={2} title="EMPANELMENT">
                        <Row gutter={16}>
                            <Col xs={24} md={12}>
                                <Form.Item name="empanelledInsurers" label={<FieldLabel>Empanelled insurers</FieldLabel>}>
                                    <Input size="large" placeholder="Eg. MS_1234567890" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="empanelmentCode" label={<FieldLabel>Empanelment code (per insurer)</FieldLabel>}>
                                    <Select size="large" placeholder="Gender" options={['Auto', 'Manual'].map((v) => ({ value: v, label: v }))} />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item name="empanelmentValidUpto" label={<FieldLabel>Empanelment valid upto</FieldLabel>}>
                                    <UploadField placeholder="PDF or JPG; max 5MB" />
                                </Form.Item>
                            </Col>
                        </Row>
                    </FormSectionCard>

                    {/* Step 3 -- Platform & Access */}
                    <FormSectionCard ref={(el) => (sectionRefs.current[2] = el)} step={3} title="PLATFORM & APP ACCESS">
                        <Row gutter={16}>
                            <Col xs={24} md={12}>
                                <Form.Item name="platform" label={<FieldLabel>Platform</FieldLabel>}>
                                    <Input size="large" placeholder="Eg. MS_1234567890" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="appPermissions" label={<FieldLabel>App permissions</FieldLabel>}>
                                    <Select size="large" placeholder="Years of experience" options={['Job Card', 'Estimate', 'Photo Upload', 'Status Update'].map((v) => ({ value: v, label: v }))} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="effectiveFrom" label={<FieldLabel>Effective from</FieldLabel>}>
                                    <Input size="large" placeholder="Select from active insurers; min 1 required" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="accountStatus" label={<FieldLabel>Account status</FieldLabel>}>
                                    <Input size="large" placeholder="All Indian states" />
                                </Form.Item>
                            </Col>
                        </Row>
                    </FormSectionCard>

                    {/* Step 4 -- Primary User / Workshop In-charge */}
                    <FormSectionCard ref={(el) => (sectionRefs.current[3] = el)} step={4} title="PRIMARY USER — WORKSHOP IN-CHARGE">
                        <Row gutter={16}>
                            <Col xs={24} md={12}>
                                <Form.Item name="inchargeName" label={<FieldLabel>In-charge name</FieldLabel>}>
                                    <Input size="large" placeholder="Eg. MS_1234567890" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="inchargeMobile" label={<FieldLabel>Mobile</FieldLabel>}>
                                    <Select size="large" placeholder="Years of experience" options={['0-1 yrs', '1-3 yrs', '3-5 yrs', '5+ yrs'].map((v) => ({ value: v, label: v }))} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="designation" label={<FieldLabel>Designation</FieldLabel>}>
                                    <Input size="large" placeholder="Select from active insurers; min 1 required" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="employeeId" label={<FieldLabel>Employee ID</FieldLabel>}>
                                    <Input size="large" placeholder="All Indian states" />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item name="tempPassword" label={<FieldLabel>Temp PIN / password</FieldLabel>}>
                                    <Input.Password size="large" placeholder="Select from active insurers; min 1 required" />
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

export default WorkshopCreationPage;
