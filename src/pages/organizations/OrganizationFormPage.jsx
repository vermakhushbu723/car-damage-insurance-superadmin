import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Form, Select, Button, App, Result, Spin } from 'antd';
import { ApartmentOutlined } from '@ant-design/icons';
import CredentialsModal from '../../components/organizations/CredentialsModal';
import FormSection from '../../components/forms/FormSection';
import StepNav from '../../components/forms/StepNav';
import FieldGrid from '../../components/forms/FieldRenderer';
import useScrollSpy from '../../components/forms/useScrollSpy';
import ModeToggle from '../../components/ui/ModeToggle';
import { EDITION_MODE } from '../../auth/session';
import { useCollection, useRemoteValue } from '../../store/DataStore';
import { organizationsApi } from '../../api/superadminApi';
import { ORG_FORMS } from '../../data/orgForms';
import { MODE_LABEL } from '../../data/workflow';
import { ROUTES } from '../../constants/routes';
import { COLORS } from '../../constants/theme';

const TYPE_OPTIONS = Object.keys(ORG_FORMS).map((t) => ({ value: t, label: t }));

/**
 * Organizations/Vendors create + view/edit form. The "Organnization Type"
 * dropdown swaps the whole form (Insurer / Broker / Surveyor / Workshop,
 * see data/orgForms.js). On /organizations/:id the form opens read-only
 * with the saved values; "Edit & Modify Profile" unlocks it.
 * "+ Add Pilot ID" / "Permanent ID" (top) and "Create Pilot ID" / "Create
 * Working ID" (bottom) both create an Active org (Permanent = Working; the
 * choice is kept as `idType`) and then show the generated Organization ID,
 * admin login ID and temporary password in CredentialsModal; that login
 * is also created in admin-service, so it signs in on the Admin portal.
 * Service Provider organizations have no plan (the Figma form has no Plan
 * step); the Service Provider claim workflow is assigned automatically.
 */
const OrganizationFormPage = () => {
    const { id } = useParams();
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const { message } = App.useApp();
    const { items: orgs, upsert } = useCollection('organizations');
    const [workflow] = useRemoteValue('workflows');
    const [form] = Form.useForm();

    const existing = id ? orgs.find((o) => o.id === id) : null;
    const isView = Boolean(existing);
    const initialType = existing?.type ?? (ORG_FORMS[params.get('type')] ? params.get('type') : 'Insurer');

    const [type, setType] = useState(initialType);
    const mode = EDITION_MODE;
    const [editing, setEditing] = useState(!isView);
    const [submitting, setSubmitting] = useState(null);
    const [credentials, setCredentials] = useState(null); // shown after a new ID is created

    const config = ORG_FORMS[type];
    const [sectionRefs, activeSection, scrollTo] = useScrollSpy([type]);

    // Live option lists (e.g. "Empanelled insurers" = current Insurer orgs).
    const insurerOptions = useMemo(
        () => orgs.filter((o) => o.type === 'Insurer' && o.status !== 'Suspended').map((o) => ({ value: o.name, label: o.name })),
        [orgs],
    );
    const sections = useMemo(() => config.sections.map((s) => ({
        ...s,
        fields: s.fields.map((f) => {
            if (f.optionsFrom === 'insurers') return { ...f, options: insurerOptions };
            if (f.manualId && isView) return { ...f, disabled: true };
            return f;
        }),
    })), [config, insurerOptions, isView]);

    // (Re)load values whenever the type or the viewed org changes.
    useEffect(() => {
        form.resetFields();
        const base = { ...config.initialValues };
        if (existing) {
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
        let values;
        try {
            values = await form.validateFields();
        } catch (err) {
            if (err?.errorFields?.length) {
                message.error('Please fix the highlighted fields.');
                form.scrollToField(err.errorFields[0].name, { behavior: 'smooth', block: 'center' });
            }
            return;
        }
        setSubmitting(kind);
        const idType = kind === 'working' ? 'Working' : 'Pilot';
        const profile = {
            name: values[config.nameField],
            idType,
            serviceModel: 'Service Provider',
            workflow: { mode, stages: [...workflow[mode].stages], assignedOn: new Date().toISOString() },
            // Derived/read-only fields are recomputed on load; passwords never go into the stored form.
            form: Object.fromEntries(Object.entries(values).filter(([k]) => !['ibimaId', 'adminId', 'adminUserId', 'userId'].includes(k))),
        };
        try {
            if (existing) {
                upsert(await organizationsApi.update(existing.id, profile));
                message.success(`${profile.name} updated (${idType} ID).`);
                navigate(ROUTES.ORGANIZATIONS);
            } else {
                const ibimaId = values.ibimaId?.trim() || undefined;
                const { organization, credentials } = await organizationsApi.create({ ...profile, type, ibimaId, admin: adminFromForm(values) });
                upsert(organization);
                setCredentials({
                    orgId: organization.id,
                    name: organization.name,
                    type,
                    idType,
                    serviceModel: organization.serviceModel,
                    loginId: credentials.loginId,
                    email: credentials.email,
                    password: credentials.password,
                    portal: credentials.portal,
                });
            }
        } catch (err) {
            message.error(err.message);
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
            <div className="flex flex-wrap items-start justify-between gap-3">
                <h1 className="text-xl md:text-2xl font-bold m-0" style={{ color: COLORS.headingBlue }}>Organizations/Vendors</h1>
                <ModeToggle value={mode} />
            </div>
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
                        <div className="flex flex-wrap gap-3 sm:ml-auto">
                            <Button type="primary" className="min-w-[150px]" disabled={!editing} loading={submitting === 'pilot'} onClick={() => save('pilot')}>+ Add Pilot ID</Button>
                            <Button type="primary" className="min-w-[150px]" disabled={!editing} loading={submitting === 'working'} onClick={() => save('working')}>Permanent ID</Button>
                        </div>
                        {existing && (
                            <Button size="small" icon={<ApartmentOutlined />} disabled={false} onClick={() => navigate(`${ROUTES.WORKFLOW}?org=${existing.id}`)}>
                                View Workflow
                            </Button>
                        )}
                    </div>
                    <p className="text-[11px] -mt-2 mb-4" style={{ color: COLORS.textSecondary }}>
                        The {MODE_LABEL[mode]} claim workflow ({workflow[mode].stages.length} stages) is assigned automatically. The admin login works on the Admin portal.
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

            <CredentialsModal data={credentials} onClose={() => navigate(ROUTES.ORGANIZATIONS)} />
        </div>
    );
};

// The organization's own admin login, taken from whichever admin/contact fields the type's form has.
const adminFromForm = (v) => ({
    name: v.adminFullName || v.fullName || v.inchargeName || v.ownerName || v.primaryContactName || v.companyName || v.firmName || v.workshopName,
    email: v.adminEmail || v.officialEmail,
    phone: v.adminContact || v.adminMobile || v.primaryContact || v.contactNumber || v.inchargeMobile || v.mobileNumber || undefined,
    password: v.tempPassword || undefined,
});

// Keyed by :id so moving between two organizations' pages starts from a fresh form state.
// Waits for the organizations list so an existing org opens with its own type/mode, not the defaults.
const OrganizationFormRoute = () => {
    const { id } = useParams();
    const { loading } = useCollection('organizations');
    const [workflow] = useRemoteValue('workflows');
    if ((id && loading) || !workflow) return <div className="py-24 flex justify-center"><Spin /></div>;
    return <OrganizationFormPage key={id ?? 'new'} />;
};

export default OrganizationFormRoute;
