import Link from "next/link";
import { auth } from "@/auth";

export default async function HomePage() {
  const session = await auth();
  return (
    <div className="space-y-6">
      <div className="card p-8">
        <h1 className="text-3xl font-bold">IT Asset Teaching SaaS</h1>
        <p className="text-slate-300 mt-2">
          A modern, production-ready foundation for tracking your organization’s assets.
        </p>
        <div className="mt-6 flex gap-3">
          <Link href="/assets" className="btn-primary">Manage Assets</Link>
          {!session && <Link href="/login" className="btn-ghost">Sign In</Link>}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="card p-6">
          <h2 className="text-xl font-semibold">Auth</h2>
          <p className="text-slate-300">Google OAuth via Auth.js v5, protected routes, sessions.</p>
        </div>
        <div className="card p-6">
          <h2 className="text-xl font-semibold">Data</h2>
          <p className="text-slate-300">MongoDB Atlas, Mongoose models, clean API endpoints.</p>
        </div>
        <div className="card p-6">
          <h2 className="text-xl font-semibold">UI</h2>
          <p className="text-slate-300">Tailwind CSS with a calm, modern gradient aesthetic.</p>
        </div>
      </div>
    </div>
  );
}
