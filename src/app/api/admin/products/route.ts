import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { canManageCategory } from "@/lib/permissions";

export async function POST(req: NextRequest) {
  const session = getSession();
  if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const body = await req.json();
  const { categoryId } = body;

  if (!categoryId || !(await canManageCategory(session, categoryId))) {
    return NextResponse.json({ error: "شما به این دسته‌بندی دسترسی ندارید." }, { status: 403 });
  }

  const product = await db.product.create({
    data: {
      title: body.title,
      slug: body.slug,
      description: body.description || "",
      type: body.type,
      brand: body.brand || null,
      sku: body.sku || null,
      categoryId,
      costPrice: Number(body.costPrice) || 0,
      listPrice: Number(body.listPrice) || 0,
      price: Number(body.price) || 0,
      taxPercent: Number(body.taxPercent) || 0,
      shippingCost: Number(body.shippingCost) || 0,
      discountPercent: Number(body.discountPercent) || 0,
      digikalaUrl: body.digikalaUrl || null,
      status: body.status || "DRAFT",
      createdById: session.userId,
      images: body.imageUrl ? { create: [{ url: body.imageUrl, sortOrder: 0 }] } : undefined,
      priceHistory: { create: [{ price: Number(body.price) || 0 }] },
    },
  });

  return NextResponse.json({ ok: true, id: product.id });
}
