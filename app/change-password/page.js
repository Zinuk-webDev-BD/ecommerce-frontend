"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

// same method as the backend route (check routes/authRoutes.js)
const CHANGE_METHOD = "POST";

export default function ChangePasswordPage() {
  const { token, user, loading: authLoading } = useAuth();
  const [form, setForm] = useState({ oldPassword: "", newPassword: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      await api("/auth/change-password", { method: CHANGE_METHOD, token, body: form });
      setMessage("Password changed successfully");
      setForm({ oldPassword: "", newPassword: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
          first.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto mt-10 max-w-sm p-4">
      <h1 className="mb-4 text-2xl font-bold">Change password</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          name="oldPassword"
          type="password"
          placeholder="Old password"
          value={form.oldPassword}
          onChange={handleChange}
          required
          className="w-full rounded border p-2"
        />
        <input
          name="newPassword"
          type="password"
          placeholder="New password (min 6 characters)"
          value={form.newPassword}
          onChange={handleChange}
          required
          className="w-full rounded border p-2"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        {message && <p className="text-sm text-green-600">{message}</p>}
        <button
          disabled={loading}
          className="w-full rounded bg-blue-600 p-2 text-white disabled:opacity-50"
        >
          {loading ? "Please wait..." : "Change password"}
        </button>
      </form>
    </main>
  );
}