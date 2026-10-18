import { db } from "./db";
import type { SessionPayload } from "./auth";

/**
 * Returns the list of category IDs a session is allowed to manage.
 * SUPER_ADMIN → null means "all categories" (no restriction).
 * ADMIN → the specific category IDs assigned to them.
 */
export async function getManageableCategoryIds(session: SessionPayload): Promise<string[] | null> {
  if (session.role === "SUPER_ADMIN") return null;
  if (session.role !== "ADMIN") return [];

  const access = await db.adminCategoryAccess.findMany({
    where: { adminId: session.userId },
    select: { categoryId: true },
  });
  return access.map((a) => a.categoryId);
}

export async function canManageCategory(session: SessionPayload, categoryId: string) {
  const ids = await getManageableCategoryIds(session);
  if (ids === null) return true; // super admin
  return ids.includes(categoryId);
}

export async function canManageProduct(session: SessionPayload, productId: string) {
  const product = await db.product.findUnique({ where: { id: productId }, select: { categoryId: true } });
  if (!product) return false;
  return canManageCategory(session, product.categoryId);
}
