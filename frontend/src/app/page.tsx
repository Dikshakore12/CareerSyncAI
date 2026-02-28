"use client";

import {
  Sparkles, ChevronRight, BrainCircuit, Target, ShieldCheck,
  AlertTriangle, TrendingUp, ArrowRight, Lightbulb
} from "lucide-react";
import { motion } from "framer-motion";
import AnalyzerForm from "@/components/AnalyzerForm";

export default function Home() {
  return (
    <div className="bg-botmax-gradient selection:bg-indigo-100 selection:text-indigo-900">

      {/* Hero */}
      <section className="relative pt-60 pb-32 px-6">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="pill-badge mb-10 mx-auto"
          >
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse" />
            #1 AI Career Orchestration Platform
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-7xl md:text-[6.5rem] font-black tracking-tight text-gray-900 leading-[1.05] mb-10"
          >
            Intelligent Careers. <br />
            <span className="text-gradient-botmax">Powered by AI.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl text-gray-500 font-medium max-w-4xl mx-auto leading-relaxed mb-14"
          >
            CareerSync AI analyzes resumes, matches jobs, detects skill gaps,
            and provides personalized growth strategies — all in one intelligent ecosystem.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col md:flex-row items-center justify-center gap-6"
          >
            <button
              onClick={() => document.getElementById("analyzer")?.scrollIntoView({ behavior: "smooth" })}
              className="btn-primary-botmax group"
            >
              Try It Free
              <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => document.getElementById("analyzer")?.scrollIntoView({ behavior: "smooth" })}
              className="px-10 py-5 rounded-full bg-white text-gray-900 font-bold text-xl border-2 border-gray-100 hover:bg-gray-50 transition-all flex items-center gap-3"
            >
              Analyze My Resume
              <Sparkles className="w-6 h-6 text-indigo-600" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <h2 className="text-5xl md:text-6xl font-black tracking-tight text-gray-900 leading-tight">
                The Career <br />
                <span className="text-indigo-600">Gap Problem</span>
              </h2>
              <div className="space-y-6 text-xl text-gray-500 font-medium leading-relaxed">
                <p>
                  Most job seekers struggle with a fragmented career search process.
                  From invisible ATS rejection to unclear skill requirements.
                </p>
                <div className="space-y-4">
                  {[
                    "ATS rejection despite high qualifications",
                    "Uncertainty about missing technical skill gaps",
                    "Low shortlisting rates due to unoptimized resumes",
                    "Unclear direction for professional growth",
                  ].map((problem) => (
                    <div key={problem} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <span className="text-gray-700">{problem}</span>
                    </div>
                  ))}
                </div>
                <p className="text-indigo-600 font-bold italic pt-4">
                  CareerSync AI solves this using Large Language Models to decode industry
                  needs and align your profile instantly.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="card-botmax p-12 relative z-10">
                <div className="space-y-8">
                  <div className="flex items-center justify-between p-6 bg-red-50 rounded-2xl border border-red-100">
                    <span className="text-lg font-bold text-red-600">Without CareerSync</span>
                    <span className="text-sm font-black text-red-400">~12% shortlist rate</span>
                  </div>
                  <div className="flex items-center justify-between p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
                    <span className="text-lg font-bold text-indigo-600">With CareerSync AI</span>
                    <span className="text-sm font-black text-indigo-400">~78% match accuracy</span>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 blur-[100px] opacity-10 rounded-full" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto text-center mb-24">
          <h2 className="text-5xl md:text-6xl font-black tracking-tight text-gray-900 mb-8">
            Powerful AI. <span className="text-indigo-600">Real Career Results.</span>
          </h2>
        </div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { icon: BrainCircuit, color: "bg-purple-500", title: "Smart Resume Intelligence", desc: "Advanced NLP parsing to extract hidden value from your work history." },
            { icon: Target, color: "bg-indigo-500", title: "Job Compatibility Engine", desc: "Instant matching score between your profile and job requirements." },
            { icon: ShieldCheck, color: "bg-blue-500", title: "ATS Optimization", desc: "Bypass recruiter screening filters with intelligent keyword alignment." },
            { icon: AlertTriangle, color: "bg-pink-500", title: "Skill Gap Detection", desc: "Precisely identify what skills you lack for your dream role." },
            { icon: TrendingUp, color: "bg-green-500", title: "Career Roadmap Generator", desc: "6-month and 12-month strategic learning and growth plans." },
            { icon: Sparkles, color: "bg-yellow-500", title: "AI Interview Simulator", desc: "Practice role-specific questions with real-time feedback." },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card-botmax group hover:border-indigo-200 transition-all cursor-pointer"
            >
              <div className={`${feature.color} w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black mb-4 text-gray-900 tracking-tight">{feature.title}</h3>
              <p className="text-lg text-gray-500 font-medium leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works + Analyzer */}
      <section id="analyzer" className="py-32 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-gray-900 mb-6 tracking-tight">
              How It Works
            </h2>
            <div className="flex items-center justify-center gap-8 text-indigo-600 font-bold text-sm uppercase tracking-widest">
              <span>01. Upload</span>
              <ArrowRight className="w-4 h-4" />
              <span>02. Paste</span>
              <ArrowRight className="w-4 h-4" />
              <span>03. Sync</span>
            </div>
          </div>
          <AnalyzerForm />
        </div>
      </section>

      {/* Analytics Preview */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto text-center mb-24">
          <h2 className="text-5xl font-black text-gray-900 mb-6">
            Real-Time Career Intelligence
          </h2>
          <p className="text-xl text-gray-500 font-medium">
            Get detailed visual insights into your professional alignment.
          </p>
        </div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="card-botmax p-8 bg-white">
            <div className="flex items-center justify-between mb-8">
              <h4 className="text-xl font-bold">Resume Score</h4>
              <span className="text-indigo-600 font-black text-2xl">78%</span>
            </div>
            <div className="space-y-6">
              {[
                { label: "Technical Proficiency", score: 85 },
                { label: "Impact Metrics", score: 62 },
                { label: "Keyword Alignment", score: 88 },
                { label: "Formatting Score", score: 75 },
              ].map((stat) => (
                <div key={stat.label} className="space-y-2">
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-gray-600">{stat.label}</span>
                    <span className="text-indigo-600">{stat.score}%</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${stat.score}%` }}
                      className="h-full bg-indigo-500 rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="card-botmax p-8 bg-gray-900 text-white">
            <h4 className="text-xl font-bold mb-8">AI Insight Panel</h4>
            <div className="space-y-6">
              <div className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-3">
                <div className="flex items-center gap-3 text-yellow-400 font-bold">
                  <Lightbulb className="w-5 h-5" />
                  <span>Strategic Advice</span>
                </div>
                <p className="text-gray-400 text-lg leading-relaxed">
                  Missing Kubernetes experience? Add Docker projects to partially bridge this gap.
                </p>
              </div>
              <div className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-3">
                <div className="flex items-center gap-3 text-green-400 font-bold">
                  <TrendingUp className="w-5 h-5" />
                  <span>Growth Opportunity</span>
                </div>
                <p className="text-gray-400 text-lg leading-relaxed">
                  Your profile matches 92% of leadership requirements — strong Senior candidate.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto card-botmax bg-indigo-600 text-white text-center p-24 relative overflow-hidden">
          <div className="relative z-10 space-y-12">
            <h2 className="text-6xl font-black tracking-tight leading-tight">
              Start Building Your <br /> Future Today
            </h2>
            <button
              onClick={() => document.getElementById("analyzer")?.scrollIntoView({ behavior: "smooth" })}
              className="px-12 py-6 rounded-full bg-white text-indigo-600 font-black text-2xl hover:scale-105 transition-all shadow-2xl"
            >
              Analyze Your Resume — Free
            </button>
          </div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full -ml-48 -mb-48 blur-3xl" />
        </div>
      </section>
    </div>
  );
}
