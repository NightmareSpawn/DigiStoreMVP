import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { computeTier } from "@/lib/tier";

/** Approve a card-to-card payment: marks it SUCCESS and the order PAID. */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = getSession();
  if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const order = await db.order.findUnique({ where: { id: params.id }, include: { payment: true } });
  if (!order || !order.payment) return NextResponse.json({ error: "سفارش یافت نشد." }, { status: 404 });

  await db.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: order.payment!.id },
      data: { status: "SUCCESS", reviewedByAdminId: session.userId, reviewedAt: new Date() },
    });
    await tx.order.update({ where: { id: order.id }, data: { status: "PAID" } });
    const updatedUser = await tx.user.update({
      where: { id: order.userId },
      data: { totalSpent: { increment: order.grandTotal } },
    });
    await tx.user.update({
      where: { id: order.userId },
      data: { tier: computeTier(updatedUser.totalSpent) },
    });
  });

  return NextResponse.json({ ok: true });
}
