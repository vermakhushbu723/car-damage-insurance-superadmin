import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import PageHeader from '../../components/common/PageHeader';
import { COLORS } from '../../constants/theme';
import { ROUTES } from '../../constants/routes';

// UI-only mock rows -- there's no backend yet (see constants/mockData.js's
// header comment). Real data source: whatever InsurerNewIdCreationPage's
// "Create Now" eventually persists to.
const ROWS = [
    { id: 1, company: 'New India Assurance', role: 'Insurer', irdai: 'MS_1234567890', status: 'Active', createdAt: 'Oct 24th 2023' },
    { id: 2, company: 'ABC Insurance Pvt. Ltd.', role: 'Insurer', irdai: 'MS_2234567890', status: 'Active', createdAt: 'Oct 18th 2023' },
    { id: 3, company: 'XYZ Broker Services', role: 'Broker', irdai: 'MS_3234567890', status: 'Pending', createdAt: 'Oct 12th 2023' },
];

const COLUMNS = [
    { title: 'Company Name', dataIndex: 'company', key: 'company' },
    { title: 'Role', dataIndex: 'role', key: 'role' },
    { title: 'IRDAI License', dataIndex: 'irdai', key: 'irdai' },
    {
        title: 'Status', dataIndex: 'status', key: 'status',
        render: (v) => (
            <Tag style={{ borderRadius: 6, border: 'none', padding: '2px 12px', fontWeight: 600, color: v === 'Active' ? COLORS.primary : COLORS.textMuted, background: v === 'Active' ? COLORS.bgSoftBlue : COLORS.pendingBadgeBg }}>
                {v}
            </Tag>
        ),
    },
    { title: 'Created', dataIndex: 'createdAt', key: 'createdAt' },
];

const InsurerListPage = () => {
    const navigate = useNavigate();
    return (
        <div className="p-4 md:p-8">
            <PageHeader title="Insurer" actionLabel="Create New ID" actionIcon={<PlusOutlined />} onAction={() => navigate(ROUTES.INSURER_NEW)} />
            <div className="rounded-2xl p-5" style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}` }}>
                <Table columns={COLUMNS} dataSource={ROWS} rowKey="id" pagination={false} />
            </div>
        </div>
    );
};

export default InsurerListPage;
