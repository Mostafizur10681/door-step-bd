"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, Lock, Eye, FileText, Sparkles, CheckCircle2, UserCheck, Bell } from "lucide-react";

export default function PrivacyPolicyPage() {
  const sections = [
    {
      icon: <UserCheck className="w-6 h-6 text-[#122B5A]" />,
      title: "1. Information We Collect",
      content: "When you visit or place an order on Door Step BD, we collect personal information necessary to fulfill your orders. This includes your name, shipping address, phone number, email address, and order history."
    },
    {
      icon: <FileText className="w-6 h-6 text-[#122B5A]" />,
      title: "2. How We Use Your Information",
      content: "We use your personal data strictly to process and deliver your orders, send order status notifications, respond to customer inquiries, and improve your overall shopping experience on our platform."
    },
    {
      icon: <Lock className="w-6 h-6 text-[#122B5A]" />,
      title: "3. Data Security & Protection",
      content: "Your data security is our highest priority. We implement advanced SSL encryption, secure database servers, and strict internal access controls to safeguard your personal details against unauthorized access."
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-[#122B5A]" />,
      title: "4. Information Sharing & Third Parties",
      content: "Door Step BD will NEVER sell, rent, or trade your personal information. We only share necessary delivery details (name, phone, address) with our verified delivery partners (e.g., Pathao, Steadfast, RedX) solely for fulfilling your shipment."
    },
    {
      icon: <Eye className="w-6 h-6 text-[#122B5A]" />,
      title: "5. Cookies & Browsing Data",
      content: "We use cookies to maintain your active shopping session, remember items in your cart, and analyze aggregate site traffic. You can disable cookies in your web browser settings at any time."
    },
    {
      icon: <Bell className="w-6 h-6 text-[#122B5A]" />,
      title: "6. Your Privacy Rights & Contact",
      content: "You have the right to inspect, update, or request the deletion of your account data at any time. For any privacy concerns or data requests, please contact our privacy compliance team at info@doorstepbd.com."
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen font-sans space-y-16 pb-20">
      
      {/* 1. Hero Header Banner */}
      <section className="bg-gradient-to-r from-[#122B5A] via-[#0A3299] to-[#E50914] text-white py-16 sm:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_50%)] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 text-center space-y-4 relative z-10">
          <span className="inline-flex items-center gap-2 bg-amber-500/20 border border-red-400/30 text-red-200 font-bold text-xs px-4 py-1.5 rounded-full uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-red-300" /> Data Protection &amp; Security
          </span>
          <h1 className="text-4xl sm:text-6xl font-black tracking-wide leading-tight">
            Privacy Policy <br className="hidden sm:inline" />
            <span className="text-white tracking-wide">&amp; Security Commitments</span>
          </h1>
          <p className="max-w-2xl mx-auto text-blue-100 text-sm sm:text-base leading-relaxed tracking-wide pt-2">
            Learn how Door Step BD protects your personal information, ensures safe browsing, and respects your privacy rights.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 space-y-16">
        
        {/* 2. Privacy Policy Overview Card */}
        <section className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-200/80 space-y-6">
          <div className="space-y-2">
            <span className="text-[#122B5A] font-bold text-xs uppercase tracking-widest block">
              PRIVACY PROMISE
            </span>
            <h2 className="text-3xl font-extrabold text-[#122B5A] tracking-tight">
              Your Privacy &amp; Trust Are Our Top Priorities
            </h2>
          </div>

          <p className="text-slate-600 text-sm leading-relaxed">
            At <strong className="text-slate-800">Door Step BD</strong>, accessible from <Link href="/" className="text-[#122B5A] underline font-semibold">https://www.doorstepbd.com</Link>, one of our main priorities is the privacy of our customers and visitors. This Privacy Policy document outlines the types of information that is collected and recorded by Door Step BD and how we use it.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {[
              "100% Encrypted Transactions",
              "Zero Third-Party Data Selling",
              "Transparent Courier Information Sharing",
              "Instant Account Data Deletion On Request"
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-xs font-bold text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Detailed Policy Sections Grid */}
        <section className="space-y-8">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-[#122B5A] font-bold text-xs uppercase tracking-widest block">
              POLICY DETAILS
            </span>
            <h2 className="text-3xl font-extrabold text-[#122B5A] tracking-tight">
              Detailed Privacy Terms
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sections.map((sec, idx) => (
              <div 
                key={idx} 
                className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 hover:border-[#122B5A]/30 shadow-xs hover:shadow-xl transition-all duration-300 space-y-4"
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

        {/* 4. Contact / Questions Box */}
        <section className="bg-[#122B5A] text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <h2 className="text-3xl font-extrabold tracking-tight">
              Have Questions About Our Privacy Policy?
            </h2>
            <p className="text-blue-100 text-sm">
              If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 relative z-10 pt-2">
            <a 
              href="mailto:info@doorstepbd.com" 
              className="bg-[#FFB800] hover:bg-[#E6A600] text-[#122B5A] font-bold text-sm px-8 py-3.5 rounded-full shadow-lg transition"
            >
              Email Privacy Team: info@doorstepbd.com
            </a>
            <a 
              href="tel:01734340066" 
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-sm px-8 py-3.5 rounded-full transition"
            >
              Hotline: 01734-340066
            </a>
          </div>
        </section>

      </div>
    </div>
  );
}
