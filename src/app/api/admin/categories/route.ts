import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

/** Only SUPER_ADMIN can create/manage categories — admins only get assigned existing ones. */
export async function POST(req: NextRequest) {
  const session = getSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "فقط سوپر ادمین می‌تواند دسته‌بندی بسازد." }, { status: 403 });
  }

  const body = await req.json();
  if (!body.name || !body.slug) {
    return NextResponse.json({ error: "نام و نامک الزامی است." }, { status: 400 });
  }

  const category = await db.category.create({
    data: {
      name: body.name,
      slug: body.slug,
      parentId: body.parentId || null,
      requiresOwnMobile: !!body.requiresOwnMobile,
    },
  });

  return NextResponse.json({ ok: true, id: category.id });
}
