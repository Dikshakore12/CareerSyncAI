"use client";

import { motion } from "framer-motion";
import {
  Upload, Brain, Target, ShieldCheck, TrendingUp,
  MessageSquare, FileText, ArrowRight, CheckCircle2, Sparkles
} from "lucide-react";

const features = [
  {
    icon: Upload,
    color: "bg-indigo-500",
    title: "Resume Upload & Parsing",
    desc: "Upload PDF, DOCX, or TXT resume files. Our parser extracts skills, experience, education, and achievements from any format.",
    bullets: ["PDF, DOCX, TXT supported", "Multi-page document support", "Scanned PDF detection"],
  },
  {
    icon: Brain,
    color: "bg-purple-500",
    title: "AI-Powered Skill Extraction",
    desc: "LangChain + Gemini 1.5 Flash intelligently identifies both explicit and implicit skills across your entire resume.",
    bullets: ["LangChain orchestration", "Gemini 1.5 Flash LLM", "Implicit skill detection"],
  },
  {
    icon: Target,
    color: "bg-blue-500",
    title: "Job Compatibility Engine",
    desc: "Paste any job description and get a real match score based on skill overlap, experience level, and role requirements.",
    bullets: ["0–100% realistic scoring", "Strong / Partial / Missing categories", "Per-skill breakdown"],
  },
  {
    icon: ShieldCheck,
    color: "bg-green-500",
    title: "ATS Optimization",
    desc: "Applicant Tracking Systems filter 75% of resumes before a human sees them. We tell you exactly what to add.",
    bullets: ["Keyword gap analysis", "Formatting recommendations", "Industry-specific terms"],
  },
  {
    icon: TrendingUp,
    color: "bg-pink-500",
    title: "Career Roadmap Generator",
    desc: "Get a personalized 6-month and 12-month learning plan to bridge your skill gaps and reach your career goals.",
    bullets: ["6-month sprint plan", "12-month growth strategy", "Resource recommendations"],
  },
  {
    icon: MessageSquare,
    color: "bg-yellow-500",
    title: "Interview Preparation AI",
    desc: "Role-specific technical and behavioral questions generated from the actual job description — not generic templates.",
    bullets: ["Technical question bank", "STAR behavioral questions", "Difficulty-calibrated"],
  },
  {
    icon: FileText,
    color: "bg-teal-500",
    title: "Cover Letter Generator",
    desc: "Optional AI-generated cover letter personalized to the specific job and company, in a professional tone.",
    bullets: ["Job-specific content", "Professional tone", "Customizable output"],
  },
];

export default function PlatformPage() {
  return (
    <div className="bg-botmax-gradient min-h-screen">

      {/* Hero */}
      <section className="pt-48 pb-24 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="pill-badge mb-8 mx-auto"
          >
            <Sparkles className="w-3 h-3" />
            The Platform
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-7xl font-black text-gray-900 tracking-tight mb-8"
          >
            Every Tool You Need <br />
            <span className="text-gradient-botmax">To Land Your Dream Job</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-500 font-medium max-w-2xl mx-auto"
          >
            CareerSync AI packs an entire career coaching session into a single AI-powered workflow.
          </motion.p>
        </div>
      </section>

      {/* 3-step pipeline */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-black text-gray-900 text-center mb-16">The 3-Step Pipeline</h2>
          <div className="flex flex-col md:flex-row items-center gap-6">
            {[
              { step: "01", title: "Upload", desc: "Drop your resume file" },
              { step: "02", title: "Paste", desc: "Add the job description" },
              { step: "03", title: "Sync", desc: "Get full AI analysis" },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-6 flex-1">
                <div className="card-botmax p-8 text-center flex-1">
                  <div className="text-5xl font-black text-indigo-200 mb-4">{s.step}</div>
                  <h3 className="text-xl font-black text-gray-900">{s.title}</h3>
                  <p className="text-gray-500 font-medium mt-2">{s.desc}</p>
                </div>
                {i < 2 && <ArrowRight className="w-8 h-8 text-indigo-300 flex-shrink-0 hidden md:block" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-black text-gray-900 text-center mb-16">
            All Features <span className="text-indigo-600">in Detail</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="card-botmax group"
              >
                <div className={`${f.color} w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                  <f.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-3">{f.title}</h3>
                <p className="text-gray-500 font-medium leading-relaxed mb-6">{f.desc}</p>
                <ul className="space-y-2">
                  {f.bullets.map((b, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech stack */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-black text-gray-900 mb-6">Built With Modern AI Stack</h2>
          <p className="text-gray-500 font-medium mb-12">
            Industry-standard tools trusted by production AI systems.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {[
              "LangChain", "Gemini 1.5 Flash", "FastAPI", "Next.js 14",
              "SQLite", "Python 3.11", "TypeScript", "Tailwind CSS",
            ].map((tech) => (
              <span
                key={tech}
                className="px-6 py-3 bg-gray-50 border border-gray-200 rounded-full font-bold text-gray-700 text-sm"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
