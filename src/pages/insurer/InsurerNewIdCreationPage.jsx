import React, { useRef, useState } from 'react';
import {
    Form, Input, Select, Row, Col, Button, Upload, Checkbox, Tag, Divider, ColorPicker, App,
} from 'antd';
import { UploadOutlined, PlusOutlined, MinusCircleOutlined, LinkOutlined } from '@ant-design/icons';
import FormSectionCard from '../../components/insurer/FormSectionCard';
import StepNav from '../../components/insurer/StepNav';
import FieldLabel from '../../components/common/FieldLabel';
import { COLORS } from '../../constants/theme';

const STEPS = [
    'Company Details',
    'Primary Admin ( National Manager )',
    'Branding',
    'Access Lifecycle',
    'Role Hierarchy',
    'Sub-user creation — all roles',
];

const ROLE_OPTIONS = ['Insurer', 'Broker', 'Surveyor', 'Workshop'].map((v) => ({ value: v, label: v }));
const ACCESS_ROLE_OPTIONS = ['Internal Claims Auditor', 'Regional Manager', 'Claims Handler'].map((v) => ({ value: v, label: v }));
const MODULE_PERMISSIONS = ['Clean Processing', 'Policy Endorsement', 'Financial Settlements', 'Dealer Management', 'Document Repository'];
const CLAIM_TYPES = ['Own Damage (OD)', 'Third Party', 'Theft Claims', 'Total Loss / Net Of Salvage', 'Commercial Glass Only'];
const SUB_USER_ROLE_OPTIONS = ['National Manager', 'Regional Manager', 'Claims Handler', 'Auditor'].map((v) => ({ value: v, label: v }));

/** Simple "chips + add" control for Multi-Religion Assignment -- a small, self-contained editable tag group (no form-library dependency needed for something this size). */
const EditableTagGroup = ({ value = [], onChange }) => {
    const [adding, setAdding] = useState(false);
    const [draft, setDraft] = useState('');

    const commitDraft = () => {
        const next = draft.trim();
        if (next && !value.includes(next)) onChange([...value, next]);
        setDraft('');
        setAdding(false);
    };

    return (
        <div className="flex flex-wrap items-center gap-2">
            {value.map((tag) => (
                <Tag key={tag} closable onClose={() => onChange(value.filter((v) => v !== tag))} color="blue" style={{ borderRadius: 999, padding: '2px 12px' }}>
                    {tag}
                </Tag>
            ))}
            {adding ? (
                <Input
                    size="small"
                    autoFocus
                    style={{ width: 120 }}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onBlur={commitDraft}
                    onPressEnter={commitDraft}
                />
            ) : (
                <Button size="small" type="dashed" icon={<PlusOutlined />} onClick={() => setAdding(true)}>Add</Button>
            )}
        </div>
    );
};

