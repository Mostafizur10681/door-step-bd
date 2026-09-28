"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Zap, 
  ShieldCheck, 
  Cpu, 
  BatteryCharging, 
  Factory, 
  Wrench, 
  ArrowRight, 
  CheckCircle2, 
  PhoneCall, 
  Mail, 
  Building2, 
  Target, 
  Eye, 
  Sparkles, 
  Clock, 
  Users,
  Award,
  ChevronRight,
  Check,
  PackageCheck,
  type LucideIcon
} from "lucide-react";
import { TrustBadgesBar } from "@/components/TrustBadgesBar";
import { getAboutPage, getMediaUrl } from "@/lib/api";

interface AboutFeature {
  icon?: string;
  title?: string;
  desc?: string;
  description?: string;
}

interface AboutStat {
  value?: string;
  label?: string;
}

interface AboutTeamMember {
  name?: string;
  role?: string;
  bio?: string;
  image?: string;
}

interface AboutData {
  hero_title?: string;
  hero_subtitle?: string;
  hero_badge?: string;
  story_title?: string;
  story_badge?: string;
  story_description_1?: string;
  story_description_2?: string;
  story_since?: string;
  experience_badge_text?: string;
  experience_badge_subtext?: string;
  story_points?: string[];
  story_image?: string;
  mission_title?: string;
  mission_description?: string;
  vision_title?: string;
  vision_description?: string;
  why_choose_badge?: string;
  why_choose_title?: string;
  why_choose_subtitle?: string;
  features?: AboutFeature[];
  stats?: AboutStat[];
  team_badge?: string;
  team_title?: string;
  team_subtitle?: string;
  team?: AboutTeamMember[];
  cta_title?: string;
  cta_subtitle?: string;
  cta_phone?: string;
  cta_email?: string;
}

const defaultPowerAboutData: AboutData = {
  hero_badge: "Leading Turnkey Power Engineering in Bangladesh",
  hero_title: "Powering Industries & Commercial Infrastructure with Zero Downtime",
  hero_subtitle: "Comprehensive power solutions from heavy-duty industrial diesel & gas generators and turnkey electrical substations to commercial rooftop solar plants and critical online UPS backup.",
  story_badge: "OUR ENGINEERING HERITAGE",
  story_title: "Delivering Dependable, High-Capacity Energy Systems Nationwide",
  story_description_1: "Established to solve Bangladesh's critical industrial power challenges, Door Step BD Power Solutions delivers turnkey electrical, generation, and renewable energy infrastructure. We combine engineering excellence with certified technical expertise to safeguard factories, commercial high-rises, hospitals, and data centers.",
  story_description_2: "From multi-megawatt synchronized diesel generator plants and 11kV electrical substations to utility-grade rooftop solar arrays and active harmonic power audits, our certified engineers manage every phase from design and load calculation to commissioning and 24/7 preventative maintenance.",
  story_since: "2018",
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
  mission_title: "Our Mission",
  mission_description: "To engineer, commission, and maintain high-efficiency, fault-tolerant power systems that protect our clients against grid instability, ensuring continuous productivity and industrial growth across Bangladesh.",
  vision_title: "Our Vision",
  vision_description: "To be Bangladesh's premier integrated power engineering and renewable energy partner, driving green transition, smart substation automation, and unmatched grid reliability.",
  why_choose_badge: "WHY CHOOSE US",
  why_choose_title: "Engineered for Uncompromising Quality & Safety",
  why_choose_subtitle: "Backed by certified electrical engineers, precision load telemetry, and 24/7 rapid nationwide field dispatch.",
  features: [
    {
      icon: "Factory",
      title: "Heavy-Duty Generation",
      desc: "Prime and standby diesel/gas gensets from 50 kVA to 3000 kVA with automated synchronization and ATS panels."
    },
    {
      icon: "Zap",
      title: "Substations & Switchgear",
      desc: "Custom-built 11kV transformers, HT vacuum circuit breakers, LT distribution boards, and PFI panels."
    },
    {
      icon: "BatteryCharging",
      title: "Renewable Solar & Hybrid",
      desc: "Turnkey commercial solar PV installations with Tier-1 modules, MPPT string inverters, and net metering integration."
    },
    {
      icon: "Cpu",
      title: "Critical UPS Systems",
      desc: "Zero-millisecond transfer online UPS architecture designed for healthcare, data facilities, and process automation."
    }
  ],
  stats: [
    { label: "Installed Capacity", value: "500+ MW" },
    { label: "Industrial Clients", value: "1,200+" },
    { label: "Districts Covered", value: "64" },
    { label: "System Uptime Record", value: "99.9%" }
  ],
  team_badge: "OUR VALUES",
  team_title: "Built On Engineering Rigor & Safety Standards",
  team_subtitle: "Every power architecture we deploy complies with IEEE, IEC, and national grid safety standards.",
  team: [],
  cta_title: "Ready to Upgrade Your Power Infrastructure?",
  cta_subtitle: "Consult with our senior electrical engineers for a comprehensive site load assessment, custom panel design, or emergency maintenance contract.",
  cta_phone: "01734-340066",
  cta_email: "support@doorstepbd.com"
};

