"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Zap } from "lucide-react";

export interface ServiceItem {
  id: string;
  title: string;
  category: string;
  image: string;
  link: string;
  desc?: string;
}

const SERVICES: ServiceItem[] = [
  {
    id: "solar",
    title: "Solar Power",
    category: "Renewable Energy",
    image: "https://images.unsplash.com/photo-1509391365360-2e959784a276?q=80&w=800&auto=format&fit=crop",
    link: "/solutions#solar",
    desc: "Turnkey commercial & industrial rooftop solar PV installations.",
  },
  {
    id: "maintenance",
    title: "Maintenance & Overhaul",
    category: "Field Services",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800&auto=format&fit=crop",
    link: "/solutions#maintenance",
    desc: "24/7 emergency response, major engine overhaul, and diagnostic checks.",
  },
  {
    id: "electricity",
    title: "Electricity & Substation",
    category: "Power Grid",
    image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=800&auto=format&fit=crop",
    link: "/solutions#substation",
    desc: "11kV/0.415kV substation engineering, HT/LT panels, and transformers.",
  },
  {
    id: "construction",
    title: "Construction & Erection",
    category: "Infrastructure",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800&auto=format&fit=crop",
    link: "/solutions#construction",
    desc: "Heavy generator foundation, acoustic canopy room, and exhaust piping.",
  },
  {
    id: "engineering",
    title: "Engineering & Energy Audits",
    category: "Consultancy",
    image: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?q=80&w=800&auto=format&fit=crop",
    link: "/solutions#audit",
    desc: "Harmonic analysis, load calculations, and power factor improvement.",
  },
  {
    id: "automation",
    title: "Automated Systems & Sync",
    category: "Automation",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop",
    link: "/solutions#sync",
    desc: "Multi-genset load sharing, automated transfer switches (ATS), and SCADA.",
  },
];

export function OurServicesSection() {
  return (
    <section className="w-full bg-[#f8fafc] py-14 sm:py-20 border-y border-slate-200/80">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-8">
        
        {/* Section Header (Reference Style: Title on left, View All on right) */}
        <div className="flex items-center justify-between gap-4 mb-8 sm:mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-black tracking-widest text-[#122B5A] uppercase mb-1">
              <Zap className="w-3.5 h-3.5 text-[#FFB800]" />
              <span>What We Offer</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#122B5A] tracking-tight">
              Our Services
            </h2>
          </div>

          <Link
            href="/solutions"
            className="inline-flex items-center justify-center bg-[#FFB800] hover:bg-[#E6A600] text-[#122B5A] font-black uppercase text-xs sm:text-xs tracking-wider px-6 sm:px-8 py-2.5 sm:py-3 rounded-sm shadow-xs transition-all active:scale-95 whitespace-nowrap cursor-pointer"
          >
            View All
          </Link>
        </div>

        {/* 6-Card Grid (2 Rows of 3 Columns matching reference image) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {SERVICES.map((item) => (
            <Link
              key={item.id}
              href={item.link}
              className="group relative h-64 sm:h-72 rounded-xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-200/80 block cursor-pointer"
            >
              {/* Background Image with Zoom on Hover */}
              <div className="absolute inset-0 w-full h-full">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110"
                />
              </div>

              {/* Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#122B5A] via-[#122B5A]/60 to-transparent opacity-85 group-hover:opacity-95 transition-opacity duration-300" />

              {/* Bottom Label Bar (Look & Feel identical to reference image) */}
              <div className="absolute bottom-0 inset-x-0 p-5 sm:p-6 flex items-end justify-between gap-3 z-10">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#FFB800] drop-shadow-xs">
                    {item.category}
                  </span>
                  <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight group-hover:text-amber-200 transition-colors">
                    {item.title}
                  </h3>
                  {item.desc && (
                    <p className="text-xs text-slate-200/85 line-clamp-1 max-w-xs font-normal">
                      {item.desc}
                    </p>
                  )}
                </div>

                {/* Arrow Icon Button Badge */}
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-xs group-hover:bg-[#FFB800] text-white group-hover:text-[#122B5A] flex items-center justify-center transition-all duration-300 shrink-0 transform group-hover:rotate-45 shadow-xs">
                  <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                </div>
              </div>

              {/* Top Accent Strip */}
              <div className="absolute top-0 inset-x-0 h-1 bg-transparent group-hover:bg-[#FFB800] transition-colors duration-300" />
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
