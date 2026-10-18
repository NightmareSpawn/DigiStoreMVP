"use client";

import Link from "next/link";
import { useCart } from "@/lib/cartStore";

export default function CartIcon() {
  const items = useCart((s) => s.items);
  const count = items.reduce((n, i) => n + i.quantity, 0);

  return (
    <Link href="/cart" className="relative text-sm text-gray-700">
      سبد خرید
      {count > 0 && (
        <span className="absolute -top-2 -left-3 bg-brand-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {count}
        </span>
      )}
    </Link>
  );
}
