"use client";

import Link from "next/link";
import { useCompare } from "@/lib/compareStore";

export default function CompareBar() {
  const { productIds, clear } = useCompare();
  if (productIds.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto z-40 bg-gray-900 text-white rounded-xl shadow-lg px-4 py-3 flex items-center gap-4">
      <span className="text-sm">{productIds.length} محصول برای مقایسه انتخاب شده</span>
      <Link href="/compare" className="bg-brand-500 hover:bg-brand-600 rounded-lg px-3 py-1.5 text-sm">
        مشاهده مقایسه
      </Link>
      <button onClick={clear} className="text-xs text-gray-400">
        پاک کردن
      </button>
    </div>
  );
}
