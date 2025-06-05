# Home Dashboard ⚡️

A modern dashboard application for displaying Norwegian power prices (with more to come?). Built with a clean and scalable frontend-first architecture using Next.js and PostgreSQL.

---

## 📦 Tech Stack

### Framework

**Next.js (App Router)**

- React-based framework with built-in routing and server components.
- Using the **App Router** (`/app` directory) for improved layouts, performance, and composability.
- Dev mode uses **Turbopack** for faster builds.

### Styling

**Vanilla CSS**

- Uses plain CSS for styling.
- Allows full control over styles using standard CSS selectors and rules, enabling custom layouts and component-specific design without relying on utility frameworks.

### Database

**Supabase (PostgreSQL)**

- Fully managed, serverless PostgreSQL.
- Includes dashboard UI, auth, storage, and REST/gRPC interfaces.
- Chosen for its easy integration and generous free tier.

### ORM

**Drizzle ORM**

- Lightweight, fully typed ORM for Postgres.
- Promotes transparent, SQL-like query building without boilerplate.
- Ideal fit for serverless environments like Vercel Functions.

### Hosting

**Vercel**

- Handles both frontend deployment and backend serverless functions.
- Enables scheduled background jobs using **Vercel Cron** (used to fetch and store power prices daily).

---

## 🕑 Keep-Alive Cron Job

To prevent Supabase from pausing on the free tier, this project includes a Keep-Alive Cron Job.

- **Endpoint**: `/api/keep-alive`
- **Runs daily** via [Vercel Cron](https://vercel.com/docs/cron-jobs)
- **Security**: Protected by `CRON_SECRET` (required in Authorization header)

The endpoint performs a lightweight DB update to the `keep_alive` table, keeping the Supabase project active.

---

## 🚀 Getting Started

Install dependencies and start the local dev server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

Start editing from `app/page.tsx`. The app auto-updates on file changes.

---

## 📁 Folder Structure (partial)

```
src/
├── app/                # App Router entry points (pages, layouts)
├── components/         # Reusable UI components
├── db/                 # Drizzle ORM schema and setup
├── lib/                # Utility functions (e.g., API wrappers)
├── styles/             # Global styles (vanilla CSS)
├── app/api/            # Vercel serverless functions
│   ├── fetch-prices/   # Function triggered by Vercel Cron
│   └── keep-alive/     # Function triggered by Vercel Cron (Keep-Alive for Supabase)
```

---

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Drizzle ORM Docs](https://orm.drizzle.team)
- [Vercel Cron](https://vercel.com/docs/cron-jobs)

---
