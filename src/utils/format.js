import dayjs from 'dayjs';

export const formatDate = (iso) => (iso ? dayjs(iso).format('DD MMM YYYY') : '—');
export const formatDateTime = (iso) => (iso ? dayjs(iso).format('DD MMM YYYY, hh:mm A') : '—');
export const formatLongDateTime = (iso) => (iso ? dayjs(iso).format('DD MMMM YYYY hh:mm A') : '—');
export const formatNumber = (n) => (typeof n === 'number' ? n.toLocaleString('en-IN') : n);
export const formatINR = (n) => (typeof n === 'number' ? `₹ ${n.toLocaleString('en-IN')}` : n);

export const initials = (name = '') => name.split(' ').filter(Boolean).slice(0, 2).map((s) => s[0]).join('').toUpperCase();

/** Case-insensitive "any of these fields contains the query" match for search boxes. */
export const matchesQuery = (row, query, fields) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return fields.some((f) => String(row[f] ?? '').toLowerCase().includes(q));
};

/** Build a CSV from rows + [{ title, dataIndex | render }] columns and trigger a browser download. */
export function downloadCsv(fileName, rows, columns) {
    const escape = (v) => {
        const s = String(v ?? '');
        return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const header = columns.map((c) => escape(c.title)).join(',');
    const body = rows.map((r) => columns.map((c) => escape(c.value ? c.value(r) : r[c.dataIndex])).join(',')).join('\n');
    const blob = new Blob([`${header}\n${body}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}
