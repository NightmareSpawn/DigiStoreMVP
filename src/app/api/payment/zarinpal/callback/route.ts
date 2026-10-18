import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { zarinpalVerify } from "@/lib/zarinpal";
import { computeTier } from "@/lib/tier";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId");
  const authority = searchParams.get("Authority");
  const status = searchParams.get("Status");

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  if (!orderId || !authority) {
    return NextResponse.redirect(`${baseUrl}/checkout/result?ok=0`);
  }

  const order = await db.order.findUnique({ where: { id: orderId }, include: { payment: true } });
  if (!order || !order.payment) {
    return NextResponse.redirect(`${baseUrl}/checkout/result?ok=0`);
  }

  if (status !== "OK") {
    await db.payment.update({
      where: { id: order.payment.id },
      data: { status: "FAILED" },
    });
    return NextResponse.redirect(`${baseUrl}/checkout/result?ok=0&orderId=${orderId}`);
  }

  const verify = await zarinpalVerify({ amountToman: order.grandTotal, authority });

  if (verify.ok) {
    await db.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: order.payment!.id },
        data: { status: "SUCCESS", zarinpalRefId: verify.refId },
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
    return NextResponse.redirect(`${baseUrl}/checkout/result?ok=1&orderId=${orderId}`);
  }

  await db.payment.update({ where: { id: order.payment.id }, data: { status: "FAILED" } });
  return NextResponse.redirect(`${baseUrl}/checkout/result?ok=0&orderId=${orderId}`);
}
