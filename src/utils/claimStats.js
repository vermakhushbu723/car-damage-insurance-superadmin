import dayjs from 'dayjs';

// Claim stages grouped the way the Claim Report tiles count them.
export const CLAIM_GROUPS = {
    survey: ['Intimation', 'Survey'],
    assessment: ['AI ILA', 'ILA', 'FLA'],
    settlement: ['Settled'],
    rejected: ['Rejected'],
};
export const REGION_ORDER = ['North', 'East', 'West', 'South', 'Central'];

const pct = (now, before) => {
    if (!before) return now ? '100%' : '0%';
    return `${Math.abs(Math.round(((now - before) / before) * 100))}%`;
};

/**
 * Claim Report tiles from a list of claims. Each tile's trend compares
 * claims intimated in the last 30 days with the 30 days before.
 */
export function claimTiles(claims) {
    const now = dayjs();
    const last = claims.filter((c) => dayjs(c.intimationDate).isAfter(now.subtract(30, 'day')));
    const prev = claims.filter((c) => {
        const d = dayjs(c.intimationDate);
        return d.isAfter(now.subtract(60, 'day')) && !d.isAfter(now.subtract(30, 'day'));
    });
    const inGroup = (list, g) => list.filter((c) => CLAIM_GROUPS[g].includes(c.status)).length;
    const tile = (key, label, tone, value, a, b) => ({ key, label, tone, value, trend: pct(a, b), down: a < b });
    return [
        tile('total', 'Total Claims', 'blue', claims.length, last.length, prev.length),
        tile('new', 'New Claims', 'purple', last.length, last.length, prev.length),
        tile('survey', 'Pending Survey', 'orange', inGroup(claims, 'survey'), inGroup(last, 'survey'), inGroup(prev, 'survey')),
        tile('assessment', 'Under Assessment', 'teal', inGroup(claims, 'assessment'), inGroup(last, 'assessment'), inGroup(prev, 'assessment')),
        tile('settlement', 'Settlement', 'green', inGroup(claims, 'settlement'), inGroup(last, 'settlement'), inGroup(prev, 'settlement')),
        tile('rejected', 'Rejected', 'red', inGroup(claims, 'rejected'), inGroup(last, 'rejected'), inGroup(prev, 'rejected')),
    ];
}

/** Settled claims per region (all five regions, zero when none). */
export const settlementByRegion = (claims) =>
    REGION_ORDER.map((region) => ({ label: region, value: claims.filter((c) => c.region === region && c.status === 'Settled').length }));

/** Claims per region (any status). */
export const claimsByRegion = (claims) =>
    REGION_ORDER.map((region) => ({ label: region, value: claims.filter((c) => c.region === region).length }));

/** Dropdown options: the standard list plus any other value that appears in the data. */
export const optionsFrom = (base, claims, key) => [...new Set([...base, ...claims.map((c) => c[key]).filter(Boolean)])];

/**
 * Daily claim counts for the dashboard trend.
 * period: 'This Month' (day by day), 'Last Month' (day by day), 'This Year' (month by month).
 */
export function claimsTrend(claims, period) {
    const now = dayjs();
    if (period === 'This Year') {
        return Array.from({ length: now.month() + 1 }, (_, m) => ({
            label: dayjs().month(m).format('MMM'),
            value: claims.filter((c) => dayjs(c.intimationDate).year() === now.year() && dayjs(c.intimationDate).month() === m).length,
        }));
    }
    const start = period === 'Last Month' ? now.subtract(1, 'month').startOf('month') : now.startOf('month');
    const days = period === 'Last Month' ? start.daysInMonth() : now.date();
    return Array.from({ length: days }, (_, i) => {
        const d = start.add(i, 'day');
        return { label: d.format('DD MMM'), value: claims.filter((c) => dayjs(c.intimationDate).isSame(d, 'day')).length };
    });
}

/** Claims of a period, for "Top organizations by claims". */
export function claimsInPeriod(claims, period) {
    const now = dayjs();
    const start = period === 'This Year' ? now.startOf('year') : period === 'Last Month' ? now.subtract(1, 'month').startOf('month') : now.startOf('month');
    const end = period === 'Last Month' ? start.endOf('month') : now.endOf('day');
    return claims.filter((c) => {
        const d = dayjs(c.intimationDate);
        return !d.isBefore(start) && !d.isAfter(end);
    });
}
