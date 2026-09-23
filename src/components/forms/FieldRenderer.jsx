import React, { useState } from 'react';
import dayjs from 'dayjs';
import {
    Form, Input, InputNumber, Select, DatePicker, Checkbox, Radio, Upload, ColorPicker, Row, Col,
} from 'antd';
import { UploadOutlined, LinkOutlined, CheckCircleFilled, MobileOutlined, DesktopOutlined, AppstoreOutlined } from '@ant-design/icons';
import OnOffSwitch from '../ui/OnOffSwitch';
import { COLORS } from '../../constants/theme';

/*
 * Config-driven field renderer for the creation forms. A field config is:
 *   { name, label, type, placeholder, options, span (12|24), required, rules, disabled }
 * Types: text | email | phone | pan | gst | ifsc | pin | aadhaar | number | textarea |
 *        password | select | multiselect | date | auto | static | url | upload |
 *        dropzone | checkboxes | switches | color | platformCards | statusRadios
 * Values are kept JSON-friendly (dates as ISO strings, files as file names)
 * so a submitted form can be stored as-is.
 */

const Label = ({ children, required }) => (
    <span className="text-[13px] font-semibold" style={{ color: COLORS.textPrimary }}>
        {children}{required && <span style={{ color: COLORS.danger }}> *</span>}
    </span>
);

// Built-in format checks, keyed by field type.
const PATTERN_RULES = {
    email: [{ type: 'email', message: 'Enter a valid email address' }],
    phone: [{ pattern: /^(\+91[\s-]?)?[6-9]\d{9}$/, message: 'Enter a valid 10-digit mobile number' }],
    pan: [{ pattern: /^[A-Z]{5}\d{4}[A-Z]$/i, message: 'PAN format: ABCDE1234F' }],
    gst: [{ pattern: /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/i, message: 'Enter a valid 15-character GSTIN' }],
    ifsc: [{ pattern: /^[A-Z]{4}0[A-Z0-9]{6}$/i, message: 'IFSC format: ABCD0123456' }],
    pin: [{ pattern: /^\d{6}$/, message: 'PIN must be 6 digits' }],
    aadhaar: [{ pattern: /^\d{4}\s?\d{4}\s?\d{4}$/, message: 'Aadhaar must be 12 digits' }],
    url: [{ type: 'url', message: 'Enter a valid URL (https://...)' }],
    account: [{ pattern: /^\d{9,18}$/, message: 'Account number must be 9-18 digits' }],
};

const toOptions = (options = []) => options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o));

/** Text-looking box that is actually a file picker (value = file name). */
const UploadBox = ({ value, onChange, placeholder, disabled, accept }) => (
    <Upload className="upload-box" showUploadList={false} beforeUpload={() => false} disabled={disabled} accept={accept} onChange={(info) => onChange?.(info.file?.name ?? '')}>
        <div className="flex items-center justify-between cursor-pointer w-full" style={{ height: 34, padding: '0 11px', borderRadius: 6, border: `1px solid #D9D9D9`, background: disabled ? '#F5F5F5' : COLORS.bgField, minWidth: 0 }}>
            <span className="text-[13px] truncate" style={{ color: value ? COLORS.textPrimary : '#BFBFBF' }}>{value || placeholder}</span>
            <UploadOutlined style={{ color: COLORS.textSecondary, flexShrink: 0, marginLeft: 8 }} />
        </div>
    </Upload>
);

/** Large dashed logo drop area with local preview (value = file name). */
const DropZone = ({ value, onChange, placeholder, disabled, compact }) => {
    const [preview, setPreview] = useState(null);
    return (
        <Upload.Dragger
            showUploadList={false}
            beforeUpload={() => false}
            accept="image/png,image/jpeg"
            disabled={disabled}
            onChange={(info) => {
                const file = info.file;
                onChange?.(file?.name ?? '');
                if (file) setPreview(URL.createObjectURL(file.originFileObj ?? file));
            }}
            style={{ background: COLORS.bgField, width: compact ? 140 : '100%' }}
        >
            <div className="flex flex-col items-center justify-center gap-2 py-2" style={{ minHeight: compact ? 90 : 110 }}>
                {preview
                    ? <img src={preview} alt="Logo preview" style={{ maxHeight: 80, maxWidth: '100%', objectFit: 'contain' }} />
                    : <UploadOutlined style={{ fontSize: 30, color: COLORS.primary }} />}
                <span className="text-xs" style={{ color: COLORS.textSecondary }}>{value || placeholder}</span>
            </div>
        </Upload.Dragger>
    );
};

const PLATFORM_CARDS = [
    { value: 'Mobile', icon: <MobileOutlined />, color: COLORS.primary },
    { value: 'Web', icon: <DesktopOutlined />, color: '#15803D' },
    { value: 'Both', icon: <AppstoreOutlined />, color: '#F59E0B' },
];

