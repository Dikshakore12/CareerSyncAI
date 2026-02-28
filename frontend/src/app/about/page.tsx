"use client";

import { motion } from "framer-motion";
import {
  Target, Sparkles, Heart, GraduationCap,
  Linkedin, Github, Mail
} from "lucide-react";

const team = [
  {
    name: "Dikshak",
    role: "Full-Stack & AI Engineer",
    desc: "Built the LangChain + Gemini AI pipeline, FastAPI backend, and SQLite data layer.",
    initials: "DK",
    color: "bg-indigo-500",
  },
  {
    name: "Frontend Lead",
    role: "UI/UX & React Engineer",
    desc: "Designed the Next.js frontend with Tailwind CSS and Framer Motion animations.",
    initials: "FL",
    color: "bg-purple-500",
  },
  {
    name: "Research Lead",
    role: "NLP & Career Domain Expert",
    desc: "Designed the AI prompts, scoring logic, and career roadmap framework.",
    initials: "RL",
    color: "bg-pink-500",
  },
];

const techStack = [
  { category: "AI / ML", items: ["LangChain", "Gemini 1.5 Flash", "Google Generative AI"] },
  { category: "Backend", items: ["FastAPI", "Python 3.11", "aiosqlite", "PyPDF2"] },
  { category: "Frontend", items: ["Next.js 14", "TypeScript", "Tailwind CSS", "Framer Motion"] },
  { category: "Database", items: ["SQLite", "aiosqlite async driver"] },
];

export default function AboutPage() {
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
            <Heart className="w-3 h-3 text-red-500" />
            Our Story
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-7xl font-black text-gray-900 tracking-tight mb-8"
          >
            Built by Students, <br />
            <span className="text-gradient-botmax">For Every Job Seeker</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-500 font-medium max-w-2xl mx-auto"
          >
            CareerSync AI started as a Final Year CSE project at Nagpur. We experienced ATS rejection
            firsthand and decided to build the tool we wished existed.
          </motion.p>
        </div>
      </section>

      {/* Mission / Tech / Academic */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Target,
              color: "text-indigo-600",
              bg: "bg-indigo-50",
              title: "Our Mission",
              desc: "Democratize career intelligence so every student and professional — regardless of background — gets the same quality of career guidance that expensive coaches provide.",
            },
            {
              icon: Sparkles,
              color: "text-purple-600",
              bg: "bg-purple-50",
              title: "Our Technology",
              desc: "We use Google's Gemini 1.5 Flash LLM via LangChain to analyze resumes and job descriptions. The output is structured, realistic, and tailored — not generic templates.",
            },
            {
              icon: GraduationCap,
              color: "text-pink-600",
              bg: "bg-pink-50",
              title: "Academic Context",
              desc: "This platform is a Final Year Computer Science & Engineering capstone project demonstrating real-world AI, REST APIs, and full-stack development skills.",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card-botmax text-center"
            >
              <div className={`${item.bg} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                <item.icon className={`w-8 h-8 ${item.color}`} />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-4">{item.title}</h3>
              <p className="text-gray-500 font-medium leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-black text-gray-900 text-center mb-16">Meet the Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card-botmax text-center group"
              >
                <div className={`${member.color} w-20 h-20 rounded-3xl flex items-center justify-center text-white text-2xl font-black mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                  {member.initials}
                </div>
                <h3 className="text-xl font-black text-gray-900">{member.name}</h3>
                <p className="text-indigo-600 font-bold text-sm mt-1 mb-4">{member.role}</p>
                <p className="text-gray-500 font-medium text-sm leading-relaxed">{member.desc}</p>
                <div className="flex items-center justify-center gap-3 mt-6">
                  <a href="#" className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                    <Linkedin className="w-4 h-4" />
                  </a>
                  <a href="#" className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all">
                    <Github className="w-4 h-4" />
                  </a>
                  <a href="#" className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
                    <Mail className="w-4 h-4" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech stack */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-black text-gray-900 text-center mb-16">Technology Stack</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {techStack.map((cat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card-botmax p-8"
              >
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">
                  {cat.category}
                </h4>
                <ul className="space-y-3">
                  {cat.items.map((item) => (
                    <li key={item} className="text-gray-700 font-semibold text-sm">{item}</li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
