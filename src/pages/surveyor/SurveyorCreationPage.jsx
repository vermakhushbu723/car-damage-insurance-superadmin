import React, { useRef, useState } from 'react';
import { Form, Input, Select, DatePicker, Row, Col, Button, App } from 'antd';
import FormSectionCard from '../../components/insurer/FormSectionCard';
import StepNav from '../../components/insurer/StepNav';
import FieldLabel from '../../components/common/FieldLabel';
import UploadField from '../../components/common/UploadField';
import { COLORS } from '../../constants/theme';

const STEPS = ['Personal details', 'Irdai license details', 'Professional details', 'Banking details', 'Documents & photo', 'Platform & app access'];

const GENDER_OPTIONS = ['Male', 'Female', 'Other'].map((v) => ({ value: v, label: v }));
const LICENSE_CATEGORY_OPTIONS = ['Category A', 'Category B', 'Category C'].map((v) => ({ value: v, label: v }));
const EXPERIENCE_OPTIONS = ['0-1 yrs', '1-3 yrs', '3-5 yrs', '5+ yrs'].map((v) => ({ value: v, label: v }));

/**
 * "Surveyor" sidebar page -- the exact screen from the reference
 * screenshot ("SURVEYOR — Survey & Claims System"), reached directly (no
 * invented list page -- see no-invented-screens-from-mockups memory).
 * Same shell as the other creation forms in this app.
 */
