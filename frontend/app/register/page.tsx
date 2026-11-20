"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { authService, ApiError } from "@/services/api";
import { useAuth } from "@/components/auth/AuthProvider";

export default function RegisterPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [form, setForm] = useState({ restaurantName: "", name: "", email: "", phone: "", address: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const change = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const session = await authService.register(form);
      signIn(session.token, session.user);
      router.replace("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to create the owner account.");
    } finally {
      setBusy(false);
    }
  }

  const fields: { key: keyof typeof form; label: string; type?: string; required?: boolean }[] = [
    { key: "restaurantName", label: "Restaurant name", required: true },
    { key: "name", label: "Owner name", required: true },
    { key: "email", label: "Email", type: "email", required: true },
    { key: "phone", label: "Phone" },
    { key: "address", label: "Address" },
    { key: "password", label: "Password (at least 6 characters)", type: "password", required: true },
  ];

  return (
    <main className="min-h-screen bg-[#F3F4F8] flex items-center justify-center p-4">
      <section className="w-full max-w-lg bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
        <Link href="/" className="text-3xl font-extrabold tracking-tight text-gray-900">Dine<span className="text-orange-500">Desk</span></Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-8">Register your restaurant</h1>
        <p className="text-sm text-gray-500 mt-1">Public registration creates the restaurant owner account.</p>
        <form onSubmit={submit} className="grid sm:grid-cols-2 gap-4 mt-7">
          {fields.map(({ key, label, type = "text", required }) => (
            <label key={key} className={`block text-sm font-semibold text-gray-700 ${key === "address" ? "sm:col-span-2" : ""}`}>
              {label}
              <input required={required} minLength={key === "password" ? 6 : undefined} type={type} autoComplete={key === "password" ? "new-password" : key === "email" ? "email" : "on"} value={form[key]} onChange={(e) => change(key, e.target.value)} className="mt-1.5 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-normal focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500" />
            </label>
          ))}
          {error && <p role="alert" className="sm:col-span-2 text-sm text-red-600">{error}</p>}
          <button disabled={busy} className="sm:col-span-2 w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition">
            {busy ? "Creating account…" : "Create Owner Account"}
          </button>
        </form>
        <p className="text-sm text-center text-gray-500 mt-6">Already registered? <Link href="/login" className="text-orange-600 font-semibold hover:underline">Sign in</Link></p>
      </section>
    </main>
  );
}
