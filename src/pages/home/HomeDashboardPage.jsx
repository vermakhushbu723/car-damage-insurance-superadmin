import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import { FileProtectOutlined, SafetyCertificateOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { COLORS } from '../../constants/theme';
import { ROUTES } from '../../constants/routes';

const MODULES = [
    {
        key: 'claim',
        icon: FileProtectOutlined,
        title: 'Claim',
        description: 'Centralized hub for managing and reviewing motor insurance claims. Oversee the lifecycle from initial submission to final resolution.',
        saasPath: ROUTES.CLAIM_SAAS,
        servicePath: ROUTES.CLAIM_SERVICE_PROVIDER,
    },
    {
        key: 'preinspection',
        icon: SafetyCertificateOutlined,
        title: 'Preinspection',
        description: 'Comprehensive management of insurer profiles and specialized policies. Ensure compliance and maintain high-performance standards.',
        saasPath: ROUTES.PREINSPECTION_SAAS,
        servicePath: ROUTES.PREINSPECTION_SERVICE_PROVIDER,
    },
];

const ModuleCard = ({ mod }) => {
    const navigate = useNavigate();
    const Icon = mod.icon;
    return (
        <div className="flex-1 min-w-[280px] rounded-2xl p-6 flex flex-col gap-4" style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}` }}>
            <div className="flex items-center gap-3">
                <div className="flex items-center justify-center rounded-xl shrink-0" style={{ width: 44, height: 44, background: COLORS.bgSoftBlue, color: COLORS.primary }}>
                    <Icon style={{ fontSize: 22 }} />
                </div>
                <h2 className="text-xl font-bold m-0" style={{ color: COLORS.headingBlue }}>{mod.title}</h2>
            </div>
            <p className="text-sm m-0 flex-1" style={{ color: COLORS.textSecondary }}>{mod.description}</p>
            <div className="flex flex-wrap gap-3">
                <Button type="primary" onClick={() => navigate(mod.saasPath)}>As SaaS</Button>
                <Button type="primary" onClick={() => navigate(mod.servicePath)}>As Service Provider</Button>
            </div>
        </div>
    );
};

const HomeDashboardPage = () => {
    return (
        <div className="p-4 md:p-8">
            <h1 className="text-3xl font-extrabold mb-2" style={{ color: COLORS.headingBlue }}>Dashboard</h1>
            <p className="text-sm mb-1" style={{ color: COLORS.textPrimary }}>
                Welcome to the central command for the motor insurance super-admin console
            </p>
            <p className="text-sm mb-6" style={{ color: COLORS.textSecondary }}>
                Manage motor claims, insurer partnerships, and oversee system performance
            </p>

            <div className="flex flex-wrap gap-6 mb-6">
                {MODULES.map((mod) => <ModuleCard key={mod.key} mod={mod} />)}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-2xl p-6" style={{ background: COLORS.bgSoftBlue }}>
                    <h3 className="text-lg font-bold m-0" style={{ color: COLORS.headingBlue }}>System Performance</h3>
                    <p className="text-sm mt-1 mb-4" style={{ color: COLORS.textSecondary }}>Real-time telemetry and system audit logs.</p>
                    <div className="flex items-center gap-6">
                        <div>
                            <span className="text-2xl font-extrabold block" style={{ color: COLORS.headingBlue }}>99.9%</span>
                            <span className="text-sm" style={{ color: COLORS.textSecondary }}>Up Time</span>
                        </div>
                        <div>
                            <span className="text-2xl font-extrabold block" style={{ color: COLORS.headingBlue }}>24ms</span>
                            <span className="text-sm" style={{ color: COLORS.textSecondary }}>Latency</span>
                        </div>
                        <Button type="primary" className="ml-auto">Generate Report</Button>
                    </div>
                </div>

                <div className="rounded-2xl p-6" style={{ background: '#F3F4F6' }}>
                    <span className="text-xs font-bold tracking-widest" style={{ color: COLORS.textMuted }}>QUICK ACTION</span>
                    <div className="flex items-center gap-2 mt-1">
                        <h3 className="text-lg font-bold m-0" style={{ color: COLORS.headingBlue }}>Generate Report</h3>
                        <ArrowRightOutlined style={{ color: COLORS.headingBlue }} />
                    </div>
                    <p className="text-sm mt-1 mb-0" style={{ color: COLORS.textSecondary }}>Last report generated 2 hours ago by admin</p>
                </div>
            </div>

            <p className="text-xs mt-8" style={{ color: COLORS.textMuted }}>v1.0.0 · IBima Assist Super Admin</p>
        </div>
    );
};

export default HomeDashboardPage;
