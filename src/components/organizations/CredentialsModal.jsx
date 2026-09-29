import React, { useState } from 'react';
import { Modal, Button, App } from 'antd';
import { CheckCircleFilled, CopyOutlined, DownloadOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { COLORS } from '../../constants/theme';

/**
 * Shown right after an organization ID is created: the generated
 * Organization ID, admin login ID and temporary password, with copy /
 * download. `data` = null hides it; closing goes back to the list.
 */
const CredentialsModal = ({ data, onClose }) => {
    const { message } = App.useApp();
    const [showPassword, setShowPassword] = useState(false);
    if (!data) return null;

    const rows = [
        ['Organization', `${data.name} (${data.type})`],
        ['Organization ID', data.orgId],
        ['ID Type', `${data.idType} ID · ${data.serviceModel}`],
        ['Status', 'Active'],
        ['Admin Login ID', data.loginId],
        ...(data.email ? [['Registered Email', data.email]] : []),
        ['Temporary Password', data.password, 'password'],
        ['Valid Till', data.validTill],
    ];
    const asText = rows.map(([k, v]) => `${k}: ${v}`).join('\n');

    const copy = async (text, what) => {
        try {
            await navigator.clipboard.writeText(text);
            message.success(`${what} copied.`);
        } catch {
            message.error('Copy failed -- select the text and copy it manually.');
        }
    };

    const download = () => {
        const url = URL.createObjectURL(new Blob([`IBima Assist -- New ID credentials\n\n${asText}\n\nThe password must be changed at first login.\n`], { type: 'text/plain' }));
        const a = document.createElement('a');
        a.href = url;
        a.download = `${data.orgId}_credentials.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <Modal
            open
            centered
            closable={false}
            maskClosable={false}
            width={520}
            title={(
                <span className="flex items-center gap-2">
                    <CheckCircleFilled style={{ color: COLORS.success, fontSize: 20 }} />
                    {data.idType} ID created successfully
                </span>
            )}
            footer={[
                <Button key="copy" icon={<CopyOutlined />} onClick={() => copy(asText, 'All details')}>Copy All</Button>,
                <Button key="dl" icon={<DownloadOutlined />} onClick={download}>Download</Button>,
                <Button key="done" type="primary" onClick={onClose}>Done</Button>,
            ]}
        >
            <p className="text-[13px] mt-0 mb-3" style={{ color: COLORS.textSecondary }}>
                Share these login details with the organization admin. They will be asked to change the password at first login.
            </p>
            <div className="rounded-md overflow-hidden" style={{ border: `1px solid ${COLORS.border}` }}>
                {rows.map(([label, value, kind], i) => (
                    <div key={label} className="flex items-center gap-3 px-3 py-2 text-[13px]" style={{ background: i % 2 ? '#fff' : '#F8FAFC' }}>
                        <span className="w-[140px] shrink-0 font-medium" style={{ color: COLORS.textSecondary }}>{label}</span>
                        <span className="flex-1 min-w-0 break-all font-semibold" style={{ color: COLORS.textPrimary, fontFamily: kind === 'password' || /ID$/.test(label) ? 'monospace' : undefined }}>
                            {kind === 'password' && !showPassword ? '•'.repeat(value.length) : value}
                        </span>
                        {kind === 'password' && (
                            <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((s) => !s)} style={{ color: COLORS.textSecondary }}>
                                {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                            </button>
                        )}
                        {(kind === 'password' || /ID$/.test(label)) && (
                            <button type="button" aria-label={`Copy ${label}`} onClick={() => copy(value, label)} style={{ color: COLORS.primary }}>
                                <CopyOutlined />
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </Modal>
    );
};

export default CredentialsModal;
