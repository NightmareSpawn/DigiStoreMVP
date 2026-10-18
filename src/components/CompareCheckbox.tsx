"use client";

import { useCompare } from "@/lib/compareStore";

export default function CompareCheckbox({ productId }: { productId: string }) {
  const { productIds, toggle } = useCompare();
  const checked = productIds.includes(productId);

  return (
    <label
      onClick={(e) => e.stopPropagation()}
      className="flex items-center gap-1 text-xs text-gray-500 mt-1"
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={() => toggle(productId)}
      />
      مقایسه (حداکثر ۵)
    </label>
  );
}
