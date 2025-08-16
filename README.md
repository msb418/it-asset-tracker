# IT Asset Teaching SaaS (Next.js + Auth.js v5 + MongoDB Atlas)

A clean, modern, **fully functional** IT asset tracking SaaS starter.
- Next.js App Router (TypeScript) + Tailwind
- Auth.js (next-auth v5) with Google OAuth + MongoDB Adapter
- MongoDB Atlas via official driver; Mongoose for app models
- Protected routes with middleware
- CRUD for Assets (create, list, view, edit, delete)

## Quick Start
1) Copy environment file:  
   ```bash
   cp .env.example .env.local
   ```
   Fill `MONGODB_URI`, generate `AUTH_SECRET` via `npx auth secret`, and (optionally) set Google:
   `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`.

2) Install & run:
   ```bash
   npm i
   npm run dev
   ```

3) Visit http://localhost:3000  
   Sign in with Google on the Login page. Assets are under **/assets**.

## Notes
- The **Auth.js MongoDB Adapter** expects a connected MongoClient (we provide one in `lib/db.ts`).
- Routes are protected with middleware and server-side checks.
- If deploying behind a proxy, set `AUTH_TRUST_HOST=true` and optionally `AUTH_URL`.

## Tech
- Next.js 14 App Router
- Auth.js (NextAuth v5 beta) + Google OAuth
- MongoDB Adapter + MongoDB Node driver
- Mongoose models for app data (assets)
- Tailwind CSS

---

MIT License
