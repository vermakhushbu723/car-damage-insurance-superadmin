import React, { useState } from 'react';
import { Button, Modal, Form, Input, Select, Segmented, App } from 'antd';
import { EditOutlined, SaveOutlined } from '@ant-design/icons';
import PageTitle from '../../components/ui/PageTitle';
import DataTable from '../../components/ui/DataTable';
import OnOffSwitch from '../../components/ui/OnOffSwitch';
import { useStoreValue, useAuditLog } from '../../store/DataStore';
import { PERMISSION_PAGES, PERMISSION_ACTIONS, PERMISSION_ACTION_LABELS, buildPermissionMatrix } from '../../data/workflow';
import { COLORS } from '../../constants/theme';

/**
 * Roles & Permission -- Page/Module x action matrix for the selected role.
 * The matrix is read-only until "Edit" is clicked; toggles then change a
 * draft copy that "Save / Update" writes to the store ("Cancel" discards).
 * "+ Create Role" adds a role (optionally copying another role's matrix).
 */
const RolesPermissionsPage = () => {
    const { message, modal } = App.useApp();
    const log = useAuditLog();
    const [roles, setRoles] = useStoreValue('roles');
    const [activeRole, setActiveRole] = useState(roles.list[0]);
    const [createOpen, setCreateOpen] = useState(false);
    const [form] = Form.useForm();
    const [draft, setDraft] = useState(null); // non-null = edit mode (unsaved copy of the matrix)

    const role = roles.list.includes(activeRole) ? activeRole : roles.list[0];
    const saved = roles.matrices[role] ?? buildPermissionMatrix(false);
    const editing = draft !== null;
    const matrix = draft ?? saved;
    const dirty = editing && JSON.stringify(draft) !== JSON.stringify(saved);

    const toggle = (page, action, value) => {
        setDraft((prev) => ({ ...prev, [page]: { ...prev[page], [action]: value } }));
    };

    const setColumn = (action, value) => {
        setDraft((prev) => Object.fromEntries(PERMISSION_PAGES.map((p) => [p, { ...prev[p], [action]: value }])));
    };

    const startEdit = () => setDraft(structuredClone(saved));
    const cancelEdit = () => setDraft(null);

    const saveMatrix = () => {
        if (!dirty) {
            setDraft(null);
            return message.info('No changes to save.');
        }
        setRoles((prev) => ({ ...prev, matrices: { ...prev.matrices, [role]: draft } }));
        setDraft(null);
        log('Updated', 'Users');
        message.success(`Permissions updated for ${role}.`);
    };

    // Switching role (or creating one) while there are unsaved edits asks first.
    const guardUnsaved = (next) => {
        if (!dirty) {
            setDraft(null);
            next();
            return;
        }
        modal.confirm({
            title: 'Discard unsaved permission changes?',
            content: `Your changes to ${role} have not been saved.`,
            okText: 'Discard',
            onOk: () => { setDraft(null); next(); },
        });
    };

    const createRole = async () => {
        const { name, copyFrom } = await form.validateFields();
        const trimmed = name.trim();
        setRoles((prev) => ({
            list: [...prev.list, trimmed],
            matrices: { ...prev.matrices, [trimmed]: copyFrom ? structuredClone(prev.matrices[copyFrom]) : buildPermissionMatrix(false) },
        }));
        setActiveRole(trimmed);
        setDraft(null);
        log('Created', 'Users');
        message.success(`Role "${trimmed}" created.`);
        setCreateOpen(false);
        form.resetFields();
    };

    const columns = [
        { title: 'Page/Module', dataIndex: 'page', fixed: 'left', width: 210, render: (p) => <span className="font-medium">{p}</span> },
        ...PERMISSION_ACTIONS.map((a) => {
            const allOn = PERMISSION_PAGES.every((p) => matrix[p]?.[a]);
            return {
                title: editing ? (
                    <button type="button" className="text-white font-medium" title={`Turn ${allOn ? 'off' : 'on'} for all pages`} onClick={() => setColumn(a, !allOn)}>
                        {PERMISSION_ACTION_LABELS[a]}
                    </button>
                ) : PERMISSION_ACTION_LABELS[a],
                key: a,
                align: 'center',
                render: (_, r) => <OnOffSwitch checked={!!matrix[r.page]?.[a]} disabled={!editing} onChange={(v) => toggle(r.page, a, v)} ariaLabel={`${r.page} ${a}`} />,
            };
        }),
    ];

    return (
        <div>
            <PageTitle title="Roles & Permission" extra={<Button type="primary" className="min-w-[170px]" onClick={() => guardUnsaved(() => setCreateOpen(true))}>+ Create Role</Button>} />

            <div className="rounded-lg p-3 md:p-4" style={{ background: '#F4F4F5', border: `1px solid ${COLORS.border}` }}>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    <h3 className="text-base font-semibold m-0" style={{ color: COLORS.headingBlue }}>
                        Page &amp; Permission Matrix
                        {dirty && <span className="ml-2 text-[11px] font-medium" style={{ color: COLORS.warning }}>Unsaved changes</span>}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 max-w-full">
                        <div className="max-w-full overflow-x-auto">
                            <Segmented size="small" value={role} onChange={(r) => guardUnsaved(() => setActiveRole(r))} options={roles.list} />
                        </div>
                        {editing ? (
                            <>
                                <Button size="small" onClick={cancelEdit}>Cancel</Button>
                                <Button size="small" type="primary" icon={<SaveOutlined />} onClick={saveMatrix}>Save / Update</Button>
                            </>
                        ) : (
                            <Button size="small" type="primary" icon={<EditOutlined />} onClick={startEdit}>Edit</Button>
                        )}
                    </div>
                </div>
                <p className="text-[11px] mt-0 mb-2" style={{ color: COLORS.textSecondary }}>
                    {editing
                        ? `Editing ${role} — change the switches (click a column header to toggle the whole column), then Save / Update.`
                        : `Viewing ${role}. Click Edit to change its permissions.`}
                </p>
                <DataTable
                    className="table-blue-head"
                    rowKey="page"
                    pagination={false}
                    scrollX={820}
                    dataSource={PERMISSION_PAGES.map((page) => ({ page }))}
                    columns={columns}
                />
            </div>

            <Modal open={createOpen} title="Create Role" okText="Create Role" onOk={createRole} onCancel={() => setCreateOpen(false)} destroyOnHidden>
                <Form form={form} layout="vertical" requiredMark={false}>
                    <Form.Item
                        name="name"
                        label="Role Name"
                        rules={[
                            { required: true, whitespace: true, message: 'Enter a role name' },
                            { validator: (_, v) => (v && roles.list.some((r) => r.toLowerCase() === v.trim().toLowerCase()) ? Promise.reject(new Error('This role already exists')) : Promise.resolve()) },
                        ]}
                    >
                        <Input placeholder="e.g. Claims Auditor" />
                    </Form.Item>
                    <Form.Item name="copyFrom" label="Copy permissions from (optional)">
                        <Select allowClear placeholder="Start with everything Off" options={roles.list.map((r) => ({ value: r, label: r }))} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default RolesPermissionsPage;
