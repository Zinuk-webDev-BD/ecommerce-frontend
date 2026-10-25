"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const { cart } = useCart();

  return (
    <nav className="flex items-center justify-between border-b px-6 py-3">
      <Link href="/" className="text-xl font-bold">
        Ecommerce Shop
      </Link>

      <div className="flex items-center gap-4">
        {/* nothing shown until we know if the user is logged in */}
        {!loading && user && (
          <>
            {user.role === "admin" && (
              <Link href="/admin" className="font-semibold text-purple-700 hover:underline">
                Admin
              </Link>
            )}
            <Link href="/orders" className="hover:underline">
              Orders
            </Link>
            <Link href="/cart" className="hover:underline">
              Cart ({cart.totalItems})
            </Link>
            <span className="text-sm text-gray-600">Hi, {user.name}</span>
            <button onClick={logout} className="rounded bg-gray-800 px-3 py-1 text-white">
              Logout
            </button>
          </>
        )}

        {!loading && !user && (
          <>
            <Link href="/login" className="hover:underline">
              Login
            </Link>
            <Link href="/register" className="rounded bg-blue-600 px-3 py-1 text-white">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}