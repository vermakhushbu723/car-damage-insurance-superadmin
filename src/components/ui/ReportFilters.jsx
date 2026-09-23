import React from 'react';
import { Button, DatePicker, Select } from 'antd';
import { COLORS } from '../../constants/theme';

/**
 * The report pages' labelled filter row ("Date Range | Branch | Region |
 * ... | Export" + "Refresh Report"). `filters` = [{ key, label, allLabel,
 * options }]; the first column is always the date range. Choosing an
 * Export option calls `onExport(format)`.
 */
const ReportFilters = ({ range, onRangeChange, filters, values, onChange, onExport, onRefresh, refreshing }) => (
    <div className="filter-bar grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-[minmax(0,1.6fr)_repeat(6,minmax(0,1fr))_auto] gap-x-2 gap-y-2 items-end mb-3">
        <div className="col-span-2 sm:col-span-1">
            <span className="block text-[13px] font-semibold mb-1" style={{ color: COLORS.textPrimary }}>Date Range</span>
            <DatePicker.RangePicker value={range} onChange={onRangeChange} format="DD MMM YY" placeholder={['01 Sep 25', '04 Sep 25']} allowClear className="w-full" />
        </div>
        {filters.map((f) => (
            <div key={f.key}>
                <span className="block text-[13px] font-semibold mb-1" style={{ color: COLORS.textPrimary }}>{f.label}</span>
                <Select
                    className="w-full"
                    value={values[f.key]}
                    onChange={(v) => onChange({ ...values, [f.key]: v })}
                    options={[{ value: 'All', label: f.allLabel }, ...f.options.map((o) => ({ value: o, label: o }))]}
                    popupMatchSelectWidth={false}
                />
            </div>
        ))}
        <div>
            <span className="block text-[13px] font-semibold mb-1" style={{ color: COLORS.textPrimary }}>Export</span>
            <Select
                className="w-full"
                value={null}
                placeholder="Export Excel"
                onChange={onExport}
                options={[{ value: 'excel', label: 'Export Excel' }, { value: 'csv', label: 'Export CSV' }]}
            />
        </div>
        <Button type="primary" onClick={onRefresh} loading={refreshing} className="col-span-2 sm:col-span-1">Refresh Report</Button>
    </div>
);

export default ReportFilters;
