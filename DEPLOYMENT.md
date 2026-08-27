# Deployment

## Current live setup (reference)

| | |
|---|---|
| VPS | 200.234.37.130, Ubuntu, user `deploy` (same box as `ai-damage-assessment-service` / `car-damage-insurance-web-app` -- see those repos' own `DEPLOYMENT.md`) |
| Site | https://superadmin.ibimaassist.online → nginx → static `dist/` build (this is a pure client-side React SPA, no backend/PM2 process needed) |
| SSL | Let's Encrypt via `certbot --nginx`, auto-renews (reused the VPS's existing certbot account, no new email registration needed) |
| Repo on VPS | `/home/deploy/car-damage-insurance-superadmin` |
| nginx site | `/etc/nginx/sites-available/superadmin` (symlinked into `sites-enabled`) |

## How it was deployed

This is a static build (`npm run build` → `dist/`), so there's no PM2
process for it -- nginx just serves the built files directly, same
pattern as `car-damage-insurance-web-app`'s `ibimaassist.online` site.

```bash
# On the VPS, as deploy (never as root -- see the PM2/ownership gotcha in
# ai-damage-assessment-service/DEPLOYMENT.md, the same "everything must be
# owned by deploy" rule applies here even though there's no PM2 involved):
cd /home/deploy/car-damage-insurance-superadmin
git pull
npm install
npm run build
```

nginx config (`/etc/nginx/sites-available/superadmin`, SSL block added by
certbot):
```nginx
server {
    listen 80;
    server_name superadmin.ibimaassist.online;
    root /home/deploy/car-damage-insurance-superadmin/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;   # SPA fallback for React Router
    }
    location /assets/ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

## To deploy a new version

```bash
ssh deploy@200.234.37.130
cd /home/deploy/car-damage-insurance-superadmin
git pull
npm install   # only if package.json changed
npm run build
# nothing else needed -- nginx serves dist/ directly, no restart required
```

If the repo ever gets cloned/pulled as `root` again (easy mistake on a
fresh VPS session), fix ownership before building:
```bash
sudo chown -R deploy:deploy /home/deploy/car-damage-insurance-superadmin
```

## Known follow-up

`src/assets/images/loginImage.jpg` is ~6.6MB (reused from
`car-damage-insurance-web-app`'s asset) and is by far the largest thing in
the build -- fine for now, but worth compressing before this gets more
real-world traffic.
