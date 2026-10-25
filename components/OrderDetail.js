"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import StatusBadge from "@/components/StatusBadge";

// message shown after coming back from the payment page
const paymentMessages = {
  success: { text: "Payment received. Thank you!", style: "bg-green-100 text-green-800" },
  failed: { text: "Payment failed. You can try again.", style: "bg-red-100 text-red-800" },
  cancelled: { text: "Payment cancelled. You can pay later.", style: "bg-yellow-100 text-yellow-800" },
};

export default function OrderDetail({ id, payment }) {
  const { token, user, loading: authLoading } = useAuth();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [busy, setBusy] = useState(false);

  // load this order
  useEffect(() => {
    if (!token) return;
    api(`/orders/${id}`, { token })
      .then((data) => setOrder(data.order))
      .catch((err) => setError(err.message));
  }, [id, token]);

  // cancel is allowed only while the order is pending, stock goes back
  const handleCancel = async () => {
    if (!confirm("Cancel this order?")) return;
    setActionError("");
    setBusy(true);
    try {
      const data = await api(`/orders/${id}/cancel`, { method: "PUT", token });
      setOrder(data.order);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusy(false);
    }
  };

  // start the online payment again
  const handlePay = async () => {
    setActionError("");
    setBusy(true);
    try {
      const pay = await api(`/payments/init/${id}`, { method: "POST", token });
      window.location.href = pay.gatewayUrl;
    } catch (err) {
      setActionError(err.message);
      setBusy(false);
    }
  };

  if (authLoading) return <p className="p-8">Loading...</p>;

  if (!user) {
    return (
      <main className="p-8">
        <p>
          Please{" "}
          <Link href="/login" className="text-blue-600 underline">
            login
          </Link>{" "}
          to see this order.
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-8">
        <p className="text-red-600">{error}</p>
        <Link href="/orders" className="text-blue-600 underline">
          Back to orders
        </Link>
      </main>
    );
  }

  if (!order) return <p className="p-8">Loading...</p>;

  const banner = paymentMessages[payment];
  const canPay =
    order.paymentMethod === "sslcommerz" &&
    order.paymentStatus !== "paid" &&
    order.orderStatus !== "cancelled";

  return (
    <main className="mx-auto max-w-3xl p-6">
      <Link href="/orders" className="text-sm text-blue-600 underline">
        Back to orders
      </Link>

      {banner && (
        <p className={`mt-3 rounded p-3 text-sm ${banner.style}`}>{banner.text}</p>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Order details</h1>
        <div className="flex items-center gap-2 text-sm">
          Order: <StatusBadge value={order.orderStatus} />
          Payment: <StatusBadge value={order.paymentStatus} />
        </div>
      </div>
      <p className="text-sm text-gray-500">
        Placed on {new Date(order.createdAt).toLocaleString()}
      </p>

      <ul className="mt-4 space-y-3">
        {order.items.map((item) => (
          <li key={item.product} className="flex items-center gap-4 rounded border p-3">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded bg-gray-100">
              {item.image && (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              )}
            </div>
            <div className="flex-1">
              <p className="font-semibold">{item.name}</p>
              <p className="text-sm text-gray-500">
                {item.price} BDT x {item.quantity}
              </p>
            </div>
            <p className="font-semibold">{item.price * item.quantity} BDT</p>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex justify-between border-t pt-3 text-lg font-bold">
        <span>Total</span>
        <span>{order.totalPrice} BDT</span>
      </div>

      <div className="mt-6 rounded border p-4 text-sm">
        <p className="mb-1 font-semibold">Shipping to</p>
        <p>{order.shippingAddress.name}</p>
        <p>{order.shippingAddress.phone}</p>
        <p>
          {order.shippingAddress.address}, {order.shippingAddress.city}
        </p>
        <p className="mt-2 text-gray-500">
          Payment method: {order.paymentMethod === "cod" ? "Cash on delivery" : "Online payment"}
        </p>
      </div>

      {actionError && <p className="mt-3 text-sm text-red-600">{actionError}</p>}

      <div className="mt-4 flex gap-3">
        {canPay && (
          <button
            onClick={handlePay}
            disabled={busy}
            className="rounded bg-green-600 px-4 py-2 text-white disabled:opacity-50"
          >
            {order.paymentStatus === "failed" ? "Try payment again" : "Pay now"}
          </button>
        )}
        {order.orderStatus === "pending" && (
          <button
            onClick={handleCancel}
            disabled={busy}
            className="rounded border border-red-600 px-4 py-2 text-red-600 disabled:opacity-50"
          >
            Cancel order
          </button>
        )}
      </div>
    </main>
  );
}