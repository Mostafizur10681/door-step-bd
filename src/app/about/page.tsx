"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  ShieldCheck, 
  Award, 
  HeartHandshake, 
  Truck, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  Leaf,
  Clock,
  Star,
  Headphones,
  Target,
  Eye,
  PhoneCall,
  Mail,
  Users
} from "lucide-react";
import { getAboutPage, getMediaUrl } from "@/lib/api";

interface AboutFeature {
  icon?: string;
  title?: string;
  desc?: string;
  description?: string;
  bgClass?: string;
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

const defaultAboutData: AboutData = {
  hero_badge: "Welcome to Door Step BD",
  hero_title: "Your Trusted Partner for Pure, Organic & Authentic Living",
  hero_subtitle: "Empowering healthy lifestyles across Bangladesh by bringing 100% natural organic food, premium skincare, and healthcare supplements directly to your home.",
  story_badge: "OUR STORY",
  story_title: "Bringing Pure & Natural Wellness to Every Home",
  story_description_1: "Founded with a clear vision, Door Step BD set out to solve the challenge of finding genuine, unadulterated organic products in Bangladesh. We believe that good health starts with authentic food, uncompromised skincare, and pure supplements.",
  story_description_2: "From pure Sundarban wild honey, raw organic chia seeds, and premium maca superfood to dermatologist-approved skincare formulations, every item in our store is selected with utmost care for purity and safety.",
  story_since: "2023",
  experience_badge_text: "#1",
  experience_badge_subtext: "Authentic E-Commerce In Bangladesh",
  story_points: [
    "Directly Sourced Organic Food",
    "100% Unadulterated Honey",
    "Chemical-Free Skincare",
    "Fast Nationwide COD"
  ],
  story_image: "/prod_honey.png",
  mission_title: "Our Mission",
  mission_description: "To deliver high-quality authentic and organic products at affordable prices with exceptional customer service, making healthy and reliable living accessible for every household in Bangladesh.",
  vision_title: "Our Vision",
  vision_description: "To become the most trusted and customer-centric lifestyle and wellness e-commerce brand in Bangladesh through unwavering quality, innovation, and direct sourcing.",
  why_choose_badge: "WHY CHOOSE US",
  why_choose_title: "Our Core Promises to You",
  why_choose_subtitle: "Built on transparency, authenticity, and dedication to your health",
  features: [
    {
      icon: "ShieldCheck",
      title: "100% Authentic & Pure",
      desc: "Every item in our collection is carefully sourced directly from certified organic farms and global trusted suppliers."
    },
    {
      icon: "Award",
      title: "Premium Quality Control",
      desc: "Strict quality checks ensure that only fresh, high-grade, chemical-free products reach your doorstep."
    },
    {
      icon: "Truck",
      title: "Nationwide Fast Delivery",
      desc: "Reliable & non-contact cash-on-delivery across all 64 districts in Bangladesh with express processing."
    },
    {
      icon: "HeartHandshake",
      title: "Customer-First Support",
      desc: "Dedicated customer service team available 7 days a week to answer your questions and assist your health journey."
    }
  ],
  stats: [
    { label: "Happy Customers", value: "50,000+" },
    { label: "Organic Products", value: "1,200+" },
    { label: "Districts Covered", value: "64" },
    { label: "Customer Rating", value: "4.9 / 5" }
  ],
  team_badge: "The Team",
  team_title: "Meet Our Leadership",
  team_subtitle: "Passionate people working every day to bring purity and wellness to your door.",
  team: [],
  cta_title: "Have Questions or Need Recommendations?",
  cta_subtitle: "Our dedicated support team is here to assist you with order inquiries, product guidance, and delivery updates.",
  cta_phone: "01681-135030",
  cta_email: "info@doorstepbd.com"
};

function renderFeatureIcon(iconName?: string) {
  switch (iconName) {
    case "ShieldCheck":
      return <ShieldCheck className="w-8 h-8 text-[#002884]" />;
    case "Award":
      return <Award className="w-8 h-8 text-[#E50914]" />;
    case "Truck":
      return <Truck className="w-8 h-8 text-[#002884]" />;
    case "HeartHandshake":
      return <HeartHandshake className="w-8 h-8 text-[#E50914]" />;
    case "Sparkles":
      return <Sparkles className="w-8 h-8 text-amber-500" />;
    case "CheckCircle2":
      return <CheckCircle2 className="w-8 h-8 text-emerald-500" />;
    case "Leaf":
      return <Leaf className="w-8 h-8 text-emerald-600" />;
    case "Clock":
      return <Clock className="w-8 h-8 text-blue-600" />;
    case "Star":
      return <Star className="w-8 h-8 text-amber-400" />;
    case "Headphones":
      return <Headphones className="w-8 h-8 text-rose-500" />;
    default:
      return <Sparkles className="w-8 h-8 text-[#002884]" />;
  }
}

export default function AboutPage() {
  const [data, setData] = useState<AboutData>(defaultAboutData);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadAboutData() {
      try {
        const response = await getAboutPage();
        if (response && response.success && response.data) {
          const apiData = response.data;
          
          const clean = (val?: any): string => {
            if (val === null || val === undefined) return "";
            const str = String(val);
            return str
              .replace(/Shopia|SMT Mart BD|SMT Mart/gi, "Door Step BD")
              .replace(/@shopiabd\.com|@smtmartbd\.com/gi, "@doorstepbd.com");
          };

          const parseArray = (input: any): any[] => {
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
              return Object.values(input);
            }
            return [];
          };

          const rawPoints = parseArray(apiData.story_points);
          const safePoints = rawPoints.length > 0
            ? rawPoints.map((p: any) => clean(typeof p === "object" ? p?.title || p?.text || p?.value || JSON.stringify(p) : p)).filter(Boolean)
            : defaultAboutData.story_points;

          const rawFeatures = parseArray(apiData.features);
          const safeFeatures = rawFeatures.length > 0
            ? rawFeatures.map((f: any) => ({
                icon: typeof f === "object" ? f?.icon : undefined,
                title: clean(typeof f === "object" ? f?.title || f?.name : f),
                desc: clean(typeof f === "object" ? f?.desc || f?.description || f?.subtitle : ""),
              }))
            : defaultAboutData.features;

          const rawStats = parseArray(apiData.stats);
          const safeStats = rawStats.length > 0
            ? rawStats.map((s: any) => ({
                label: clean(typeof s === "object" ? s?.label || s?.title || s?.name : ""),
                value: clean(typeof s === "object" ? s?.value || s?.count : s),
              }))
            : defaultAboutData.stats;

          const rawTeam = parseArray(apiData.team);
          const safeTeam = rawTeam.map((m: any) => ({
            name: clean(typeof m === "object" ? m?.name : m),
            role: clean(typeof m === "object" ? m?.role || m?.designation : ""),
            bio: clean(typeof m === "object" ? m?.bio || m?.description : ""),
            image: typeof m === "object" && m?.image ? getMediaUrl(m.image, "") : "",
          }));

          setData({
            hero_title: clean(apiData.hero_title) || defaultAboutData.hero_title,
            hero_subtitle: clean(apiData.hero_subtitle) || defaultAboutData.hero_subtitle,
            hero_badge: clean(apiData.hero_badge) || defaultAboutData.hero_badge,
            story_title: clean(apiData.story_title) || defaultAboutData.story_title,
            story_badge: clean(apiData.story_badge) || defaultAboutData.story_badge,
            story_description_1: clean(apiData.story_description_1) || defaultAboutData.story_description_1,
            story_description_2: clean(apiData.story_description_2) || defaultAboutData.story_description_2,
            story_since: clean(apiData.story_since) || defaultAboutData.story_since,
            experience_badge_text: clean(apiData.experience_badge_text) || defaultAboutData.experience_badge_text,
            experience_badge_subtext: clean(apiData.experience_badge_subtext) || defaultAboutData.experience_badge_subtext,
            story_points: safePoints,
            story_image: apiData.story_image ? getMediaUrl(apiData.story_image, "/prod_honey.png") : defaultAboutData.story_image,
            mission_title: clean(apiData.mission_title) || defaultAboutData.mission_title,
            mission_description: clean(apiData.mission_description) || defaultAboutData.mission_description,
            vision_title: clean(apiData.vision_title) || defaultAboutData.vision_title,
            vision_description: clean(apiData.vision_description) || defaultAboutData.vision_description,
            why_choose_badge: clean(apiData.why_choose_badge) || defaultAboutData.why_choose_badge,
            why_choose_title: clean(apiData.why_choose_title) || defaultAboutData.why_choose_title,
            why_choose_subtitle: clean(apiData.why_choose_subtitle) || defaultAboutData.why_choose_subtitle,
            features: safeFeatures,
            stats: safeStats,
            team_badge: clean(apiData.team_badge) || defaultAboutData.team_badge,
            team_title: clean(apiData.team_title) || defaultAboutData.team_title,
            team_subtitle: clean(apiData.team_subtitle) || defaultAboutData.team_subtitle,
            team: safeTeam,
            cta_title: clean(apiData.cta_title) || defaultAboutData.cta_title,
            cta_subtitle: clean(apiData.cta_subtitle) || defaultAboutData.cta_subtitle,
            cta_phone: clean(apiData.cta_phone) || defaultAboutData.cta_phone,
            cta_email: clean(apiData.cta_email) || defaultAboutData.cta_email,
          });
        }
      } catch (err) {
        console.error("Failed to load dynamic about page content:", err);
      } finally {
        setLoading(false);
      }
    }

