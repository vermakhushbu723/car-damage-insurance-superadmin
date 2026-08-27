import React from 'react';
import { Button } from 'antd';
import { COLORS } from '../../constants/theme';

const PageHeader = ({ title, actionLabel, onAction, actionIcon }) => (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-extrabold m-0" style={{ color: COLORS.headingBlue }}>{title}</h1>
        {actionLabel && (
            <Button type="primary" size="large" icon={actionIcon} onClick={onAction}>
                {actionLabel}
            </Button>
        )}
    </div>
);

export default PageHeader;
