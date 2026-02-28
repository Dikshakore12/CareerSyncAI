"use client";

import { useState, useRef } from "react";
import { Upload, Sparkles, FileText } from "lucide-react";
import { motion } from "framer-motion";
import ResultDisplay from "./ResultDisplay";

const API_BASE = "http://localhost:8001";

export default function AnalyzerForm() {
  const [resume, setResume] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [requestCoverLetter, setRequestCoverLetter] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ analysis: string; match_score: number | null } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resume || !jobDescription.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("resume", resume);
    formData.append("job_description", jobDescription);
    formData.append("request_cover_letter", String(requestCoverLetter));

    try {
      const headers: HeadersInit = {};
      const storedToken = typeof window !== "undefined" ? localStorage.getItem("cs_token") : null;
      if (storedToken) headers["Authorization"] = `Bearer ${storedToken}`;

      const res = await fetch(`${API_BASE}/analyze`, {
        method: "POST",
        headers,
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Analysis failed. Please try again.");
        return;
      }

      setResult({ analysis: data.analysis, match_score: data.match_score });
    } catch {
      setError("Cannot connect to backend. Make sure the server is running on port 8001.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="card-botmax border-2 border-indigo-50"
      >
        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Resume upload */}
            <div className="space-y-4">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">
                Step 1 — Upload Resume
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all ${
                  resume
                    ? "border-green-400 bg-green-50/50"
                    : "border-gray-200 bg-gray-50 hover:border-indigo-400 hover:bg-indigo-50/30"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={e => e.target.files?.[0] && setResume(e.target.files[0])}
                  accept=".pdf,.docx,.txt"
                  className="hidden"
                />
                {resume ? (
                  <>
                    <FileText className="w-12 h-12 mx-auto mb-4 text-green-500" />
                    <p className="font-bold text-green-700 truncate">{resume.name}</p>
                    <p className="text-sm text-green-500 mt-1">
                      {(resume.size / 1024).toFixed(1)} KB — click to change
                    </p>
                  </>
                ) : (
                  <>
                    <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="font-bold text-gray-600">Drop or click to upload</p>
                    <p className="text-sm text-gray-400 mt-1">PDF, DOCX, or TXT</p>
                  </>
                )}
              </div>
            </div>

            {/* Job description */}
            <div className="space-y-4">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">
                Step 2 — Paste Job Description
              </label>
              <textarea
                required
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                className="input-botmax h-52 resize-none"
                placeholder="Paste the full job description here..."
              />
            </div>
          </div>

          {/* Cover letter toggle */}
          <label className="flex items-center gap-4 cursor-pointer group">
            <div
              onClick={() => setRequestCoverLetter(v => !v)}
              className={`w-12 h-7 rounded-full transition-colors flex-shrink-0 relative ${
                requestCoverLetter ? "bg-indigo-600" : "bg-gray-200"
              }`}
            >
              <div
                className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  requestCoverLetter ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </div>
            <span className="text-sm font-bold text-gray-600 group-hover:text-gray-900 transition-colors">
              Also generate a personalized cover letter
            </span>
          </label>

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 font-semibold text-sm">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !resume || !jobDescription.trim()}
            className="btn-primary-botmax w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing Career Path...
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6" />
                Run AI Sync
              </>
            )}
          </button>
        </form>
      </motion.div>

      {/* Result rendered below form */}
      {result && (
        <ResultDisplay
          analysis={result.analysis}
          matchScore={result.match_score}
          onClose={() => setResult(null)}
        />
      )}
    </div>
  );
}
