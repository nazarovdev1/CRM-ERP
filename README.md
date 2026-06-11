# LUXX CRM

LUXX CRM is a lightweight ERP and CRM workspace for wholesale fashion operations. It brings product catalog management, inventory movements, suppliers, customers, sales orders, purchase orders, invoices, roles, and activity logs into one clean dashboard.

The interface is written in Uzbek and is built for daily operational use: fast navigation, role-based access, practical tables, and a dashboard that summarizes the state of sales, stock, orders, and CRM activity.

## Features

- Role-based authentication for admin, manager, sales, warehouse, and viewer users
- Dashboard metrics for revenue, customers, open deals, low stock, pending purchase orders, recent orders, and audit logs
- Product catalog with categories, SKU data, supplier links, pricing, stock level, and reorder threshold
- Inventory movement tracking for incoming and outgoing stock
- Supplier and manufacturer management
- CRM workspace for customers, leads, deals, and follow-up tasks
- Purchase orders, sales orders, and invoice payment tracking
- Warehouse overview with stock and location-style operational cards
- Admin panel for user role management
- PostgreSQL persistence through Prisma

## Tech Stack

- React
- TypeScript
- Vite
- Express
- Prisma
- PostgreSQL
- JWT authentication
- Tailwind CSS utility classes
- Recharts
- Lucide React icons

## Project Structure

```text
.
+-- prisma/            # Prisma schema and seed scripts
+-- src/               # React application
|   +-- pages/         # Main screens
|   +-- api.ts         # API client
|   +-- App.tsx        # Routing and layout
+-- server.ts          # Express server and API routes
+-- server/            # Server helpers
+-- data/              # Local fallback data
+-- assets/            # Static assets
```

## Getting Started

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env
```

Set the required values:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE"
JWT_SECRET="CHANGE_ME_TO_A_LONG_RANDOM_SECRET"
```

Push the Prisma schema to the database:

```bash
npx prisma db push
```

Seed demo users and sample business data:

```bash
npx tsx prisma/seedDemo.ts
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Demo Accounts

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@luxx.uz` | `Admin12345` |
| Manager | `manager@luxx.uz` | `Manager12345` |
| Sales | `sales@luxx.uz` | `Sales12345` |
| Warehouse | `warehouse@luxx.uz` | `Warehouse12345` |
| Viewer | `viewer@luxx.uz` | `Viewer12345` |

The default admin profile is seeded as `Akbar Nazarov`.

## Useful Scripts

```bash
npm run dev      # Run the app locally
npm run build    # Build the frontend and server bundle
npm run start    # Run the production build
npm run lint     # Type-check the project
```

## Database Notes

The app uses Prisma with PostgreSQL when `DATABASE_URL` is present. A local JSON-style fallback is kept in the codebase for development scenarios, but PostgreSQL is the recommended setup.

The seed scripts use `upsert`, so they can be run more than once without duplicating the main demo records.

## Deployment

For a production deployment:

1. Configure `DATABASE_URL` and `JWT_SECRET` in the hosting provider.
2. Run `npx prisma db push` or your preferred Prisma migration flow.
3. Run `npm run build`.
4. Start the app with `npm run start`.

## Security

Do not commit `.env` or real database credentials. Keep production secrets in the deployment platform's environment variable settings.
