# Plesk deploy

This project must be deployed as a Node.js app. Do not upload only the frontend
files to `public` or `httpdocs`, because login and CRM data use `/api/*`
backend routes.

## Temporary deployment without PostgreSQL

For a quick temporary launch, do not set `DATABASE_URL`. The app will use
`data/db.json` as local storage.

Set these environment variables in Plesk Node.js settings:

```env
NODE_ENV=production
JWT_SECRET=change-this-to-a-long-random-secret
```

Plesk Node.js settings:

```text
Application root: the uploaded crm folder
Application startup file: dist/server.cjs
Application mode: production
```

If you upload the package into the existing `/server/public` folder shown in
Plesk File Manager, set:

```text
Application root: /server/public
Application startup file: dist/server.cjs
```

Do not put only the contents of `dist/assets` into `public`. Upload the whole
package contents so `package.json`, `dist/server.cjs`, and `data/db.json` stay
together.

Commands to run after upload:

```bash
npm install --omit=dev
npm run start
```

If you build on the server instead of uploading the existing `dist` folder, run:

```bash
npm install
npm run build
```

## Upload checklist

Upload these files and folders:

```text
dist/
data/
prisma/
server/
package.json
package-lock.json
.env.plesk.example
```

For temporary use, the demo users are already in `data/db.json`.

## CI/CD

GitHub Actions deployment is configured in:

```text
.github/workflows/deploy-plesk.yml
```

CI/CD setup notes and required GitHub Secrets are in:

```text
CI_CD.md
```

The CI/CD workflow does not upload `data/db.json`, so live temporary data on
Plesk is not overwritten by future deployments.

## Demo login

```text
admin@luxx.uz
Admin12345
```
