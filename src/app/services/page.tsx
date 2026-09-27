"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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
  Headphones,
  Settings,
  Flame,
  Award
} from "lucide-react";
import { getServices, ApiService, getMediaUrl } from "@/lib/api";

const DEFAULT_SERVICES: ApiService[] = [
  {
    id: 1,
    title: "Doorstep AC Repair & Servicing",
    slug: "doorstep-ac-repair-servicing",
    icon: "❄️",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800&auto=format&fit=crop",
    short_description: "Fast, verified and certified air conditioner repair, cleaning, gas recharge, and master servicing at your doorstep.",
    description: "Get top-notch AC repair and servicing by certified technicians right at your home or office. We handle master servicing, jet wash cleaning, gas leakage repairs, PCB circuit diagnostics, and compressor replacement.",
    status: "active"
  },
  {
    id: 2,
    title: "Home Appliance & Fridge Repair",
    slug: "home-appliance-fridge-repair",
    icon: "🛠️",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800&auto=format&fit=crop",
    short_description: "Comprehensive refrigerator, washing machine, microwave oven, and industrial appliance maintenance.",
    description: "Quick and reliable appliance repair technicians available on-demand across all districts. Our expert team diagnoses and fixes cooling issues, electrical faults, defrosting failures, and motor defects.",
    status: "active"
  },
  {
    id: 3,
    title: "Computer, Laptop & CCTV Security Setup",
    slug: "computer-laptop-cctv-setup",
    icon: "💻",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop",
    short_description: "Hardware repairs, OS setup, network configuration, and CCTV camera installation for home, factory & office.",
    description: "Complete IT support and surveillance installation services. Whether you need motherboard repair, SSD upgrade, data recovery, or full HD IP camera setup, we provide fast doorstep service.",
    status: "active"
  },
  {
    id: 4,
    title: "Solar & Hybrid Power Solutions",
    slug: "solar-power-solutions",
    icon: "☀️",
    image: "https://images.unsplash.com/photo-1509391365360-2e959784a276?q=80&w=800&auto=format&fit=crop",
    short_description: "Turnkey commercial & industrial rooftop solar PV installations and battery storage.",
    description: "Complete design, supply, installation, and net metering integration of high-efficiency rooftop solar systems.",
    status: "active"
  }
];

