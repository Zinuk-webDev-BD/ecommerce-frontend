"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", otp: "", newPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // fill the email saved by the forgot password page
  useEffect(() => {
    const saved = sessionStorage.getItem("resetEmail");
    if (saved) setForm((prev) => ({ ...prev, email: saved }));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api("/auth/reset-password", { method: "POST", body: form });
      sessionStorage.removeItem("resetEmail");
      router.push("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto mt-10 max-w-sm p-4">
      <h1 className="mb-2 text-2xl font-bold">Reset password</h1>
      <p className="mb-4 text-sm text-gray-600">
        Enter the 6 digit code from your email. It expires in 5 minutes.
      </p>
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
          name="otp"
          placeholder="6 digit code"
          value={form.otp}
          onChange={handleChange}
          required
          maxLength={6}
          className="w-full rounded border p-2 tracking-widest"
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
        <button
          disabled={loading}
          className="w-full rounded bg-blue-600 p-2 text-white disabled:opacity-50"
        >
          {loading ? "Please wait..." : "Reset password"}
        </button>
      </form>
      <p className="mt-4 text-sm">
        Did not get a code?{" "}
        <Link href="/forgot-password" className="text-blue-600 underline">
          Send again
        </Link>
      </p>
    </main>
  );
}