"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  category: {
    id: string;
    name: string;
    slug: string;
    parentName?: string;
    productCount: number;
    requiresOwnMobile: boolean;
  };
  allCategories: { id: string; name: string }[];
};

export default function CategoryRow({ category, allCategories }: Props) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const [slug, setSlug] = useState(category.slug);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function save() {
    setLoading(true);
    setError("");
    const res = await fetch(`/api/admin/categories/${category.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setEditing(false);
    router.refresh();
  }

  async function remove() {
    if (!confirm(`دسته‌بندی «${category.name}» حذف شود؟`)) return;
    setLoading(true);
    const res = await fetch(`/api/admin/categories/${category.id}`, { method: "DELETE" });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      alert(data.error);
      return;
    }
    router.refresh();
  }

  if (editing) {
    return (
      <tr className="border-t">
        <td className="p-3">
          <input value={name} onChange={(e) => setName(e.target.value)} className="border rounded px-2 py-1 text-sm w-full" />
        </td>
        <td className="p-3">
          <input value={slug} onChange={(e) => setSlug(e.target.value)} className="border rounded px-2 py-1 text-sm w-full" />
        </td>
        <td className="p-3 text-gray-400">{category.parentName || "—"}</td>
        <td className="p-3">{category.productCount}</td>
        <td className="p-3">{category.requiresOwnMobile ? "بله" : "خیر"}</td>
        <td className="p-3 flex gap-2">
          <button onClick={save} disabled={loading} className="text-green-600 text-xs">
            ذخیره
          </button>
          <button onClick={() => setEditing(false)} className="text-gray-500 text-xs">
            انصراف
          </button>
          {error && <span className="text-red-600 text-xs">{error}</span>}
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-t">
      <td className="p-3">{category.name}</td>
      <td className="p-3 text-gray-500">{category.slug}</td>
      <td className="p-3 text-gray-400">{category.parentName || "—"}</td>
      <td className="p-3">{category.productCount}</td>
      <td className="p-3">{category.requiresOwnMobile ? "بله" : "خیر"}</td>
      <td className="p-3 flex gap-2">
        <button onClick={() => setEditing(true)} className="text-brand-600 text-xs">
          ویرایش
        </button>
        <button onClick={remove} disabled={loading} className="text-red-600 text-xs">
          حذف
        </button>
      </td>
    </tr>
  );
}
