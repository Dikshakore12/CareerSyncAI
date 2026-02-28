"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2, AlertTriangle, XCircle,
  TrendingUp, Target, Brain, Briefcase, FileText, X
} from "lucide-react";

interface ResultDisplayProps {
  analysis: string;
  matchScore: number | null;
  onClose?: () => void;
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80 ? "text-green-600 bg-green-50 border-green-200" :
    score >= 60 ? "text-indigo-600 bg-indigo-50 border-indigo-200" :
    score >= 40 ? "text-yellow-600 bg-yellow-50 border-yellow-200" :
                  "text-red-600 bg-red-50 border-red-200";
  const label =
    score >= 80 ? "Excellent Match" :
    score >= 60 ? "Good Match" :
    score >= 40 ? "Partial Match" :
                  "Low Match";

  return (
    <div className={`inline-flex flex-col items-center px-8 py-6 rounded-3xl border-2 ${color}`}>
      <span className="text-6xl font-black">{score}%</span>
      <span className="text-sm font-bold uppercase tracking-widest mt-1">{label}</span>
    </div>
  );
}

function Section({ icon: Icon, title, color, content }: {
  icon: React.ElementType;
  title: string;
  color: string;
  content: string;
}) {
  if (!content.trim()) return null;
  const lines = content.split("\n").filter((l: string) => l.trim());
  return (
    <div className="space-y-3">
      <div className={`flex items-center gap-3 ${color}`}>
        <Icon className="w-5 h-5" />
        <h4 className="font-black text-lg">{title}</h4>
      </div>
      <ul className="space-y-2 pl-2">
        {lines.map((line: string, i: number) => {
          const clean = line.replace(/^[-•*]\s*/, "").trim();
          if (!clean) return null;
          return (
            <li key={i} className="flex items-start gap-2 text-gray-700 font-medium">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-current flex-shrink-0 opacity-50" />
              {clean}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function parseSection(text: string, startMarker: string, endMarkers: string[]): string {
  const startIdx = text.indexOf(startMarker);
  if (startIdx === -1) return "";
  const afterStart = text.slice(startIdx + startMarker.length);
  let endIdx = afterStart.length;
  for (const end of endMarkers) {
    const idx = afterStart.indexOf(end);
    if (idx !== -1 && idx < endIdx) endIdx = idx;
  }
  return afterStart.slice(0, endIdx).trim();
}

const ALL_MARKERS = [
  "\u2705", "\u26a0", "\u274c", "\ud83d\udcc8", "\ud83c\udfaf", "\ud83e\udde0", "\ud83d\udcbc", "\ud83d\udcc4", "\ud83d\udcca"
];

export default function ResultDisplay({ analysis, matchScore, onClose }: ResultDisplayProps) {
  const strongMatches  = parseSection(analysis, "\u2705 Strong Matches",       ALL_MARKERS.filter((m: string) => m !== "\u2705"));
  const partialMatches = parseSection(analysis, "\u26a0 Partial Matches",       ALL_MARKERS.filter((m: string) => m !== "\u26a0"));
  const missingSkills  = parseSection(analysis, "\u274c Missing Skills",        ALL_MARKERS.filter((m: string) => m !== "\u274c"));
  const improvements   = parseSection(analysis, "\ud83d\udcc8 Resume Improvement",   ALL_MARKERS.filter((m: string) => m !== "\ud83d\udcc8"));
  const ats            = parseSection(analysis, "\ud83c\udfaf ATS Optimization",     ALL_MARKERS.filter((m: string) => m !== "\ud83c\udfaf"));
  const roadmap        = parseSection(analysis, "\ud83e\udde0 Suggested Learning",   ALL_MARKERS.filter((m: string) => m !== "\ud83e\udde0"));
  const interview      = parseSection(analysis, "\ud83d\udcbc Interview Preparation",ALL_MARKERS.filter((m: string) => m !== "\ud83d\udcbc"));
  const coverLetter    = parseSection(analysis, "\ud83d\udcc4 Personalized Cover Letter", []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-12 space-y-8"
    >
      <div className="card-botmax relative">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        )}
        <div className="flex flex-col md:flex-row items-center gap-8">
          {matchScore !== null && <ScoreBadge score={matchScore} />}
          <div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">Analysis Complete</h3>
            <p className="text-gray-500 font-medium">
              Your resume has been analyzed against the job description. Review the detailed breakdown below.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {strongMatches && (
          <div className="card-botmax p-8 border-green-100">
            <Section icon={CheckCircle2} title="Strong Matches" color="text-green-600" content={strongMatches} />
          </div>
        )}
        {partialMatches && (
          <div className="card-botmax p-8 border-yellow-100">
            <Section icon={AlertTriangle} title="Partial Matches" color="text-yellow-600" content={partialMatches} />
          </div>
        )}
        {missingSkills && (
          <div className="card-botmax p-8 border-red-100">
            <Section icon={XCircle} title="Missing Skills" color="text-red-600" content={missingSkills} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {improvements && (
          <div className="card-botmax p-8">
            <Section icon={TrendingUp} title="Resume Improvements" color="text-indigo-600" content={improvements} />
          </div>
        )}
        {ats && (
          <div className="card-botmax p-8">
            <Section icon={Target} title="ATS Optimization" color="text-purple-600" content={ats} />
          </div>
        )}
      </div>

      {roadmap && (
        <div className="card-botmax p-8">
          <Section icon={Brain} title="Learning Roadmap" color="text-blue-600" content={roadmap} />
        </div>
      )}

      {interview && (
        <div className="card-botmax p-8">
          <Section icon={Briefcase} title="Interview Preparation" color="text-pink-600" content={interview} />
        </div>
      )}

      {coverLetter && (
        <div className="card-botmax p-8 bg-gray-900 text-white">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-5 h-5 text-indigo-400" />
            <h4 className="font-black text-lg">Personalized Cover Letter</h4>
          </div>
          <div className="whitespace-pre-wrap text-gray-300 font-medium leading-relaxed">
            {coverLetter}
          </div>
        </div>
      )}

      {!strongMatches && !missingSkills && (
        <div className="card-botmax p-8">
          <pre className="whitespace-pre-wrap text-gray-700 font-mono text-sm leading-relaxed">
            {analysis}
          </pre>
        </div>
      )}
    </motion.div>
  );
}
