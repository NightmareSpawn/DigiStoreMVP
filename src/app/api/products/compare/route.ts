import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ids = (searchParams.get("ids") || "").split(",").filter(Boolean).slice(0, 5);

  if (ids.length === 0) return NextResponse.json({ products: [] });

  const products = await db.product.findMany({
    where: { id: { in: ids }, status: "PUBLISHED" },
    include: { images: { take: 1 }, category: true },
  });

  // Preserve the order the user selected them in
  const ordered = ids.map((id) => products.find((p) => p.id === id)).filter(Boolean);

  return NextResponse.json({ products: ordered });
}
