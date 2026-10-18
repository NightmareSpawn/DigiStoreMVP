import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "ابتدا وارد شوید." }, { status: 401 });

  const { orderId, trackingCode } = await req.json();
  if (!orderId || !trackingCode) {
    return NextResponse.json({ error: "کد رهگیری الزامی است." }, { status: 400 });
  }

  const order = await db.order.findUnique({ where: { id: orderId }, include: { payment: true } });
  if (!order || order.userId !== session.userId || !order.payment) {
    return NextResponse.json({ error: "سفارش یافت نشد." }, { status: 404 });
  }

  await db.payment.update({
    where: { id: order.payment.id },
    data: { cardTrackingCode: trackingCode, status: "PENDING_REVIEW" },
  });

  return NextResponse.json({ ok: true });
}
