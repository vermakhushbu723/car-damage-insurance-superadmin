import React, { useState } from 'react';
import { Button, Modal, Form, Input, Select, Segmented, App } from 'antd';
import PageTitle from '../../components/ui/PageTitle';
import DataTable from '../../components/ui/DataTable';
import OnOffSwitch from '../../components/ui/OnOffSwitch';
import { useStoreValue, useAuditLog } from '../../store/DataStore';
import { PERMISSION_PAGES, PERMISSION_ACTIONS, PERMISSION_ACTION_LABELS, buildPermissionMatrix } from '../../data/workflow';
import { COLORS } from '../../constants/theme';

/**
 * Roles & Permission -- Page/Module x action matrix for the selected role.
 * "+ Create Role" adds a role (optionally copying another role's matrix);
 * every toggle saves immediately to the store.
 */
const RolesPermissionsPage = () => {
    const { message } = App.useApp();
    const log = useAuditLog();
    const [roles, setRoles] = useStoreValue('roles');
    const [activeRole, setActiveRole] = useState(roles.list[0]);
    const [createOpen, setCreateOpen] = useState(false);
    const [form] = Form.useForm();

    const role = roles.list.includes(activeRole) ? activeRole : roles.list[0];
    const matrix = roles.matrices[role] ?? buildPermissionMatrix(false);

    const toggle = (page, action, value) => {
        setRoles((prev) => ({
            ...prev,
            matrices: { ...prev.matrices, [role]: { ...prev.matrices[role], [page]: { ...prev.matrices[role][page], [action]: value } } },
        }));
    };

    const setColumn = (action, value) => {
        setRoles((prev) => ({
            ...prev,
            matrices: {
                ...prev.matrices,
                [role]: Object.fromEntries(PERMISSION_PAGES.map((p) => [p, { ...prev.matrices[role][p], [action]: value }])),
            },
        }));
        log('Updated', 'Users');
        message.success(`${PERMISSION_ACTION_LABELS[action]} ${value ? 'enabled' : 'disabled'} on all pages for ${role}.`);
    };

    const createRole = async () => {
        const { name, copyFrom } = await form.validateFields();
        const trimmed = name.trim();
        setRoles((prev) => ({
            list: [...prev.list, trimmed],
            matrices: { ...prev.matrices, [trimmed]: copyFrom ? structuredClone(prev.matrices[copyFrom]) : buildPermissionMatrix(false) },
        }));
        setActiveRole(trimmed);
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
                title: (
                    <button type="button" className="text-white font-medium" title={`Turn ${allOn ? 'off' : 'on'} for all pages`} onClick={() => setColumn(a, !allOn)}>
                        {PERMISSION_ACTION_LABELS[a]}
                    </button>
                ),
                key: a,
                align: 'center',
                render: (_, r) => <OnOffSwitch checked={!!matrix[r.page]?.[a]} onChange={(v) => toggle(r.page, a, v)} ariaLabel={`${r.page} ${a}`} />,
            };
        }),
    ];

    return (
        <div>
            <PageTitle title="Roles & Permission" extra={<Button type="primary" className="min-w-[170px]" onClick={() => setCreateOpen(true)}>+ Create Role</Button>} />

            <div className="rounded-lg p-3 md:p-4" style={{ background: '#F4F4F5', border: `1px solid ${COLORS.border}` }}>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    <h3 className="text-base font-semibold m-0" style={{ color: COLORS.headingBlue }}>Page &amp; Permission Matrix</h3>
                    <div className="max-w-full overflow-x-auto">
                        <Segmented size="small" value={role} onChange={setActiveRole} options={roles.list} />
                    </div>
                </div>
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
