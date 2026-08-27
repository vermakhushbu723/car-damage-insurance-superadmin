// Single source of truth for the brand palette + antd ConfigProvider theme.
// Everything else (Tailwind utility colors used in the layout/dashboard
// components, inline styles) pulls from here so the look stays consistent
// without hunting down every hex code separately.

export const COLORS = {
    // Brand blues
    primary: '#1447D6',
    primaryDark: '#0B2E86',
    primaryDarker: '#08215F',
    sidebarBg: '#0B3FCE',
    sidebarItemActiveBg: '#2954E0',
    topbarBg: '#7C9CEE',
    topbarBgLight: '#8FADF2',

    // Text
    textPrimary: '#0F172A',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    headingBlue: '#1447D6',
    white: '#FFFFFF',

    // Surfaces
    bgApp: '#F5F7FB',
    bgCard: '#FFFFFF',
    bgSoftBlue: '#EFF4FF',
    border: '#E2E8F0',

    // Status
    success: '#16A34A',
    successBg: '#DCFCE7',
    danger: '#DC2626',
    dangerBg: '#FEE2E2',
    warning: '#F59E0B',
    warningBg: '#FEF3C7',
    pendingBadgeBg: '#E2E8F0',
    pendingBadgeText: '#94A3B8',

    // Chart accents (donut / stacked bar)
    chartNavy: '#0B2E86',
    chartBlue: '#93B4F5',
    chartPink: '#FBC7D4',
};

// Passed to antd's <ConfigProvider theme={...}> in main.jsx.
export const antdTheme = {
    token: {
        colorPrimary: COLORS.primary,
        colorLink: COLORS.primary,
        borderRadius: 8,
        fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
    },
    components: {
        Menu: {
            darkItemBg: 'transparent',
            darkItemSelectedBg: COLORS.sidebarItemActiveBg,
            darkItemHoverBg: 'rgba(255,255,255,0.08)',
        },
        Button: {
            controlHeight: 40,
        },
        Table: {
            headerBg: '#F8FAFC',
            headerColor: COLORS.textSecondary,
        },
    },
};