/** Mobile / Web / Both selectable tiles (Surveyor "Platform & App Access"). */
const PlatformCards = ({ value, onChange, disabled }) => (
    <div className="flex flex-wrap gap-3">
        {PLATFORM_CARDS.map((c) => {
            const selected = value === c.value;
            return (
                <button key={c.value} type="button" disabled={disabled} onClick={() => onChange?.(c.value)} className="flex flex-col items-center gap-1">
                    <span className="relative flex items-center justify-center rounded-md" style={{ width: 52, height: 56, background: '#F8FAFC', border: `1px solid ${selected ? COLORS.primary : COLORS.border}`, color: c.color, fontSize: 24 }}>
                        {c.icon}
                        <span className="absolute" style={{ top: 3, right: 4, fontSize: 11, color: selected ? COLORS.textPrimary : '#CBD5E1' }}>
                            {selected ? <CheckCircleFilled /> : <span className="inline-block rounded-full" style={{ width: 10, height: 10, border: '1px solid #94A3B8' }} />}
                        </span>
                    </span>
                    <span className="text-[11px]">{c.value}</span>
                </button>
            );
        })}
    </div>
);

/** Row of On/Off switches bound to an object value ({ 'Hub Manager': true, ... }). */
const SwitchGroup = ({ value = {}, onChange, options, disabled }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
        {options.map((o) => (
            <label key={o} className="flex items-center gap-3 text-[13px] font-medium">
                {o}
                <OnOffSwitch checked={!!value[o]} disabled={disabled} onChange={(v) => onChange?.({ ...value, [o]: v })} />
            </label>
        ))}
    </div>
);

const ColorField = ({ value = '#004AC6', onChange, disabled }) => (
    <div className="inline-flex items-center gap-3 rounded-md pr-10" style={{ background: COLORS.bgField, padding: 6 }}>
        <ColorPicker value={value} disabled={disabled} onChange={(c) => onChange?.(c.toHexString().toUpperCase())} />
        <span className="font-semibold text-sm">{value}</span>
    </div>
);

const dateProps = {
    getValueProps: (v) => ({ value: v ? dayjs(v) : null }),
    normalize: (v) => (v ? v.toISOString() : null),
};

function renderControl(field, disabled) {
    const common = { placeholder: field.placeholder, disabled: disabled || field.disabled };
    switch (field.type) {
        case 'textarea':
            return <Input.TextArea rows={field.rows ?? 4} {...common} />;
        case 'password':
            return <Input.Password {...common} autoComplete="new-password" />;
        case 'number':
            return <InputNumber min={0} className="w-full" style={{ width: '100%' }} {...common} />;
        case 'select':
            return <Select options={toOptions(field.options)} allowClear showSearch={{ optionFilterProp: 'label' }} {...common} />;
        case 'multiselect':
            return <Select mode="multiple" options={toOptions(field.options)} allowClear maxTagCount="responsive" {...common} />;
        case 'date':
            return <DatePicker format="DD-MM-YYYY" className="w-full" {...common} />;
        case 'auto':
        case 'static':
            return <Input {...common} disabled />;
        case 'url':
            return <Input suffix={<LinkOutlined style={{ color: COLORS.textMuted }} />} {...common} />;
        case 'upload':
            return <UploadBox {...common} accept={field.accept} />;
        case 'dropzone':
            return <DropZone {...common} compact={field.compact} />;
        case 'checkboxes':
            return <Checkbox.Group options={toOptions(field.options)} disabled={common.disabled} className="flex flex-wrap gap-x-5 gap-y-2" />;
        case 'switches':
            return <SwitchGroup options={field.options} disabled={common.disabled} />;
        case 'color':
            return <ColorField disabled={common.disabled} />;
        case 'platformCards':
            return <PlatformCards disabled={common.disabled} />;
        case 'statusRadios':
            return <Radio.Group options={toOptions(field.options)} disabled={common.disabled} className="flex flex-wrap gap-x-5 gap-y-2" />;
        default:
            return <Input {...common} maxLength={field.maxLength} />;
    }
}

/** One field -> <Form.Item> inside a responsive column. */
export const Field = ({ field, disabled }) => {
    if (field.type === 'spacer') return <Col xs={0} md={12} />;
    const rules = [
        ...(field.required ? [{ required: true, message: `${field.label} is required` }] : []),
        ...(PATTERN_RULES[field.type] ?? PATTERN_RULES[field.validate] ?? []),
        ...(field.rules ?? []),
    ];
    const extraProps = field.type === 'date' ? dateProps : {};
    const span = field.span ?? 12;
    return (
        <Col xs={24} md={span}>
            <Form.Item
                name={field.name}
                label={field.label ? <Label required={field.required}>{field.label}</Label> : null}
                rules={rules}
                {...extraProps}
            >
                {renderControl(field, disabled)}
            </Form.Item>
        </Col>
    );
};

/** A whole section's fields laid out on a 2-column grid. */
const FieldGrid = ({ fields, disabled }) => (
    <Row gutter={16}>
        {fields.map((f) => <Field key={f.key ?? f.name} field={f} disabled={disabled} />)}
    </Row>
);

export default FieldGrid;