    loadAboutData();
  }, []);

  const storyImgSrc = data.story_image && typeof data.story_image === "string" && data.story_image.trim() !== "" 
    ? getMediaUrl(data.story_image, "/prod_honey.png") 
    : "/prod_honey.png";

  const pointsList = Array.isArray(data.story_points) && data.story_points.length > 0 
    ? data.story_points 
    : (defaultAboutData.story_points || []);

  const statsList = Array.isArray(data.stats) && data.stats.length > 0 
    ? data.stats 
    : (defaultAboutData.stats || []);

  const featuresList = Array.isArray(data.features) && data.features.length > 0 
    ? data.features 
    : (defaultAboutData.features || []);

  const teamList = Array.isArray(data.team) ? data.team : [];

  return (
    <div className="bg-slate-50 min-h-screen font-sans space-y-16 pb-20">
      
      {/* 1. Hero Header Banner */}
      <section className="bg-gradient-to-r from-[#002884] via-[#0A3299] to-[#E50914] text-white py-16 sm:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_50%)] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 text-center space-y-4 relative z-10">
          {data.hero_badge && (
            <span className="inline-flex items-center gap-2 bg-amber-400/20 border border-amber-400/30 text-amber-300 font-bold text-xs px-4 py-1.5 rounded-full uppercase tracking-wider">
              <Sparkles className="w-4 h-4" /> {data.hero_badge}
            </span>
          )}
          
          <h1 className="text-4xl sm:text-6xl font-black tracking-wide leading-tight max-w-5xl mx-auto">
            {data.hero_title}
          </h1>

          {data.hero_subtitle && (
            <p className="max-w-2xl mx-auto text-blue-100 text-sm sm:text-base leading-relaxed tracking-wide pt-2">
              {data.hero_subtitle}
            </p>
          )}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 space-y-20">
        
        {/* 2. Story Section with Image Showcase */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Image Grid Box (Col 6) */}
          <div className="lg:col-span-6 relative">
            <div className="relative w-full h-[400px] sm:h-[480px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100 flex items-center justify-center">
              <img 
                src={storyImgSrc} 
                alt={data.story_title || "Door Step BD Story Showcase"}
                className="max-h-full max-w-full object-contain p-6 hover:scale-105 transition duration-500"
              />
            </div>
            
            {/* Floating Experience Badge */}
            {(data.experience_badge_text || data.experience_badge_subtext) && (
              <div className="absolute -bottom-6 -right-4 sm:bottom-6 sm:right-6 bg-white p-5 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#002884] text-white font-black text-xl flex items-center justify-center shrink-0">
                  {data.experience_badge_text || "#1"}
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-800 text-sm">
                    {data.experience_badge_subtext || "Authentic E-Commerce"}
                  </h4>
                  {data.story_since && (
                    <p className="text-xs text-slate-500">Since {data.story_since}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Story Text Box (Col 6) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              {data.story_badge && (
                <span className="text-[#E50914] font-bold text-xs uppercase tracking-widest block">
                  {data.story_badge}
                </span>
              )}
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#002884] tracking-tight leading-snug">
                {data.story_title}
              </h2>
            </div>

            {data.story_description_1 && (
              <p className="text-slate-600 text-sm leading-relaxed">
                {data.story_description_1}
              </p>
            )}

            {data.story_description_2 && (
              <p className="text-slate-600 text-sm leading-relaxed">
                {data.story_description_2}
              </p>
            )}

            {/* Feature Checklist */}
            {pointsList.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {pointsList.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-4">
              <Link 
                href="/" 
                className="inline-flex items-center gap-2 bg-[#E50914] hover:bg-[#C80000] text-white font-bold text-sm px-8 py-3.5 rounded-full shadow-lg hover:shadow-xl transition-all"
              >
                Explore Products <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </section>

        {/* 3. Stat Counter Bar */}
        {statsList.length > 0 && (
          <section className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-200/80">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 text-center">
              {statsList.map((stat, idx) => (
                <div key={idx} className={`${idx !== 0 ? "pt-6 sm:pt-0" : ""} space-y-1`}>
                  <div className="text-3xl sm:text-5xl font-black text-[#002884] tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 4. Core Values Grid (Why Choose Us) */}
        {featuresList.length > 0 && (
          <section className="space-y-10">
            <div className="text-center space-y-2 max-w-xl mx-auto">
              {data.why_choose_badge && (
                <span className="text-[#E50914] font-bold text-xs uppercase tracking-widest block">
                  {data.why_choose_badge}
                </span>
              )}
              <h2 className="text-3xl font-extrabold text-[#002884] tracking-tight">
                {data.why_choose_title || "Our Core Promises to You"}
              </h2>
              {data.why_choose_subtitle && (
                <p className="text-xs sm:text-sm text-slate-500">
                  {data.why_choose_subtitle}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuresList.map((val, idx) => (
                <div 
                  key={idx} 
                  className="bg-white rounded-2xl p-6 border border-slate-200/80 hover:border-[#002884]/30 shadow-xs hover:shadow-xl transition-all duration-300 space-y-4"
                >
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 shadow-inner">
                    {renderFeatureIcon(val.icon)}
                  </div>
                  <h3 className="font-bold text-slate-800 text-base">
                    {val.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {val.desc || val.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 5. Mission & Vision Section */}
        {(data.mission_description || data.vision_description) && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {data.mission_description && (
              <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-sm space-y-4 relative overflow-hidden">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-[#002884]">
                  {data.mission_title || "Our Mission"}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {data.mission_description}
                </p>
              </div>
            )}

            {data.vision_description && (
              <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-sm space-y-4 relative overflow-hidden">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                  <Eye className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-[#002884]">
                  {data.vision_title || "Our Vision"}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {data.vision_description}
                </p>
              </div>
            )}
          </section>
        )}

        {/* 6. Team Members Section (if populated) */}
        {teamList.length > 0 && (
          <section className="space-y-10">
            <div className="text-center space-y-2 max-w-xl mx-auto">
              {data.team_badge && (
                <span className="text-[#E50914] font-bold text-xs uppercase tracking-widest block">
                  {data.team_badge}
                </span>
              )}
              <h2 className="text-3xl font-extrabold text-[#002884] tracking-tight">
                {data.team_title || "Meet Our Team"}
              </h2>
              {data.team_subtitle && (
                <p className="text-xs sm:text-sm text-slate-500">
                  {data.team_subtitle}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {teamList.map((member, idx) => (
                <div key={idx} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-xl transition-all space-y-4 text-center">
                  <div className="w-24 h-24 mx-auto rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
                    {member.image ? (
                      <img src={getMediaUrl(member.image, "")} alt={member.name || "Team Member"} className="w-full h-full object-cover" />
                    ) : (
                      <Users className="w-10 h-10 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-base">{member.name}</h4>
                    <p className="text-xs font-semibold text-[#E50914] mt-0.5">{member.role}</p>
                  </div>
                  {member.bio && (
                    <p className="text-xs text-slate-500 leading-relaxed">{member.bio}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 7. Contact CTA Box */}
        <section className="bg-[#002884] text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <h2 className="text-3xl font-extrabold tracking-tight">
              {data.cta_title || "Have Questions or Need Recommendations?"}
            </h2>
            <p className="text-blue-100 text-sm">
              {data.cta_subtitle || "Our dedicated support team is here to assist you with order inquiries, product guidance, and delivery updates."}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 relative z-10 pt-2">
            {data.cta_phone && (
              <a 
                href={`tel:${String(data.cta_phone).replace(/[^0-9+]/g, "")}`} 
                className="inline-flex items-center gap-2 bg-[#E50914] hover:bg-[#C80000] text-white font-bold text-sm px-8 py-3.5 rounded-full shadow-lg transition"
              >
                <PhoneCall className="w-4 h-4" /> Call Hotline: {data.cta_phone}
              </a>
            )}
            {data.cta_email && (
              <a 
                href={`mailto:${data.cta_email}`} 
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-sm px-8 py-3.5 rounded-full transition"
              >
                <Mail className="w-4 h-4" /> Email Us ({data.cta_email})
              </a>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
