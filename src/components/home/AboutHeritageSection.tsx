"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Zap, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  ChevronRight
} from "lucide-react";
import { getAboutPage, getMediaUrl, ApiAboutData } from "@/lib/api";

interface AboutHeritageData {
  story_badge?: string;
  story_title?: string;
  story_description_1?: string;
  story_description_2?: string;
  experience_badge_text?: string;
  experience_badge_subtext?: string;
  story_points?: string[];
  story_image?: string;
}

const DEFAULT_HERITAGE_DATA: AboutHeritageData = {
  story_badge: "OUR ENGINEERING HERITAGE",
  story_title: "Delivering Dependable, High-Capacity Energy Systems Nationwide",
  story_description_1: "Established to solve Bangladesh's critical industrial power challenges, Door Step BD Power Solutions delivers turnkey electrical, generation, and renewable energy infrastructure. We combine engineering excellence with certified technical expertise to safeguard factories, commercial high-rises, hospitals, and data centers.",
  story_description_2: "From multi-megawatt synchronized diesel generator plants and 11kV electrical substations to utility-grade rooftop solar arrays and active harmonic power audits, our certified engineers manage every phase from design and load calculation to commissioning and 24/7 preventative maintenance.",
  experience_badge_text: "500+ MW",
  experience_badge_subtext: "Total Power Capacity Commissioned",
  story_points: [
    "Heavy-Duty Industrial Generators (50 kVA - 3000 kVA)",
    "Turnkey 11kV Substation, HT/LT & PFI Switchgear Fabrication",
    "Commercial & Industrial Rooftop Solar with Net Metering",
    "Double-Conversion Online UPS for Critical Medical & Data Loads",
    "Harmonic Filtration (AHF) & Comprehensive Energy Audits",
    "24/7 Rapid Emergency Field Engineering & Genuine OEM Parts"
  ],
  story_image: "",
};

