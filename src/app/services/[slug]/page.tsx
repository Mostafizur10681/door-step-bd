"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  Zap, 
  PhoneCall, 
  MessageSquare, 
  ChevronRight, 
  ArrowLeft,
  Wrench,
  Sparkles,
  Building2,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import { getServiceBySlug, getServices, getContactSettings, ApiService, ApiContactSettings, getMediaUrl } from "@/lib/api";

export default function SingleServicePage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [service, setService] = useState<ApiService | null>(null);
  const [otherServices, setOtherServices] = useState<ApiService[]>([]);
  const [contactSettings, setContactSettings] = useState<ApiContactSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    if (!slug) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const [singleRes, allRes, contactRes] = await Promise.allSettled([
          getServiceBySlug(slug),
          getServices({ all: 1 }),
          getContactSettings()
        ]);

        if (!isMounted) return;

        if (singleRes.status === "fulfilled" && singleRes.value.success && singleRes.value.data) {
          setService(singleRes.value.data);
        } else if (allRes.status === "fulfilled" && allRes.value.success && Array.isArray(allRes.value.data)) {
          // Match by slug or id
          const found = allRes.value.data.find(s => String(s.slug) === slug || String(s.id) === slug);
          if (found) {
            setService(found);
          }
        }

        if (allRes.status === "fulfilled" && allRes.value.success && Array.isArray(allRes.value.data)) {
          setOtherServices(allRes.value.data.filter(s => String(s.slug) !== slug && String(s.id) !== slug).slice(0, 3));
        }

        if (contactRes.status === "fulfilled" && contactRes.value.success && contactRes.value.data) {
          setContactSettings(contactRes.value.data);
        }
      } catch (err) {
        console.warn("Failed to load service detail:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, [slug]);

  const phone = contactSettings?.phone || "01734-340066";
  const whatsappNumber = contactSettings?.whatsapp_number || "01734-340066";
  const cleanPhone = phone.replace(/[^0-9+]/g, "");
  const cleanWaNumber = whatsappNumber.replace(/[^0-9]/g, "");

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 sm:py-24">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="space-y-6 animate-pulse">
            <div className="h-6 bg-slate-200 rounded w-48" />
            <div className="h-12 bg-slate-200 rounded w-3/4" />
            <div className="w-full h-80 sm:h-96 bg-slate-200 rounded-3xl" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-4 bg-slate-200 rounded w-full" />
                <div className="h-4 bg-slate-200 rounded w-5/6" />
                <div className="h-4 bg-slate-200 rounded w-2/3" />
              </div>
              <div className="h-64 bg-slate-200 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-[70vh] bg-slate-50 flex flex-col items-center justify-center text-center px-4 py-16">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-[#122B5A] flex items-center justify-center mb-4">
          <Wrench className="w-8 h-8 text-[#FFB800]" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#122B5A] mb-2">Service Not Found</h1>
        <p className="text-slate-500 text-sm max-w-md mb-6">
          The service you are looking for does not exist or may have been updated in the admin panel.
        </p>
        <Link
          href="/services"
          className="inline-flex items-center gap-2 bg-[#122B5A] hover:bg-[#0B1B38] text-white font-bold text-xs uppercase px-6 py-3 rounded-xl transition shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Services</span>
        </Link>
      </div>
    );
  }

  const imageUrl = service.image ? (service.image.startsWith("data:") ? service.image : getMediaUrl(service.image)) : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* 1. Hero Header Section (Dynamic Data Only) */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#122B5A] via-[#1A3D7C] to-[#0B1B38] text-white pt-14 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,184,0,0.15),transparent_50%)] pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#FFB800]/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#122B5A]/40 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-5xl mx-auto space-y-5 z-10 text-center sm:text-left">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFB800]/20 border border-[#FFB800]/40 text-[#FFB800] text-xs font-bold uppercase tracking-wider self-center sm:self-start shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-[#FFB800]" />
            <span>Door Step BD Engineering Service</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
            {service.title}
          </h1>

          {service.short_description && (
            <p className="text-sm sm:text-base text-blue-100/90 max-w-3xl leading-relaxed whitespace-pre-line">
              {service.short_description}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-3">
            <a
              href={`tel:${cleanPhone}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#FFB800] hover:bg-[#E6A600] text-[#122B5A] font-black text-xs sm:text-sm shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <PhoneCall className="w-4 h-4 text-[#122B5A]" />
              <span>Call Hotline: {phone}</span>
            </a>

            {cleanWaNumber && (
              <a
                href={`https://wa.me/${cleanWaNumber}?text=${encodeURIComponent(`Hello, I need inquiry regarding ${service.title}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp Quote</span>
              </a>
            )}

            <Link
              href="/contact-us"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs sm:text-sm backdrop-blur-sm transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Zap className="w-4 h-4 text-[#FFB800]" />
              <span>Submit Inquiry</span>
            </Link>
          </div>

        </div>
      </section>

      {/* 2. Main Service Content Body */}
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Image & Full Description (8 Cols) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Dynamic Service Featured Image */}
            {imageUrl && (
              <div className="relative w-full rounded-3xl overflow-hidden shadow-xl border border-slate-200/90 bg-white max-h-[500px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt={service.title}
                  className="w-full h-auto object-cover object-center max-h-[500px]"
                />
              </div>
            )}

            {/* Dynamic Service Full Rich HTML Description */}
            {service.description && (
              <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-xl sm:text-2xl font-black text-[#122B5A] tracking-tight">
                    Service Details &amp; Specifications
                  </h2>
                </div>

                <div 
                  className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-sm sm:text-base space-y-4 prose-headings:font-black prose-headings:text-[#122B5A] prose-a:text-blue-600"
                  dangerouslySetInnerHTML={{ __html: service.description }}
                />
              </div>
            )}

          </div>

          {/* Right Column: Dynamic Inquiry & Meta Widget (4 Cols) */}
          <div className="lg:col-span-4 space-y-6 sticky top-24">
            
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-md space-y-6">
              
              <div className="space-y-1.5 pb-4 border-b border-slate-100">
                <span className="inline-block text-[11px] font-black uppercase tracking-widest text-[#FFB800] bg-[#122B5A] px-3 py-1 rounded-full">
                  Quick Inquiry
                </span>
                <h3 className="text-xl font-black text-[#122B5A]">
                  {service.title}
                </h3>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <a
                  href={`tel:${cleanPhone}`}
                  className="w-full flex items-center justify-center gap-3 bg-[#122B5A] hover:bg-[#0B1B38] text-white font-black text-xs sm:text-sm uppercase py-3.5 px-4 rounded-2xl shadow-md transition duration-200 cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4 text-[#FFB800]" />
                  <span>Call {phone}</span>
                </a>

                {cleanWaNumber && (
                  <a
                    href={`https://wa.me/${cleanWaNumber}?text=${encodeURIComponent(`Hello, I need inquiry regarding ${service.title}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm uppercase py-3.5 px-4 rounded-2xl shadow-md transition duration-200 cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp Quote</span>
                  </a>
                )}

                <Link
                  href="/contact-us"
                  className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase py-3 px-4 rounded-2xl transition duration-200 cursor-pointer"
                >
                  <span>Submit Inquiry Online</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Dynamic Service Metadata */}
              <div className="space-y-3 pt-4 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400 font-medium">Service Name:</span>
                  <span className="font-bold text-slate-800 text-right truncate max-w-[180px]">{service.title}</span>
                </div>
                {service.created_at && (
                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-400 font-medium">Published:</span>
                    <span className="font-bold text-slate-800">
                      {new Date(service.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                    </span>
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>

        {/* 3. Other Dynamic Services from Database */}
        {otherServices.length > 0 && (
          <section className="mt-16 sm:mt-24 pt-12 border-t border-slate-200 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#122B5A]/10 text-[#122B5A] text-xs font-bold uppercase tracking-wider mb-2">
                  <Layers className="w-3.5 h-3.5 text-[#122B5A]" />
                  <span>Other Services</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-[#122B5A] tracking-tight">
                  Explore More Services
                </h3>
              </div>

              <Link
                href="/services"
                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#122B5A] hover:text-[#FFB800] transition"
              >
                <span>View All Services</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {otherServices.map((other, idx) => {
                const img = other.image ? (other.image.startsWith("data:") ? other.image : getMediaUrl(other.image)) : null;

                return (
                  <Link
                    key={other.id || idx}
                    href={`/services/${other.slug || other.id}`}
                    className="group bg-white rounded-2xl border border-slate-200/90 hover:border-[#122B5A]/40 p-5 flex flex-col justify-between transition-all duration-300 shadow-xs hover:shadow-xl hover:-translate-y-1 block cursor-pointer overflow-hidden"
                  >
                    <div className="space-y-4">
                      {img ? (
                        <div className="w-full aspect-[16/10] rounded-xl overflow-hidden bg-slate-50 border border-slate-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={img}
                            alt={other.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      ) : (
                        <div className="w-full aspect-[16/10] rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                          <Wrench className="w-8 h-8" />
                        </div>
                      )}

                      <h4 className="font-extrabold text-base text-[#122B5A] group-hover:text-[#FFB800] line-clamp-1 transition-colors">
                        {other.title}
                      </h4>

                      {other.short_description && (
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {other.short_description}
                        </p>
                      )}
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#122B5A] group-hover:text-[#FFB800] transition-colors">
                      <span>View Service Details</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

      </div>

    </div>
  );
}
