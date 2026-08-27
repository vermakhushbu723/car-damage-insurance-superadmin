import React from 'react';
import { COLORS } from '../../constants/theme';

/** Shared field label style used across every multi-step creation form (Insurer/Broker/Surveyor/Workshop). */
const FieldLabel = ({ children }) => (
    <span className="block text-sm font-semibold mb-1.5" style={{ color: COLORS.textPrimary }}>{children}</span>
);

export default FieldLabel;
