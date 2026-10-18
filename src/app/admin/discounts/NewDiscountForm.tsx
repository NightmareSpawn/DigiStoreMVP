"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewDiscountForm({ categories }: { categories: { id: string; name: string }[] }) {
  const [code, setCode] = useState("");
  const [percent, setPercent] = useState<number | "">("");
  const [amount, setAmount] = useState<number | "">("");
  const [maxUses, setMaxUses] = useState<number | "">("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/discounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, percent: percent || undefined, amount: amount || undefined, maxUses: maxUses || undefined }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setCode("");
    setPercent("");
    setAmount("");
    setMaxUses("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border rounded-xl p-4 flex flex-wrap items-end gap-3">
      <div>
        <label className="text-xs text-gray-500 block mb-1">کد</label>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className="border rounded-lg px-2 py-1.5 text-sm"
          required
        />
      </div>
      <div>
        <label className="text-xs text-gray-500 block mb-1">درصد تخفیف</label>
        <input
          type="number"
          value={percent}
          onChange={(e) => setPercent(e.target.value ? Number(e.target.value) : "")}
          className="border rounded-lg px-2 py-1.5 text-sm w-24"
        />
      </div>
      <div>
        <label className="text-xs text-gray-500 block mb-1">یا مبلغ ثابت (تومان)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")}
          className="border rounded-lg px-2 py-1.5 text-sm w-32"
        />
      </div>
      <div>
        <label className="text-xs text-gray-500 block mb-1">سقف استفاده</label>
        <input
          type="number"
          value={maxUses}
          onChange={(e) => setMaxUses(e.target.value ? Number(e.target.value) : "")}
          className="border rounded-lg px-2 py-1.5 text-sm w-24"
        />
      </div>
      <button
        disabled={loading}
        className="bg-brand-500 text-white rounded-lg px-4 py-2 text-sm disabled:opacity-50"
      >
        ایجاد کد
      </button>
      {error && <span className="text-red-600 text-xs">{error}</span>}
    </form>
  );
}