const iconMap: Record<string, LucideIcon> = {
  Factory,
  Zap,
  BatteryCharging,
  Cpu,
  ShieldCheck,
  Wrench,
  Clock,
  Sparkles,
  Building2,
  Award,
  PackageCheck
};

function renderFeatureIcon(iconName?: string) {
  const IconComp = (iconName && iconMap[iconName]) ? iconMap[iconName] : Zap;
  return <IconComp className="w-6 h-6 text-[#122B5A]" />;
}

export default function AboutPage() {
  const [data, setData] = useState<AboutData>(defaultPowerAboutData);

  useEffect(() => {
    async function loadAboutData() {
      try {
        const response = await getAboutPage();
        if (response && response.success && response.data) {
          const apiData = response.data;
          
          const clean = (val?: unknown): string => {
            if (val === null || val === undefined) return "";
            const str = String(val);
            return str
              .replace(/Shopia|SMT Mart BD|SMT Mart/gi, "Door Step BD")
              .replace(/@shopiabd\.com|@smtmartbd\.com/gi, "@doorstepbd.com");
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
          const safePoints = rawPoints.length > 0
            ? rawPoints.map((p) => {
                if (typeof p === "object" && p !== null) {
                  const obj = p as Record<string, unknown>;
                  return clean(obj.title || obj.text || obj.value || JSON.stringify(obj));
                }
                return clean(p);
              }).filter(Boolean)
            : defaultPowerAboutData.story_points;

          const rawFeatures = parseArray(apiData.features);
          const safeFeatures = rawFeatures.length > 0
            ? rawFeatures.map((f) => {
                const obj = typeof f === "object" && f !== null ? (f as Record<string, unknown>) : {};
                return {
                  icon: typeof obj.icon === "string" ? obj.icon : undefined,
                  title: clean(obj.title || obj.name || f),
                  desc: clean(obj.desc || obj.description || obj.subtitle || ""),
                };
              })
            : defaultPowerAboutData.features;

          const rawStats = parseArray(apiData.stats);
          const safeStats = rawStats.length > 0
            ? rawStats.map((s) => {
                const obj = typeof s === "object" && s !== null ? (s as Record<string, unknown>) : {};
                return {
                  label: clean(obj.label || obj.title || obj.name || ""),
                  value: clean(obj.value || obj.count || s),
                };
              })
            : defaultPowerAboutData.stats;

          const rawTeam = parseArray(apiData.team);
          const safeTeam = rawTeam.map((m) => {
            const obj = typeof m === "object" && m !== null ? (m as Record<string, unknown>) : {};
            return {
              name: clean(obj.name || m),
              role: clean(obj.role || obj.designation || ""),
              bio: clean(obj.bio || obj.description || ""),
              image: typeof obj.image === "string" ? getMediaUrl(obj.image, "") : "",
            };
          });

          setData({
            hero_title: clean(apiData.hero_title) || defaultPowerAboutData.hero_title,
            hero_subtitle: clean(apiData.hero_subtitle) || defaultPowerAboutData.hero_subtitle,
            hero_badge: clean(apiData.hero_badge) || defaultPowerAboutData.hero_badge,
            story_title: clean(apiData.story_title) || defaultPowerAboutData.story_title,
            story_badge: clean(apiData.story_badge) || defaultPowerAboutData.story_badge,
            story_description_1: clean(apiData.story_description_1) || defaultPowerAboutData.story_description_1,
            story_description_2: clean(apiData.story_description_2) || defaultPowerAboutData.story_description_2,
            story_since: clean(apiData.story_since) || defaultPowerAboutData.story_since,
            experience_badge_text: clean(apiData.experience_badge_text) || defaultPowerAboutData.experience_badge_text,
            experience_badge_subtext: clean(apiData.experience_badge_subtext) || defaultPowerAboutData.experience_badge_subtext,
            story_points: safePoints,
            story_image: typeof apiData.story_image === "string" ? getMediaUrl(apiData.story_image, "") : defaultPowerAboutData.story_image,
            mission_title: clean(apiData.mission_title) || defaultPowerAboutData.mission_title,
            mission_description: clean(apiData.mission_description) || defaultPowerAboutData.mission_description,
            vision_title: clean(apiData.vision_title) || defaultPowerAboutData.vision_title,
            vision_description: clean(apiData.vision_description) || defaultPowerAboutData.vision_description,
            why_choose_badge: clean(apiData.why_choose_badge) || defaultPowerAboutData.why_choose_badge,
            why_choose_title: clean(apiData.why_choose_title) || defaultPowerAboutData.why_choose_title,
            why_choose_subtitle: clean(apiData.why_choose_subtitle) || defaultPowerAboutData.why_choose_subtitle,
            features: safeFeatures,
            stats: safeStats,
            team_badge: clean(apiData.team_badge) || defaultPowerAboutData.team_badge,
            team_title: clean(apiData.team_title) || defaultPowerAboutData.team_title,
            team_subtitle: clean(apiData.team_subtitle) || defaultPowerAboutData.team_subtitle,
            team: safeTeam,
            cta_title: clean(apiData.cta_title) || defaultPowerAboutData.cta_title,
            cta_subtitle: clean(apiData.cta_subtitle) || defaultPowerAboutData.cta_subtitle,
            cta_phone: clean(apiData.cta_phone) || defaultPowerAboutData.cta_phone,
            cta_email: clean(apiData.cta_email) || defaultPowerAboutData.cta_email,
          });
        }
      } catch (err) {
        console.error("Failed to load dynamic about page content:", err);
      }
    }

    loadAboutData();
  }, []);

  const pointsList = Array.isArray(data.story_points) && data.story_points.length > 0 
    ? data.story_points 
    : (defaultPowerAboutData.story_points || []);

  const statsList = Array.isArray(data.stats) && data.stats.length > 0 
    ? data.stats 
    : (defaultPowerAboutData.stats || []);

  const featuresList = Array.isArray(data.features) && data.features.length > 0 
    ? data.features 
    : (defaultPowerAboutData.features || []);

  // 4-Stage Project Engineering Lifecycle
  const engineeringProcess = [
    {
      step: "01",
      title: "Load Calculation & Site Audit",
      desc: "Detailed site survey, peak load profiling, power factor analysis, and grid synchronization mapping."
    },
    {
      step: "02",
      title: "Engineering Design & Fabrication",
      desc: "CAD schematic drafting, custom panel fabrication, component sourcing from Tier-1 global OEMs."
    },
    {
      step: "03",
      title: "Turnkey Installation & Commissioning",
      desc: "Rigorous high-voltage testing, insulation checks, ATS functional trials, and live load handover."
    },
    {
      step: "04",
      title: "24/7 SLA Maintenance & Remote Telemetry",
      desc: "Routine preventative diagnostics, fast emergency response dispatch, and genuine spare parts inventory."
    }
  ];

  // Core Solutions Quick Grid
  const solutionsCapabilities = [
    {
      title: "Industrial Generators",
      capacity: "50 kVA - 3000 kVA",
      desc: "Heavy-duty diesel, gas, and dual-fuel generator sets with automated synchronization controllers and acoustic canopies.",
      link: "/solutions"
    },
    {
      title: "Substations & Switchgears",
      capacity: "11kV / 0.415kV",
      desc: "Turnkey transformer installation, HT vacuum circuit breakers, LT distribution boards, and automatic PFI panels.",
      link: "/solutions"
    },
    {
      title: "Commercial Rooftop Solar",
      capacity: "100 kWp - 5 MWp",
      desc: "High-efficiency Tier-1 monocrystalline solar PV systems with smart inverters and net-metering integration.",
      link: "/solutions"
    },
    {
      title: "Critical Online UPS",
      capacity: "10 kVA - 800 kVA",
      desc: "True online double-conversion industrial UPS architecture ensuring zero downtime for hospitals and data centers.",
      link: "/solutions"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* 1. Top Brand Value Strip (Primary & Secondary Palette) */}
      <div className="bg-[#FFB800] text-[#122B5A] py-2.5 px-4 shadow-xs">
        <div className="max-w-[1500px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-extrabold text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#122B5A] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#122B5A]"></span>
            </span>
            <span>⚡ Bangladesh&apos;s Premier Turnkey Power Engineering &amp; Energy Solutions Partner • 24/7 Field Support</span>
          </div>
          <Link
            href="/solutions"
            className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-[#122B5A] hover:bg-[#0B1B38] text-white text-[11px] font-bold rounded-lg transition-all shadow-xs"
          >
            <Zap className="w-3 h-3 text-[#FFB800]" />
            <span>Explore Power Solutions</span>
          </Link>
        </div>
      </div>

      {/* 2. Hero Header Section (Primary Navy & Secondary Gold Gradient) */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#122B5A] via-[#1A3D7C] to-[#0B1B38] text-white pt-16 pb-28 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,184,0,0.12),transparent_50%)] pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#FFB800]/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#122B5A]/40 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-4xl mx-auto text-center space-y-5 z-10">
          {data.hero_badge && (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFB800]/20 border border-[#FFB800]/40 text-[#FFB800] text-xs font-bold uppercase tracking-wider shadow-inner">
              <Zap className="w-3.5 h-3.5 text-[#FFB800]" />
              <span>{data.hero_badge}</span>
            </div>
          )}

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            {data.hero_title}
          </h1>

          {data.hero_subtitle && (
            <p className="text-sm sm:text-base text-blue-100/90 max-w-3xl mx-auto leading-relaxed">
              {data.hero_subtitle}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link
              href="/solutions"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#FFB800] hover:bg-[#E6A600] text-[#122B5A] font-extrabold text-xs sm:text-sm shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Zap className="w-4 h-4 text-[#122B5A]" />
              <span>Explore Solutions</span>
            </Link>
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs sm:text-sm backdrop-blur-sm transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-[#FFB800]" />
              <span>View Commissioned Projects</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Floating Stats Highlight Strip (Overlap) */}
      <section className="relative max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 -mt-16 z-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {statsList.map((stat, idx) => {
            const statIcons = [Zap, Building2, Wrench, ShieldCheck];
            const StatIcon = statIcons[idx % statIcons.length];
            return (
              <div 
                key={idx}
                className="bg-white rounded-2xl p-5 sm:p-6 shadow-xl shadow-slate-900/5 border border-slate-100 flex items-center gap-4 hover:border-[#122B5A]/40 hover:shadow-md transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#122B5A]/10 text-[#122B5A] flex items-center justify-center shrink-0 group-hover:bg-[#122B5A] group-hover:text-white group-hover:scale-110 transition-all duration-300">
                  <StatIcon className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-[#122B5A] tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
                    {stat.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 space-y-20 py-16">
        
        {/* 4. Our Engineering Story Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Power Visual Architecture Box */}
          <div className="lg:col-span-6 relative">
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
            
            {/* Floating Experience Badge */}
            {(data.experience_badge_text || data.experience_badge_subtext) && (
              <div className="absolute -bottom-6 -right-3 sm:bottom-6 sm:right-6 bg-white p-5 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-4 z-20">
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#122B5A] to-[#0B1B38] text-[#FFB800] font-black text-xl flex items-center justify-center shrink-0 shadow-md">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                    {data.experience_badge_text || "500+ MW"}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                    {data.experience_badge_subtext || "Commissioned Power Capacity"}
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
                href="/solutions" 
                className="inline-flex items-center gap-2 bg-[#FFB800] hover:bg-[#E6A600] text-[#122B5A] font-extrabold text-xs sm:text-sm px-7 py-3 rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95"
              >
                <span>Browse All Solutions</span>
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

        </section>

        {/* 5. Core Engineering Pillars (Why Choose Us) */}
        {featuresList.length > 0 && (
          <section className="space-y-8">
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              {data.why_choose_badge && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#122B5A]/10 text-[#122B5A] text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#122B5A]" />
                  <span>{data.why_choose_badge}</span>
                </div>
              )}
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#122B5A] tracking-tight">
                {data.why_choose_title || "Our Core Engineering Promises"}
              </h2>
              {data.why_choose_subtitle && (
                <p className="text-xs sm:text-sm text-slate-500">
                  {data.why_choose_subtitle}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuresList.map((val, idx) => (
                <div 
                  key={idx} 
                  className="bg-white rounded-2xl p-6 border border-slate-200/80 hover:border-[#122B5A]/40 shadow-xs hover:shadow-xl transition-all duration-300 space-y-3.5 group flex flex-col justify-between"
                >
                  <div className="space-y-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-[#122B5A]/10 text-[#122B5A] flex items-center justify-center group-hover:bg-[#122B5A] group-hover:text-white group-hover:scale-110 transition-all duration-300 shadow-xs">
                      {renderFeatureIcon(val.icon)}
                    </div>
                    <h3 className="font-bold text-[#122B5A] text-sm sm:text-base">
                      {val.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {val.desc || val.description}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-bold text-[#122B5A]">
                    <Check className="w-3.5 h-3.5 text-[#FFB800]" />
                    <span>Certified Engineering</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 6. Mission & Vision Split Cards */}
        {(data.mission_description || data.vision_description) && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {data.mission_description && (
              <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-md shadow-slate-900/5 space-y-4 relative overflow-hidden group hover:border-[#122B5A]/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#122B5A]/10 text-[#122B5A] flex items-center justify-center border border-[#122B5A]/20 shadow-xs">
                    <Target className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-[#122B5A] uppercase tracking-wider block">Our Purpose</span>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-[#122B5A]">
                      {data.mission_title || "Our Mission"}
                    </h3>
                  </div>
                </div>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                  {data.mission_description}
                </p>
              </div>
            )}

            {data.vision_description && (
              <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-md shadow-slate-900/5 space-y-4 relative overflow-hidden group hover:border-[#122B5A]/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#FFB800]/15 text-[#122B5A] flex items-center justify-center border border-[#FFB800]/30 shadow-xs">
                    <Eye className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-[#122B5A] uppercase tracking-wider block">Looking Forward</span>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-[#122B5A]">
                      {data.vision_title || "Our Vision"}
                    </h3>
                  </div>
                </div>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                  {data.vision_description}
                </p>
              </div>
            )}
          </section>
        )}

        {/* 7. Turnkey Engineering Lifecycle (4 Stages) */}
        <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-sm space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#122B5A]/10 text-[#122B5A] text-xs font-bold uppercase tracking-wider">
              <PackageCheck className="w-3.5 h-3.5 text-[#122B5A]" />
              <span>Turnkey Execution</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#122B5A] tracking-tight">
              Our 4-Stage Project Engineering Process
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              From initial electrical load calculation to grid-synchronized commissioning and lifelong field SLA support.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {engineeringProcess.map((step, idx) => (
              <div key={idx} className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 space-y-3 relative hover:bg-white hover:border-[#122B5A]/30 hover:shadow-lg transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-[#122B5A] text-[#FFB800] font-extrabold text-sm flex items-center justify-center shadow-xs">
                  {step.step}
                </div>
                <h4 className="font-bold text-sm text-[#122B5A]">{step.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 8. Core Capabilities Spotlight Grid */}
        <section className="space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#122B5A]/10 text-[#122B5A] text-xs font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 text-[#122B5A]" />
              <span>Full Spectrum Portfolio</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#122B5A] tracking-tight">
              Power Systems We Deliver &amp; Maintain
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Complete equipment sourcing, custom panel manufacturing, and field maintenance across Bangladesh.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {solutionsCapabilities.map((item, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-[#122B5A]/40 transition-all duration-300 flex flex-col justify-between group">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-3 py-1 bg-[#122B5A]/10 text-[#122B5A] text-[11px] font-extrabold rounded-full uppercase tracking-wider">
                      Capacity: {item.capacity}
                    </span>
                    <span className="text-[#FFB800] font-bold text-xs">Turnkey Solution</span>
                  </div>
                  <h3 className="text-xl font-bold text-[#122B5A] group-hover:text-[#FFB800] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </div>
                <div className="pt-5 mt-4 border-t border-slate-100">
                  <Link
                    href={item.link}
                    className="inline-flex items-center gap-2 text-xs font-bold text-[#122B5A] hover:text-[#FFB800] transition"
                  >
                    <span>View Specifications &amp; Request Proposal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 9. Contact / Support CTA Section (Primary Navy & Secondary Gold Gradient) */}
        <section className="bg-gradient-to-r from-[#122B5A] via-[#1A3D7C] to-[#0B1B38] text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,184,0,0.12),transparent_50%)] pointer-events-none" />
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#FFB800]/15 rounded-full blur-3xl pointer-events-none"></div>

          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFB800]/20 border border-[#FFB800]/40 text-[#FFB800] text-xs font-bold uppercase tracking-wider">
              <PhoneCall className="w-3.5 h-3.5 text-[#FFB800]" />
              <span>Engineering Helpdesk &amp; Site Surveys</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              {data.cta_title || "Ready to Upgrade Your Power Infrastructure?"}
            </h2>
            <p className="text-blue-100 text-xs sm:text-sm leading-relaxed">
              {data.cta_subtitle || "Consult with our certified electrical engineers for a comprehensive site load assessment, custom panel design, or emergency maintenance contract."}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 relative z-10 pt-2">
            {data.cta_phone && (
              <a 
                href={`tel:${String(data.cta_phone).replace(/[^0-9+]/g, "")}`} 
                className="inline-flex items-center gap-2 bg-[#FFB800] hover:bg-[#E6A600] text-[#122B5A] font-extrabold text-xs sm:text-sm px-7 py-3.5 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <PhoneCall className="w-4 h-4 text-[#122B5A]" />
                <span>Call Hotline: {data.cta_phone}</span>
              </a>
            )}
            {data.cta_email && (
              <a 
                href={`mailto:${data.cta_email}`} 
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs sm:text-sm px-7 py-3.5 rounded-full backdrop-blur-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Mail className="w-4 h-4 text-[#FFB800]" />
                <span>Email Engineering Team ({data.cta_email})</span>
              </a>
            )}
            <Link
              href="/contact-us"
              className="inline-flex items-center gap-2 bg-white text-[#122B5A] hover:bg-slate-100 font-extrabold text-xs sm:text-sm px-7 py-3.5 rounded-full shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>Submit Project Inquiry</span>
              <ArrowRight className="w-4 h-4 text-[#122B5A]" />
            </Link>
          </div>
        </section>

      </div>

      {/* Trust Badges */}
      <div className="pb-12">
        <TrustBadgesBar />
      </div>
    </div>
  );
}
