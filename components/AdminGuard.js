"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

// shows the page only to an admin, everyone else sees a message
export default function AdminGuard({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <p className="p-8">Loading...</p>;

  if (!user) {
    return (
      <main className="p-8">
        <p>
          Please{" "}
          <Link href="/login" className="text-blue-600 underline">
            login
          </Link>{" "}
          as an admin.
        </p>
      </main>
    );
  }

  if (user.role !== "admin") {
    return (
      <main className="p-8">
        <p className="text-red-600">This page is only for admins.</p>
        <Link href="/" className="text-blue-600 underline">
          Back to shop
        </Link>
      </main>
    );
  }

  return children;
}