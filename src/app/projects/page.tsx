"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Building2, CheckCircle, MapPin, Calendar, ArrowRight, Zap, Filter } from "lucide-react";
import { TrustBadgesBar } from "@/components/TrustBadgesBar";

const PROJECTS_DATA = [
  {
    id: 1,
    title: "1500 kVA Heavy Industrial Substation",
    category: "Substation",
    location: "Gazipur Industrial Zone, Dhaka",
    year: "2024",
    client: "Leading Textile & Garments Composite",
    desc: "Complete 11kV/0.415kV substation installation including transformer, HT vacuum circuit breaker, and automatic power factor correction panel.",
    capacity: "1500 kVA",
    status: "Commissioned & Live",
  },
  {
    id: 2,
    title: "2000 kVA Prime Diesel Generator Sync System",
    category: "Generators",
    location: "Sreepur, Gazipur",
    year: "2024",
    client: "Pharmaceutical Manufacturing Plant",
    desc: "Turnkey synchronization of dual 1000 kVA Cummins powered acoustic canopy gensets with automated load-sharing controllers.",
    capacity: "2 x 1000 kVA",
    status: "Commissioned & Live",
  },
  {
    id: 3,
    title: "500 kWp Rooftop Solar Grid-Tied System",
    category: "Renewable Solar",
    location: "Chittagong Export Processing Zone (CEPZ)",
    year: "2023",
    client: "Export Packaging Industries Ltd.",
    desc: "High-efficiency Tier-1 monocrystalline PERC solar system with net-metering integration and cloud telemetry monitoring.",
    capacity: "500 kWp",
    status: "Operational",
  },
  {
    id: 4,
    title: "Hospital Critical Backup Online UPS Architecture",
    category: "UPS & Backup",
    location: "Dhanmondi, Dhaka",
    year: "2023",
    client: "Specialized Medical Center & ICU",
    desc: "Modular 400 kVA redundant N+1 online UPS system providing continuous zero-interruption power to critical surgical units and diagnostic equipment.",
    capacity: "400 kVA N+1",
    status: "Operational",
  },
  {
    id: 5,
    title: "Commercial High-Rise Synchronized Power Center",
    category: "Substation",
    location: "Gulshan-2, Dhaka",
    year: "2023",
    client: "Corporate Plaza & Tower",
    desc: "Design and fabrication of intelligent LT distribution switchboards, busbar trunking (BBT) system, and automated fire-safe ATS.",
    capacity: "2500 kVA",
    status: "Operational",
  },
  {
    id: 6,
    title: "Steel Re-Rolling Mill Power Quality Rectification",
    category: "Automation & Audit",
    location: "Narayanganj",
    year: "2022",
    client: "Steel Mills & Heavy Forging",
    desc: "Installation of Active Harmonic Filters (AHF) and dynamic capacitor banks to eliminate grid distortions and reduce utility penalties by 98%.",
    capacity: "800 kvar",
    status: "Completed",
  },
];

const CATEGORIES = ["All", "Substation", "Generators", "Renewable Solar", "UPS & Backup", "Automation & Audit"];

export default function ProjectsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filtered = selectedCategory === "All"
    ? PROJECTS_DATA
    : PROJECTS_DATA.filter((p) => p.category === selectedCategory);

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      {/* Hero Header */}
      <section className="bg-gradient-to-r from-[#122B5A] via-[#0D2247] to-[#122B5A] text-white py-14 sm:py-20 px-4 sm:px-8 border-b border-[#FFB800]/20">
        <div className="max-w-[1500px] mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFB800]/20 border border-[#FFB800]/40 text-[#FFB800] text-xs font-bold uppercase tracking-wider">
            <Building2 className="w-3.5 h-3.5" />
            <span>Proven Track Record</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            Featured Engineering Projects
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Explore our delivered power infrastructure, generator installations, industrial substations, and solar systems across Bangladesh.
          </p>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="max-w-[1500px] mx-auto px-4 sm:px-8 pt-8 pb-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[#122B5A] text-[#FFB800] shadow-md"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Projects Grid */}
      <section className="max-w-[1500px] mx-auto px-4 sm:px-8 py-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filtered.map((proj) => (
            <div
              key={proj.id}
              className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-xl hover:border-[#122B5A]/40 transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="p-6 sm:p-8 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-3 py-1 bg-[#122B5A]/10 text-[#122B5A] text-[11px] font-extrabold rounded-full uppercase tracking-wider">
                    {proj.category}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                    <span>{proj.status}</span>
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-[#122B5A] tracking-tight group-hover:text-[#FFB800] transition-colors">
                  {proj.title}
                </h3>

                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                  {proj.desc}
                </p>

                <div className="pt-3 space-y-1.5 border-t border-slate-100 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#122B5A] shrink-0" />
                    <span>{proj.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-[#FFB800] shrink-0" />
                    <span className="font-semibold text-slate-700">Capacity: {proj.capacity}</span>
                  </div>
                </div>
              </div>

              <div className="px-6 sm:px-8 pb-6 pt-2">
                <Link
                  href="/contact-us"
                  className="w-full bg-slate-50 hover:bg-[#122B5A] text-[#122B5A] hover:text-white font-bold text-xs py-2.5 px-4 rounded-xl text-center flex items-center justify-center gap-2 transition border border-slate-200 hover:border-[#122B5A]"
                >
                  <span>Inquire for Similar Project</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Badges */}
      <div className="pb-12">
        <TrustBadgesBar />
      </div>
    </div>
  );
}
