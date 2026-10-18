"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  admin: { id: string; name: string | null; phone: string; categoryIds: string[] };
  allCategories: { id: string; name: string }[];
};

export default function AdminRow({ admin, allCategories }: Props) {
  const [editing, setEditing] = useState(false);
  const [categoryIds, setCategoryIds] = useState(admin.categoryIds);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function toggle(id: string) {
    setCategoryIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function save() {
    setLoading(true);
    await fetch(`/api/admin/admins/${admin.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryIds }),
    });
    setLoading(false);
    setEditing(false);
    router.refresh();
  }

  async function demote() {
    if (!confirm(`دسترسی ادمین «${admin.name || admin.phone}» لغو شود؟`)) return;
    setLoading(true);
    await fetch(`/api/admin/admins/${admin.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ demote: true }),
    });
    setLoading(false);
    router.refresh();
  }

  const categoryNames = allCategories.filter((c) => admin.categoryIds.includes(c.id)).map((c) => c.name);

  if (editing) {
    return (
      <tr className="border-t">
        <td className="p-3">{admin.name || "—"}</td>
        <td className="p-3">{admin.phone}</td>
        <td className="p-3">
          <div className="flex flex-wrap gap-1">
            {allCategories.map((c) => (
              <label
                key={c.id}
                className={`text-xs border rounded-full px-2 py-0.5 cursor-pointer ${
                  categoryIds.includes(c.id) ? "bg-brand-500 text-white border-brand-500" : "bg-white text-gray-600"
                }`}
              >
                <input type="checkbox" checked={categoryIds.includes(c.id)} onChange={() => toggle(c.id)} className="hidden" />
                {c.name}
              </label>
            ))}
          </div>
        </td>
        <td className="p-3 flex gap-2">
          <button onClick={save} disabled={loading} className="text-green-600 text-xs">
            ذخیره
          </button>
          <button onClick={() => setEditing(false)} className="text-gray-500 text-xs">
            انصراف
          </button>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-t">
      <td className="p-3">{admin.name || "—"}</td>
      <td className="p-3">{admin.phone}</td>
      <td className="p-3 text-xs text-gray-500">{categoryNames.join("، ") || "—"}</td>
      <td className="p-3 flex gap-2">
        <button onClick={() => setEditing(true)} className="text-brand-600 text-xs">
          ویرایش دسترسی
        </button>
        <button onClick={demote} disabled={loading} className="text-red-600 text-xs">
          لغو دسترسی ادمین
        </button>
      </td>
    </tr>
  );
}
