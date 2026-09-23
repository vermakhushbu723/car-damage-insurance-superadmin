import React from 'react';
import { Modal, Descriptions } from 'antd';

/** Read-only key/value popup for a table row's "View"/eye action. */
const DetailsModal = ({ open, title, items = [], onClose, footer = null, width = 580 }) => (
    <Modal open={open} title={title} onCancel={onClose} footer={footer} width={width} destroyOnHidden>
        <Descriptions
            column={{ xs: 1, sm: 2 }}
            size="small"
            bordered
            items={items.map((it, i) => ({ key: i, label: it.label, children: it.value ?? '—', span: it.span }))}
        />
    </Modal>
);

export default DetailsModal;
