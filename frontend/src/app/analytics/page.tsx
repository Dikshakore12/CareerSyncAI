"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BarChart3, TrendingUp, FileSearch, Clock, Trash2,
  LogOut, RefreshCw, ChevronRight
} from "lucide-react";
import Link from "next/link";

const API_BASE = "http://localhost:8001";

interface Stats {
  total_analyses: number;
  average_score: number;
  score_distribution: {
    low: number;
    medium: number;
    good: number;
    excellent: number;
  };
  recent_analyses: Array<{
    id: number;
    filename: string;
    job_title: string;
    match_score: number | null;
    created_at: string;
  }>;
}

interface Analysis {
  id: number;
  filename: string;
  job_title: string;
  match_score: number | null;
  created_at: string;
}

function ScoreBar({ label, count, total, color }: {
  label: string; count: number; total: number; color: string;
}) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm font-bold">
        <span className="text-gray-600">{label}</span>
        <span className="text-gray-900">{count}</span>
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
}

function ScorePill({ score }: { score: number | null }) {
  if (score === null) return <span className="text-gray-400 text-sm font-bold">N/A</span>;
  const color =
    score >= 80 ? "bg-green-100 text-green-700" :
    score >= 60 ? "bg-indigo-100 text-indigo-700" :
    score >= 40 ? "bg-yellow-100 text-yellow-700" :
                  "bg-red-100 text-red-700";
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-black ${color}`}>
      {score}%
    </span>
  );
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getToken = () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("cs_token");
  };

  const logout = () => {
    localStorage.removeItem("cs_token");
    localStorage.removeItem("cs_user");
    router.push("/login");
  };

  const fetchData = async () => {
    const token = getToken();
    if (!token) { router.push("/login"); return; }

    setLoading(true);
    setError(null);

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [statsRes, analysesRes] = await Promise.all([
        fetch(`${API_BASE}/analytics/stats`, { headers }),
        fetch(`${API_BASE}/analyses`, { headers }),
      ]);

      if (statsRes.status === 401 || analysesRes.status === 401) {
        logout();
        return;
      }

      const statsData = await statsRes.json();
      const analysesData = await analysesRes.json();

      setStats(statsData);
      setAnalyses(analysesData.analyses || []);

      const stored = localStorage.getItem("cs_user");
      if (stored) setUser(JSON.parse(stored));
    } catch {
      setError("Failed to load dashboard data. Make sure the backend is running on port 8001.");
    } finally {
      setLoading(false);
    }
  };

  const deleteAnalysis = async (id: number) => {
    const token = getToken();
    if (!token) return;
    try {
      await fetch(`${API_BASE}/analyses/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnalyses(prev => prev.filter(a => a.id !== id));
      // Update stats count locally
      setStats(prev => prev ? { ...prev, total_analyses: prev.total_analyses - 1 } : prev);
    } catch {
      // silent fail
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("cs_token");
      if (!token) { router.push("/login"); return; }
      fetchData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-botmax-gradient flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 font-semibold">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-botmax-gradient pt-32 pb-24 px-6">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="pill-badge mb-4">
              <BarChart3 className="w-3 h-3" />
              Analytics Dashboard
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">
              Welcome back, {user?.name || "Dikshak"} 👋
            </h1>
            <p className="text-gray-500 font-medium mt-2">
              Here&apos;s your complete career analysis history and insights.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="p-3 rounded-2xl bg-white border border-gray-100 text-gray-500 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <Link
              href="/#analyzer"
              className="px-6 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition-colors"
            >
              New Analysis
            </Link>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-gray-100 text-gray-600 font-bold text-sm hover:border-red-200 hover:text-red-600 transition-all shadow-sm"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 font-semibold">
            {error}
          </div>
        )}

        {/* Stat cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-botmax p-8 text-center"
            >
              <FileSearch className="w-10 h-10 text-indigo-500 mx-auto mb-4" />
              <div className="text-5xl font-black text-gray-900">{stats.total_analyses}</div>
              <div className="text-gray-500 font-semibold mt-2">Total Analyses</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card-botmax p-8 text-center"
            >
              <TrendingUp className="w-10 h-10 text-green-500 mx-auto mb-4" />
              <div className="text-5xl font-black text-gray-900">{stats.average_score}%</div>
              <div className="text-gray-500 font-semibold mt-2">Average Match Score</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card-botmax p-8 text-center"
            >
              <BarChart3 className="w-10 h-10 text-purple-500 mx-auto mb-4" />
              <div className="text-5xl font-black text-gray-900">
                {stats.score_distribution.excellent + stats.score_distribution.good}
              </div>
              <div className="text-gray-500 font-semibold mt-2">Strong Matches (60%+)</div>
            </motion.div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Score distribution */}
          {stats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card-botmax p-8 space-y-6"
            >
              <h3 className="text-xl font-black text-gray-900">Score Distribution</h3>
              <div className="space-y-4">
                <ScoreBar
                  label="Excellent (80–100%)"
                  count={stats.score_distribution.excellent}
                  total={stats.total_analyses}
                  color="bg-green-500"
                />
                <ScoreBar
                  label="Good (60–79%)"
                  count={stats.score_distribution.good}
                  total={stats.total_analyses}
                  color="bg-indigo-500"
                />
                <ScoreBar
                  label="Partial (40–59%)"
                  count={stats.score_distribution.medium}
                  total={stats.total_analyses}
                  color="bg-yellow-500"
                />
                <ScoreBar
                  label="Low (0–39%)"
                  count={stats.score_distribution.low}
                  total={stats.total_analyses}
                  color="bg-red-400"
                />
              </div>
            </motion.div>
          )}

          {/* Analyses table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 card-botmax p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-gray-900">All Analyses</h3>
              <span className="text-sm text-gray-400 font-semibold">{analyses.length} records</span>
            </div>

            {analyses.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <FileSearch className="w-12 h-12 mx-auto mb-4 opacity-40" />
                <p className="font-semibold">No analyses yet.</p>
                <p className="text-sm mt-2">Run your first analysis from the home page.</p>
                <Link
                  href="/#analyzer"
                  className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition-colors"
                >
                  Analyze Resume <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                      <th className="pb-4 pr-4">File</th>
                      <th className="pb-4 pr-4">Job Title</th>
                      <th className="pb-4 pr-4">Score</th>
                      <th className="pb-4 pr-4">Date</th>
                      <th className="pb-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {analyses.map((a) => (
                      <tr key={a.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="py-4 pr-4">
                          <span className="font-semibold text-gray-800 text-sm truncate max-w-[120px] block">
                            {a.filename}
                          </span>
                        </td>
                        <td className="py-4 pr-4">
                          <span className="text-gray-600 text-sm truncate max-w-[140px] block">
                            {a.job_title}
                          </span>
                        </td>
                        <td className="py-4 pr-4">
                          <ScorePill score={a.match_score} />
                        </td>
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-1.5 text-gray-400 text-xs font-semibold">
                            <Clock className="w-3 h-3" />
                            {new Date(a.created_at).toLocaleDateString("en-IN", {
                              day: "numeric", month: "short", year: "numeric"
                            })}
                          </div>
                        </td>
                        <td className="py-4">
                          <button
                            onClick={() => deleteAnalysis(a.id)}
                            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
