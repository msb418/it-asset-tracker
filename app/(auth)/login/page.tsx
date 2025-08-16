"use client";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto">
      <div className="card p-8">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="text-slate-300 mt-2">Sign in to continue.</p>
        <div className="mt-6 space-y-3">
          <button
            onClick={() => signIn("google", { callbackUrl: "/assets" })}
            className="btn-primary w-full"
          >
            Continue with Google
          </button>
        </div>
        <p className="text-slate-400 text-sm mt-6">
          Don&apos;t have an account? Google will create one on first sign-in.
        </p>
      </div>
    </div>
  );
}