export function AboutHeritageSection() {
  const [data, setData] = useState<AboutHeritageData>(DEFAULT_HERITAGE_DATA);

  useEffect(() => {
    let isMounted = true;
    const loadDynamicData = async () => {
      try {
        const res = await getAboutPage();
        if (!isMounted) return;
        if (res && res.success && res.data) {
          const apiData: ApiAboutData = res.data;
          
          const clean = (val: any): string | undefined => {
            if (val === null || val === undefined) return undefined;
            const str = String(val).trim();
            return str.length > 0 ? str : undefined;
          };

          const parseArray = (input: unknown): unknown[] => {
            if (Array.isArray(input)) return input;
            if (typeof input === "string" && input.trim()) {
              try {
                const parsed = JSON.parse(input);
                if (Array.isArray(parsed)) return parsed;
              } catch {
                return input.split("\n").map((s) => s.trim()).filter(Boolean);
              }
            }
            if (input && typeof input === "object") {
              return Object.values(input as Record<string, unknown>);
            }
            return [];
          };

          const rawPoints = parseArray(apiData.story_points);
          let safePoints: string[] = [];
          if (rawPoints.length > 0) {
            safePoints = rawPoints.map((p) => {
              if (typeof p === "object" && p !== null) {
                const obj = p as Record<string, unknown>;
                return clean(obj.title || obj.text || obj.value || obj.point) || "";
              }
              return clean(p) || "";
            }).filter(Boolean);
          }

          setData({
            story_badge: clean(apiData.story_badge) || DEFAULT_HERITAGE_DATA.story_badge,
            story_title: clean(apiData.story_title) || DEFAULT_HERITAGE_DATA.story_title,
            story_description_1: clean(apiData.story_description_1) || DEFAULT_HERITAGE_DATA.story_description_1,
            story_description_2: clean(apiData.story_description_2) || DEFAULT_HERITAGE_DATA.story_description_2,
            experience_badge_text: clean(apiData.experience_badge_text) || DEFAULT_HERITAGE_DATA.experience_badge_text,
            experience_badge_subtext: clean(apiData.experience_badge_subtext) || DEFAULT_HERITAGE_DATA.experience_badge_subtext,
            story_points: safePoints.length > 0 ? safePoints : DEFAULT_HERITAGE_DATA.story_points,
            story_image: typeof apiData.story_image === "string" && apiData.story_image ? getMediaUrl(apiData.story_image, "") : undefined,
          });
        }
      } catch (err) {
        console.warn("Failed to load about page data for home page:", err);
      }
    };

    loadDynamicData();
    return () => { isMounted = false; };
  }, []);

  const pointsList = data.story_points && data.story_points.length > 0
    ? data.story_points
    : (DEFAULT_HERITAGE_DATA.story_points || []);

  return (
    <section className="w-full bg-[#f8fafc] py-14 sm:py-18 md:py-24 border-b border-slate-200/80 relative overflow-hidden" suppressHydrationWarning>
      {/* Background Architectural Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.025] pointer-events-none" 
        style={{
          backgroundImage: "linear-gradient(#122B5A 1px, transparent 1px), linear-gradient(to right, #122B5A 1px, transparent 1px)",
          backgroundSize: "44px 44px"
        }}
      />
      
      {/* Ambient Lighting */}
      <div className="absolute top-1/4 -right-32 w-96 h-96 bg-[#FFB800]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-32 w-96 h-96 bg-[#122B5A]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 md:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Power Visual Architecture Box */}
          <div className="lg:col-span-6 relative">
            {data.story_image ? (
              <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-900 min-h-[420px] max-h-[520px] group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={data.story_image} 
                  alt={data.story_title || "Door Step BD Power Heritage"} 
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1B38]/80 via-transparent to-transparent pointer-events-none" />
              </div>
            ) : (
              <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-gradient-to-br from-[#122B5A] via-[#0B1B38] to-[#1A3D7C] text-white p-8 sm:p-10 flex flex-col justify-between min-h-[420px] group">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,184,0,0.15),transparent_60%)] pointer-events-none" />
                
                <div className="space-y-6 relative z-10">
                  <div className="inline-flex items-center gap-2 bg-[#FFB800]/20 border border-[#FFB800]/40 text-[#FFB800] text-xs font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4 text-[#FFB800]" />
                    <span>IEC &amp; National Grid Compliant</span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                      Engineered for Industrial Continuity
                    </h3>
                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                      Custom designed electrical and generation systems built to withstand the toughest industrial operational loads across Bangladesh.
                    </p>
                  </div>

                  {/* Key Metrics Mini Grid */}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-1">
                      <span className="text-xl font-black text-[#FFB800] block">50kVA - 3MVA</span>
                      <span className="text-[11px] text-slate-300 font-medium">Generator Range</span>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-1">
                      <span className="text-xl font-black text-[#FFB800] block">11kV / 0.415kV</span>
                      <span className="text-[11px] text-slate-300 font-medium">Substation Engineering</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Support Tag */}
                <div className="pt-6 mt-6 border-t border-white/15 flex items-center justify-between text-xs text-slate-300 relative z-10">
                  <span className="flex items-center gap-1.5 font-bold text-white">
                    <Clock className="w-4 h-4 text-[#FFB800]" />
                    <span>24/7 Emergency Dispatch</span>
                  </span>
                  <span className="text-[#FFB800] font-bold">64 Districts Active</span>
                </div>
              </div>
            )}
            
            {/* Floating Experience Badge */}
            {(data.experience_badge_text || data.experience_badge_subtext) && (
              <div className="absolute -bottom-6 -right-3 sm:bottom-6 sm:right-6 bg-white p-5 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-4 z-20">
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#122B5A] to-[#0B1B38] text-[#FFB800] font-black text-xl flex items-center justify-center shrink-0 shadow-md">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                    {data.experience_badge_text}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                    {data.experience_badge_subtext}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Story Text Box */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              {data.story_badge && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#122B5A]/10 text-[#122B5A] text-xs font-bold uppercase tracking-wider">
                  <Zap className="w-3.5 h-3.5 text-[#122B5A]" />
                  <span>{data.story_badge}</span>
                </div>
              )}
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#122B5A] tracking-tight leading-tight">
                {data.story_title}
              </h2>
            </div>

            {data.story_description_1 && (
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                {data.story_description_1}
              </p>
            )}

            {data.story_description_2 && (
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                {data.story_description_2}
              </p>
            )}

            {/* Feature Checklist */}
            {pointsList.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                {pointsList.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs font-semibold text-slate-700 bg-white p-2.5 rounded-xl border border-slate-100 shadow-2xs">
                    <CheckCircle2 className="w-4 h-4 text-[#122B5A] shrink-0 mt-0.5" />
                    <span className="leading-snug">{item}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link 
                href="/services" 
                className="inline-flex items-center gap-2 bg-[#FFB800] hover:bg-[#E6A600] text-[#122B5A] font-extrabold text-xs sm:text-sm px-7 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95"
              >
                <span>Browse All Services</span>
                <ArrowRight className="w-4 h-4 text-[#122B5A]" />
              </Link>
              <Link 
                href="/contact-us" 
                className="inline-flex items-center gap-2 text-xs font-bold text-[#122B5A] hover:text-[#0B1B38] px-4 py-3 rounded-xl hover:bg-[#122B5A]/5 transition-colors"
              >
                <span>Request Technical Site Survey</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
