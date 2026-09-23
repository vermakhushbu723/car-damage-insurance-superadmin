import React from 'react';
import { STATUS_STYLES } from '../../constants/theme';

/** Soft pill badge -- colors come from STATUS_STYLES keyed by the status text. */
const StatusTag = ({ status, minWidth = 84, size = 'md' }) => {
    const s = STATUS_STYLES[status] ?? { bg: '#E2E8F0', color: '#475569' };
    return (
        <span
            className="inline-flex items-center justify-center rounded-md font-medium whitespace-nowrap"
            style={{
                background: s.bg,
                color: s.color,
                minWidth,
                fontSize: size === 'sm' ? 11 : 12,
                padding: size === 'sm' ? '2px 8px' : '4px 10px',
            }}
        >
            {status}
        </span>
    );
};

export default StatusTag;
