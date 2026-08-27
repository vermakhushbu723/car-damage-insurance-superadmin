# Car Damage Insurance — Super Admin

React + Ant Design + Tailwind CSS super-admin console, built from the
supplied Figma screenshots: a shared sidebar/topbar shell, a module/mode
picker hub, 4 dashboard variants (Claim/Preinspection × SaaS/Service
Provider), and the "SaaS New ID Creation" (Insurer) multi-section form.

This is a **UI-only** build for now -- no backend yet. Login, dashboard
numbers, and table rows all come from mock data / a local session flag
(see the "UI-only, no backend yet" notes in the code) so the whole flow is
clickable and demoable; swap the marked spots for real API calls later.

## Folder structure

```
src/
├── App.jsx, main.jsx, index.css      entrypoint + Tailwind import
├── auth/                             UI-only session flag + route guard
│   ├── session.js
│   └── RequireAuth.jsx
├── routes/
│   └── AppRoutes.jsx                 every route in one place
├── constants/
│   ├── routes.js                     route path constants
│   ├── navigation.js                 sidebar item config
│   ├── theme.js                      brand palette + antd ConfigProvider theme
│   └── mockData.js                   dashboard stats/table mock data
├── components/
│   ├── layout/                       AppLayout, Sidebar, Topbar (shared shell)
│   ├── dashboard/                    StatCard, ClaimsByStatusCard,
│   │                                 DistributionDonutCard, ClaimsTable,
│   │                                 + the two dashboard "flavors"
│   │                                 (ClaimsCentricDashboard,
│   │                                 PartnerCentricDashboard)
│   ├── insurer/                      StepNav, FormSectionCard (New ID form)
│   └── common/                       PageHeader, PlaceholderPage
├── pages/
│   ├── auth/LoginPage.jsx
│   ├── home/HomeDashboardPage.jsx    the module/mode picker hub
│   ├── dashboards/                   4 thin pages, one per module × mode
│   ├── insurer/                      InsurerListPage, InsurerNewIdCreationPage
│   └── placeholders/                 Internal User/Broker/Surveyor/Workshop/
│                                     Settings/Support (not in the reference
│                                     design yet -- simple "coming soon" pages)
└── assets/images/                    login hero image + IBima Assist logo
```

## How the 4 dashboards map to the screenshots

- **Claim → As SaaS**: Total/Approved/Pending Claims stats, Claim ID +
  Customer Name table, "Create SaaS ID" button.
- **Claim → Service Provider**, **Preinspection → As SaaS**,
  **Preinspection → Service Provider**: all three share the same
  Insurer/Broker/Others-stat layout (Insurar Name/State/Religion table,
  "Create User" button) -- they only differ by title text and the `Others`
  count, matching the reference screenshots exactly.

Both "flavors" are one shared component each
(`components/dashboard/ClaimsCentricDashboard.jsx` and
`PartnerCentricDashboard.jsx`) so a 5th module/mode combination is just a
new thin page + a route, not a new dashboard to build from scratch.

## Setup

```bash
npm install
npm run dev      # http://localhost:5180
```

Sign in with any email/password + the on-screen captcha (no backend yet,
see auth/session.js).
