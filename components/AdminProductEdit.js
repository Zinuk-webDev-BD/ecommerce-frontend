"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import AdminProductForm from "@/components/AdminProductForm";

// loads the product first, then shows the form filled with its data
export default function AdminProductEdit({ id }) {
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api(`/products/${id}`)
      .then((data) => setProduct(data.product))
      .catch((err) => setError(err.message));
  }, [id]);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!product) return <p>Loading...</p>;

  return <AdminProductForm product={product} />;
}