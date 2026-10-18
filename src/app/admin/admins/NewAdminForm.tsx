"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Category = { id: string; name: string };

export default function NewAdminForm({ categories }: { categories: Category[] }) {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function toggle(id: string) {
    setCategoryIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/admins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, name, categoryIds }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setPhone("");
    setName("");
    setCategoryIds([]);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border rounded-xl p-4 space-y-3">
      <h2 className="font-medium text-gray-700">افزودن ادمین جدید</h2>
      <div className="flex flex-wrap gap-3">
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="شماره موبایل (09xxxxxxxxx)"
          className="border rounded-lg px-3 py-2 text-sm"
          required
        />
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="نام (اختیاری)"
          className="border rounded-lg px-3 py-2 text-sm"
        />
      </div>

      <div>
        <p className="text-xs text-gray-500 mb-2">دسترسی به دسته‌بندی‌های زیر:</p>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <label
              key={c.id}
              className={`text-xs border rounded-full px-3 py-1 cursor-pointer ${
                categoryIds.includes(c.id) ? "bg-brand-500 text-white border-brand-500" : "bg-white text-gray-600"
              }`}
            >
              <input type="checkbox" checked={categoryIds.includes(c.id)} onChange={() => toggle(c.id)} className="hidden" />
              {c.name}
            </label>
          ))}
        </div>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        disabled={loading}
        className="bg-brand-500 hover:bg-brand-600 text-white rounded-lg px-4 py-2 text-sm disabled:opacity-50"
      >
        {loading ? "در حال ذخیره..." : "ایجاد ادمین"}
      </button>
    </form>
  );
}
