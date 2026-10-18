import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

/** SUPER_ADMIN only: promote an existing phone number to ADMIN and assign category access. */
export async function POST(req: NextRequest) {
  const session = getSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "فقط سوپر ادمین می‌تواند ادمین بسازد." }, { status: 403 });
  }

  const body = await req.json();
  const { phone, name, categoryIds } = body as { phone: string; name?: string; categoryIds: string[] };

  if (!phone || !/^09\d{9}$/.test(phone)) {
    return NextResponse.json({ error: "شماره موبایل معتبر نیست." }, { status: 400 });
  }
  if (!categoryIds || categoryIds.length === 0) {
    return NextResponse.json({ error: "حداقل یک دسته‌بندی باید انتخاب شود." }, { status: 400 });
  }

  // Create the user if they don't exist yet (they'll log in with OTP same as any customer).
  const user = await db.user.upsert({
    where: { phone },
    update: { role: "ADMIN", name: name || undefined },
    create: { phone, name: name || null, role: "ADMIN" },
  });

  await db.adminCategoryAccess.deleteMany({ where: { adminId: user.id } });
  await db.adminCategoryAccess.createMany({
    data: categoryIds.map((categoryId) => ({ adminId: user.id, categoryId })),
    skipDuplicates: true,
  });

  return NextResponse.json({ ok: true, id: user.id });
}
