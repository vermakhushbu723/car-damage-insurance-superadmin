import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input } from 'antd';
import { SearchOutlined, AppstoreOutlined, CheckCircleOutlined, ClockCircleOutlined, CloudUploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import PageTitle from '../../components/ui/PageTitle';
import StatCard from '../../components/ui/StatCard';
import StatusTag from '../../components/ui/StatusTag';
import DataTable from '../../components/ui/DataTable';
import UserCell from '../../components/ui/UserCell';
import { ViewButton } from '../../components/ui/RowActions';
import { useCollection } from '../../store/DataStore';
import { ROUTES, serviceModelPath } from '../../constants/routes';
import { formatDate, matchesQuery } from '../../utils/format';

const isRecent = (iso) => dayjs().diff(dayjs(iso), 'day') <= 30;

/** Service Model list -- search + stat-card filters; eye opens the model's form. */
const ServiceModelsPage = () => {
    const navigate = useNavigate();
    const { items: models } = useCollection('serviceModels');
    const [q, setQ] = useState('');
    const [quick, setQuick] = useState('all');

    const rows = useMemo(() => models.filter((m) =>
        matchesQuery(m, q, ['name', 'serviceType', 'applicableFor', 'status'])
        && (quick === 'all'
            || (quick === 'active' && m.status === 'Active')
            || (quick === 'inactive' && m.status !== 'Active')
            || (quick === 'recent' && isRecent(m.lastUploaded)))), [models, q, quick]);

    const toggleQuick = (k) => setQuick((cur) => (cur === k ? 'all' : k));

    return (
        <div>
            <PageTitle title="Service Model" />

            <div className="filter-bar flex flex-wrap items-center gap-2 mb-3">
                <Input className="w-full sm:flex-1 sm:max-w-[420px]" placeholder="Search Services,models,Policies,Models" suffix={<SearchOutlined />} allowClear value={q} onChange={(e) => setQ(e.target.value)} />
                <Button type="primary" className="sm:ml-auto min-w-[170px]" onClick={() => navigate(ROUTES.SERVICE_MODEL_NEW)}>+ Add Service Models</Button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                <StatCard label="Total Service Models" value={models.length} icon={<AppstoreOutlined />} tone="blue" onClick={() => setQuick('all')} active={quick === 'all'} />
                <StatCard label="Active" value={models.filter((m) => m.status === 'Active').length} icon={<CheckCircleOutlined />} tone="green" onClick={() => toggleQuick('active')} active={quick === 'active'} />
                <StatCard label="Inactive" value={models.filter((m) => m.status !== 'Active').length} icon={<ClockCircleOutlined />} tone="orange" onClick={() => toggleQuick('inactive')} active={quick === 'inactive'} />
                <StatCard label="Recently Uploaded" value={models.filter((m) => isRecent(m.lastUploaded)).length} icon={<CloudUploadOutlined />} tone="red" onClick={() => toggleQuick('recent')} active={quick === 'recent'} />
            </div>

            <DataTable
                dataSource={rows}
                scrollX={960}
                locale={{ emptyText: 'No service models found.' }}
                columns={[
                    { title: 'Service Model', dataIndex: 'name', width: 230, render: (n) => <UserCell name={n} />, sorter: (a, b) => a.name.localeCompare(b.name) },
                    { title: 'Service Type', dataIndex: 'serviceType', align: 'center' },
                    { title: 'Applicable For', dataIndex: 'applicableFor', align: 'center' },
                    { title: 'Staus', dataIndex: 'status', align: 'center', render: (s) => <StatusTag status={s} /> },
                    { title: 'SLA/TAT', dataIndex: 'sla', align: 'center', render: (h) => `${h} hrs`, sorter: (a, b) => a.sla - b.sla },
                    { title: 'Last Uploaded', dataIndex: 'lastUploaded', align: 'center', render: formatDate, sorter: (a, b) => a.lastUploaded.localeCompare(b.lastUploaded) },
                    { title: 'Action', key: 'a', align: 'center', width: 70, render: (_, r) => <ViewButton onClick={() => navigate(serviceModelPath(r.id))} /> },
                ]}
            />
        </div>
    );
};

export default ServiceModelsPage;
