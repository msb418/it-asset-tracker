"use client";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="max-w-md mx-auto">
      <div className="card p-8">
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="text-slate-300 mt-2">Use Google to register instantly.</p>
        <div className="mt-6 space-y-3">
          <button onClick={() => signIn("google")} className="btn-primary w-full">
            Sign up with Google
          </button>
        </div>
        <p className="text-slate-400 text-sm mt-6">
          Already have an account? <Link href="/login" className="underline">Sign in</Link>.
        </p>
      </div>
    </div>
  );
}
