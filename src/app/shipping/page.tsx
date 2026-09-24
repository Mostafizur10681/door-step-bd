"use client";

import React from "react";
import Link from "next/link";
import { 
  Truck, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  DollarSign, 
  CheckCircle2, 
  Headphones, 
  Package, 
  Building2, 
  Compass,
  ArrowRight
} from "lucide-react";

export default function ShippingPage() {
  const deliveryRates = [
    {
      zone: "Inside Dhaka City",
      fee: "৳80",
      time: "24 – 48 Hours",
      partner: "Steadfast / Pathao / In-house Courier",
      badge: "Fastest Delivery",
      freeOver: "Fast Doorstep Delivery"
    },
    {
      zone: "Outside Dhaka (All 64 Districts)",
      fee: "৳120",
      time: "2 – 4 Business Days",
      partner: "Sundarban / SA Paribahan / Steadfast",
      badge: "Nationwide Coverage",
      freeOver: "All 64 Districts"
    }
  ];

  const shippingHighlights = [
    {
      icon: Truck,
      title: "Nationwide Home Delivery",
      desc: "We deliver directly to your doorstep across all 64 districts in Bangladesh."
    },
    {
      icon: Clock,
      title: "Same Day Dispatch",
      desc: "Orders placed before 2:00 PM are dispatched on the exact same business day."
    },
    {
      icon: ShieldCheck,
      title: "100% Cash on Delivery",
      desc: "Inspect your package upon delivery before making payment to the courier."
    },
    {
      icon: DollarSign,
      title: "Affordable Shipping Rates",
      desc: "Only ৳80 Inside Dhaka and ৳120 Outside Dhaka for fast & reliable delivery."
    }
  ];

  const faqs = [
    {
      q: "How can I track my shipment package?",
      a: "Simply click 'Track Order' in the website header or visit /track-order and enter your Order Number (e.g. SHP-2026-8891) for live courier updates."
    },
    {
      q: "What courier partners do you use?",
      a: "We work with Bangladesh's most reliable courier logistics: Steadfast Express, Pathao Courier, Sundarban Courier, and SA Paribahan."
    },
    {
      q: "Can I open and verify the parcel before paying COD?",
      a: "Yes! All our packages permit customer parcel inspection in front of the courier rider before handing over Cash on Delivery."
    },
    {
      q: "What happens if I am not available during delivery?",
      a: "The courier rider will attempt delivery up to 3 times and contact you on your registered phone number before returning the package."
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen font-sans space-y-12 pb-20">
      
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-[#122B5A] via-[#0A3299] to-[#E50914] text-white py-14 sm:py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-3 relative z-10">
          <span className="inline-flex items-center gap-2 bg-amber-400/20 border border-amber-300/30 text-amber-300 font-bold text-xs px-4 py-1.5 rounded-full uppercase tracking-wider">
            <Truck className="w-4 h-4 text-amber-400" /> Fast &amp; Reliable Nationwide Logistics
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-wide leading-tight">
            Shipping &amp; Delivery Information
          </h1>
          <p className="max-w-2xl mx-auto text-blue-100 text-xs sm:text-sm leading-relaxed">
            Transparent shipping rates, doorstep delivery across 64 districts, and cash on delivery guarantee.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 space-y-12">
        
        {/* 4 Feature Highlights Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {shippingHighlights.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition space-y-3"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#122B5A]/10 text-[#122B5A] flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-sm">{item.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Shipping Rates & Timelines Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-black text-slate-900">Delivery Charges &amp; Timelines</h2>
              <p className="text-xs text-slate-500">Shipping rates based on delivery location in Bangladesh</p>
            </div>
            <span className="bg-amber-50 text-[#122B5A] font-bold text-xs px-3 py-1.5 rounded-full border border-amber-200">
              Inside Dhaka ৳80 | Outside Dhaka ৳120
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {deliveryRates.map((rate, idx) => (
              <div 
                key={idx} 
                className="bg-slate-50/80 rounded-2xl border border-slate-200 p-5 space-y-4 flex flex-col justify-between hover:border-[#122B5A]/40 transition"
              >
                <div className="space-y-2">
                  <span className="bg-[#122B5A]/10 text-[#122B5A] text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {rate.badge}
                  </span>
                  <h3 className="font-extrabold text-slate-900 text-sm">{rate.zone}</h3>
                  
                  <div className="pt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-black text-[#122B5A]">{rate.fee}</span>
                    <span className="text-xs text-emerald-600 font-bold">({rate.freeOver})</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200/80 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-slate-400 font-medium">Logistics Partner:</span>
                    <span className="font-bold text-slate-800 text-[11px] truncate max-w-[140px]" title={rate.partner}>
                      {rate.partner}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Tracking Quick CTA Box */}
        <div className="bg-gradient-to-r from-[#122B5A] via-[#0A3299] to-[#E50914] rounded-3xl p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-xl font-extrabold">Already placed an order?</h3>
            <p className="text-xs text-blue-100">Check real-time package dispatch and courier tracking updates online.</p>
          </div>
          <Link
            href="/track-order"
            className="bg-amber-400 hover:bg-amber-300 text-slate-900 font-black text-xs px-8 py-3.5 rounded-full transition shadow-md flex items-center gap-2 whitespace-nowrap"
          >
            <Truck className="w-4 h-4" /> Track Your Shipment <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
