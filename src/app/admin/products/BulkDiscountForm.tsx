"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BulkDiscountForm({ categories }: { categories: { id: string; name: string }[] }) {
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  const [percent, setPercent] = useState(10);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const router = useRouter();

  async function apply() {
    setLoading(true);
    setMsg("");
    const res = await fetch("/api/admin/products/bulk-discount", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId, discountPercent: percent }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setMsg(`تخفیف ${percent}٪ روی ${data.updated} محصول اعمال شد.`);
      router.refresh();
    } else {
      setMsg(data.error);
    }
  }

  if (categories.length === 0) return null;

  return (
    <div className="bg-white border rounded-xl p-4 flex flex-wrap items-center gap-3">
      <span className="text-sm text-gray-600 font-medium">تخفیف گروهی:</span>
      <select
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
        className="border rounded-lg px-2 py-1.5 text-sm"
      >
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <input
        type="number"
        value={percent}
        onChange={(e) => setPercent(Number(e.target.value))}
        className="border rounded-lg px-2 py-1.5 text-sm w-20"
      />
      <span className="text-sm text-gray-500">٪</span>
      <button
        onClick={apply}
        disabled={loading}
        className="bg-gray-800 text-white rounded-lg px-3 py-1.5 text-sm disabled:opacity-50"
      >
        اعمال روی کل دسته‌بندی
      </button>
      {msg && <span className="text-xs text-gray-500">{msg}</span>}
    </div>
  );
}
