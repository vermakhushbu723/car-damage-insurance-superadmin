import React from 'react';
import { Tooltip } from 'antd';
import { EyeOutlined, EditOutlined } from '@ant-design/icons';
import { COLORS } from '../../constants/theme';

export const ViewButton = ({ onClick, title = 'View' }) => (
    <Tooltip title={title}>
        <button type="button" onClick={onClick} aria-label={title} className="p-1 rounded hover:bg-slate-100" style={{ color: COLORS.textPrimary, fontSize: 16 }}>
            <EyeOutlined />
        </button>
    </Tooltip>
);

/** Soft-blue "Edit ✎" chip used in the Workflow / API Integration tables. */
export const EditChip = ({ onClick, label = 'Edit' }) => (
    <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[13px] font-medium"
        style={{ background: COLORS.primarySoft, color: COLORS.primary }}
    >
        {label} <EditOutlined />
    </button>
);
