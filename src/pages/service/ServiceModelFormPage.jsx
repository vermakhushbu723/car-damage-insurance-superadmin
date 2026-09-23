import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Input, InputNumber, Select, AutoComplete, TimePicker, Button, Row, Col, Result, App } from 'antd';
import dayjs from 'dayjs';
import PageTitle from '../../components/ui/PageTitle';
import StatusTag from '../../components/ui/StatusTag';
import { useCollection, useAuditLog, newId } from '../../store/DataStore';
import { ROUTES } from '../../constants/routes';
import { SERVICE_TYPES, APPLICABLE_FOR } from '../../data/seed';
import { COLORS } from '../../constants/theme';

const NAME_SUGGESTIONS = ['Motor Claims', 'Health Claims', 'Policy Renewal', 'Survey and Inspection', 'Customer support', 'Claim Settlement', 'Endorsement', 'Pre-Inspection'];
const ESCALATION_AFTER = ['6 Hours', '12 Hours', '24 Hours', '48 Hours', '72 Hours'];
const ESCALATION_TO = ['Senior Claims Manager', 'Regional Manager', 'National Manager', 'HO/Admin'];
const PRIORITIES = ['High', 'Medium', 'Low'];
const STATUSES = ['Active', 'Pending', 'Suspended'];
const opts = (l) => l.map((v) => ({ value: v, label: v }));
const TIME_FMT = 'hh:mm A';

const Label = ({ children }) => (
    <span className="text-[14px] font-semibold" style={{ color: COLORS.textPrimary }}>{children} <span style={{ color: COLORS.danger }}>*</span></span>
);
const req = (msg) => [{ required: true, message: msg }];

/** Add Service Model (and view/edit an existing one at /service-models/:id). */
const ServiceModelFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { message } = App.useApp();
    const log = useAuditLog();
    const { items: models, add, update } = useCollection('serviceModels');
    const [form] = Form.useForm();
    const existing = id ? models.find((m) => m.id === id) : null;

    useEffect(() => {
        if (!existing) return;
        const [from, to] = existing.workingHours.split(' - ');
        form.setFieldsValue({ ...existing, workingHours: [dayjs(from, TIME_FMT), dayjs(to, TIME_FMT)] });
    }, [existing?.id]); // eslint-disable-line react-hooks/exhaustive-deps

    if (id && !existing) {
        return <Result status="404" title="Service model not found" extra={<Button type="primary" onClick={() => navigate(ROUTES.SERVICE_MODELS)}>Back to Service Model</Button>} />;
    }

    const onFinish = (v) => {
        const record = {
            name: v.name.trim(),
            serviceType: v.serviceType,
            applicableFor: v.applicableFor,
            description: v.description ?? '',
            sla: v.sla,
            workingHours: `${v.workingHours[0].format(TIME_FMT)} - ${v.workingHours[1].format(TIME_FMT)}`,
            escalationAfter: v.escalationAfter,
            escalationTo: v.escalationTo,
            priority: v.priority,
            status: v.status ?? existing?.status ?? 'Active',
            lastUploaded: new Date().toISOString(),
        };
        if (existing) {
            update(existing.id, record);
            log('Updated', 'Settings');
            message.success(`${record.name} updated.`);
        } else {
            add({ id: newId('SM'), ...record });
            log('Created', 'Settings');
            message.success(`${record.name} created.`);
        }
        navigate(ROUTES.SERVICE_MODELS);
    };

    return (
        <div className="max-w-[1100px]">
            <PageTitle
                title={existing ? existing.name : 'Add Service Model'}
                extra={existing && <StatusTag status={existing.status} />}
                className="mb-2"
            />

            <Form
                form={form}
                layout="vertical"
                requiredMark={false}
                onFinish={onFinish}
                onFinishFailed={() => message.error('Please fill all required fields.')}
                initialValues={{ applicableFor: 'Motor', sla: 48, escalationAfter: '24 Hours', escalationTo: 'Senior Claims Manager', priority: 'High', workingHours: [dayjs('09:00 AM', TIME_FMT), dayjs('06:00 PM', TIME_FMT)] }}
            >
                <h2 className="text-lg font-semibold mt-2 mb-2" style={{ color: COLORS.headingBlue }}>Basic Details</h2>
                <div className="rounded-lg p-4 md:p-5 mb-5" style={{ border: `1px solid ${COLORS.border}` }}>
                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Form.Item name="name" label={<Label>Service Model Name</Label>} rules={[...req('Enter or select a service model name'), { whitespace: true, message: 'Name cannot be blank' }]}>
                                <AutoComplete options={opts(NAME_SUGGESTIONS)} placeholder="Select Service  Model" filterOption={(input, o) => o.value.toLowerCase().includes(input.toLowerCase())} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item name="serviceType" label={<Label>Service Type</Label>} rules={req('Select a service type')}>
                                <Select placeholder="Select Service  Type" options={opts(SERVICE_TYPES)} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item name="applicableFor" label={<Label>Applicable For</Label>} rules={req('Select where it applies')}>
                                <Select placeholder="Motor" options={opts(APPLICABLE_FOR)} />
                            </Form.Item>
                        </Col>
                        {existing && (
                            <Col xs={24} md={12}>
                                <Form.Item name="status" label={<Label>Status</Label>}>
                                    <Select options={opts(STATUSES)} />
                                </Form.Item>
                            </Col>
                        )}
                        <Col span={24}>
                            <Form.Item name="description" label={<span className="text-[14px] font-semibold">Description</span>}>
                                <Input.TextArea rows={5} placeholder="Enter Service Model  Description" maxLength={500} showCount />
                            </Form.Item>
                        </Col>
                    </Row>
                </div>

                <h2 className="text-lg font-semibold mt-2 mb-2" style={{ color: COLORS.headingBlue }}>SLA Work Flow</h2>
                <div className="rounded-lg p-4 md:p-5 mb-5" style={{ border: `1px solid ${COLORS.border}` }}>
                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Form.Item name="sla" label={<Label>SLA/TAT</Label>} rules={req('Enter the SLA in hours')}>
                                <InputNumber min={1} max={720} suffix="Hours" placeholder="48 Hours" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item name="workingHours" label={<Label>Working Hours</Label>} rules={req('Select working hours')}>
                                <TimePicker.RangePicker format={TIME_FMT} use12Hours minuteStep={15} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item name="escalationAfter" label={<Label>Escalation After</Label>} rules={req('Select escalation time')}>
                                <Select placeholder="24 Hours" options={opts(ESCALATION_AFTER)} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item name="escalationTo" label={<Label>Escalation To</Label>} rules={req('Select who to escalate to')}>
                                <Select placeholder="Senior Claims Manager" options={opts(ESCALATION_TO)} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item name="priority" label={<Label>Priority</Label>} rules={req('Select a priority')}>
                                <Select placeholder="High" options={opts(PRIORITIES)} />
                            </Form.Item>
                        </Col>
                    </Row>
                </div>

                <div className="flex justify-end gap-3 mb-4">
                    <Button onClick={() => navigate(ROUTES.SERVICE_MODELS)}>Cancel</Button>
                    <Button type="primary" htmlType="submit" className="min-w-[180px]">{existing ? 'Update Service Model' : 'Create Service Model'}</Button>
                </div>
            </Form>
        </div>
    );
};

export default ServiceModelFormPage;
