# IT Asset Tracker (Next.js + Auth.js v5 + MongoDB Atlas)

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

![715313AE-6600-41A7-9446-7C7413051A5B_1_201_a](https://github.com/user-attachments/assets/62b7ed14-091d-4482-bab5-4555cce20eb2)
![50D18E6D-59EC-4A76-A9F8-8B1B898D1503_1_201_a](https://github.com/user-attachments/assets/ebd745d3-0547-4a61-8680-f75fe454c670)
![D6F7B53A-F56E-4BC8-8F01-B383BE7B2246_1_201_a](https://github.com/user-attachments/assets/97aff9c3-3668-48a2-b4c8-97b55c30ab9a)
![5A6C72F8-41DD-494F-8794-10431560B78A_1_201_a](https://github.com/user-attachments/assets/cfdd8478-15de-45c3-b582-69cbb03bfee9)

