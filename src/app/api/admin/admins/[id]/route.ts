import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

/** Update an admin's category access, or demote them back to CUSTOMER. */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = getSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const body = await req.json();

  if (body.categoryIds) {
    await db.adminCategoryAccess.deleteMany({ where: { adminId: params.id } });
    await db.adminCategoryAccess.createMany({
      data: (body.categoryIds as string[]).map((categoryId) => ({ adminId: params.id, categoryId })),
      skipDuplicates: true,
    });
  }

  if (body.demote) {
    await db.user.update({ where: { id: params.id }, data: { role: "CUSTOMER" } });
    await db.adminCategoryAccess.deleteMany({ where: { adminId: params.id } });
  }

  return NextResponse.json({ ok: true });
}
