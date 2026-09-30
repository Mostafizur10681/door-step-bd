"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Zap, 
  Wrench, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  PhoneCall, 
  Sparkles, 
  ChevronRight, 
  Search,
  Building2,
  Cpu,
  Factory,
  PackageCheck,
  Check,
  ArrowRight,
  ArrowUpRight,
  Headset,
  Settings,
  Flame,
  Award
} from "lucide-react";
import { getServices, ApiService, getMediaUrl, getContactSettings, ApiContactSettings } from "@/lib/api";

const FALLBACK_SERVICES: ApiService[] = [
  {
    id: 1,
    title: "Solar & Hybrid Power Solutions",
    slug: "solar-power-solutions",
    image: "https://images.unsplash.com/photo-1509391365360-2e959784a276?q=80&w=800&auto=format&fit=crop",
    short_description: "Turnkey commercial & industrial rooftop solar PV installations, Tier-1 panels, and net metering integration.",
    description: "Complete design, supply, installation, and net metering integration of high-efficiency rooftop solar systems.",
    status: "active"
  },
  {
    id: 2,
    title: "Industrial Generator Maintenance & Overhaul",
    slug: "maintenance-overhaul",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800&auto=format&fit=crop",
    short_description: "24/7 emergency response, major engine overhaul, cylinder head skimming, and computerized diagnostic checks.",
    description: "Comprehensive generator preventative maintenance and major top/major overhaul by certified diesel & gas power specialists.",
    status: "active"
  },
  {
    id: 3,
    title: "Substation & HT/LT Switchgear Engineering",
    slug: "electricity-substation",
    image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=800&auto=format&fit=crop",
    short_description: "11kV/0.415kV substation engineering, HT vacuum circuit breakers, LT distribution boards, and PFI panels.",
    description: "End-to-end design, fabrication, testing, and commissioning of industrial electrical substations.",
    status: "active"
  },
  {
    id: 4,
    title: "Power Plant Construction & Acoustic Canopy",
    slug: "construction-erection",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800&auto=format&fit=crop",
    short_description: "Heavy reinforced generator foundation, acoustic canopy room soundproofing, and exhaust piping installation.",
    description: "Turnkey civil and acoustic engineering for multi-megawatt industrial diesel and gas generator plants.",
    status: "active"
  },
  {
    id: 5,
    title: "Harmonic Audits & Energy Optimization",
    slug: "engineering-energy-audits",
    image: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?q=80&w=800&auto=format&fit=crop",
    short_description: "Active harmonic filtration (AHF), load calculations, power factor improvement, and energy audits.",
    description: "Comprehensive electrical load telemetry and harmonic audits to eliminate equipment overheating and power penalties.",
    status: "active"
  },
  {
    id: 6,
    title: "Automated Synchronization & ATS Panels",
    slug: "automated-systems-sync",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop",
    short_description: "Multi-genset load sharing, automated transfer switches (ATS), SCADA telemetry, and remote monitoring.",
    description: "Intelligent automation and synchronization systems for seamless transition between national grid and backup generators.",
    status: "active"
  }
];

