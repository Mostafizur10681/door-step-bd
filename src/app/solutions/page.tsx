"use client";

import React from "react";
import Link from "next/link";
import { Zap, ShieldCheck, Cpu, BatteryCharging, Factory, Wrench, ArrowRight, CheckCircle2, PhoneCall } from "lucide-react";
import { TrustBadgesBar } from "@/components/TrustBadgesBar";

const SOLUTIONS_LIST = [
  {
    icon: Factory,
    title: "Industrial Power Generation",
    desc: "Heavy-duty diesel, gas, and dual-fuel generator sets engineered for continuous factory, commercial, and utility loads.",
    features: ["50 kVA to 3000 kVA capacities", "Low emissions & acoustic canopies", "Automatic Transfer Switch (ATS)"],
  },
  {
    icon: Zap,
    title: "Substation & HT / LT Panels",
    desc: "Turnkey electrical substation engineering, high-tension switchgears, low-voltage distribution boards, and transformers.",
    features: ["Custom panel fabrication", "Circuit protection & metering", "Compliance with national grid standards"],
  },
  {
    icon: BatteryCharging,
    title: "Solar & Hybrid Power Solutions",
    desc: "Commercial and industrial rooftop solar photovoltaic systems paired with intelligent hybrid inverter technology.",
    features: ["Net metering readiness", "Tier-1 solar panels", "High-efficiency MPPT string inverters"],
  },
  {
    icon: Cpu,
    title: "UPS & Critical Power Backup",
    desc: "Online double-conversion uninterruptible power supply systems designed for data centers, hospitals, and automation lines.",
    features: ["Zero millisecond transfer time", "Scalable modular architecture", "Extended battery runtime"],
  },
  {
    icon: ShieldCheck,
    title: "Energy Audits & Automation",
    desc: "Comprehensive industrial power quality analysis, harmonic suppression, load balancing, and SCADA monitoring.",
    features: ["Power factor improvement (PFI)", "Harmonic active filters", "Remote telemetry & monitoring"],
  },
  {
    icon: Wrench,
    title: "Annual Maintenance & Overhauling",
    desc: "24/7 emergency field support, preventative maintenance contracts, genuine spare parts, and engine overhauls.",
    features: ["Rapid response dispatch teams", "Genuine OEM spare parts", "Scheduled oil & filter diagnostics"],
  },
];

export default function SolutionsPage() {
  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      {/* Hero Header */}
      <section className="bg-gradient-to-r from-[#122B5A] via-[#0D2247] to-[#122B5A] text-white py-14 sm:py-20 px-4 sm:px-8 border-b border-[#FFB800]/20">
        <div className="max-w-[1500px] mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFB800]/20 border border-[#FFB800]/40 text-[#FFB800] text-xs font-bold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" />
            <span>Engineered for Reliability</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            Comprehensive Power Solutions
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            From heavy-duty industrial power plants to turn-key substations and renewable energy, Doorstep delivers dependable power systems nationwide.
          </p>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="max-w-[1500px] mx-auto px-4 sm:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {SOLUTIONS_LIST.map((sol, idx) => {
            const IconComp = sol.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-[#122B5A]/40 transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-[#122B5A]/10 text-[#122B5A] flex items-center justify-center group-hover:bg-[#122B5A] group-hover:text-[#FFB800] transition-colors">
                    <IconComp className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold text-[#122B5A] tracking-tight">
                    {sol.title}
                  </h2>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                    {sol.desc}
                  </p>
                  <ul className="space-y-2 pt-2 border-t border-slate-100">
                    {sol.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#FFB800] shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6 mt-4">
                  <Link
                    href="/contact-us"
                    className="inline-flex items-center gap-2 text-xs font-bold text-[#122B5A] hover:text-[#FFB800] transition group/btn"
                  >
                    <span>Request Technical Proposal</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Strip */}
        <div className="mt-12 bg-[#122B5A] text-white rounded-2xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Need a Custom Power Architecture?
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
              Our certified electrical and mechanical engineers provide site surveys, load calculations, and turnkey installation across Bangladesh.
            </p>
          </div>
          <div className="flex items-center gap-4 shrink-0 flex-wrap justify-center">
            <a
              href="tel:01734340066"
              className="inline-flex items-center gap-2 bg-[#FFB800] hover:bg-[#E6A600] text-[#122B5A] font-black px-6 py-3 rounded-lg text-xs tracking-wider uppercase transition shadow-md"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call Hotline</span>
            </a>
            <Link
              href="/contact-us"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded-lg text-xs tracking-wider uppercase transition border border-white/20"
            >
              <span>Contact Us</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <div className="pb-12">
        <TrustBadgesBar />
      </div>
    </div>
  );
}
