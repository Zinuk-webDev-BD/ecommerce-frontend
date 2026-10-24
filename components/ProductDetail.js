"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { api } from "@/lib/api";

export default function ProductDetail({ id }) {
  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [error, setError] = useState("");

  // load this product from the backend
  useEffect(() => {
    api(`/products/${id}`)
      .then((data) => setProduct(data.product))
      .catch((err) => setError(err.message));
  }, [id]);

  if (error) {
    return (
      <main className="p-8">
        <p className="text-red-600">{error}</p>
        <Link href="/" className="text-blue-600 underline">
          Back to shop
        </Link>
      </main>
    );
  }

  if (!product) return <p className="p-8">Loading...</p>;

  const images = product.images || [];

  return (
    <main className="mx-auto max-w-5xl p-6">
      <Link href="/" className="text-sm text-blue-600 underline">
        Back to shop
      </Link>

      <div className="mt-4 grid gap-8 md:grid-cols-2">
        {/* images */}
        <div>
          <div className="relative h-80 w-full overflow-hidden rounded border bg-gray-100">
            {images.length > 0 ? (
              <Image
                src={images[activeImage].url}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">No image</div>
            )}
          </div>

          <div className="mt-3 flex gap-2">
            {images.map((img, index) => (
              <button
                key={img._id}
                onClick={() => setActiveImage(index)}
                className={`relative h-16 w-16 overflow-hidden rounded border-2 ${
                  index === activeImage ? "border-blue-600" : "border-transparent"
                }`}
              >
                <Image src={img.url} alt="" fill sizes="64px" className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* info */}
        <div>
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <p className="text-sm text-gray-500">{product.category?.name}</p>
          <p className="mt-3 text-2xl font-bold">{product.price} BDT</p>
          <p className="mt-2 text-sm">
            {product.stock > 0 ? (
              <span className="text-green-600">{product.stock} in stock</span>
            ) : (
              <span className="text-red-600">Out of stock</span>
            )}
          </p>
          <p className="mt-4 text-gray-700">{product.description || "No description."}</p>
        </div>
      </div>
    </main>
  );
}