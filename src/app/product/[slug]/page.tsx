import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { toman, finalPrice } from "@/lib/format";
import AddToCartBox from "@/components/AddToCartBox";
import ProductCard from "@/components/ProductCard";
import ReviewForm from "@/components/ReviewForm";
import { getCurrentUser } from "@/lib/auth";

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await db.product.findUnique({
    where: { slug: params.slug },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: true,
      reviews: { include: { user: true }, orderBy: { createdAt: "desc" } },
      category: true,
    },
  });
  if (!product || product.status !== "PUBLISHED") notFound();

  const user = await getCurrentUser();
  const canReview =
    user &&
    !product.reviews.some((r) => r.userId === user.id) &&
    (await db.orderItem.findFirst({
      where: { productId: product.id, order: { userId: user.id, status: "DELIVERED" } },
    }));

  const similar = await db.product.findMany({
    where: { categoryId: product.categoryId, status: "PUBLISHED", id: { not: product.id } },
    take: 5,
    include: { images: { take: 1 } },
  });

  const final = finalPrice(product.price, product.discountPercent);
  const avgRating =
    product.reviews.length > 0
      ? (product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length).toFixed(1)
      : null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <img
            src={product.images[0]?.url || "https://placehold.co/600x600"}
            alt={product.title}
            className="w-full rounded-xl border"
          />
        </div>

        <div>
          <p className="text-xs text-gray-400 mb-1">{product.category.name}</p>
          <h1 className="text-xl font-bold text-gray-900 mb-2">{product.title}</h1>
          {product.brand && <p className="text-sm text-gray-500 mb-2">برند: {product.brand}</p>}
          {product.category.requiresOwnMobile && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1 mb-2 inline-block">
              خرید این محصول فقط با موبایل احراز‌شده به نام خودتان امکان‌پذیر است
            </p>
          )}
          {avgRating && (
            <p className="text-sm text-amber-600 mb-3">
              ⭐ {avgRating} ({product.reviews.length} نظر)
            </p>
          )}

          <div className="bg-white border rounded-xl p-4 mb-4">
            {product.discountPercent > 0 && (
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs bg-red-100 text-red-600 rounded px-1.5 py-0.5">
                  ٪{product.discountPercent}-
                </span>
                <span className="text-sm text-gray-400 line-through">{toman(product.listPrice)}</span>
              </div>
            )}
            <div className="text-2xl font-bold text-gray-900">{toman(final)}</div>
            <p className="text-xs text-gray-400 mt-1">
              شامل {product.taxPercent}٪ مالیات بر ارزش افزوده
              {product.shippingCost > 0 && ` + ${toman(product.shippingCost)} هزینه ارسال`}
            </p>
          </div>

          {product.digikalaUrl && (
            <a
              href={product.digikalaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm text-blue-600 border border-blue-200 bg-blue-50 rounded-lg px-3 py-2 mb-4"
            >
              مقایسه قیمت با دیجی‌کالا ↗
            </a>
          )}

          <AddToCartBox
            productId={product.id}
            slug={product.slug}
            title={product.title}
            image={product.images[0]?.url}
            basePrice={final}
            variants={product.variants.map((v) => ({
              id: v.id,
              name: v.name,
              priceDelta: v.priceDelta,
              stock: v.stock,
            }))}
          />
        </div>
      </div>

      {product.description && (
        <div className="mt-10">
          <h2 className="font-bold text-gray-800 mb-2">توضیحات محصول</h2>
          <p className="text-sm text-gray-600 whitespace-pre-line">{product.description}</p>
        </div>
      )}

      <div className="mt-10">
        <h2 className="font-bold text-gray-800 mb-2">نظرات خریداران</h2>
        {product.reviews.length === 0 && <p className="text-sm text-gray-500">هنوز نظری ثبت نشده.</p>}
        <div className="space-y-3">
          {product.reviews.map((r) => (
            <div key={r.id} className="bg-white border rounded-lg p-3 text-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium">{r.user.name || "کاربر"}</span>
                <span className="text-amber-600">⭐ {r.rating}</span>
              </div>
              {r.comment && <p className="text-gray-600">{r.comment}</p>}
              {r.verifiedPurchase && <p className="text-xs text-green-600 mt-1">خرید تأیید‌شده</p>}
            </div>
          ))}
        </div>
        {canReview && (
          <div className="mt-4">
            <ReviewForm productId={product.id} />
          </div>
        )}
      </div>

      {similar.length > 0 && (
        <div className="mt-10">
          <h2 className="font-bold text-gray-800 mb-4">محصولات مشابه</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {similar.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
