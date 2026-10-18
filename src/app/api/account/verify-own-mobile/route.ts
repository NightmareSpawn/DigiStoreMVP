import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { verifyOwnMobile } from "@/lib/shahkar";

export async function POST(req: NextRequest) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "ابتدا وارد شوید." }, { status: 401 });

  const { nationalId } = await req.json();
  const result = await verifyOwnMobile({ phone: session.phone, nationalId });

  if (!result.ok) {
    return NextResponse.json({ error: result.reason || "احراز هویت ناموفق بود." }, { status: 400 });
  }

  await db.user.update({ where: { id: session.userId }, data: { ownMobileVerified: true } });
  return NextResponse.json({ ok: true });
}
