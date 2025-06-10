import React, { useState } from "react";
import { api } from "../api";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to send reset link.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-36 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Forgot Password</h2>
      {sent ? (
        <div className="space-y-4">
          <div className="text-green-600 font-semibold">
            If that email exists, a reset link has been sent.
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="w-full p-2 border"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded w-full"
          >
            Send Reset Link
          </button>
          {error && <div className="text-red-600">{error}</div>}
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;
