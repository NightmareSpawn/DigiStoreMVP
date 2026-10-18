import { db } from "@/lib/db";
import ProductCard from "@/components/ProductCard";
import { notFound } from "next/navigation";

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { brand?: string; sort?: string; q?: string };
}) {
  const category = await db.category.findUnique({ where: { slug: params.slug } });
  if (!category) notFound();

  const orderBy =
    searchParams.sort === "price_asc"
      ? { price: "asc" as const }
      : searchParams.sort === "price_desc"
      ? { price: "desc" as const }
      : { createdAt: "desc" as const };

  const products = await db.product.findMany({
    where: {
      categoryId: category.id,
      status: "PUBLISHED",
      ...(searchParams.brand ? { brand: searchParams.brand } : {}),
      ...(searchParams.q
        ? { title: { contains: searchParams.q } }
        : {}),
    },
    orderBy,
    include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
  });

  const brands = await db.product.findMany({
    where: { categoryId: category.id, status: "PUBLISHED", brand: { not: null } },
    select: { brand: true },
    distinct: ["brand"],
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-gray-800 mb-4">{category.name}</h1>

      <div className="flex flex-wrap gap-2 mb-6 text-sm">
        <a
          href={`?${new URLSearchParams({ ...searchParams, sort: "price_asc" }).toString()}`}
          className="border rounded-full px-3 py-1 bg-white"
        >
          ارزان‌ترین
        </a>
        <a
          href={`?${new URLSearchParams({ ...searchParams, sort: "price_desc" }).toString()}`}
          className="border rounded-full px-3 py-1 bg-white"
        >
          گران‌ترین
        </a>
        {brands.map((b) => (
          <a
            key={b.brand}
            href={`?${new URLSearchParams({ ...searchParams, brand: b.brand! }).toString()}`}
            className="border rounded-full px-3 py-1 bg-white"
          >
            {b.brand}
          </a>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      {products.length === 0 && <p className="text-gray-500 text-sm">محصولی در این دسته یافت نشد.</p>}
    </div>
  );
}
