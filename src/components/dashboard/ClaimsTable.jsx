import React, { useMemo, useState } from 'react';
import { Input, Table, Tag, Button } from 'antd';
import { SearchOutlined, FilterOutlined, FileExcelOutlined } from '@ant-design/icons';
import { COLORS } from '../../constants/theme';

const STATUS_TAG_STYLES = {
    Approved: { color: COLORS.primary, bg: COLORS.bgSoftBlue },
    Pending: { color: COLORS.textMuted, bg: COLORS.pendingBadgeBg },
    Rejected: { color: COLORS.danger, bg: COLORS.dangerBg },
};

export const StatusTag = ({ status }) => {
    const style = STATUS_TAG_STYLES[status] ?? STATUS_TAG_STYLES.Pending;
    return (
        <Tag style={{ color: style.color, background: style.bg, border: 'none', borderRadius: 6, padding: '2px 12px', fontWeight: 600 }}>
            {status}
        </Tag>
    );
};

/**
 * "All Claims" table shared by every dashboard variant. `columns` is a
 * plain antd Table columns array the page passes in (claims-centric vs
 * partner-centric dashboards show different columns); this component only
 * owns the header/search/export chrome + row filtering.
 */
const ClaimsTable = ({ columns, dataSource, searchableKeys, onView }) => {
    const [query, setQuery] = useState('');

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return dataSource;
        return dataSource.filter((row) =>
            searchableKeys.some((key) => String(row[key] ?? '').toLowerCase().includes(q))
        );
    }, [query, dataSource, searchableKeys]);

    const finalColumns = [
        ...columns,
        {
            title: 'Action',
            key: 'action',
            width: 100,
            render: (_, row) => (
                <Button size="small" onClick={() => onView?.(row)}>View</Button>
            ),
        },
    ];

    return (
        <div className="rounded-2xl p-5" style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}` }}>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                <div>
                    <h3 className="text-lg font-bold m-0" style={{ color: COLORS.textPrimary }}>All Claims</h3>
                    <p className="text-sm m-0" style={{ color: COLORS.textSecondary }}>Detailed Log &amp; Recent Insurance Activities</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <Input
                        placeholder="Search Claims"
                        prefix={<SearchOutlined style={{ color: COLORS.textMuted }} />}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        style={{ width: 200 }}
                    />
                    <Button icon={<FileExcelOutlined />} type="primary">EXPORT TO XL</Button>
                    <Button icon={<FilterOutlined />}>Filter</Button>
                </div>
            </div>

            <Table
                columns={finalColumns}
                dataSource={filtered}
                rowKey="id"
                pagination={{ pageSize: 6, hideOnSinglePage: true }}
                scroll={{ x: 720 }}
            />
        </div>
    );
};

export default ClaimsTable;