const SurveyorCreationPage = () => {
    const { message } = App.useApp();
    const [form] = Form.useForm();
    const [activeStep, setActiveStep] = useState(1);
    const sectionRefs = useRef([]);

    const scrollToStep = (step) => {
        setActiveStep(step);
        sectionRefs.current[step - 1]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const handleFinish = (values) => {
        console.log('New surveyor payload:', values);
        message.success('Surveyor created successfully.');
        form.resetFields();
        setActiveStep(1);
    };

    return (
        <div className="p-4 md:p-8">
            <h1 className="text-2xl font-extrabold m-0" style={{ color: COLORS.headingBlue }}>SURVEYOR — Survey &amp; Claims System</h1>

            <div className="flex gap-8 items-start mt-6">
                <StepNav steps={STEPS} activeStep={activeStep} onStepClick={scrollToStep} />

                <Form form={form} layout="vertical" onFinish={handleFinish} className="flex-1 min-w-0" requiredMark={false}>
                    {/* Step 1 -- Personal Details */}
                    <FormSectionCard ref={(el) => (sectionRefs.current[0] = el)} step={1} title="PERSONAL DETAILS">
                        <Row gutter={16}>
                            <Col xs={24} md={12}>
                                <Form.Item name="fullName" label={<FieldLabel>Full name</FieldLabel>}>
                                    <Input size="large" placeholder="Eg. MS_1234567890" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="gender" label={<FieldLabel>Gender</FieldLabel>}>
                                    <Select size="large" placeholder="Gender" options={GENDER_OPTIONS} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="aadhaarNumber" label={<FieldLabel>Aadhaar number</FieldLabel>}>
                                    <Input size="large" placeholder="Aadhaar number" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="dateOfBirth" label={<FieldLabel>Date of birth</FieldLabel>}>
                                    <DatePicker size="large" style={{ width: '100%' }} format="DD-MM-YYYY" placeholder="DD-MM-YYYY" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="primaryContactNumber" label={<FieldLabel>Primary Contact Number</FieldLabel>}>
                                    <Input size="large" placeholder="Operating State" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="pan" label={<FieldLabel>PAN</FieldLabel>}>
                                    <Input size="large" placeholder="Eg: MSRTS7851G" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="registerAddress" label={<FieldLabel>Register Address</FieldLabel>}>
                                    <Input size="large" placeholder="Eg: Comapnyname@gmail.com" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="officialEmail" label={<FieldLabel>Official Email ID</FieldLabel>}>
                                    <Input size="large" placeholder="Eg: +91 1234567890" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="state" label={<FieldLabel>State</FieldLabel>}>
                                    <Input size="large" placeholder="Eg: +91 1234567890" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="pin" label={<FieldLabel>PIN</FieldLabel>}>
                                    <Input size="large" placeholder="6 Digit Code" />
                                </Form.Item>
                            </Col>
                        </Row>
                    </FormSectionCard>

                    {/* Step 2 -- IRDAI License Details */}
                    <FormSectionCard ref={(el) => (sectionRefs.current[1] = el)} step={2} title="IRDAI LICENSE DETAILS">
                        <Row gutter={16}>
                            <Col xs={24} md={12}>
                                <Form.Item name="irdaiLicenseNo" label={<FieldLabel>IRDAI surveyor license no</FieldLabel>}>
                                    <Input size="large" placeholder="Eg. MS_1234567890" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="licenseCategory" label={<FieldLabel>License category</FieldLabel>}>
                                    <Select size="large" placeholder="Gender" options={LICENSE_CATEGORY_OPTIONS} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="licenseCertificate" label={<FieldLabel>License certificate upload</FieldLabel>}>
                                    <UploadField placeholder="PDF or JPG; max 5MB" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="licenseIssueDate" label={<FieldLabel>License issue date</FieldLabel>}>
                                    <DatePicker size="large" style={{ width: '100%' }} format="DD-MM-YYYY" placeholder="DD-MM-YYYY" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="licenseExpiryDate" label={<FieldLabel>License expiry date</FieldLabel>}>
                                    <DatePicker size="large" style={{ width: '100%' }} format="DD-MM-YYYY" placeholder="DD-MM-YYYY" />
                                </Form.Item>
                            </Col>
                        </Row>
                    </FormSectionCard>

                    {/* Step 3 -- Professional Details */}
                    <FormSectionCard ref={(el) => (sectionRefs.current[2] = el)} step={3} title="PROFESSIONAL DETAILS">
                        <Row gutter={16}>
                            <Col xs={24} md={12}>
                                <Form.Item name="specialization" label={<FieldLabel>Specialization</FieldLabel>}>
                                    <Input size="large" placeholder="Eg. MS_1234567890" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="yearsOfExperience" label={<FieldLabel>Years of experience</FieldLabel>}>
                                    <Select size="large" placeholder="Years of experience" options={EXPERIENCE_OPTIONS} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="empanelledInsurers" label={<FieldLabel>Empanelled insurers</FieldLabel>}>
                                    <Input size="large" placeholder="Select from active insurers; min 1 required" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="serviceStates" label={<FieldLabel>Service states</FieldLabel>}>
                                    <Input size="large" placeholder="All Indian states" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="serviceDistricts" label={<FieldLabel>Service districts</FieldLabel>}>
                                    <Input size="large" placeholder="Select from active insurers; min 1 required" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="maxConcurrentSurveys" label={<FieldLabel>Max concurrent surveys</FieldLabel>}>
                                    <Input size="large" placeholder="Service states" />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item name="vehicleTypesHandled" label={<FieldLabel>Vehicle types handled</FieldLabel>}>
                                    <Input size="large" placeholder="2-Wheeler / 4-Wheeler Sedan / SUV / Commercial LCV / Commercial HCV / EV" />
                                </Form.Item>
                            </Col>
                        </Row>
                    </FormSectionCard>

                    {/* Step 4 -- Banking Details */}
                    <FormSectionCard ref={(el) => (sectionRefs.current[3] = el)} step={4} title="BANKING DETAILS">
                        <Row gutter={16}>
                            <Col xs={24} md={12}>
                                <Form.Item name="accountHolderName" label={<FieldLabel>Account holder name</FieldLabel>}>
                                    <Input size="large" placeholder="Eg. MS_1234567890" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="bankName" label={<FieldLabel>Bank name</FieldLabel>}>
                                    <Select size="large" placeholder="Years of experience" options={EXPERIENCE_OPTIONS} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="accountNumber" label={<FieldLabel>Account number</FieldLabel>}>
                                    <Input size="large" placeholder="Select from active insurers; min 1 required" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="ifscCode" label={<FieldLabel>IFSC code</FieldLabel>}>
                                    <Input size="large" placeholder="All Indian states" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="accountType" label={<FieldLabel>Account type</FieldLabel>}>
                                    <Input size="large" placeholder="Select from active insurers; min 1 required" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="cancelledCheque" label={<FieldLabel>Cancelled cheque / passbook</FieldLabel>}>
                                    <UploadField placeholder="Service states" />
                                </Form.Item>
                            </Col>
                        </Row>
                    </FormSectionCard>

                    {/* Step 5 -- Documents & Photo */}
                    <FormSectionCard ref={(el) => (sectionRefs.current[4] = el)} step={5} title="DOCUMENTS & PHOTO">
                        <Row gutter={16}>
                            <Col xs={24} md={12}>
                                <Form.Item name="profilePhoto" label={<FieldLabel>Profile photo</FieldLabel>}>
                                    <UploadField placeholder="JPG/PNG; max 1MB; face clearly visible; min 200×200px" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="idProof" label={<FieldLabel>ID proof</FieldLabel>}>
                                    <UploadField placeholder="Aadhaar / Passport / Voter ID — PDF or JPG; max 3MB" />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item name="addressProof" label={<FieldLabel>Address proof</FieldLabel>}>
                                    <UploadField placeholder="Utility bill / Aadhaar / Bank statement — max 3MB; not older than 3 months" />
                                </Form.Item>
                            </Col>
                        </Row>
                    </FormSectionCard>

                    {/* Step 6 -- Platform & App Access */}
                    <FormSectionCard ref={(el) => (sectionRefs.current[5] = el)} step={6} title="PLATFORM & APP ACCESS">
                        <Row gutter={16}>
                            <Col xs={24} md={12}>
                                <Form.Item name="platform" label={<FieldLabel>Platform</FieldLabel>}>
                                    <Input size="large" placeholder="Eg. MS_1234567890" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="appPermissions" label={<FieldLabel>App permissions</FieldLabel>}>
                                    <Input size="large" placeholder="Vehicle Survey / Pre-Inspection / Photo-Video Capture / Survey Report Submit / GPS Tracking" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="effectiveFrom" label={<FieldLabel>Effective from</FieldLabel>}>
                                    <Input size="large" placeholder="Select from active insurers; min 1 required" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="accountStatus" label={<FieldLabel>Account status</FieldLabel>}>
                                    <Input size="large" placeholder="Active / Inactive / Suspended / License Expired" />
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

export default SurveyorCreationPage;
