"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import clsx from "clsx";

export function NavBar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const isAuthPage =
    pathname?.startsWith("/login") || pathname?.startsWith("/register");

  if (isAuthPage) return null;

  return (
    <header className="border-b border-white/10 sticky top-0 bg-slate-950/60 backdrop-blur z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-semibold tracking-tight">
          IT Asset SaaS
        </Link>
        <nav className="flex items-center gap-3">
          <Link
            href="/assets"
            className={clsx(
              "btn-ghost",
              pathname === "/assets" && "ring-1 ring-white/20"
            )}
          >
            Assets
          </Link>
          {status === "loading" ? (
            <span className="text-sm text-slate-400">…</span>
          ) : session ? (
            <>
              <span className="text-sm text-slate-300 hidden md:inline">
                Hi, {session.user?.name || session.user?.email}
              </span>
              <button onClick={() => signOut()} className="btn-primary">
                Sign out
              </button>
            </>
          ) : (
            <button onClick={() => signIn()} className="btn-primary">
              Sign in
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}