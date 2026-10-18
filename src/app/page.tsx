import Link from "next/link";
import { db } from "@/lib/db";
import PriceBox from "@/components/PriceBox";
import ProductCard from "@/components/ProductCard";

export default async function HomePage() {
  const [categories, products] = await Promise.all([
    db.category.findMany({ where: { parentId: null }, orderBy: { name: "asc" } }),
    db.product.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
      take: 12,
      include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
    }),
  ]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
      <PriceBox />

      <div className="flex flex-wrap gap-3">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/category/${c.slug}`}
            className="bg-white border rounded-full px-4 py-2 text-sm text-gray-700 hover:border-brand-400"
          >
            {c.name}
          </Link>
        ))}
      </div>

      <section>
        <h2 className="text-lg font-bold text-gray-800 mb-4">جدیدترین محصولات</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        {products.length === 0 && (
          <p className="text-gray-500 text-sm">
            هنوز محصولی ثبت نشده. از پنل ادمین یک محصول اضافه کنید یا <code>npm run db:seed</code> را اجرا
            کنید.
          </p>
        )}
      </section>
    </div>
  );
}
