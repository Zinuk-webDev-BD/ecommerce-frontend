"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      router.push("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto mt-10 max-w-sm p-4">
      <h1 className="mb-4 text-2xl font-bold">Login</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
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
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          className="w-full rounded border p-2"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        {error.includes("verify") && (
          <Link href="/verify-otp" className="text-sm text-blue-600 underline">
            Verify your email now
          </Link>
        )}
        <button
          disabled={loading}
          className="w-full rounded bg-blue-600 p-2 text-white disabled:opacity-50"
        >
          {loading ? "Please wait..." : "Login"}
        </button>
      </form>
      <p className="mt-4 text-sm">
        New here?{" "}
        <Link href="/register" className="text-blue-600 underline">
          Create an account
        </Link>
      </p>
    </main>
  );
}