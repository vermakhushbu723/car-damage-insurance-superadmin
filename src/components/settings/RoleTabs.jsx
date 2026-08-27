import React from 'react';
import { COLORS } from '../../constants/theme';

const ROLES = ['Insurer Admin', 'Claim Manager', 'Handler', 'Approver', 'Surveyor', 'Finance', 'Viewer/Auditor'];

/** Single-select role pill row above the User & Roles permission matrix. */
const RoleTabs = ({ activeRole, onSelect }) => (
    <div className="flex flex-wrap gap-3 mb-5">
        {ROLES.map((role) => {
            const isActive = role === activeRole;
            return (
                <button
                    key={role}
                    type="button"
                    onClick={() => onSelect(role)}
                    className="text-sm font-semibold rounded-lg"
                    style={{
                        padding: '9px 18px',
                        border: `1.5px solid ${COLORS.primary}`,
                        background: isActive ? COLORS.primary : '#fff',
                        color: isActive ? '#fff' : COLORS.primary,
                    }}
                >
                    {role}
                </button>
            );
        })}
    </div>
);

export default RoleTabs;
