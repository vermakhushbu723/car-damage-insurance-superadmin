import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import PageHeader from '../../components/common/PageHeader';
import { COLORS } from '../../constants/theme';
import { ROUTES } from '../../constants/routes';

// UI-only mock rows -- there's no backend yet (see constants/mockData.js's
// header comment). Real source: whatever InternalUserCreationPage's
// "Create Now" eventually persists to.
const ROWS = [
    { id: 1, userId: 'MS_1234567890', name: 'Ananya Rao', branch: 'Metropolitan HQ', platform: 'Omni-Channel (Both)', status: 'Active' },
    { id: 2, userId: 'MS_2234567890', name: 'Karan Mehta', branch: 'Mumbai Regional', platform: 'Web Portal', status: 'Active' },
    { id: 3, userId: 'MS_3234567890', name: 'Fatima Sheikh', branch: 'Delhi NCR', platform: 'Mob Application', status: 'Inactive' },
];

const COLUMNS = [
    { title: 'User ID', dataIndex: 'userId', key: 'userId' },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Branch/Office', dataIndex: 'branch', key: 'branch' },
    { title: 'Platform', dataIndex: 'platform', key: 'platform' },
    {
        title: 'Status', dataIndex: 'status', key: 'status',
        render: (v) => (
            <Tag style={{ borderRadius: 6, border: 'none', padding: '2px 12px', fontWeight: 600, color: v === 'Active' ? COLORS.success : COLORS.textMuted, background: v === 'Active' ? COLORS.successBg : COLORS.pendingBadgeBg }}>
                {v}
            </Tag>
        ),
    },
];

const InternalUserListPage = () => {
    const navigate = useNavigate();
    return (
        <div className="p-4 md:p-8">
            <PageHeader title="Internal User" actionLabel="Create User" actionIcon={<PlusOutlined />} onAction={() => navigate(ROUTES.INTERNAL_USER_NEW)} />
            <div className="rounded-2xl p-5" style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}` }}>
                <Table columns={COLUMNS} dataSource={ROWS} rowKey="id" pagination={false} />
            </div>
        </div>
    );
};

export default InternalUserListPage;
