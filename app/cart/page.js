"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { user, loading: authLoading } = useAuth();
  const { cart, loading, updateItem, removeItem, clearCart } = useCart();
  const [error, setError] = useState("");

  // run a cart action and show the error if the backend refuses (for example: not enough stock)
  const run = async (action) => {
    setError("");
    try {
      await action();
    } catch (err) {
      setError(err.message);
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
          to see your cart.
        </p>
      </main>
    );
  }

  if (loading) return <p className="p-8">Loading cart...</p>;

  if (cart.items.length === 0) {
    return (
      <main className="p-8">
        <h1 className="mb-2 text-2xl font-bold">Your cart</h1>
        <p className="text-gray-500">Your cart is empty.</p>
        <Link href="/" className="text-blue-600 underline">
          Continue shopping
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your cart</h1>
        <button onClick={() => run(clearCart)} className="text-sm text-red-600 underline">
          Clear cart
        </button>
      </div>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      <ul className="space-y-3">
        {cart.items.map((item) => (
          <li key={item.product._id} className="flex items-center gap-4 rounded border p-3">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded bg-gray-100">
              {item.product.image ? (
                <Image
                  src={item.product.image}
                  alt={item.product.name}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-gray-400">
                  No image
                </div>
              )}
            </div>

            <div className="flex-1">
              <Link href={`/products/${item.product._id}`} className="font-semibold hover:underline">
                {item.product.name}
              </Link>
              <p className="text-sm text-gray-500">{item.product.price} BDT each</p>
              {!item.inStock && (
                <p className="text-xs text-red-600">
                  Only {item.product.stock} left in stock, please lower the quantity.
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={item.quantity <= 1}
                onClick={() => run(() => updateItem(item.product._id, item.quantity - 1))}
                className="h-8 w-8 rounded border disabled:opacity-40"
              >
                -
              </button>
              <span className="w-6 text-center">{item.quantity}</span>
              <button
                onClick={() => run(() => updateItem(item.product._id, item.quantity + 1))}
                className="h-8 w-8 rounded border"
              >
                +
              </button>
            </div>

            <div className="w-24 text-right font-semibold">{item.subtotal} BDT</div>

            <button
              onClick={() => run(() => removeItem(item.product._id))}
              className="text-sm text-red-600 underline"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center justify-between border-t pt-4">
        <p className="text-gray-600">Total items: {cart.totalItems}</p>
        <p className="text-xl font-bold">Total: {cart.totalPrice} BDT</p>
      </div>

            <div className="mt-4 text-right">
        <Link
          href="/checkout"
          className="inline-block rounded bg-green-600 px-5 py-2 text-white"
        >
          Proceed to checkout
        </Link>
      </div>
    </main>
  );
}
