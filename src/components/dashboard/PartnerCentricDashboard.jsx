import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    PlusOutlined,
    SafetyCertificateOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    ArrowUpOutlined,
    CalendarOutlined,
} from '@ant-design/icons';
import PageHeader from '../common/PageHeader';
import StatCard from './StatCard';
import ClaimsByStatusCard from './ClaimsByStatusCard';
import DistributionDonutCard from './DistributionDonutCard';
import ClaimsTable, { StatusTag } from './ClaimsTable';
import { CLAIMS_TABLE_ROWS, partnerStats, partnerStatusBreakdown, PARTNER_DISTRIBUTION } from '../../constants/mockData';
import { ROUTES } from '../../constants/routes';

const STAT_ICONS = { insurer: <SafetyCertificateOutlined />, broker: <CheckCircleOutlined />, others: <CloseCircleOutlined /> };

const COLUMNS = [
    { title: 'Insurar Name', dataIndex: 'insurerName', key: 'insurerName' },
    { title: 'State', dataIndex: 'state', key: 'state' },
    { title: 'Religion', dataIndex: 'religion', key: 'religion' },
    { title: 'Amount', dataIndex: 'amount', key: 'amount', render: (v) => `₹${v.toLocaleString('en-IN')}.00` },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (v) => <StatusTag status={v} /> },
    { title: 'Date', dataIndex: 'date', key: 'date' },
];

/**
 * Partner-centric dashboard body -- "Claim > Service Provider" and both
 * Preinspection variants (see the reference screenshots -- they only differ
 * by title and `othersCount`). Total Insurer/Broker/Others stats, an
 * Insurar Name/State/Religion table.
 */
const PartnerCentricDashboard = ({ title, othersCount = 18 }) => {
    const navigate = useNavigate();
    const stats = partnerStats({ othersCount });
    const statusBreakdown = partnerStatusBreakdown({ includePending: othersCount > 0 });

    return (
        <div className="p-4 md:p-8">
            <PageHeader title={title} actionLabel="Create User" actionIcon={<PlusOutlined />} onAction={() => navigate(ROUTES.INSURER_NEW)} />

            <div className="flex flex-wrap gap-4 mb-6">
                {stats.map((s) => (
                    <StatCard
                        key={s.key}
                        label={s.label}
                        value={s.value}
                        icon={STAT_ICONS[s.key]}
                        tone="light"
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
                <ClaimsByStatusCard
                    breakdown={statusBreakdown}
                    insightTitle={`${statusBreakdown[0].percent}% of claims have been approved`}
                    insightSubtitle="Great Job! Your approval rate is above target"
                />
                <DistributionDonutCard {...PARTNER_DISTRIBUTION} />
            </div>

            <ClaimsTable
                columns={COLUMNS}
                dataSource={CLAIMS_TABLE_ROWS}
                searchableKeys={['insurerName', 'state', 'religion', 'status']}
            />
        </div>
    );
};

export default PartnerCentricDashboard;
