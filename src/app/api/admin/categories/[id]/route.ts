import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = getSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "فقط سوپر ادمین می‌تواند دسته‌بندی را ویرایش کند." }, { status: 403 });
  }

  const body = await req.json();
  const category = await db.category.update({
    where: { id: params.id },
    data: {
      name: body.name,
      slug: body.slug,
      parentId: body.parentId || null,
      requiresOwnMobile: body.requiresOwnMobile !== undefined ? !!body.requiresOwnMobile : undefined,
    },
  });

  return NextResponse.json({ ok: true, id: category.id });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = getSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "فقط سوپر ادمین می‌تواند دسته‌بندی را حذف کند." }, { status: 403 });
  }

  const productCount = await db.product.count({ where: { categoryId: params.id } });
  if (productCount > 0) {
    return NextResponse.json(
      { error: "این دسته‌بندی محصول دارد و قابل حذف نیست. ابتدا محصولات را منتقل یا آرشیو کنید." },
      { status: 400 }
    );
  }

  await db.category.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
