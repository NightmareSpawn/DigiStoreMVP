"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Category = { id: string; name: string };

type Initial = {
  id?: string;
  title?: string;
  slug?: string;
  description?: string;
  type?: string;
  brand?: string;
  sku?: string;
  categoryId?: string;
  costPrice?: number;
  listPrice?: number;
  price?: number;
  taxPercent?: number;
  shippingCost?: number;
  discountPercent?: number;
  digikalaUrl?: string;
  status?: string;
  imageUrl?: string;
};

export default function ProductForm({ categories, initial }: { categories: Category[]; initial?: Initial }) {
  const [form, setForm] = useState<Initial>({
    type: "PHYSICAL",
    status: "DRAFT",
    categoryId: categories[0]?.id,
    ...initial,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function set<K extends keyof Initial>(key: K, value: Initial[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const url = initial?.id ? `/api/admin/products/${initial.id}` : "/api/admin/products";
    const method = initial?.id ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error);
      return;
    }
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
      <Field label="عنوان">
        <input
          value={form.title || ""}
          onChange={(e) => set("title", e.target.value)}
          className="border rounded-lg px-3 py-2 w-full text-sm"
          required
        />
      </Field>
      <Field label="نامک (slug) — یکتا">
        <input
          value={form.slug || ""}
          onChange={(e) => set("slug", e.target.value)}
          className="border rounded-lg px-3 py-2 w-full text-sm"
          required
        />
      </Field>
      <Field label="دسته‌بندی">
        <select
          value={form.categoryId}
          onChange={(e) => set("categoryId", e.target.value)}
          className="border rounded-lg px-3 py-2 w-full text-sm"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="نوع محصول">
        <select
          value={form.type}
          onChange={(e) => set("type", e.target.value)}
          className="border rounded-lg px-3 py-2 w-full text-sm"
        >
          <option value="PHYSICAL">فیزیکی</option>
          <option value="DOWNLOADABLE_FILE">فایل دانلودی</option>
          <option value="VIDEO_COURSE">ویدئوی آموزشی</option>
          <option value="SERVICE">خدمات</option>
        </select>
      </Field>
      <Field label="برند (اختیاری)">
        <input
          value={form.brand || ""}
          onChange={(e) => set("brand", e.target.value)}
          className="border rounded-lg px-3 py-2 w-full text-sm"
        />
      </Field>
      <Field label="کد کالا / SKU (اختیاری)">
        <input
          value={form.sku || ""}
          onChange={(e) => set("sku", e.target.value)}
          className="border rounded-lg px-3 py-2 w-full text-sm"
        />
      </Field>
      <Field label="آدرس تصویر (URL)">
        <input
          value={form.imageUrl || ""}
          onChange={(e) => set("imageUrl", e.target.value)}
          placeholder="https://..."
          className="border rounded-lg px-3 py-2 w-full text-sm"
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="قیمت تمام‌شده (خرید)">
          <input
            type="number"
            value={form.costPrice || 0}
            onChange={(e) => set("costPrice", Number(e.target.value))}
            className="border rounded-lg px-3 py-2 w-full text-sm"
          />
        </Field>
        <Field label="قیمت خط‌خورده">
          <input
            type="number"
            value={form.listPrice || 0}
            onChange={(e) => set("listPrice", Number(e.target.value))}
            className="border rounded-lg px-3 py-2 w-full text-sm"
          />
        </Field>
        <Field label="قیمت فروش (نهایی)">
          <input
            type="number"
            value={form.price || 0}
            onChange={(e) => set("price", Number(e.target.value))}
            className="border rounded-lg px-3 py-2 w-full text-sm"
            required
          />
        </Field>
        <Field label="درصد تخفیف تکی">
          <input
            type="number"
            value={form.discountPercent || 0}
            onChange={(e) => set("discountPercent", Number(e.target.value))}
            className="border rounded-lg px-3 py-2 w-full text-sm"
          />
        </Field>
        <Field label="درصد مالیات">
          <input
            type="number"
            value={form.taxPercent || 0}
            onChange={(e) => set("taxPercent", Number(e.target.value))}
            className="border rounded-lg px-3 py-2 w-full text-sm"
          />
        </Field>
        <Field label="هزینه ارسال">
          <input
            type="number"
            value={form.shippingCost || 0}
            onChange={(e) => set("shippingCost", Number(e.target.value))}
            className="border rounded-lg px-3 py-2 w-full text-sm"
          />
        </Field>
      </div>

      <Field label="لینک محصول مشابه در دیجی‌کالا (اختیاری)">
        <input
          value={form.digikalaUrl || ""}
          onChange={(e) => set("digikalaUrl", e.target.value)}
          placeholder="https://www.digikala.com/product/..."
          className="border rounded-lg px-3 py-2 w-full text-sm"
        />
      </Field>

      <Field label="توضیحات">
        <textarea
          value={form.description || ""}
          onChange={(e) => set("description", e.target.value)}
          rows={4}
          className="border rounded-lg px-3 py-2 w-full text-sm"
        />
      </Field>

      <Field label="وضعیت">
        <select
          value={form.status}
          onChange={(e) => set("status", e.target.value)}
          className="border rounded-lg px-3 py-2 w-full text-sm"
        >
          <option value="DRAFT">پیش‌نویس</option>
          <option value="PUBLISHED">منتشرشده</option>
          <option value="ARCHIVED">آرشیوشده</option>
        </select>
      </Field>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        disabled={loading}
        className="bg-brand-500 hover:bg-brand-600 text-white rounded-lg px-6 py-2.5 text-sm font-medium disabled:opacity-50"
      >
        {loading ? "در حال ذخیره..." : "ذخیره محصول"}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm text-gray-600 block mb-1">{label}</label>
      {children}
    </div>
  );
}
