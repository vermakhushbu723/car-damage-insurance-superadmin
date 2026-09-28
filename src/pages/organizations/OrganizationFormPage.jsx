import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Form, Select, Button, App, Result } from 'antd';
import { ApartmentOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import FormSection from '../../components/forms/FormSection';
import StepNav from '../../components/forms/StepNav';
import FieldGrid from '../../components/forms/FieldRenderer';
import useScrollSpy from '../../components/forms/useScrollSpy';
import ModeToggle from '../../components/ui/ModeToggle';
import { scopedMode } from '../../auth/session';
import { useCollection, useStoreValue, useAuditLog, newId } from '../../store/DataStore';
import { ORG_FORMS, buildPlanSettingsSection, PLAN_SETTINGS_DEFAULTS } from '../../data/orgForms';
import { MODE_LABEL } from '../../data/workflow';
import { ROUTES } from '../../constants/routes';
import { COLORS } from '../../constants/theme';

const TYPE_OPTIONS = Object.keys(ORG_FORMS).map((t) => ({ value: t, label: t }));

/**
 * Organizations/Vendors create + view/edit form. The "Organnization Type"
 * dropdown swaps the whole form (Insurer / Broker / Surveyor / Workshop,
 * see data/orgForms.js). On /organizations/:id the form opens read-only
 * with the saved values; "Edit & Modify Profile" unlocks it.
 * "Create Pilot ID" saves the org as Pending, "Create Working ID" as Active.
 * The last section, PLAN & SETTINGS, finalizes the org's plan, validity,
 * permissions, modules and channels at creation; its claim workflow is
 * assigned automatically from the SaaS / Service Provider mode.
 */
const OrganizationFormPage = () => {
    const { id } = useParams();
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const { message } = App.useApp();
    const log = useAuditLog();
    const { items: orgs, add, update } = useCollection('organizations');
    const { items: plans } = useCollection('plans');
    const [workflow] = useStoreValue('workflow');
    const [roles] = useStoreValue('roles');
    const [form] = Form.useForm();

    const existing = id ? orgs.find((o) => o.id === id) : null;
    const isView = Boolean(existing);
    const initialType = existing?.type ?? (ORG_FORMS[params.get('type')] ? params.get('type') : 'Insurer');

    const [type, setType] = useState(initialType);
    const [mode, setMode] = useState(existing ? (existing.serviceModel === 'Service Provider' ? 'serviceProvider' : 'saas') : scopedMode('saas'));
    const [editing, setEditing] = useState(!isView);
    const [submitting, setSubmitting] = useState(null);

    const baseConfig = ORG_FORMS[type];
    const [sectionRefs, activeSection, scrollTo] = useScrollSpy([type]);

    // Every type's form ends with PLAN & SETTINGS (fields depend on the mode).
    const config = useMemo(() => ({
        ...baseConfig,
        steps: [...baseConfig.steps, { label: 'Plan & Settings', section: baseConfig.sections.length }],
        sections: [...baseConfig.sections, buildPlanSettingsSection({ mode, plans, roles: roles.list })],
    }), [baseConfig, mode, plans, roles.list]);

    const workflowLabel = `${MODE_LABEL[mode]} workflow — ${workflow[mode].stages.length} stages (${workflow[mode].stages.join(' → ')})`;
    const planId = Form.useWatch('plan', form);
    const start = Form.useWatch('subscriptionStart', form);
    const validity = Form.useWatch('validityMonths', form);

    // Derived, read-only fields of PLAN & SETTINGS.
    useEffect(() => {
        form.setFieldsValue({
            workflowName: workflowLabel,
            userLimit: plans.find((p) => p.id === planId)?.userLimit ?? '',
            validTill: start && validity ? dayjs(start).add(validity, 'month').format('DD MMM YYYY') : '',
        });
    }, [form, workflowLabel, planId, start, validity, plans, type]);

    // Live option lists (e.g. "Empanelled insurers" = current Insurer orgs).
    const insurerOptions = useMemo(
        () => orgs.filter((o) => o.type === 'Insurer' && o.status !== 'Suspended').map((o) => ({ value: o.name, label: o.name })),
        [orgs],
    );
    const sections = useMemo(() => config.sections.map((s) => ({
        ...s,
        fields: s.fields.map((f) => (f.optionsFrom === 'insurers' ? { ...f, options: insurerOptions } : f)),
    })), [config, insurerOptions]);

    // (Re)load values whenever the type or the viewed org changes.
    useEffect(() => {
        form.resetFields();
        const base = { ...PLAN_SETTINGS_DEFAULTS, subscriptionStart: dayjs().startOf('day').toISOString(), ...config.initialValues };
        if (existing) {
            // Orgs created before PLAN & SETTINGS existed: fill it from their record.
            Object.assign(base, {
                plan: existing.plan,
                subscriptionStart: existing.createdOn,
                validityMonths: Math.max(1, dayjs(existing.subscriptionExpiry).diff(dayjs(existing.createdOn), 'month')),
            });
            Object.assign(base, { [config.nameField]: existing.name, ...existing.form });
            base.ibimaId = existing.id;
            base.adminId = `${existing.id}-ADM`;
            base.adminUserId = `${existing.id}-ADM`;
            base.userId = `${existing.id}-USR`;
        }
        form.setFieldsValue(base);
    }, [type, existing?.id]); // eslint-disable-line react-hooks/exhaustive-deps

    if (id && !existing) {
        return (
            <Result
                status="404"
                title="Organization not found"
                subTitle="It may have been removed or the link is wrong."
                extra={<Button type="primary" onClick={() => navigate(ROUTES.ORGANIZATIONS)}>Back to Organizations/Vendors</Button>}
            />
        );
    }

    const save = async (kind) => {
        try {
            const values = await form.validateFields();
            setSubmitting(kind);
            const status = kind === 'working' ? 'Active' : 'Pending';
            const expiry = dayjs(values.subscriptionStart).add(values.validityMonths, 'month');
            const payload = {
                name: values[config.nameField],
                type,
                status,
                serviceModel: mode === 'saas' ? 'SaaS' : 'Service Provider',
                // Finalized at ID creation (PLAN & SETTINGS):
                plan: values.plan,
                subscriptionExpiry: expiry.toISOString(),
                workflow: { mode, stages: [...workflow[mode].stages], assignedOn: new Date().toISOString() },
                settings: {
                    billingCycle: values.billingCycle,
                    roleTemplate: values.roleTemplate,
                    modules: values.modules ?? [],
                    channels: values.channels ?? [],
                    ...(mode === 'serviceProvider' ? { feeBillModel: values.feeBillModel, feePerClaim: values.feePerClaim ?? null } : {}),
                },
                form: values,
            };
            if (existing) {
                update(existing.id, payload);
                log('Updated', 'Organizations');
                message.success(`${payload.name} updated (${status}).`);
            } else {
                const orgId = newId('ORG');
                add({
                    id: orgId,
                    users: 1,
                    createdOn: new Date().toISOString(),
                    claims: 0,
                    ...payload,
                });
                log('Created', 'Organizations');
                message.success(`${kind === 'working' ? 'Working' : 'Pilot'} ID created for ${payload.name} — ${MODE_LABEL[mode]} workflow assigned automatically.`);
            }
            navigate(ROUTES.ORGANIZATIONS);
        } catch (err) {
            if (err?.errorFields?.length) {
                message.error('Please fix the highlighted fields.');
                form.scrollToField(err.errorFields[0].name, { behavior: 'smooth', block: 'center' });
            }
        } finally {
            setSubmitting(null);
        }
    };

    const profileButton = isView && (
        // explicit disabled={false}: the Form's `disabled` would otherwise lock this button too
        <Button type="primary" size="small" disabled={false} onClick={() => setEditing((e) => !e)}>
            {editing ? 'Cancel Editing' : 'Edit & Modify Profile'}
        </Button>
    );

    return (
        <div>
            <h1 className="text-xl md:text-2xl font-bold m-0" style={{ color: COLORS.headingBlue }}>Organizations/Vendors</h1>
            <h2 className="text-lg font-semibold mt-1 mb-4" style={{ color: COLORS.textPrimary }}>
                {existing ? existing.name : type}
                {existing && <span className="ml-2 text-xs font-medium" style={{ color: COLORS.textSecondary }}>({existing.id} · {type})</span>}
            </h2>

            <div className="flex gap-6 items-start">
                <StepNav steps={config.steps} activeIndex={activeSection} onStepClick={scrollTo} />

                <div className="flex-1 min-w-0 max-w-[900px]">
                    <span className="block text-[13px] font-semibold mb-1.5">Organnization Type</span>
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                        <Select
                            value={type}
                            onChange={setType}
                            options={TYPE_OPTIONS}
                            disabled={isView}
                            className="w-full sm:w-[320px]"
                        />
                        <ModeToggle value={mode} onChange={(v) => (editing ? setMode(v) : message.info('Click "Edit & Modify Profile" to change the mode.'))} />
                        {existing && (
                            <Button size="small" icon={<ApartmentOutlined />} disabled={false} onClick={() => navigate(`${ROUTES.WORKFLOW}?org=${existing.id}`)}>
                                View Workflow
                            </Button>
                        )}
                    </div>
                    <p className="text-[11px] -mt-2 mb-4" style={{ color: COLORS.textSecondary }}>
                        {MODE_LABEL[mode]} mode: the {MODE_LABEL[mode]} claim workflow ({workflow[mode].stages.length} stages) is assigned automatically. Plan and settings are finalized in the last step.
                    </p>

                    <Form form={form} layout="vertical" requiredMark={false} disabled={!editing} scrollToFirstError>
                        {sections.map((section, i) => (
                            <FormSection
                                key={`${type}-${section.title}`}
                                ref={(el) => { sectionRefs.current[i] = el; }}
                                step={i + 1}
                                title={section.title}
                                extra={section.profileButton ? profileButton : null}
                            >
                                <FieldGrid fields={section.fields} disabled={!editing} />
                            </FormSection>
                        ))}
                    </Form>

                    <div className="flex flex-wrap justify-end gap-3 mb-4">
                        <Button type="primary" disabled={!editing} loading={submitting === 'pilot'} onClick={() => save('pilot')}>Create Pilot ID</Button>
                        <Button type="primary" disabled={!editing} loading={submitting === 'working'} onClick={() => save('working')}>Create Working ID</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Keyed by :id so moving between two organizations' pages starts from a fresh form state.
const OrganizationFormRoute = () => {
    const { id } = useParams();
    return <OrganizationFormPage key={id ?? 'new'} />;
};

export default OrganizationFormRoute;
