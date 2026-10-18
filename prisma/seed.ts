import { PrismaClient, ProductType, ProductStatus, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // --- Super admin ---
  const phone = process.env.SEED_SUPER_ADMIN_PHONE || "09120000000";
  const name = process.env.SEED_SUPER_ADMIN_NAME || "Super Admin";

  const superAdmin = await prisma.user.upsert({
    where: { phone },
    update: { role: Role.SUPER_ADMIN },
    create: { phone, name, role: Role.SUPER_ADMIN },
  });
  console.log(`Super admin ready: ${superAdmin.phone} (login with OTP; in dev the code is printed to the console)`);

  // --- An invite code so the first customers can sign up ---
  await prisma.inviteCode.upsert({
    where: { code: "WELCOME" },
    update: {},
    create: { code: "WELCOME", maxUses: 1000, active: true },
  });
  console.log("Invite code ready: WELCOME");

  // --- Categories ---
  const electronics = await prisma.category.upsert({
    where: { slug: "electronics" },
    update: {},
    create: { name: "لوازم الکترونیک", slug: "electronics" },
  });
  const homeAppliances = await prisma.category.upsert({
    where: { slug: "home-appliances" },
    update: {},
    create: { name: "لوازم خانگی", slug: "home-appliances" },
  });
  const fashion = await prisma.category.upsert({
    where: { slug: "fashion" },
    update: {},
    create: { name: "پوشاک", slug: "fashion" },
  });
  const courses = await prisma.category.upsert({
    where: { slug: "courses" },
    update: {},
    create: { name: "ویدئوهای آموزشی", slug: "courses" },
  });

  // --- Sample products ---
  const products = [
    {
      title: "هدفون بی‌سیم مدل X1",
      slug: "wireless-headphone-x1",
      type: ProductType.PHYSICAL,
      brand: "SoundMax",
      categoryId: electronics.id,
      costPrice: 1_200_000,
      listPrice: 2_200_000,
      price: 1_890_000,
      discountPercent: 14,
      taxPercent: 9,
      shippingCost: 45_000,
    },
    {
      title: "اتوی بخار حرفه‌ای",
      slug: "steam-iron-pro",
      type: ProductType.PHYSICAL,
      brand: "HomePlus",
      categoryId: homeAppliances.id,
      costPrice: 800_000,
      listPrice: 1_450_000,
      price: 1_290_000,
      discountPercent: 11,
      taxPercent: 9,
      shippingCost: 60_000,
    },
    {
      title: "دوره آموزش ویدئویی Next.js",
      slug: "nextjs-video-course",
      type: ProductType.VIDEO_COURSE,
      brand: null,
      categoryId: courses.id,
      costPrice: 0,
      listPrice: 990_000,
      price: 590_000,
      discountPercent: 40,
      taxPercent: 0,
      shippingCost: 0,
    },
    {
      title: "تی‌شرت نخی مردانه",
      slug: "mens-cotton-tshirt",
      type: ProductType.PHYSICAL,
      brand: "BasicWear",
      categoryId: fashion.id,
      costPrice: 150_000,
      listPrice: 390_000,
      price: 290_000,
      discountPercent: 26,
      taxPercent: 9,
      shippingCost: 35_000,
    },
  ];

  for (const p of products) {
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        ...p,
        status: ProductStatus.PUBLISHED,
        createdById: superAdmin.id,
        images: {
          create: [{ url: "https://placehold.co/600x600?text=" + encodeURIComponent(p.title), sortOrder: 0 }],
        },
        priceHistory: {
          create: [{ price: p.price }],
        },
      },
    });
    console.log(`Product ready: ${product.title}`);
  }

  console.log("\nSeed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
