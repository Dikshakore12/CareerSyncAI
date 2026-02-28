"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Eye, EyeOff } from "lucide-react";

const API_BASE = "http://localhost:8001";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || "Login failed.");
        return;
      }
      localStorage.setItem("cs_token", data.token);
      localStorage.setItem("cs_user", JSON.stringify(data.user));
      router.push("/analytics");
    } catch {
      setError("Cannot connect to backend. Make sure the server is running on port 8001.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-botmax-gradient flex items-center justify-center px-6 py-24">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-500 w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/20">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-gray-900">Welcome back</h1>
          <p className="mt-3 text-gray-500 font-medium">Sign in to your CareerSync AI dashboard</p>
        </div>

        <form onSubmit={onSubmit} className="card-botmax p-8 space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              className="input-botmax"
              placeholder="dikshak"
              autoComplete="username"
            />
          </div>
          <div className="relative">
            <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="input-botmax pr-14"
              placeholder="••••••••"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPw(v => !v)}
              className="absolute right-4 top-[2.9rem] text-gray-400 hover:text-gray-700 transition-colors"
            >
              {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 font-semibold text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary-botmax"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <div className="pt-2 p-4 bg-indigo-50 rounded-2xl text-center text-sm text-indigo-700">
            <p className="font-bold mb-1">Demo credentials</p>
            <p className="font-mono tracking-wide">dikshak / demo@1234</p>
          </div>
        </form>

        <p className="text-center text-sm font-semibold text-gray-500">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-indigo-600 hover:text-indigo-700 font-bold">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
