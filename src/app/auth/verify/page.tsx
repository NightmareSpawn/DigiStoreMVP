"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function VerifyPage() {
  const params = useSearchParams();
  const phone = params.get("phone") || "";
  const purpose = params.get("purpose") || "login";
  const inviteCode = params.get("inviteCode") || "";
  const referrerCode = params.get("referrerCode") || "";
  const name = params.get("name") || "";

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, code, purpose, inviteCode, referrerCode, name }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error);
      return;
    }
    if (data.role === "SUPER_ADMIN" || data.role === "ADMIN") {
      router.push("/admin");
    } else {
      router.push("/");
    }
    router.refresh();
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <h1 className="text-xl font-bold text-gray-800 mb-2">کد تأیید</h1>
      <p className="text-sm text-gray-500 mb-6">
        کد ۶ رقمی ارسال‌شده به {phone} را وارد کنید.
        <br />
        <span className="text-xs text-amber-600">
          (در حالت توسعه، کد در کنسول سرور/ترمینال چاپ می‌شود)
        </span>
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="------"
          maxLength={6}
          className="border rounded-lg px-3 py-3 w-full text-center text-lg tracking-widest"
          required
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          disabled={loading}
          className="w-full bg-brand-500 hover:bg-brand-600 text-white rounded-lg py-3 font-medium disabled:opacity-50"
        >
          {loading ? "در حال بررسی..." : "تأیید و ورود"}
        </button>
      </form>
    </div>
  );
}
