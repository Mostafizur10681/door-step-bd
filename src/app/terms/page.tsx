"use client";

import React from "react";
import Link from "next/link";
import { Scale, FileText, CheckCircle2, ShieldAlert, ShoppingBag, Truck, RefreshCw, Sparkles } from "lucide-react";

export default function TermsAndConditionsPage() {
  const termsSections = [
    {
      icon: <ShoppingBag className="w-6 h-6 text-[#002884]" />,
      title: "1. Account & Order Acceptance",
      content: "By placing an order on Door Step BD, you agree that all provided contact details, delivery address, and phone numbers are accurate. We reserve the right to verify, hold, or cancel any order suspected of fraudulent activity."
    },
    {
      icon: <Truck className="w-6 h-6 text-[#E50914]" />,
      title: "2. Shipping & Delivery Terms",
      content: "Estimated delivery timelines (Inside Dhaka: 24-48 hours, Outside Dhaka: 3-5 working days) are approximate. Delivery delays caused by unexpected weather conditions, political strikes, or courier logistics are beyond our control."
    },
    {
      icon: <RefreshCw className="w-6 h-6 text-[#002884]" />,
      title: "3. Returns & Exchange Policy",
      content: "Products can be returned or exchanged within 7 days of delivery if you receive a damaged, expired, or incorrect item. Items must remain unopened and in original packaging. Please inspect your package upon delivery."
    },
    {
      icon: <Scale className="w-6 h-6 text-[#E50914]" />,
      title: "4. Pricing & Product Information",
      content: "While we strive to maintain accurate product descriptions, images, and prices, minor typographical errors may occur. Prices in Bangladeshi Taka (৳) are subject to update without prior notice."
    },
    {
      icon: <ShieldAlert className="w-6 h-6 text-[#002884]" />,
      title: "5. Intellectual Property Rights",
      content: "All trademarks, product images, brand names, and website contents displayed on Door Step BD belong exclusively to Door Step BD and their respective brand owners. Unauthorized copying is prohibited."
    },
    {
      icon: <FileText className="w-6 h-6 text-[#E50914]" />,
      title: "6. Limitation of Liability & Governing Law",
      content: "Door Step BD operates in full accordance with the consumer protection laws of Bangladesh. Any legal disputes arising from the use of our services shall be resolved under the jurisdiction of courts in Dhaka, Bangladesh."
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen font-sans space-y-16 pb-20">
      
      {/* 1. Hero Header Banner */}
      <section className="bg-gradient-to-r from-[#002884] via-[#0A3299] to-[#E50914] text-white py-16 sm:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_50%)] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 text-center space-y-4 relative z-10">
          <span className="inline-flex items-center gap-2 bg-red-500/20 border border-red-400/30 text-red-200 font-bold text-xs px-4 py-1.5 rounded-full uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-red-300" /> Legal Terms &amp; Policies
          </span>
          <h1 className="text-4xl sm:text-6xl font-black tracking-wide leading-tight">
            Terms &amp; Conditions <br className="hidden sm:inline" />
            <span className="text-white tracking-wide">&amp; User Agreement</span>
          </h1>
          <p className="max-w-2xl mx-auto text-blue-100 text-sm sm:text-base leading-relaxed tracking-wide pt-2">
            Please read these terms and conditions carefully before placing an order on Door Step BD.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 space-y-16">
        
        {/* 2. Agreement Overview Card */}
        <section className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-200/80 space-y-6">
          <div className="space-y-2">
            <span className="text-[#E50914] font-bold text-xs uppercase tracking-widest block">
              USER AGREEMENT
            </span>
            <h2 className="text-3xl font-extrabold text-[#002884] tracking-tight">
              Welcome to Door Step BD
            </h2>
          </div>

          <p className="text-slate-600 text-sm leading-relaxed">
            By accessing or purchasing from <strong className="text-slate-800">Door Step BD</strong> (<Link href="/" className="text-[#002884] underline font-semibold">https://www.doorstepbd.com</Link>), you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, please do not use our website or services.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {[
              "Transparent Cash on Delivery Terms",
              "7-Day Return & Exchange Guarantee",
              "100% Authentic Product Guarantee",
              "Dhaka Jurisdiction Dispute Resolution"
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-xs font-bold text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Detailed Terms Grid */}
        <section className="space-y-8">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-[#E50914] font-bold text-xs uppercase tracking-widest block">
              TERMS DETAILS
            </span>
            <h2 className="text-3xl font-extrabold text-[#002884] tracking-tight">
              Store Terms &amp; Conditions
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {termsSections.map((sec, idx) => (
              <div 
                key={idx} 
                className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 hover:border-[#002884]/30 shadow-xs hover:shadow-xl transition-all duration-300 space-y-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 shadow-inner">
                  {sec.icon}
                </div>
                <h3 className="font-extrabold text-slate-800 text-lg">
                  {sec.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {sec.content}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Contact Support Box */}
        <section className="bg-[#002884] text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <h2 className="text-3xl font-extrabold tracking-tight">
              Questions Regarding Terms or Orders?
            </h2>
            <p className="text-blue-100 text-sm">
              Our customer support hotline is available 7 days a week to clarify any order terms or policy inquiries.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 relative z-10 pt-2">
            <a 
              href="tel:01734340066" 
              className="bg-[#E50914] hover:bg-[#C80000] text-white font-bold text-sm px-8 py-3.5 rounded-full shadow-lg transition"
            >
              Call Hotline: 01734-340066
            </a>
            <a 
              href="mailto:info@doorstepbd.com" 
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
