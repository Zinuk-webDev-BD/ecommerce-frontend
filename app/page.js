"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");

  // load products from our backend when the page opens
  useEffect(() => {
    api("/products")
      .then((data) => setProducts(data.products))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Ecommerce Shop</h1>
      {error && <p className="text-red-600">{error}</p>}
      <ul className="space-y-2">
        {products.map((p) => (
          <li key={p._id}>
            {p.name} - {p.price} BDT
          </li>
        ))}
      </ul>
    </main>
  );
}