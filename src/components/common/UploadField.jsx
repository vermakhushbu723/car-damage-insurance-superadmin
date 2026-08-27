import React, { useState } from 'react';
import { Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { COLORS } from '../../constants/theme';

/**
 * "Upload-styled" text field -- a bordered box that looks like a text
 * input (placeholder text on the left) but is actually a file picker
 * (upload icon on the right). Used for the small inline upload fields in
 * the Workshop/Surveyor/Broker forms (e.g. "Empanelment valid upto",
 * "License certificate upload", "Profile photo") -- as opposed to
 * BrandingUploadBox-style big dashed dropzones.
 */
const UploadField = ({ placeholder, onChange }) => {
    const [fileName, setFileName] = useState('');

    return (
        <Upload
            showUploadList={false}
            beforeUpload={() => false}
            onChange={(info) => {
                const name = info.file?.name ?? '';
                setFileName(name);
                onChange?.(info.file);
            }}
        >
            <div
                className="flex items-center justify-between cursor-pointer"
                style={{
                    height: 40, padding: '0 12px', borderRadius: 8,
                    border: `1px solid ${COLORS.border}`, background: COLORS.bgApp,
                }}
            >
                <span className="text-sm truncate" style={{ color: fileName ? COLORS.textPrimary : COLORS.textMuted }}>
                    {fileName || placeholder}
                </span>
                <UploadOutlined style={{ color: COLORS.primary, fontSize: 16, flexShrink: 0, marginLeft: 8 }} />
            </div>
        </Upload>
    );
};

export default UploadField;
