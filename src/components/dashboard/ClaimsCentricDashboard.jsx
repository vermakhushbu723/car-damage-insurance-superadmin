import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusOutlined, FileDoneOutlined, CheckCircleOutlined, CloseCircleOutlined, ArrowUpOutlined, CalendarOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import PageHeader from '../common/PageHeader';
import StatCard from './StatCard';
import ClaimsByStatusCard from './ClaimsByStatusCard';
import DistributionDonutCard from './DistributionDonutCard';
import ClaimsTable, { StatusTag } from './ClaimsTable';
import { CLAIMS_TABLE_ROWS, CLAIM_SAAS_STATS, CLAIM_SAAS_STATUS_BREAKDOWN, CLAIM_SAAS_DISTRIBUTION } from '../../constants/mockData';
import { ROUTES } from '../../constants/routes';

const STAT_ICONS = { total: <FileDoneOutlined />, approved: <CheckCircleOutlined />, pending: <CloseCircleOutlined /> };

const COLUMNS = [
    { title: 'Claim ID', dataIndex: 'claimId', key: 'claimId' },
    { title: 'Customer Name', dataIndex: 'customerName', key: 'customerName' },
    { title: 'Insurar Name', dataIndex: 'insurerName', key: 'insurerName' },
    { title: 'Amount', dataIndex: 'amount', key: 'amount', render: (v) => `₹${v.toLocaleString('en-IN')}.00` },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (v) => <StatusTag status={v} /> },
    { title: 'Date', dataIndex: 'date', key: 'date' },
];

/**
 * Claims-centric dashboard body -- "Claim > As SaaS" (see the reference
 * screenshot). Total/Approved/Pending Claims stats, a Claim ID + Customer
 * Name table.
 */
const ClaimsCentricDashboard = ({ title }) => {
    const navigate = useNavigate();

    return (
        <div className="p-4 md:p-8">
            <PageHeader title={title} actionLabel="Create SaaS ID" actionIcon={<PlusOutlined />} onAction={() => navigate(ROUTES.INSURER_NEW)} />

            <div className="flex flex-wrap gap-4 mb-6">
                {CLAIM_SAAS_STATS.map((s, i) => (
                    <StatCard
                        key={s.key}
                        label={s.label}
                        value={s.value}
                        icon={STAT_ICONS[s.key]}
                        tone={i === 0 ? 'dark' : 'light'}
                        footer={
                            s.trend
                                ? { text: s.trend, tone: 'success', icon: <ArrowUpOutlined /> }
                                : {
                                    text: s.badge,
                                    tone: s.badgeType === 'danger' ? 'danger' : 'success',
                                    icon: s.badgeType === 'danger' ? <CalendarOutlined /> : <SafetyCertificateOutlined />,
                                }
                        }
                    />
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
                <ClaimsByStatusCard breakdown={CLAIM_SAAS_STATUS_BREAKDOWN} />
                <DistributionDonutCard {...CLAIM_SAAS_DISTRIBUTION} />
            </div>

            <ClaimsTable
                columns={COLUMNS}
                dataSource={CLAIMS_TABLE_ROWS}
                searchableKeys={['claimId', 'customerName', 'insurerName', 'status']}
            />
        </div>
    );
};

export default ClaimsCentricDashboard;
