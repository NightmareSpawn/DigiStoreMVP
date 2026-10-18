import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getManageableCategoryIds, canManageProduct } from "@/lib/permissions";
import { notFound, redirect } from "next/navigation";
import ProductForm from "../../ProductForm";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const session = getSession()!;

  if (!(await canManageProduct(session, params.id))) {
    redirect("/admin/products");
  }

  const [product, categoryIds] = await Promise.all([
    db.product.findUnique({ where: { id: params.id }, include: { images: true } }),
    getManageableCategoryIds(session),
  ]);
  if (!product) notFound();

  const categories = await db.category.findMany({
    where: categoryIds === null ? {} : { id: { in: categoryIds } },
  });

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-6">ویرایش محصول</h1>
      <ProductForm
        categories={categories}
        initial={{
          id: product.id,
          title: product.title,
          slug: product.slug,
          description: product.description,
          type: product.type,
          brand: product.brand || "",
          sku: product.sku || "",
          categoryId: product.categoryId,
          costPrice: product.costPrice,
          listPrice: product.listPrice,
          price: product.price,
          taxPercent: product.taxPercent,
          shippingCost: product.shippingCost,
          discountPercent: product.discountPercent,
          digikalaUrl: product.digikalaUrl || "",
          status: product.status,
          imageUrl: product.images[0]?.url || "",
        }}
      />
    </div>
  );
}
