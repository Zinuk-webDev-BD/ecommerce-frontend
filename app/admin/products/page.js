"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function AdminProducts() {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);

  // load the product list, again when the page changes or after a delete
  useEffect(() => {
    setLoading(true);
    api(`/products?page=${page}&limit=8`)
      .then((data) => {
        setProducts(data.products);
        setTotalPages(data.totalPages);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [page, reload]);

  const handleDelete = async (product) => {
    if (!confirm(`Delete "${product.name}" and its images?`)) return;
    setError("");
    try {
      await api(`/products/${product._id}`, { method: "DELETE", token });
      // if we deleted the last item of this page, go one page back
      if (products.length === 1 && page > 1) setPage((p) => p - 1);
      else setReload((n) => n + 1);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link href="/admin/products/new" className="rounded bg-blue-600 px-4 py-2 text-white">
          Add product
        </Link>
      </div>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      {loading && <p>Loading...</p>}
      {!loading && products.length === 0 && <p className="text-gray-500">No products yet.</p>}

      <ul className="space-y-2">
        {products.map((p) => (
          <li key={p._id} className="flex items-center gap-4 rounded border p-3">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded bg-gray-100">
              {p.images?.[0] && (
                <Image
                  src={p.images[0].url}
                  alt={p.name}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              )}
            </div>
            <div className="flex-1">
              <p className="font-semibold">{p.name}</p>
              <p className="text-sm text-gray-500">
                {p.category?.name} | {p.price} BDT | stock: {p.stock}
              </p>
            </div>
            <div className="flex gap-3 text-sm">
              <Link href={`/admin/products/${p._id}/edit`} className="text-blue-600 underline">
                Edit
              </Link>
              <button onClick={() => handleDelete(p)} className="text-red-600 underline">
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded border px-3 py-1 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded border px-3 py-1 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}