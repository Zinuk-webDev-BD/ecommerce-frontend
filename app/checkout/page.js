"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

export default function CheckoutPage() {
  const router = useRouter();
  const { token, user, loading: authLoading } = useAuth();
  const { cart, loading: cartLoading, refreshCart } = useCart();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    paymentMethod: "cod",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // fill the name from the logged in user
  useEffect(() => {
    if (user) setForm((prev) => ({ ...prev, name: prev.name || user.name }));
  }, [user]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      // 1. place the order, the backend takes the items from my cart
      const data = await api("/orders", { method: "POST", token, body: form });
      const order = data.order;
      await refreshCart().catch(() => {});

      // 2. cash on delivery is done here
      if (form.paymentMethod === "cod") {
        router.push(`/orders/${order._id}`);
        return;
      }

      // 3. online payment, go to the sslcommerz page
      try {
        const pay = await api(`/payments/init/${order._id}`, { method: "POST", token });
        window.location.href = pay.gatewayUrl;
      } catch {
        // the order is saved, the customer can pay again from the order page
        router.push(`/orders/${order._id}`);
      }
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  if (authLoading || cartLoading) return <p className="p-8">Loading...</p>;

  if (!user) {
    return (
      <main className="p-8">
        <p>
          Please{" "}
          <Link href="/login" className="text-blue-600 underline">
            login
          </Link>{" "}
          to checkout.
        </p>
      </main>
    );
  }

  if (cart.items.length === 0 && !submitting) {
    return (
      <main className="p-8">
        <p className="text-gray-500">Your cart is empty.</p>
        <Link href="/" className="text-blue-600 underline">
          Continue shopping
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto grid max-w-5xl gap-8 p-6 md:grid-cols-2">
      {/* shipping form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <h1 className="text-2xl font-bold">Checkout</h1>

        <input
          name="name"
          placeholder="Full name"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full rounded border p-2"
        />
        <input
          name="phone"
          placeholder="Phone (01712345678)"
          value={form.phone}
          onChange={handleChange}
          required
          className="w-full rounded border p-2"
        />
        <input
          name="address"
          placeholder="Address"
          value={form.address}
          onChange={handleChange}
          required
          className="w-full rounded border p-2"
        />
        <input
          name="city"
          placeholder="City"
          value={form.city}
          onChange={handleChange}
          required
          className="w-full rounded border p-2"
        />

        <div className="space-y-2 pt-2">
          <p className="text-sm font-semibold">Payment method</p>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="paymentMethod"
              value="cod"
              checked={form.paymentMethod === "cod"}
              onChange={handleChange}
            />
            Cash on delivery
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="paymentMethod"
              value="sslcommerz"
              checked={form.paymentMethod === "sslcommerz"}
              onChange={handleChange}
            />
            Online payment (SSLCommerz)
          </label>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          disabled={submitting}
          className="w-full rounded bg-green-600 p-2 text-white disabled:opacity-50"
        >
          {submitting ? "Please wait..." : "Place order"}
        </button>
      </form>

      {/* order summary */}
      <div>
        <h2 className="mb-3 text-xl font-bold">Order summary</h2>
        <ul className="space-y-2">
          {cart.items.map((item) => (
            <li key={item.product._id} className="flex justify-between text-sm">
              <span>
                {item.product.name} x {item.quantity}
              </span>
              <span>{item.subtotal} BDT</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t pt-3 text-lg font-bold">
          <span>Total</span>
          <span>{cart.totalPrice} BDT</span>
        </div>
      </div>
    </main>
  );
}