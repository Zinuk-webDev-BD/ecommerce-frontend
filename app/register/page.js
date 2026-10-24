"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api("/auth/register", { method: "POST", body: form });
      // remember the email so the otp page can fill it
      sessionStorage.setItem("pendingEmail", form.email);
      router.push("/verify-otp");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto mt-10 max-w-sm p-4">
      <h1 className="mb-4 text-2xl font-bold">Create an account</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full rounded border p-2"
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full rounded border p-2"
        />
        <input
          name="password"
          type="password"
          placeholder="Password (min 6 characters)"
          value={form.password}
          onChange={handleChange}
          required
          className="w-full rounded border p-2"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          disabled={loading}
          className="w-full rounded bg-blue-600 p-2 text-white disabled:opacity-50"
        >
          {loading ? "Please wait..." : "Register"}
        </button>
      </form>
      <p className="mt-4 text-sm">
        Already have an account?{" "}
        <Link href="/login" className="text-blue-600 underline">
          Login
        </Link>
      </p>
    </main>
  );
}