export default function ServicesPage() {
  const [services, setServices] = useState<ApiService[]>(DEFAULT_SERVICES);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadAllServices = async () => {
      try {
        const res = await getServices({ all: 1 });
        if (!isMounted) return;
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setServices(res.data);
        }
      } catch (err) {
        console.warn("Failed to load services:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadAllServices();
    return () => { isMounted = false; };
  }, []);

  const filteredServices = services.filter((s) => {
    const term = searchQuery.toLowerCase();
    return (
      s.title?.toLowerCase().includes(term) ||
      s.short_description?.toLowerCase().includes(term) ||
      s.description?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-800">
      
      {/* 1. Breadcrumb */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 md:px-8 py-3">
          <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Link href="/" className="hover:text-[#122B5A] transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[#122B5A] font-bold">Our Services</span>
          </nav>
        </div>
      </div>

      {/* 2. Hero Header */}
      <section className="relative bg-gradient-to-br from-[#122B5A] via-[#0C1E40] to-[#122B5A] text-white py-14 sm:py-20 px-4 sm:px-6 md:px-8 border-b border-[#FFB800]/20 overflow-hidden">
        <div className="relative max-w-[1500px] mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFB800]/15 border border-[#FFB800]/40 text-[#FFB800] text-xs font-black uppercase tracking-widest shadow-xs">
            <Sparkles className="w-3.5 h-3.5 fill-[#FFB800]" />
            <span>On-Demand &amp; Industrial Field Support</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
            Our Professional Services
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Fast, certified, and guaranteed engineering repair, maintenance, and setup services delivered straight to your home, office, or factory.
          </p>

          {/* Quick Stat Highlights */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto text-center">
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-xs">
              <div className="text-lg sm:text-xl font-black text-[#FFB800]">24/7</div>
              <div className="text-[11px] text-slate-300 font-medium uppercase tracking-wider">Fast Dispatch</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-xs">
              <div className="text-lg sm:text-xl font-black text-[#FFB800]">100%</div>
              <div className="text-[11px] text-slate-300 font-medium uppercase tracking-wider">Certified Techs</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-xs">
              <div className="text-lg sm:text-xl font-black text-[#FFB800]">64</div>
              <div className="text-[11px] text-slate-300 font-medium uppercase tracking-wider">Districts Covered</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-xs">
              <div className="text-lg sm:text-xl font-black text-[#FFB800]">Guaranteed</div>
              <div className="text-[11px] text-slate-300 font-medium uppercase tracking-wider">Service Warranty</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Search & Filter Bar */}
      <section className="max-w-[1500px] mx-auto px-4 sm:px-6 md:px-8 pt-8 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#122B5A]">All Available Services</h2>
            <p className="text-xs text-slate-500">Showing {filteredServices.length} verified doorstep service packages</p>
          </div>

          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-full pl-9 pr-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#122B5A]/30 focus:border-[#122B5A]"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </section>

      {/* 4. Services Grid */}
      <section className="max-w-[1500px] mx-auto px-4 sm:px-6 md:px-8 py-6 pb-16">
        {filteredServices.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
            <p className="text-slate-500 text-sm">No services found matching &quot;{searchQuery}&quot;</p>
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs font-bold text-[#122B5A] hover:underline cursor-pointer"
            >
              Reset Search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {filteredServices.map((service, idx) => (
              <div
                key={service.id || idx}
                className="group relative bg-white border border-slate-200/90 hover:border-[#FFB800]/70 rounded-2xl p-6 sm:p-7 transition-all duration-300 ease-out flex flex-col justify-between shadow-xs hover:shadow-xl hover:-translate-y-1.5 overflow-hidden"
              >
                {/* Dynamic Top Accent Strip */}
                <div className="absolute top-0 inset-x-0 h-1 bg-slate-200/80 group-hover:h-1.5 group-hover:bg-gradient-to-r group-hover:from-[#FFB800] group-hover:via-amber-400 group-hover:to-[#122B5A] transition-all duration-300" />

                {/* Subtle Light-Sweep Shine Ray on Hover */}
                <div className="absolute -inset-full top-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 opacity-0 group-hover:opacity-100 group-hover:translate-x-[250%] transition-all duration-1000 ease-out pointer-events-none" />

                <div className="space-y-4 relative z-10">
                  {/* Service Icon Badge & Status */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#122B5A] to-[#0A1D3D] text-[#FFB800] flex items-center justify-center text-xl shadow-sm group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-md group-hover:shadow-[#FFB800]/20 transition-all duration-300 overflow-hidden relative">
                      {service.image ? (
                        <Image
                          src={getMediaUrl(service.image)}
                          alt={service.title}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          unoptimized
                        />
                      ) : (
                        <span>{service.icon || "🛠️"}</span>
                      )}
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 group-hover:bg-emerald-100/70 border border-emerald-200 px-2.5 py-0.5 rounded-full transition-colors duration-300">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Available Now</span>
                    </span>
                  </div>

                  {/* Title & Short Description */}
                  <div className="space-y-1.5">
                    <h3 className="text-lg sm:text-xl font-black text-[#122B5A] tracking-tight leading-snug group-hover:text-[#0B1B38] transition-colors duration-200">
                      {service.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                      {service.short_description || service.description?.replace(/<[^>]+>/g, '') || "Certified doorstep diagnostic, repair, and maintenance by specialized engineers."}
                    </p>
                  </div>
                </div>

                {/* Card Action */}
                <div className="pt-6 mt-4 border-t border-slate-100 flex items-center gap-3 relative z-10">
                  <a
                    href="tel:01734340066"
                    className="flex-1 bg-[#122B5A] hover:bg-[#0A1D3D] text-[#FFB800] font-bold text-xs py-3 px-4 rounded-xl text-center flex items-center justify-center gap-2 transition shadow-xs hover:shadow-md cursor-pointer"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call To Book</span>
                  </a>
                  <Link
                    href="/contact-us"
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3 px-4 rounded-xl text-center transition cursor-pointer"
                  >
                    Inquire
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. Direct Consultation Banner */}
      <section className="max-w-[1500px] mx-auto px-4 sm:px-6 md:px-8 py-8 pb-16">
        <div className="bg-gradient-to-r from-[#122B5A] via-[#0C1E40] to-[#122B5A] text-white rounded-3xl p-8 sm:p-12 border border-[#FFB800]/20 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFB800]/20 text-[#FFB800] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Door Step BD Service Guarantee</span>
            </span>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              Need Emergency Field Engineering Support?
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Our 24/7 technical hotline is open for urgent generator repairs, AC master servicing, substation overhauls, and electrical diagnostics.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto shrink-0">
            <a
              href="tel:01734340066"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#FFB800] hover:bg-[#E6A600] active:scale-95 text-[#122B5A] font-black uppercase text-xs tracking-wider px-7 py-3.5 rounded-xl shadow-md transition whitespace-nowrap cursor-pointer"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call: 01734-340066</span>
            </a>
            <Link
              href="/contact-us"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs tracking-wider px-6 py-3.5 rounded-xl border border-white/20 transition whitespace-nowrap cursor-pointer"
            >
              <span>Online Request</span>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
