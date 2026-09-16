"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Truck, ShieldCheck, Clock, CreditCard, CheckCircle2, ArrowRight, Sparkles, MapPin, PhoneCall } from "lucide-react";

export default function DeliveryInformationPage() {
  const deliveryRates = [
    { location: "Inside Dhaka City", time: "24 - 48 Hours", rate: "৳ 80.00" },
    { location: "Outside Dhaka (All 64 Districts)", time: "3 - 5 Working Days", rate: "৳ 120.00" },
  ];

  const deliverySteps = [
    {
      icon: <Clock className="w-8 h-8 text-[#002B49]" />,
      title: "Order Verification",
      description: "Once your order is placed, our team verifies items and dispatches within 24 hours."
    },
    {
      icon: <Truck className="w-8 h-8 text-[#ff8c00]" />,
      title: "Courier Handover",
      description: "Handed over to top-tier delivery partners (Pathao, Steadfast, RedX) with live tracking info."
    },
    {
      icon: <CreditCard className="w-8 h-8 text-[#002B49]" />,
      title: "Doorstep Delivery & COD",
      description: "Pay cash directly to courier agent after receiving and inspecting your package."
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen font-sans space-y-16 pb-20">
      
      {/* 1. Hero Header Banner matching About page */}
      <section className="bg-gradient-to-r from-[#002B49] via-[#092a5e] to-[#FF6600] text-white py-16 sm:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_50%)] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 text-center space-y-4 relative z-10">
          <span className="inline-flex items-center gap-2 bg-amber-400/20 border border-amber-400/30 text-amber-300 font-bold text-xs px-4 py-1.5 rounded-full uppercase tracking-wider">
            <Sparkles className="w-4 h-4" /> Fast &amp; Reliable Delivery
          </span>
          <h1 className="text-4xl sm:text-6xl font-black tracking-wide leading-tight">
            Nationwide Delivery <br className="hidden sm:inline" />
            <span className="text-amber-300 tracking-wide">Across 64 Districts in Bangladesh</span>
          </h1>
          <p className="max-w-2xl mx-auto text-blue-100 text-sm sm:text-base leading-relaxed tracking-wide pt-2">
            Non-contact shipping with cash-on-delivery service so your favorite organic food, skincare, and healthcare supplements arrive quickly and safely.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 space-y-20">
        


        {/* 3. Rates & Timelines Table Section (Matches About Page Stat Bar Box styling) */}
        <section className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-200/80 space-y-6">
          <div className="space-y-2 text-center max-w-xl mx-auto">
            <span className="text-[#ff8c00] font-bold text-xs uppercase tracking-widest block">
              PRICING &amp; TIMELINES
            </span>
            <h2 className="text-3xl font-extrabold text-[#002B49] tracking-tight">
              Delivery Rates Across Bangladesh
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#002B49] text-white font-bold">
                <tr>
                  <th className="py-4 px-4 sm:px-6">Destination Zone</th>
                  <th className="py-4 px-4 sm:px-6 text-right">Shipping Fee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600 bg-white">
                {deliveryRates.map((rate, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition">
                    <td className="py-4.5 px-4 sm:px-6 font-bold text-slate-800">{rate.location}</td>
                    <td className="py-4.5 px-4 sm:px-6 text-right font-black text-lg text-[#ff8c00]">{rate.rate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 4. Delivery Workflow Grid (Matches About Page Core Values 4-Card styling) */}
        <section className="space-y-10">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-[#ff8c00] font-bold text-xs uppercase tracking-widest block">
              HOW IT WORKS
            </span>
            <h2 className="text-3xl font-extrabold text-[#002B49] tracking-tight">
              Our 3-Step Delivery Process
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Simple, transparent, and hassle-free from warehouse to your door
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {deliverySteps.map((step, idx) => (
              <div 
                key={idx} 
                className="bg-white rounded-2xl p-6 border border-slate-200/80 hover:border-[#002B49]/30 shadow-xs hover:shadow-xl transition-all duration-300 space-y-4"
              >
                <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 shadow-inner">
                  {step.icon}
                </div>
                <h3 className="font-bold text-slate-800 text-base">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Contact CTA Box (Matches About Page Contact Box) */}
        <section className="bg-[#002B49] text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <h2 className="text-3xl font-extrabold tracking-tight">
              Need Help With Your Order Tracking?
            </h2>
            <p className="text-blue-100 text-sm">
              Our dedicated support team is available 7 days a week from 9:00 AM to 10:00 PM.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 relative z-10 pt-2">
            <a 
              href="tel:01681135030" 
              className="bg-[#ff8c00] hover:bg-[#e07b00] text-white font-bold text-sm px-8 py-3.5 rounded-full shadow-lg transition"
            >
              Call Hotline: 01681-135030
            </a>
            <a 
              href="mailto:info@smtmartbd.com" 
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-sm px-8 py-3.5 rounded-full transition"
            >
              Email Us
            </a>
          </div>
        </section>

      </div>
    </div>
  );
}
