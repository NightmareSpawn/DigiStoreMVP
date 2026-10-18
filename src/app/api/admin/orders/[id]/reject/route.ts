import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = getSession();
  if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const order = await db.order.findUnique({ where: { id: params.id }, include: { payment: true } });
  if (!order || !order.payment) return NextResponse.json({ error: "سفارش یافت نشد." }, { status: 404 });

  await db.payment.update({
    where: { id: order.payment.id },
    data: { status: "REJECTED", reviewedByAdminId: session.userId, reviewedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
