import Link from "next/link";
import { toman, finalPrice } from "@/lib/format";
import CompareCheckbox from "./CompareCheckbox";

type Props = {
  product: {
    id: string;
    slug: string;
    title: string;
    price: number;
    listPrice: number;
    discountPercent: number;
    images: { url: string }[];
  };
};

export default function ProductCard({ product }: Props) {
  const final = finalPrice(product.price, product.discountPercent);
  const image = product.images[0]?.url || "https://placehold.co/400x400?text=" + encodeURIComponent(product.title);

  return (
    <Link
      href={`/product/${product.slug}`}
      className="bg-white border rounded-xl p-3 hover:shadow-md transition-shadow flex flex-col"
    >
      <img src={image} alt={product.title} className="rounded-lg aspect-square object-cover mb-2" />
      <div className="text-sm text-gray-800 flex-1 line-clamp-2">{product.title}</div>
      <div className="mt-2">
        {product.discountPercent > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs bg-red-100 text-red-600 rounded px-1.5 py-0.5">
              ٪{product.discountPercent}-
            </span>
            <span className="text-xs text-gray-400 line-through">{toman(product.listPrice)}</span>
          </div>
        )}
        <div className="font-bold text-gray-900 mt-1">{toman(final)}</div>
      </div>
      <CompareCheckbox productId={product.id} />
    </Link>
  );
}
