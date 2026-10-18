import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { canManageProduct, canManageCategory } from "@/lib/permissions";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = getSession();
  if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }
  if (!(await canManageProduct(session, params.id))) {
    return NextResponse.json({ error: "شما به این محصول دسترسی ندارید." }, { status: 403 });
  }

  const body = await req.json();

  if (body.categoryId && !(await canManageCategory(session, body.categoryId))) {
    return NextResponse.json({ error: "شما به دسته‌بندی مقصد دسترسی ندارید." }, { status: 403 });
  }

  const existing = await db.product.findUnique({ where: { id: params.id } });
  const priceChanged = existing && body.price !== undefined && Number(body.price) !== existing.price;

  const product = await db.product.update({
    where: { id: params.id },
    data: {
      title: body.title,
      description: body.description,
      type: body.type,
      brand: body.brand || null,
      sku: body.sku || null,
      categoryId: body.categoryId,
      costPrice: body.costPrice !== undefined ? Number(body.costPrice) : undefined,
      listPrice: body.listPrice !== undefined ? Number(body.listPrice) : undefined,
      price: body.price !== undefined ? Number(body.price) : undefined,
      taxPercent: body.taxPercent !== undefined ? Number(body.taxPercent) : undefined,
      shippingCost: body.shippingCost !== undefined ? Number(body.shippingCost) : undefined,
      discountPercent: body.discountPercent !== undefined ? Number(body.discountPercent) : undefined,
      digikalaUrl: body.digikalaUrl,
      status: body.status,
      ...(priceChanged ? { priceHistory: { create: [{ price: Number(body.price) }] } } : {}),
    },
  });

  return NextResponse.json({ ok: true, id: product.id });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = getSession();
  if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }
  if (!(await canManageProduct(session, params.id))) {
    return NextResponse.json({ error: "شما به این محصول دسترسی ندارید." }, { status: 403 });
  }

  await db.product.update({ where: { id: params.id }, data: { status: "ARCHIVED" } });
  return NextResponse.json({ ok: true });
}
