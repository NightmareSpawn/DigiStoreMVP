"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error);
      return;
    }
    const q = new URLSearchParams({ phone, purpose: "login" });
    router.push(`/auth/verify?${q.toString()}`);
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <h1 className="text-xl font-bold text-gray-800 mb-6">ورود</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm text-gray-600 block mb-1">شماره موبایل</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="09xxxxxxxxx"
            className="border rounded-lg px-3 py-2 w-full text-sm"
            required
          />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          disabled={loading}
          className="w-full bg-brand-500 hover:bg-brand-600 text-white rounded-lg py-3 font-medium disabled:opacity-50"
        >
          {loading ? "در حال ارسال کد..." : "دریافت کد ورود"}
        </button>
      </form>
      <p className="text-sm text-gray-500 mt-4">
        حساب ندارید؟{" "}
        <Link href="/auth/signup" className="text-brand-600">
          ثبت‌نام
        </Link>
      </p>
    </div>
  );
}
