import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { canManageCategory } from "@/lib/permissions";

/** Apply a discount percent to every product in a category at once. */
export async function POST(req: NextRequest) {
  const session = getSession();
  if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const { categoryId, discountPercent } = await req.json();
  if (!categoryId || !(await canManageCategory(session, categoryId))) {
    return NextResponse.json({ error: "شما به این دسته‌بندی دسترسی ندارید." }, { status: 403 });
  }

  const result = await db.product.updateMany({
    where: { categoryId },
    data: { discountPercent: Number(discountPercent) || 0 },
  });

  return NextResponse.json({ ok: true, updated: result.count });
}
