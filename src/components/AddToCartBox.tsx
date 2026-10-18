"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cartStore";

type Variant = { id: string; name: string; priceDelta: number; stock: number };

export default function AddToCartBox({
  productId,
  slug,
  title,
  image,
  basePrice,
  variants,
}: {
  productId: string;
  slug: string;
  title: string;
  image?: string;
  basePrice: number;
  variants: Variant[];
}) {
  const [variantId, setVariantId] = useState(variants[0]?.id);
  const [qty, setQty] = useState(1);
  const add = useCart((s) => s.add);
  const router = useRouter();

  const variant = variants.find((v) => v.id === variantId);
  const unitPrice = basePrice + (variant?.priceDelta || 0);

  function handleAdd() {
    add({
      productId,
      slug,
      title,
      image,
      unitPrice,
      quantity: qty,
      variantId: variant?.id,
      variantName: variant?.name,
    });
    router.push("/cart");
  }

  return (
    <div className="space-y-3">
      {variants.length > 0 && (
        <div>
          <label className="text-sm text-gray-600 block mb-1">تنوع محصول</label>
          <select
            value={variantId}
            onChange={(e) => setVariantId(e.target.value)}
            className="border rounded-lg px-3 py-2 w-full text-sm"
          >
            {variants.map((v) => (
              <option key={v.id} value={v.id} disabled={v.stock <= 0}>
                {v.name} {v.stock <= 0 ? "(ناموجود)" : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex items-center gap-3">
        <label className="text-sm text-gray-600">تعداد</label>
        <input
          type="number"
          min={1}
          value={qty}
          onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
          className="border rounded-lg px-3 py-2 w-20 text-sm"
        />
      </div>

      <button
        onClick={handleAdd}
        className="w-full bg-brand-500 hover:bg-brand-600 text-white rounded-lg py-3 font-medium"
      >
        افزودن به سبد خرید
      </button>
    </div>
  );
}