export default function ServicesPage() {
  const [services, setServices] = useState<ApiService[]>(FALLBACK_SERVICES);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [contactPhone, setContactPhone] = useState("01734340066");

  useEffect(() => {
    let isMounted = true;
    const loadAllData = async () => {
      try {
        setLoading(true);
        const [servicesRes, contactRes] = await Promise.allSettled([
          getServices({ all: 1 }),
          getContactSettings()
        ]);

        if (!isMounted) return;

        if (servicesRes.status === "fulfilled" && servicesRes.value.success && Array.isArray(servicesRes.value.data) && servicesRes.value.data.length > 0) {
          setServices(servicesRes.value.data);
        }

        if (contactRes.status === "fulfilled" && contactRes.value.success && contactRes.value.data) {
          const c = contactRes.value.data as ApiContactSettings;
          if (c.phone) setContactPhone(c.phone);
        }
      } catch (err) {
        console.warn("Failed to load services data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadAllData();
    return () => { isMounted = false; };
  }, []);

  const filteredServices = services.filter((s) => {
    const term = searchQuery.toLowerCase().trim();
    if (!term) return true;
    return (
      s.title?.toLowerCase().includes(term) ||
      s.short_description?.toLowerCase().includes(term) ||
      s.description?.toLowerCase().includes(term)
    );
  });

  const cleanPhoneLink = `tel:${contactPhone.replace(/[^0-9+]/g, "")}`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* 1. Hero Header Section (Matching About Us & Brands Hero Aesthetic) */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#122B5A] via-[#1A3D7C] to-[#0B1B38] text-white pt-16 pb-28 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,184,0,0.15),transparent_50%)] pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#FFB800]/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#122B5A]/40 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-4xl mx-auto text-center space-y-5 z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFB800]/20 border border-[#FFB800]/40 text-[#FFB800] text-xs font-bold uppercase tracking-wider shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-[#FFB800]" />
            <span>Certified Turnkey Engineering &amp; Field Maintenance</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            Our Engineering &amp; Diagnostic Services
          </h1>

          <p className="text-sm sm:text-base text-blue-100/90 max-w-3xl mx-auto leading-relaxed">
            From heavy-duty industrial generator overhauls and 11kV substation engineering to commercial rooftop solar plants and 24/7 rapid emergency dispatch across Bangladesh.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link
              href="/contact-us"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#FFB800] hover:bg-[#E6A600] text-[#122B5A] font-black text-xs sm:text-sm shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Zap className="w-4 h-4 text-[#122B5A]" />
              <span>Request Technical Consultation</span>
            </Link>
            <a
              href={cleanPhoneLink}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs sm:text-sm backdrop-blur-sm transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <PhoneCall className="w-4 h-4 text-[#FFB800]" />
              <span>24/7 Hotline: {contactPhone}</span>
            </a>
          </div>
        </div>
      </section>

      {/* 2. Floating Stats Strip (Overlapping Hero) */}
      <section className="relative max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 -mt-16 z-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xl shadow-slate-900/5 border border-slate-100 flex items-center gap-4 hover:border-[#122B5A]/40 hover:shadow-2xl transition-all duration-300 group">
            <div className="w-12 h-12 rounded-2xl bg-[#122B5A]/10 text-[#122B5A] flex items-center justify-center shrink-0 group-hover:bg-[#122B5A] group-hover:text-white group-hover:scale-110 transition-all duration-300">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[#122B5A] tracking-tight">
                24/7
              </div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                Rapid Field Dispatch
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xl shadow-slate-900/5 border border-slate-100 flex items-center gap-4 hover:border-[#122B5A]/40 hover:shadow-2xl transition-all duration-300 group">
            <div className="w-12 h-12 rounded-2xl bg-[#122B5A]/10 text-[#122B5A] flex items-center justify-center shrink-0 group-hover:bg-[#122B5A] group-hover:text-white group-hover:scale-110 transition-all duration-300">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[#122B5A] tracking-tight">
                100%
              </div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                Certified Engineers
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xl shadow-slate-900/5 border border-slate-100 flex items-center gap-4 hover:border-[#122B5A]/40 hover:shadow-2xl transition-all duration-300 group">
            <div className="w-12 h-12 rounded-2xl bg-[#122B5A]/10 text-[#122B5A] flex items-center justify-center shrink-0 group-hover:bg-[#122B5A] group-hover:text-white group-hover:scale-110 transition-all duration-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[#122B5A] tracking-tight">
                OEM
              </div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                Genuine Spare Parts
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xl shadow-slate-900/5 border border-slate-100 flex items-center gap-4 hover:border-[#122B5A]/40 hover:shadow-2xl transition-all duration-300 group">
            <div className="w-12 h-12 rounded-2xl bg-[#122B5A]/10 text-[#122B5A] flex items-center justify-center shrink-0 group-hover:bg-[#122B5A] group-hover:text-white group-hover:scale-110 transition-all duration-300">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[#122B5A] tracking-tight">
                64
              </div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                Districts Active
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16 py-16">
        
        {/* 3. Search & Filter Bar */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#122B5A] tracking-tight">
              All Engineering Packages &amp; Solutions
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Showing {filteredServices.length} certified technical service disciplines
            </p>
          </div>

          <div className="w-full md:w-80 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search service package..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#122B5A] focus:border-transparent transition-all shadow-inner"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </section>

        {/* 4. Services Grid (Visual Cards Matching Home & Brands Style) */}
        <section>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[1, 2, 3, 4, 5, 6].map((sk) => (
                <div key={sk} className="h-80 bg-slate-200 rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 sm:p-16 border border-slate-200/90 text-center space-y-4 shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-[#122B5A] flex items-center justify-center mx-auto">
                <Wrench className="w-8 h-8 text-[#FFB800]" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-[#122B5A]">No Services Found</h3>
              <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto">
                {searchQuery ? `No service packages matching "${searchQuery}". Try a different keyword.` : "No dynamic services are currently available."}
              </p>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="inline-flex items-center gap-2 bg-[#122B5A] text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-[#0A1D3D] transition cursor-pointer"
                >
                  Reset Search
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredServices.map((service, idx) => {
                const serviceImage = service.image 
                  ? (service.image.startsWith("data:") ? service.image : getMediaUrl(service.image)) 
                  : (FALLBACK_SERVICES[idx % FALLBACK_SERVICES.length].image as string);

                const serviceDesc = service.short_description || service.description?.replace(/<[^>]+>/g, "") || "Certified diagnostic, installation, and preventative field maintenance.";

                return (
                  <Link
                    key={service.id || idx}
                    href={`/services/${service.slug || service.id}`}
                    className="group relative h-80 sm:h-96 rounded-3xl overflow-hidden shadow-xs hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 ease-out border border-slate-200/80 hover:border-[#FFB800]/80 block cursor-pointer bg-slate-900"
                  >
                    {/* Background Image with Zoom on Hover */}
                    <div className="absolute inset-0 w-full h-full overflow-hidden bg-slate-900">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={serviceImage}
                        alt={service.title}
                        className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110 opacity-90"
                        loading="lazy"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = FALLBACK_SERVICES[idx % FALLBACK_SERVICES.length].image as string;
                        }}
                      />
                    </div>

                    {/* Dynamic Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B1B38] via-[#122B5A]/75 to-transparent opacity-85 group-hover:opacity-95 transition-all duration-500" />

                    {/* Subtle Light-Sweep Shine Ray on Hover */}
                    <div className="absolute -inset-full top-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 opacity-0 group-hover:opacity-100 group-hover:translate-x-[250%] transition-all duration-1000 ease-out pointer-events-none z-20" />

                    {/* Expanding Top Accent Strip */}
                    <div className="absolute top-0 inset-x-0 h-1 bg-transparent group-hover:h-1.5 group-hover:bg-gradient-to-r group-hover:from-[#FFB800] group-hover:via-amber-400 group-hover:to-[#122B5A] transition-all duration-300 z-20" />

                    {/* Top Status Badge */}
                    <div className="absolute top-5 left-5 right-5 flex items-center justify-between z-10 pointer-events-none">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-[#FFB800] bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-[#FFB800]/40 shadow-xs">
                        <CheckCircle2 className="w-3 h-3 text-[#FFB800]" />
                        <span>Active Discipline</span>
                      </span>
                    </div>

                    {/* Bottom Content & Action */}
                    <div className="absolute bottom-0 inset-x-0 p-6 sm:p-7 flex flex-col justify-end gap-3 z-10 transition-transform duration-300 ease-out group-hover:-translate-y-1">
                      <div className="space-y-1.5">
                        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug group-hover:text-amber-200 transition-colors duration-300">
                          {service.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-200/90 line-clamp-2 font-normal leading-relaxed">
                          {serviceDesc}
                        </p>
                      </div>

                      {/* View Details Action Button */}
                      <div className="pt-3 flex items-center justify-between border-t border-white/15 mt-1">
                        <span className="text-xs font-bold text-amber-300 group-hover:text-white transition-colors">
                          Explore Engineering Specifications
                        </span>
                        <div className="w-9 h-9 rounded-xl bg-white/15 group-hover:bg-[#FFB800] group-hover:text-[#122B5A] text-white flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-sm">
                          <ArrowUpRight className="w-4 h-4 stroke-[2.5] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* 5. Core Engineering Assurance Section (Matching About Us 4-Card Section) */}
        <section className="space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#122B5A]/10 text-[#122B5A] text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-[#122B5A]" />
              <span>Service Level Agreement</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#122B5A] tracking-tight">
              Our Technical Service Standards
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Rigorous engineering diagnostics, genuine OEM spare parts, and fast field mobilization across all 64 districts.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 hover:border-[#122B5A]/40 shadow-xs hover:shadow-xl transition-all duration-300 space-y-3.5 group flex flex-col justify-between">
              <div className="space-y-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#122B5A]/10 text-[#122B5A] flex items-center justify-center group-hover:bg-[#122B5A] group-hover:text-white group-hover:scale-110 transition-all duration-300 shadow-xs">
                  <Cpu className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-[#122B5A] text-sm sm:text-base">
                  Precision Telemetry &amp; Diagnostics
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Computerized ECU analysis, thermal imaging, power factor profiling, and vibration checks for zero error margin.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-bold text-[#122B5A]">
                <Check className="w-3.5 h-3.5 text-[#FFB800]" />
                <span>Certified Testing</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 hover:border-[#122B5A]/40 shadow-xs hover:shadow-xl transition-all duration-300 space-y-3.5 group flex flex-col justify-between">
              <div className="space-y-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#122B5A]/10 text-[#122B5A] flex items-center justify-center group-hover:bg-[#122B5A] group-hover:text-white group-hover:scale-110 transition-all duration-300 shadow-xs">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-[#122B5A] text-sm sm:text-base">
                  100% Genuine OEM Spares
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Direct manufacturer import of filters, injectors, AVRs, ATS components, and engine rebuild kits.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-bold text-[#122B5A]">
                <Check className="w-3.5 h-3.5 text-[#FFB800]" />
                <span>OEM Verified</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 hover:border-[#122B5A]/40 shadow-xs hover:shadow-xl transition-all duration-300 space-y-3.5 group flex flex-col justify-between">
              <div className="space-y-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#122B5A]/10 text-[#122B5A] flex items-center justify-center group-hover:bg-[#122B5A] group-hover:text-white group-hover:scale-110 transition-all duration-300 shadow-xs">
                  <Factory className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-[#122B5A] text-sm sm:text-base">
                  Turnkey Overhaul &amp; Erection
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Complete mechanical rebuilds, acoustic canopy fabrication, dynamic load balancing, and live commissioning.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-bold text-[#122B5A]">
                <Check className="w-3.5 h-3.5 text-[#FFB800]" />
                <span>End-to-End SLA</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 hover:border-[#122B5A]/40 shadow-xs hover:shadow-xl transition-all duration-300 space-y-3.5 group flex flex-col justify-between">
              <div className="space-y-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#122B5A]/10 text-[#122B5A] flex items-center justify-center group-hover:bg-[#122B5A] group-hover:text-white group-hover:scale-110 transition-all duration-300 shadow-xs">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-[#122B5A] text-sm sm:text-base">
                  24/7 Rapid Emergency Response
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Dedicated field emergency engineering vans ready for rapid dispatch across Dhaka, Chattogram, and all divisions.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-bold text-[#122B5A]">
                <Check className="w-3.5 h-3.5 text-[#FFB800]" />
                <span>2-4h Dispatch</span>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Emergency Technical Consultation & Hotline CTA Banner */}
        <section className="bg-gradient-to-r from-[#122B5A] via-[#1A3D7C] to-[#0B1B38] text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,184,0,0.12),transparent_50%)] pointer-events-none" />
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#FFB800]/15 rounded-full blur-3xl pointer-events-none"></div>

          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFB800]/20 border border-[#FFB800]/40 text-[#FFB800] text-xs font-bold uppercase tracking-wider">
              <PhoneCall className="w-3.5 h-3.5 text-[#FFB800]" />
              <span>24/7 Field Engineering Helpdesk</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
              Need Urgent Field Repair or Maintenance Contract?
            </h2>
            <p className="text-blue-100 text-xs sm:text-sm leading-relaxed">
              Consult with our senior electrical and mechanical engineers for urgent on-site breakdown support, load bank testing, or annual maintenance contracts (AMC).
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 relative z-10 pt-2">
            <a 
              href={cleanPhoneLink}
              className="inline-flex items-center gap-2 bg-[#FFB800] hover:bg-[#E6A600] text-[#122B5A] font-black text-xs sm:text-sm px-7 py-3.5 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <PhoneCall className="w-4 h-4 text-[#122B5A]" />
              <span>Call Hotline: {contactPhone}</span>
            </a>
            <Link
              href="/contact-us"
              className="inline-flex items-center gap-2 bg-white text-[#122B5A] hover:bg-slate-100 font-black text-xs sm:text-sm px-7 py-3.5 rounded-full shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>Submit Service Ticket</span>
              <ArrowRight className="w-4 h-4 text-[#122B5A]" />
            </Link>
          </div>
        </section>

      </div>

    </div>
  );
}

