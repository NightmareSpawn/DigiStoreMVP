/**
 * These used to be real Prisma `enum`s, but SQLite (our dev database) has
 * no native enum support, so the schema stores them as plain String columns
 * (see prisma/schema.prisma for the `///` doc-comments next to each model).
 * These TypeScript types are the single source of truth for which string
 * values are valid, used across the app wherever one of these fields is read
 * or written.
 *
 * If you move to Postgres for production, you can promote these back to
 * real Prisma enums — not required for the MVP.
 */

export type Role = "SUPER_ADMIN" | "ADMIN" | "CUSTOMER";

export type CustomerTier = "NONE" | "BRONZE" | "SILVER" | "ROSE_GOLD" | "GOLD";

export type ProductType = "PHYSICAL" | "DOWNLOADABLE_FILE" | "VIDEO_COURSE" | "SERVICE";

export type ProductStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type OrderStatus =
  | "PENDING_PAYMENT"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentMethod = "CARD_TO_CARD" | "ZARINPAL";

export type PaymentStatus =
  | "PENDING_REVIEW"
  | "AWAITING_GATEWAY"
  | "SUCCESS"
  | "FAILED"
  | "REJECTED";
