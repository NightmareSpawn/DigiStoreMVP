"use client";

import { useEffect, useState } from "react";
import { useCompare } from "@/lib/compareStore";
import { toman, finalPrice } from "@/lib/format";
import Link from "next/link";

type Product = {
  id: string;
  title: string;
  slug: string;
  brand: string | null;
  price: number;
  discountPercent: number;
  taxPercent: number;
  shippingCost: number;
  images: { url: string }[];
  category: { name: string };
};

export default function ComparePage() {
  const { productIds } = useCompare();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (productIds.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/products/compare?ids=${productIds.join(",")}`)
      .then((r) => r.json())
      .then((data) => setProducts(data.products || []))
      .finally(() => setLoading(false));
  }, [productIds]);

  if (loading) return <p className="text-center py-16 text-gray-500">در حال بارگذاری...</p>;

  if (products.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 mb-4">هیچ محصولی برای مقایسه انتخاب نشده.</p>
        <Link href="/" className="text-brand-600">
          بازگشت به فروشگاه
        </Link>
      </div>
    );
  }

  const rows = [
    { label: "برند", render: (p: Product) => p.brand || "—" },
    { label: "دسته‌بندی", render: (p: Product) => p.category.name },
    {
      label: "قیمت نهایی",
      render: (p: Product) => toman(finalPrice(p.price, p.discountPercent)),
    },
    { label: "تخفیف", render: (p: Product) => `٪${p.discountPercent}` },
    { label: "مالیات", render: (p: Product) => `٪${p.taxPercent}` },
    { label: "هزینه ارسال", render: (p: Product) => toman(p.shippingCost) },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 overflow-x-auto">
      <h1 className="text-xl font-bold text-gray-800 mb-6">مقایسه محصولات</h1>
      <table className="w-full text-sm border-separate border-spacing-y-2">
        <thead>
          <tr>
            <th></th>
            {products.map((p) => (
              <th key={p.id} className="p-2 text-center">
                <Link href={`/product/${p.slug}`}>
                  <img src={p.images[0]?.url} alt={p.title} className="w-20 h-20 object-cover rounded-lg mx-auto mb-1" />
                  <span className="text-xs font-medium">{p.title}</span>
                </Link>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="bg-white">
              <td className="p-2 text-gray-500 font-medium">{row.label}</td>
              {products.map((p) => (
                <td key={p.id} className="p-2 text-center">
                  {row.render(p)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
