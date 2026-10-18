"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Category = { id: string; name: string };

export default function NewCategoryForm({ categories }: { categories: Category[] }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState("");
  const [requiresOwnMobile, setRequiresOwnMobile] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug, parentId: parentId || undefined, requiresOwnMobile }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setName("");
    setSlug("");
    setParentId("");
    setRequiresOwnMobile(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border rounded-xl p-4 flex flex-wrap items-end gap-3">
      <div>
        <label className="text-xs text-gray-500 block mb-1">نام دسته‌بندی</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border rounded-lg px-2 py-1.5 text-sm"
          required
        />
      </div>
      <div>
        <label className="text-xs text-gray-500 block mb-1">نامک (slug)</label>
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="border rounded-lg px-2 py-1.5 text-sm"
          required
        />
      </div>
      <div>
        <label className="text-xs text-gray-500 block mb-1">زیرمجموعه‌ی (اختیاری)</label>
        <select
          value={parentId}
          onChange={(e) => setParentId(e.target.value)}
          className="border rounded-lg px-2 py-1.5 text-sm"
        >
          <option value="">— بدون والد —</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <label className="flex items-center gap-2 text-xs text-gray-600">
        <input
          type="checkbox"
          checked={requiresOwnMobile}
          onChange={(e) => setRequiresOwnMobile(e.target.checked)}
        />
        خرید فقط با موبایل اختصاصی (احراز شاهکار)
      </label>
      <button
        disabled={loading}
        className="bg-brand-500 text-white rounded-lg px-4 py-2 text-sm disabled:opacity-50"
      >
        ایجاد دسته‌بندی
      </button>
      {error && <span className="text-red-600 text-xs">{error}</span>}
    </form>
  );
}