const InsurerNewIdCreationPage = () => {
    const { message } = App.useApp();
    const [form] = Form.useForm();
    const [activeStep, setActiveStep] = useState(1);
    const [religionTags, setReligionTags] = useState(['North-West', 'South-Central']);
    const [brandColor, setBrandColor] = useState('#004AC6');
    const sectionRefs = useRef([]);

    const scrollToStep = (step) => {
        setActiveStep(step);
        sectionRefs.current[step - 1]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const handleFinish = (values) => {
        console.log('New insurer payload:', { ...values, religionTags, brandColor });
        message.success('Insurer created successfully.');
        form.resetFields();
        setReligionTags(['North-West', 'South-Central']);
        setBrandColor('#004AC6');
        setActiveStep(1);
    };

    return (
        <div className="p-4 md:p-8">
            <h1 className="text-2xl font-extrabold mb-6" style={{ color: COLORS.headingBlue }}>INSURER  Survey &amp; Claims System</h1>

            <div className="flex gap-8 items-start">
                <StepNav steps={STEPS} activeStep={activeStep} onStepClick={scrollToStep} />

                <Form form={form} layout="vertical" onFinish={handleFinish} className="flex-1 min-w-0" requiredMark={false}>
                    {/* Step 1 -- Company Details */}
                    <FormSectionCard ref={(el) => (sectionRefs.current[0] = el)} step={1} title="COMPANY DETAILS">
                        <Row gutter={16}>
                            <Col span={24}>
                                <Form.Item name="role" label={<FieldLabel>Role</FieldLabel>} rules={[{ required: true, message: 'Select a role' }]}>
                                    <Select placeholder="Select Role" options={ROLE_OPTIONS} size="large" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="companyName" label={<FieldLabel>Company Name</FieldLabel>} rules={[{ required: true }]}>
                                    <Input size="large" placeholder="Eg. MS_1234567890" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="cin" label={<FieldLabel>CIN</FieldLabel>}>
                                    <Input size="large" placeholder="Enter Employee Name" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="irdaiLicense" label={<FieldLabel>IRDAI License</FieldLabel>}>
                                    <Input size="large" placeholder="Eg. MS_1234567890" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="insureType" label={<FieldLabel>Insure Type</FieldLabel>}>
                                    <Input size="large" placeholder="Enter Insure Type" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="gst" label={<FieldLabel>GST</FieldLabel>}>
                                    <Input size="large" placeholder="Enter GST Number" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="pan" label={<FieldLabel>PAN</FieldLabel>}>
                                    <Input size="large" placeholder="Enter PAN Number" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="contactNumber" label={<FieldLabel>Contact Number</FieldLabel>}>
                                    <Input size="large" prefix="+91 " placeholder="1234567890" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="officialEmail" label={<FieldLabel>Official Email</FieldLabel>} rules={[{ type: 'email' }]}>
                                    <Input size="large" placeholder="Enter official email" />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item name="registerAddress" label={<FieldLabel>Register Address</FieldLabel>}>
                                    <Input.TextArea rows={3} placeholder="Full Postal Address" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="state" label={<FieldLabel>State</FieldLabel>}>
                                    <Input size="large" placeholder="Enter State" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="pin" label={<FieldLabel>PIN</FieldLabel>}>
                                    <Input size="large" placeholder="6 Digit Pin" maxLength={6} />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item name="website" label={<FieldLabel>Website</FieldLabel>}>
                                    <Input size="large" placeholder="website URI" />
                                </Form.Item>
                            </Col>
                        </Row>
                    </FormSectionCard>

                    {/* Step 2 -- Primary Admin (National Manager) */}
                    <FormSectionCard ref={(el) => (sectionRefs.current[1] = el)} step={2} title="PRIMARY ADMIN ( NATIONAL MANAGER)">
                        <Row gutter={16}>
                            <Col xs={24} md={12}>
                                <Form.Item name="adminUserId" label={<FieldLabel>User ID</FieldLabel>}>
                                    <Input size="large" placeholder="Eg. MS_1234567890" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="branchOffice" label={<FieldLabel>Branch/Office</FieldLabel>}>
                                    <Input size="large" placeholder="Enter branch/office" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Divider className="my-3" />
                        <span className="block text-xs font-bold tracking-wide mb-3" style={{ color: COLORS.textMuted }}>ADDITIONAL CONTACTS</span>

                        <Form.List name="adminContacts" initialValue={[{}, {}, {}]}>
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map(({ key, name, ...rest }) => (
                                        <Row gutter={16} key={key} align="middle">
                                            <Col xs={24} md={11}>
                                                <Form.Item {...rest} name={[name, 'mobile']} label={<FieldLabel>Mobile Number</FieldLabel>}>
                                                    <Input size="large" prefix="+91 " placeholder="1234567890" />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} md={11}>
                                                <Form.Item {...rest} name={[name, 'email']} label={<FieldLabel>Email Address</FieldLabel>} rules={[{ type: 'email' }]}>
                                                    <Input size="large" placeholder="Enter email address" />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} md={2} className="flex justify-end">
                                                {fields.length > 1 && (
                                                    <Button type="text" danger icon={<MinusCircleOutlined />} onClick={() => remove(name)} />
                                                )}
                                            </Col>
                                        </Row>
                                    ))}
                                    <Button type="dashed" icon={<PlusOutlined />} onClick={() => add()}>Add Contact</Button>
                                </>
                            )}
                        </Form.List>
                    </FormSectionCard>

                    {/* Step 3 -- Branding */}
                    <FormSectionCard ref={(el) => (sectionRefs.current[2] = el)} step={3} title="BRANDING">
                        <Row gutter={32}>
                            <Col xs={24} md={12}>
                                <FieldLabel>Upload Logo</FieldLabel>
                                <Upload.Dragger showUploadList={{ showRemoveIcon: true }} maxCount={1} beforeUpload={() => false}>
                                    <p className="m-0 flex justify-center" style={{ color: COLORS.primary, fontSize: 22 }}><UploadOutlined /></p>
                                    <p className="m-0 mt-2 text-sm font-semibold" style={{ color: COLORS.textPrimary }}>Upload Logo</p>
                                </Upload.Dragger>
                            </Col>
                            <Col xs={24} md={12}>
                                <span className="block text-xs font-bold tracking-wide mb-2" style={{ color: COLORS.primary }}>PRIMARY BRAND COLOUR</span>
                                <div className="flex items-center gap-3">
                                    <ColorPicker value={brandColor} onChange={(c) => setBrandColor(c.toHexString())} />
                                    <Input size="large" value={brandColor} onChange={(e) => setBrandColor(e.target.value)} style={{ width: 140 }} />
                                </div>
                            </Col>
                        </Row>
                    </FormSectionCard>

                    {/* Step 4 -- Access Lifecycle / System Access Configuration */}
                    <FormSectionCard ref={(el) => (sectionRefs.current[3] = el)} step={4} title="SYSTEM ACCESS CONFIGURATION">
                        <Row gutter={24}>
                            <Col xs={24} md={8}>
                                <Form.Item name="accessRole" label={<FieldLabel>Role</FieldLabel>}>
                                    <Select placeholder="Internal Claims Auditor" options={ACCESS_ROLE_OPTIONS} size="large" />
                                </Form.Item>
                                <Tag icon={<LinkOutlined />} color="blue" style={{ marginBottom: 16 }}>National_Admin_HQ_01</Tag>

                                <span className="block text-xs font-bold tracking-wide mb-2 mt-2" style={{ color: COLORS.textMuted }}>MULTI-RELIGION ASSIGNMENT</span>
                                <EditableTagGroup value={religionTags} onChange={setReligionTags} />
                            </Col>

                            <Col xs={24} md={8}>
                                <span className="block text-xs font-bold tracking-wide mb-2" style={{ color: COLORS.textMuted }}>MODULE PERMISSION</span>
                                <Form.Item name="modulePermissions" initialValue={['Clean Processing', 'Policy Endorsement', 'Document Repository']}>
                                    <Checkbox.Group className="flex flex-col gap-2">
                                        {MODULE_PERMISSIONS.map((p) => <Checkbox key={p} value={p}>{p}</Checkbox>)}
                                    </Checkbox.Group>
                                </Form.Item>
                            </Col>

                            <Col xs={24} md={8}>
                                <span className="block text-xs font-bold tracking-wide mb-2" style={{ color: COLORS.textMuted }}>CLAIM TYPES ACCESSIBLE</span>
                                <Form.Item name="claimTypes" initialValue={['Own Damage (OD)', 'Third Party', 'Commercial Glass Only']}>
                                    <Checkbox.Group className="flex flex-col gap-2">
                                        {CLAIM_TYPES.map((c) => <Checkbox key={c} value={c}>{c}</Checkbox>)}
                                    </Checkbox.Group>
                                </Form.Item>
                            </Col>
                        </Row>
                    </FormSectionCard>

                    {/* Step 5 -- Role Hierarchy */}
                    <FormSectionCard ref={(el) => (sectionRefs.current[4] = el)} step={5} title="ROLE HIERARCHY">
                        <Form.List name="roleHierarchy" initialValue={[{ role: 'National Manager', reportsTo: '—' }, { role: 'Regional Manager', reportsTo: 'National Manager' }]}>
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map(({ key, name, ...rest }) => (
                                        <Row gutter={16} key={key} align="middle">
                                            <Col xs={24} md={11}>
                                                <Form.Item {...rest} name={[name, 'role']} label={<FieldLabel>Role</FieldLabel>}>
                                                    <Select placeholder="Select role" options={SUB_USER_ROLE_OPTIONS} size="large" />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} md={11}>
                                                <Form.Item {...rest} name={[name, 'reportsTo']} label={<FieldLabel>Reports To</FieldLabel>}>
                                                    <Input size="large" placeholder="Reports to" />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} md={2} className="flex justify-end">
                                                <Button type="text" danger icon={<MinusCircleOutlined />} onClick={() => remove(name)} />
                                            </Col>
                                        </Row>
                                    ))}
                                    <Button type="dashed" icon={<PlusOutlined />} onClick={() => add()}>Add Role Level</Button>
                                </>
                            )}
                        </Form.List>
                    </FormSectionCard>

                    {/* Step 6 -- Sub-user creation, all roles */}
                    <FormSectionCard ref={(el) => (sectionRefs.current[5] = el)} step={6} title="SUB-USER CREATION — ALL ROLES">
                        <Form.List name="subUsers" initialValue={[{}]}>
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map(({ key, name, ...rest }) => (
                                        <Row gutter={16} key={key} align="middle">
                                            <Col xs={24} md={7}>
                                                <Form.Item {...rest} name={[name, 'name']} label={<FieldLabel>Name</FieldLabel>}>
                                                    <Input size="large" placeholder="Full name" />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} md={7}>
                                                <Form.Item {...rest} name={[name, 'role']} label={<FieldLabel>Role</FieldLabel>}>
                                                    <Select placeholder="Select role" options={SUB_USER_ROLE_OPTIONS} size="large" />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} md={8}>
                                                <Form.Item {...rest} name={[name, 'email']} label={<FieldLabel>Email Address</FieldLabel>} rules={[{ type: 'email' }]}>
                                                    <Input size="large" placeholder="Enter email address" />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} md={2} className="flex justify-end">
                                                {fields.length > 1 && (
                                                    <Button type="text" danger icon={<MinusCircleOutlined />} onClick={() => remove(name)} />
                                                )}
                                            </Col>
                                        </Row>
                                    ))}
                                    <Button type="dashed" icon={<PlusOutlined />} onClick={() => add()}>Add Sub-user</Button>
                                </>
                            )}
                        </Form.List>
                    </FormSectionCard>

                    <div className="flex justify-end">
                        <Button type="primary" size="large" htmlType="submit">Create Now</Button>
                    </div>
                </Form>
            </div>
        </div>
    );
};

export default InsurerNewIdCreationPage;
