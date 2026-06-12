# CI/CD to Plesk

GitHub Actions deploys the project to Plesk on every push to `main`.

## Required GitHub Secrets

Add these in GitHub:

```text
Settings -> Secrets and variables -> Actions -> New repository secret
```

Required:

```text
PLESK_HOST=luxx.uz
PLESK_USERNAME=host8051
PLESK_TARGET_PATH=/var/www/vhosts/luxx.uz/server/public
```

Use one of these authentication methods:

```text
PLESK_PASSWORD=your_ssh_or_ftp_password
```

or:

```text
PLESK_SSH_KEY=your_private_ssh_key
```

Optional:

```text
PLESK_PORT=22
```

## What the workflow does

1. Installs dependencies with `npm ci`.
2. Runs `npm run lint`.
3. Runs `npm run build`.
4. Uploads `dist`, `prisma`, `server`, and package files to Plesk.
5. Runs `npm install --omit=dev` on Plesk.
6. Restarts the Node.js app with `touch tmp/restart.txt`.

The workflow does not upload `data/db.json`, so temporary production data is not
overwritten on each deployment.

## Plesk Node.js settings

```text
Application root: /server/public
Startup file: dist/server.cjs
Application mode: production
```

Environment variables in Plesk:

```env
NODE_ENV=production
JWT_SECRET=change-this-to-a-long-random-secret
```

Do not set `DATABASE_URL` for the temporary JSON-file deployment.
