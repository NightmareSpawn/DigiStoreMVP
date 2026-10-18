import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = getSession();
  if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const body = await req.json();
  const discount = await db.discountCode.create({
    data: {
      code: body.code,
      percent: body.percent ? Number(body.percent) : null,
      amount: body.amount ? Number(body.amount) : null,
      appliesToCategoryId: body.appliesToCategoryId || null,
      maxUses: body.maxUses ? Number(body.maxUses) : null,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
    },
  });

  return NextResponse.json({ ok: true, id: discount.id });
}
