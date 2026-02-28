"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Sparkles, Zap, Building2 } from "lucide-react";

const plans = [
  {
    icon: Sparkles,
    name: "Free",
    price: "₹0",
    period: "forever",
    desc: "Perfect for students and first-time job seekers.",
    color: "border-gray-200",
    buttonClass: "bg-gray-900 text-white hover:bg-gray-800",
    features: [
      "5 resume analyses per month",
      "Job compatibility score",
      "Basic skill gap detection",
      "ATS optimization tips",
      "Email support",
    ],
    highlighted: false,
  },
  {
    icon: Zap,
    name: "Pro",
    price: "₹499",
    period: "per month",
    desc: "For active job seekers who need full AI power.",
    color: "border-indigo-500 shadow-2xl shadow-indigo-500/20",
    buttonClass: "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-xl hover:shadow-indigo-500/30",
    features: [
      "Unlimited analyses",
      "Career roadmap (6 & 12 months)",
      "AI interview preparation",
      "Cover letter generator",
      "Analytics dashboard",
      "Priority support",
    ],
    highlighted: true,
  },
  {
    icon: Building2,
    name: "Enterprise",
    price: "₹2,499",
    period: "per month",
    desc: "For teams, colleges, and placement cells.",
    color: "border-gray-200",
    buttonClass: "bg-gray-900 text-white hover:bg-gray-800",
    features: [
      "Everything in Pro",
      "Up to 50 team members",
      "Bulk resume processing",
      "Custom AI fine-tuning",
      "API access",
      "Dedicated support & SLA",
    ],
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <div className="bg-botmax-gradient min-h-screen pt-40 pb-24 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="pill-badge mb-8 mx-auto"
          >
            Simple Pricing
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl font-black text-gray-900 tracking-tight mb-6"
          >
            Plans That Match <br />
            <span className="text-gradient-botmax">Your Career Stage</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-500 font-medium"
          >
            No hidden fees. No credit card required for free plan.
          </motion.p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative bg-white rounded-[2.5rem] border-2 p-10 ${plan.color} ${plan.highlighted ? "scale-105" : ""}`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-black uppercase tracking-widest rounded-full shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}

              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 ${
                plan.highlighted ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-600"
              }`}>
                <plan.icon className="w-7 h-7" />
              </div>

              <h3 className="text-2xl font-black text-gray-900 mb-2">{plan.name}</h3>
              <p className="text-gray-500 font-medium mb-8">{plan.desc}</p>

              <div className="mb-8">
                <span className="text-5xl font-black text-gray-900">{plan.price}</span>
                <span className="text-gray-400 font-semibold ml-2">/{plan.period}</span>
              </div>

              <ul className="space-y-4 mb-10">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <CheckCircle2 className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      plan.highlighted ? "text-indigo-500" : "text-gray-400"
                    }`} />
                    <span className="text-gray-600 font-medium text-sm">{f}</span>
                  </li>
                ))}
              </ul>

              <button className={`w-full py-4 rounded-2xl font-black text-lg transition-all ${plan.buttonClass}`}>
                Get Started
              </button>
            </motion.div>
          ))}
        </div>

        {/* FAQ teaser */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-24 text-center card-botmax p-12"
        >
          <h3 className="text-3xl font-black text-gray-900 mb-4">
            Have questions about pricing?
          </h3>
          <p className="text-gray-500 font-medium mb-8">
            This is a final-year CSE demonstration project. All features run locally for free.
          </p>
          <span className="px-6 py-3 bg-indigo-50 text-indigo-700 rounded-full font-bold text-sm">
            contact@careersync.ai
          </span>
        </motion.div>
      </div>
    </div>
  );
}
