"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import StatusBadge from "@/components/StatusBadge";

const statuses = ["pending", "processing", "shipped", "delivered", "cancelled"];

// which status can change to which (same rule as the backend)
const NEXT_STATUS = {
  pending: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

function AdminOrders() {
  const { token } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get("status") || "";

  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  // changing this number loads the list again
  const [reload, setReload] = useState(0);

  // load orders when the filter, page or reload number changes
  useEffect(() => {
    if (!token) return;

    const query = new URLSearchParams({ page: String(page), limit: "10" });
    if (status) query.set("status", status);

    setLoading(true);
    setError("");
    api(`/orders?${query.toString()}`, { token })
      .then((data) => {
        setOrders(data.orders);
        setTotalPages(data.totalPages);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token, status, page, reload]);

  const changeFilter = (value) => {
    setPage(1);
    router.push(value ? `/admin/orders?status=${value}` : "/admin/orders");
  };

  const changeStatus = async (order, newStatus) => {
    if (newStatus === "cancelled" && !confirm("Cancel this order? The stock will go back.")) {
      return;
    }

    setActionError("");
    try {
      await api(`/orders/${order._id}/status`, {
        method: "PUT",
        token,
        body: { status: newStatus },
      });
      // load the list again so every row is fresh
      setReload((n) => n + 1);
    } catch (err) {
      setActionError(err.message);
    }
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">All orders</h1>
        <select
          value={status}
          onChange={(e) => changeFilter(e.target.value)}
          className="rounded border p-2"
        >
          <option value="">All statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-red-600">{error}</p>}
      {actionError && <p className="mb-3 text-sm text-red-600">{actionError}</p>}
      {loading && <p>Loading...</p>}
      {!loading && orders.length === 0 && !error && (
        <p className="text-gray-500">No orders found.</p>
      )}

      <ul className="space-y-3">
        {orders.map((order) => (
          <li key={order._id} className="rounded border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold">
                  {order.user?.name || "Deleted user"}{" "}
                  <span className="text-sm font-normal text-gray-500">{order.user?.email}</span>
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(order.createdAt).toLocaleString()} | #{order._id.slice(-6)}
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <StatusBadge value={order.orderStatus} />
                <span className="text-gray-500">
                  {order.paymentMethod === "cod" ? "COD" : "Online"}
                </span>
                <StatusBadge value={order.paymentStatus} />
              </div>
            </div>

            <p className="mt-2 text-sm">
              {order.items.map((i) => `${i.name} x ${i.quantity}`).join(", ")}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {order.shippingAddress.name}, {order.shippingAddress.phone},{" "}
              {order.shippingAddress.address}, {order.shippingAddress.city}
            </p>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold">{order.totalPrice} BDT</span>
              <div className="flex gap-2">
                {NEXT_STATUS[order.orderStatus].map((next) => (
                  <button
                    key={next}
                    onClick={() => changeStatus(order, next)}
                    className={`rounded px-3 py-1 text-sm capitalize ${
                      next === "cancelled"
                        ? "border border-red-600 text-red-600"
                        : "bg-blue-600 text-white"
                    }`}
                  >
                    Mark {next}
                  </button>
                ))}
              </div>
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

// useSearchParams needs Suspense, otherwise the build fails when we deploy
export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <AdminOrders />
    </Suspense>
  );
}