"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { authService, ApiError } from "@/services/api";
import { useAuth } from "@/components/auth/AuthProvider";

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [demoError, setDemoError] = useState("");
  const [demoBusy, setDemoBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const session = await authService.login({ email, password });
      signIn(session.token, session.user);
      router.replace("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to sign in.");
    } finally {
      setBusy(false);
    }
  }

  async function continueAsGuest() {
    setDemoBusy(true);
    setError("");
    setDemoError("");
    try {
      const session = await authService.demoLogin();
      signIn(session.token, session.user);
      router.replace("/");
    } catch (err) {
      setDemoError(err instanceof ApiError ? err.message : "Unable to start the demo. Please try again.");
    } finally {
      setDemoBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F3F4F8] flex items-center justify-center p-4">
      <section className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
        <Link href="/" className="text-3xl font-extrabold tracking-tight text-gray-900">
          Dine<span className="text-orange-500">Desk</span>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-8">Welcome back</h1>
        <p className="text-sm text-gray-500 mt-1">Sign in to manage your restaurant.</p>
        <form onSubmit={submit} className="space-y-4 mt-7">
          <label className="block text-sm font-semibold text-gray-700">
            Email
            <input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-normal focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500" />
          </label>
          <label className="block text-sm font-semibold text-gray-700">
            Password
            <input required type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-normal focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500" />
          </label>
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          <button disabled={busy || demoBusy} className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition">
            {busy ? "Signing in…" : "Sign In"}
          </button>
          <button
            type="button"
            disabled={busy || demoBusy}
            onClick={() => void continueAsGuest()}
            className="w-full border border-gray-200 bg-white hover:bg-orange-50 disabled:opacity-60 text-gray-800 font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
          >
            {demoBusy ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" aria-hidden="true" />Starting demo...</> : "Continue as Guest / Demo Visitor"}
          </button>
          {demoError && <p role="alert" className="text-sm text-red-600">{demoError}</p>}
        </form>
        <p className="text-sm text-center text-gray-500 mt-6">New to DineDesk? <Link href="/register" className="text-orange-600 font-semibold hover:underline">Create owner account</Link></p>
      </section>
    </main>
  );
}
