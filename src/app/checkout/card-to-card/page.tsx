"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function CardToCardPage() {
  const params = useSearchParams();
  const orderId = params.get("orderId") || "";
  const router = useRouter();

  const [trackingCode, setTrackingCode] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/payment/card-to-card", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, trackingCode }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-green-600 font-medium mb-2">کد رهگیری ثبت شد ✅</p>
        <p className="text-sm text-gray-500 mb-6">
          سفارش شما پس از تأیید پرداخت توسط ادمین پردازش خواهد شد.
        </p>
        <button onClick={() => router.push("/account")} className="text-brand-600 text-sm">
          مشاهده سفارش‌های من
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-xl font-bold text-gray-800 mb-4">پرداخت کارت به کارت</h1>
      <div className="bg-white border rounded-xl p-4 mb-6 text-sm text-gray-700 space-y-1">
        <p>شماره کارت: ۶۰۳۷-۹۹۱۲-۰۰۰۰-۰۰۰۰</p>
        <p>به نام: دیجی‌استور</p>
        <p className="text-xs text-gray-400">پس از واریز، کد رهگیری تراکنش را در فیلد زیر وارد کنید.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          value={trackingCode}
          onChange={(e) => setTrackingCode(e.target.value)}
          placeholder="کد رهگیری تراکنش"
          className="border rounded-lg px-3 py-2 w-full text-sm"
          required
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          disabled={loading}
          className="w-full bg-brand-500 hover:bg-brand-600 text-white rounded-lg py-3 font-medium disabled:opacity-50"
        >
          {loading ? "در حال ثبت..." : "ثبت کد رهگیری"}
        </button>
      </form>
    </div>
  );
}
