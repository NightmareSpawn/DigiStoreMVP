"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function VerifyOwnMobile({ verified }: { verified: boolean }) {
  const [nationalId, setNationalId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  if (verified) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700 mb-6">
        ✅ احراز هویت موبایل اختصاصی انجام شده — می‌توانید از دسته‌بندی‌های محدود‌شده نیز خرید کنید.
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/account/verify-own-mobile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nationalId }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
      <p className="text-sm text-amber-800 mb-2">
        برای خرید از دسته‌بندی‌های با محدودیت موبایل اختصاصی، احراز هویت شاهکار لازم است.
        <br />
        <span className="text-xs text-amber-600">(این بخش فعلاً نسخه آزمایشی است — بدون اتصال واقعی به سامانه شاهکار)</span>
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={nationalId}
          onChange={(e) => setNationalId(e.target.value)}
          placeholder="کد ملی ۱۰ رقمی"
          maxLength={10}
          className="border rounded-lg px-3 py-1.5 text-sm flex-1"
        />
        <button
          disabled={loading}
          className="bg-amber-600 text-white rounded-lg px-4 py-1.5 text-sm disabled:opacity-50"
        >
          احراز هویت
        </button>
      </form>
      {error && <p className="text-red-600 text-xs mt-2">{error}</p>}
    </div>
  );
}
