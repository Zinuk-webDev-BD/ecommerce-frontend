import Link from "next/link";
import Image from "next/image";

// one product box on the home page
export default function ProductCard({ product }) {
  const image = product.images && product.images[0];

  return (
    <Link
      href={`/products/${product._id}`}
      className="block overflow-hidden rounded border hover:shadow-md"
    >
      <div className="relative h-48 w-full bg-gray-100">
        {image ? (
          <Image
            src={image.url}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            No image
          </div>
        )}
      </div>

      <div className="p-3">
        <h3 className="truncate font-semibold">{product.name}</h3>
        <p className="text-sm text-gray-500">{product.category?.name}</p>
        <div className="mt-1 flex items-center justify-between">
          <span className="font-bold">{product.price} BDT</span>
          {product.stock > 0 ? (
            <span className="text-xs text-green-600">In stock</span>
          ) : (
            <span className="text-xs text-red-600">Out of stock</span>
          )}
        </div>
      </div>
    </Link>
  );
}