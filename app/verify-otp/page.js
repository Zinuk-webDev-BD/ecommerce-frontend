"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function VerifyOtpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // fill the email saved by the register page
  useEffect(() => {
    const saved = sessionStorage.getItem("pendingEmail");
    if (saved) setEmail(saved);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api("/auth/verify-otp", { method: "POST", body: { email, otp } });
      sessionStorage.removeItem("pendingEmail");
      router.push("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto mt-10 max-w-sm p-4">
      <h1 className="mb-2 text-2xl font-bold">Verify your email</h1>
      <p className="mb-4 text-sm text-gray-600">
        We sent a 6 digit code to your email. It expires in 5 minutes.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded border p-2"
        />
        <input
          placeholder="6 digit code"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
          maxLength={6}
          className="w-full rounded border p-2 tracking-widest"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          disabled={loading}
          className="w-full rounded bg-blue-600 p-2 text-white disabled:opacity-50"
        >
          {loading ? "Please wait..." : "Verify"}
        </button>
      </form>
    </main>
  );
}