import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getManageableCategoryIds } from "@/lib/permissions";
import ProductForm from "../ProductForm";

export default async function NewProductPage() {
  const session = getSession()!;
  const categoryIds = await getManageableCategoryIds(session);
  const categories = await db.category.findMany({
    where: categoryIds === null ? {} : { id: { in: categoryIds } },
  });

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-6">محصول جدید</h1>
      {categories.length === 0 ? (
        <p className="text-sm text-red-600">
          هیچ دسته‌بندی‌ای به شما اختصاص داده نشده. از سوپر ادمین بخواهید دسترسی دسته‌بندی برایتان تعریف کند.
        </p>
      ) : (
        <ProductForm categories={categories} />
      )}
    </div>
  );
}
