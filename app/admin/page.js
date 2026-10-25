"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import StatusBadge from "@/components/StatusBadge";

const statuses = ["pending", "processing", "shipped", "delivered", "cancelled"];

export default function AdminDashboard() {
  const { token } = useAuth();
  const [counts, setCounts] = useState(null);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");

  // ask the backend for each status, limit=1 because we only need the total number
  useEffect(() => {
    if (!token) return;

    Promise.all([
      api("/orders?limit=1", { token }),
      ...statuses.map((s) => api(`/orders?status=${s}&limit=1`, { token })),
    ])
      .then(([all, ...byStatus]) => {
        setTotal(all.total);
        const result = {};
        statuses.forEach((s, i) => (result[s] = byStatus[i].total));
        setCounts(result);
      })
      .catch((err) => setError(err.message));
  }, [token]);

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Admin dashboard</h1>

      {error && <p className="text-red-600">{error}</p>}
      {!counts && !error && <p>Loading...</p>}

      {counts && (
        <>
          <div className="mb-6 rounded border p-4">
            <p className="text-sm text-gray-500">Total orders</p>
            <p className="text-3xl font-bold">{total}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            {statuses.map((s) => (
              <Link
                key={s}
                href={`/admin/orders?status=${s}`}
                className="rounded border p-4 hover:shadow-md"
              >
                <StatusBadge value={s} />
                <p className="mt-2 text-2xl font-bold">{counts[s]}</p>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}