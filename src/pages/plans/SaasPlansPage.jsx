import React, { useMemo, useState } from 'react';
import { Button, Modal, Form, Input, InputNumber, Select, App } from 'antd';
import { CheckCircleFilled, FileTextOutlined, UserSwitchOutlined, ClockCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import PageTitle from '../../components/ui/PageTitle';
import StatCard from '../../components/ui/StatCard';
import { useCollection, useAuditLog } from '../../store/DataStore';
import { COLORS } from '../../constants/theme';
import { TODAY } from '../../data/seed';
import { formatNumber } from '../../utils/format';

/**
 * SaaS Plans & Subscription. KPIs are computed from organizations' plans;
 * "Edit Plan" edits price/limit/features, "Select Plan" assigns the plan to
 * one or more organizations (which moves the KPIs and the org list's
 * Subscription column).
 */
const SaasPlansPage = () => {
    const { message } = App.useApp();
    const log = useAuditLog();
    const { items: plans, update: updatePlan } = useCollection('plans');
    const { items: orgs, updateMany } = useCollection('organizations');
    const [editPlan, setEditPlan] = useState(null);
    const [assignPlan, setAssignPlan] = useState(null);
    const [editForm] = Form.useForm();
    const [assignForm] = Form.useForm();

    const kpi = useMemo(() => {
        const now = dayjs(TODAY);
        const subscribed = orgs.filter((o) => o.plan);
        const active = subscribed.filter((o) => o.status === 'Active');
        const expiring = subscribed.filter((o) => {
            const d = dayjs(o.subscriptionExpiry).diff(now, 'day');
            return d >= 0 && d <= 30;
        });
        // Custom plans have no list price -- count them at the Enterprise rate.
        const priceOf = (id) => plans.find((p) => p.id === id)?.price ?? plans.find((p) => p.id === 'enterprise')?.price ?? 0;
        const mrr = active.reduce((sum, o) => sum + priceOf(o.plan) * Math.max(1, Math.ceil(o.users / 10)), 0);
        return { total: subscribed.length, active: active.length, expiring: expiring.length, mrr };
    }, [orgs, plans]);

    const subscribersOf = (planId) => orgs.filter((o) => o.plan === planId).length;

    const openEdit = (plan) => setEditPlan(plan);

    const saveEdit = async () => {
        const v = await editForm.validateFields();
        updatePlan(editPlan.id, {
            name: v.name,
            price: editPlan.id === 'custom' ? null : v.price,
            userLimit: v.userLimit,
            features: v.features.split('\n').map((f) => f.trim()).filter(Boolean),
        });
        log('Updated', 'Settings');
        message.success(`${v.name} plan updated.`);
        setEditPlan(null);
    };

    const openAssign = (plan) => setAssignPlan(plan);

    const saveAssign = async () => {
        const { orgIds } = await assignForm.validateFields();
        updateMany(orgIds, { plan: assignPlan.id });
        log('Updated', 'Organizations');
        message.success(`${assignPlan.name} plan assigned to ${orgIds.length} organization${orgIds.length > 1 ? 's' : ''}.`);
        setAssignPlan(null);
    };

    return (
        <div>
            <PageTitle title="SaaS Plans & Subscription" />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                <StatCard label="Total Plans" value={kpi.total} icon={<FileTextOutlined />} tone="blue" />
                <StatCard label="Active Subscription" value={kpi.active} icon={<UserSwitchOutlined />} tone="green" />
                <StatCard label="Expiring Soon" value={kpi.expiring} icon={<ClockCircleOutlined />} tone="orange" />
                <StatCard label="Monthly Recurring Revenue" value={`₹ ${formatNumber(kpi.mrr)}`} icon={<CloseCircleOutlined />} tone="red" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                {plans.map((plan) => {
                    const isCustom = plan.price == null;
                    return (
                        <div key={plan.id} className="rounded-lg p-4 flex flex-col" style={{ border: `1px solid ${COLORS.border}`, minHeight: 380 }}>
                            <div className="flex justify-end h-6">
                                {!isCustom && (
                                    <button type="button" className="text-sm font-medium hover:text-blue-700" onClick={() => openEdit(plan)}>Edit Plan</button>
                                )}
                            </div>
                            <h2 className="text-2xl font-bold m-0 mt-2" style={{ color: COLORS.headingBlue }}>{plan.name}</h2>
                            <div className="mt-3 mb-4">
                                {isCustom
                                    ? <span className="text-lg font-semibold">{plan.priceLabel ?? 'Custom Pricing'}</span>
                                    : (
                                        <span className="text-xl font-bold">
                                            ₹ {formatNumber(plan.price)} <span className="text-sm font-medium">/ Month</span>
                                        </span>
                                    )}
                            </div>
                            <p className="text-[15px] font-medium m-0 mb-4">{plan.userLimit}</p>
                            <ul className="list-none p-0 m-0 flex flex-col gap-3 flex-1">
                                {plan.features.map((f) => (
                                    <li key={f} className="flex items-start gap-2.5 text-[13px] font-medium">
                                        <CheckCircleFilled style={{ color: COLORS.primary, fontSize: 15, marginTop: 1 }} />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                            <p className="text-[11px] m-0 mt-4 mb-2" style={{ color: COLORS.textSecondary }}>{subscribersOf(plan.id)} organizations on this plan</p>
                            {isCustom
                                ? <Button block onClick={() => openEdit(plan)} style={{ borderColor: COLORS.primary, color: COLORS.primary }}>Edit Plan</Button>
                                : <Button block type="primary" onClick={() => openAssign(plan)}>Select Plan</Button>}
                        </div>
                    );
                })}
            </div>

            <Modal open={!!editPlan} title={`Edit Plan — ${editPlan?.name ?? ''}`} okText="Save Plan" onOk={saveEdit} onCancel={() => setEditPlan(null)} destroyOnHidden>
                {/* preserve={false} + initialValues: each open starts from the clicked plan (modals are destroyed on close) */}
                <Form form={editForm} layout="vertical" requiredMark={false} preserve={false} initialValues={editPlan ? { ...editPlan, features: editPlan.features.join('\n') } : undefined}>
                    <Form.Item name="name" label="Plan Name" rules={[{ required: true }]}><Input /></Form.Item>
                    {editPlan?.id !== 'custom' && (
                        <Form.Item name="price" label="Price (₹ / Month)" rules={[{ required: true, message: 'Enter a price' }]}>
                            <InputNumber min={0} className="w-full" style={{ width: '100%' }} />
                        </Form.Item>
                    )}
                    <Form.Item name="userLimit" label="User Limit Text" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="features" label="Features (one per line)" rules={[{ required: true }]}><Input.TextArea rows={5} /></Form.Item>
                </Form>
            </Modal>

            <Modal open={!!assignPlan} title={`Select Plan — ${assignPlan?.name ?? ''}`} okText="Assign Plan" onOk={saveAssign} onCancel={() => setAssignPlan(null)} destroyOnHidden>
                <Form form={assignForm} layout="vertical" requiredMark={false} preserve={false}>
                    <Form.Item name="orgIds" label="Organizations" rules={[{ required: true, message: 'Select at least one organization' }]}>
                        <Select
                            mode="multiple"
                            placeholder="Select organizations"
                            showSearch={{ optionFilterProp: 'label' }}
                            options={orgs.map((o) => ({ value: o.id, label: `${o.name} (${plans.find((p) => p.id === o.plan)?.name ?? '—'})` }))}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default SaasPlansPage;
