"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import StatusBadge from "@/components/StatusBadge";

export default function OrdersPage() {
  const { token, user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // load my orders, again when the page changes
  useEffect(() => {
    if (!token) return;

    setLoading(true);
    api(`/orders/my?page=${page}&limit=5`, { token })
      .then((data) => {
        setOrders(data.orders);
        setTotalPages(data.totalPages);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token, page]);

  if (authLoading) return <p className="p-8">Loading...</p>;

  if (!user) {
    return (
      <main className="p-8">
        <p>
          Please{" "}
          <Link href="/login" className="text-blue-600 underline">
            login
          </Link>{" "}
          to see your orders.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-4 text-2xl font-bold">My orders</h1>

      {error && <p className="text-red-600">{error}</p>}
      {loading && <p>Loading...</p>}
      {!loading && orders.length === 0 && !error && (
        <p className="text-gray-500">You have no orders yet.</p>
      )}

      <ul className="space-y-3">
        {orders.map((order) => (
          <li key={order._id}>
            <Link
              href={`/orders/${order._id}`}
              className="block rounded border p-4 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleString()}
                </span>
                <StatusBadge value={order.orderStatus} />
              </div>
              <p className="mt-1 text-sm">
                {order.items.map((i) => `${i.name} x ${i.quantity}`).join(", ")}
              </p>
              <div className="mt-2 flex items-center justify-between">
                <span className="font-bold">{order.totalPrice} BDT</span>
                <span className="text-xs text-gray-500">
                  {order.paymentMethod === "cod" ? "Cash on delivery" : "Online payment"}{" "}
                  <StatusBadge value={order.paymentStatus} />
                </span>
              </div>
            </Link>
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
    </main>
  );
}