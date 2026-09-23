import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, App } from 'antd';
import { ArrowRightOutlined, FileProtectOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { COLORS } from '../../constants/theme';
import { ROUTES } from '../../constants/routes';
import { useCollection, useAuditLog } from '../../store/DataStore';
import { downloadCsv, formatDateTime } from '../../utils/format';

const LAST_REPORT_KEY = 'superadmin_last_report_at';
const readLastReport = () => {
    try {
        return localStorage.getItem(LAST_REPORT_KEY);
    } catch {
        return null;
    }
};

/**
 * Dashboard hub (sidebar "Dashboard"): Claim module card whose two buttons
 * open the overview dashboard in SaaS / Service Provider mode, plus the
 * System Performance and Quick Action "Generate Report" cards (both export
 * a real CSV of the current organizations snapshot).
 */
const HomeDashboardPage = () => {
    const navigate = useNavigate();
    const { message } = App.useApp();
    const { items: orgs } = useCollection('organizations');
    const log = useAuditLog();
    const [lastReport, setLastReport] = useState(readLastReport);

    const generateReport = () => {
        downloadCsv(`System_Report_${dayjs().format('YYYY_MM_DD_HHmm')}.csv`, orgs, [
            { title: 'Organization', dataIndex: 'name' },
            { title: 'Type', dataIndex: 'type' },
            { title: 'Service Model', dataIndex: 'serviceModel' },
            { title: 'Status', dataIndex: 'status' },
            { title: 'Users', dataIndex: 'users' },
            { title: 'Claims', dataIndex: 'claims' },
            { title: 'Created On', value: (r) => formatDateTime(r.createdOn) },
        ]);
        const now = new Date().toISOString();
        try {
            localStorage.setItem(LAST_REPORT_KEY, now);
        } catch {
            /* ignore */
        }
        setLastReport(now);
        log('Exported', 'Reports');
        message.success('System report generated and downloaded.');
    };

    return (
        <div>
            <h1 className="text-2xl font-bold m-0" style={{ color: COLORS.headingBlue }}>Dashboard</h1>
            <p className="text-[13px] font-medium mt-2 mb-5 max-w-2xl leading-relaxed" style={{ color: COLORS.textPrimary }}>
                Welcome to the central command for the architectural sanctuary motor insurance System motor claims, manage insurer partnerships, &amp; ocersee system performance
            </p>

            <div className="rounded-lg p-5 max-w-[480px] mb-6" style={{ background: '#fff', border: `1px solid ${COLORS.border}`, boxShadow: '0 2px 6px rgba(15,23,42,0.08)' }}>
                <div className="flex items-center gap-3 mb-3">
                    <span className="flex items-center justify-center rounded-md" style={{ width: 36, height: 36, background: '#83A4E6', color: '#fff', fontSize: 18 }}>
                        <FileProtectOutlined />
                    </span>
                    <h2 className="text-xl font-semibold m-0" style={{ color: COLORS.headingBlue }}>Claim</h2>
                </div>
                <p className="text-[13px] m-0 mb-5 leading-relaxed" style={{ color: COLORS.textPrimary }}>
                    Centralized hub for managing and reviewing motor insurance claims. Oversee lifecycle from initial submission to final resolution with architectural precision.
                </p>
                <div className="flex flex-wrap justify-between gap-3">
                    <Button type="primary" onClick={() => navigate(`${ROUTES.OVERVIEW}?mode=saas`)}>As SaaS</Button>
                    <Button type="primary" onClick={() => navigate(`${ROUTES.OVERVIEW}?mode=service-provider`)}>As Service Provider</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-[1000px]">
                <div className="rounded-lg p-5" style={{ background: '#F3F4F6', border: `1px solid ${COLORS.border}` }}>
                    <h3 className="text-lg font-semibold m-0" style={{ color: COLORS.headingBlue }}>System Performance Sanctuary</h3>
                    <p className="text-[13px] font-medium mt-1 mb-4" style={{ color: COLORS.textPrimary }}>Real-time telemetry and architectural audit logs.</p>
                    <div className="flex flex-wrap items-center gap-6">
                        <div>
                            <span className="text-2xl font-semibold block leading-none" style={{ color: COLORS.headingBlue }}>99.9%</span>
                            <span className="text-[13px]">Up Time</span>
                        </div>
                        <div>
                            <span className="text-2xl font-semibold block leading-none" style={{ color: COLORS.headingBlue }}>24ms</span>
                            <span className="text-[13px]">Latency</span>
                        </div>
                        <Button type="primary" className="ml-auto" onClick={generateReport}>Generate Report</Button>
                    </div>
                </div>

                <button type="button" onClick={generateReport} className="text-left rounded-lg p-5 group" style={{ background: '#F3F4F6', border: `1px solid ${COLORS.border}` }}>
                    <span className="text-[11px] font-medium tracking-[0.3em]" style={{ color: COLORS.textPrimary }}>QUICK ACTION</span>
                    <div className="flex items-center justify-between gap-2 mt-1">
                        <h3 className="text-lg font-semibold m-0" style={{ color: COLORS.headingBlue }}>Generate Report</h3>
                        <ArrowRightOutlined className="transition-transform group-hover:translate-x-1" style={{ color: COLORS.headingBlue, fontSize: 18 }} />
                    </div>
                    <p className="text-[13px] font-medium mt-1 mb-0" style={{ color: COLORS.textPrimary }}>
                        {lastReport ? `Last report generated ${dayjs(lastReport).format('DD MMM, hh:mm A')} by admin` : 'Last report generated 2 hours ago by admin'}
                    </p>
                </button>
            </div>

            <p className="text-[13px] font-medium mt-8 mb-0" style={{ color: COLORS.textPrimary }}>v2.8.0 · Last updated: July 2026</p>
        </div>
    );
};

export default HomeDashboardPage;
