"use client";

import Link from "next/link";
import { useCart } from "@/lib/cartStore";
import { toman } from "@/lib/format";

export default function CartPage() {
  const { items, remove, setQuantity, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 mb-4">سبد خرید شما خالی است.</p>
        <Link href="/" className="text-brand-600 font-medium">
          بازگشت به فروشگاه
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-gray-800 mb-6">سبد خرید</h1>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.productId + (item.variantId || "")}
            className="bg-white border rounded-xl p-3 flex items-center gap-3"
          >
            <img src={item.image} alt={item.title} className="w-16 h-16 rounded-lg object-cover" />
            <div className="flex-1">
              <Link href={`/product/${item.slug}`} className="font-medium text-gray-800 text-sm">
                {item.title}
              </Link>
              {item.variantName && <p className="text-xs text-gray-400">{item.variantName}</p>}
              <p className="text-sm text-gray-700 mt-1">{toman(item.unitPrice)}</p>
            </div>
            <input
              type="number"
              min={1}
              value={item.quantity}
              onChange={(e) =>
                setQuantity(item.productId, Math.max(1, Number(e.target.value)), item.variantId)
              }
              className="border rounded-lg w-16 px-2 py-1 text-sm text-center"
            />
            <button
              onClick={() => remove(item.productId, item.variantId)}
              className="text-red-500 text-xs"
            >
              حذف
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white border rounded-xl p-4 mt-6 flex items-center justify-between">
        <span className="text-gray-600">جمع کل</span>
        <span className="font-bold text-lg text-gray-900">{toman(subtotal())}</span>
      </div>

      <Link
        href="/checkout"
        className="block text-center mt-4 bg-brand-500 hover:bg-brand-600 text-white rounded-lg py-3 font-medium"
      >
        ادامه به تسویه حساب
      </Link>
    </div>
  );
}
