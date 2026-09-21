"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  RotateCcw, 
  ShieldCheck, 
  Clock, 
  Truck, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  FileText, 
  Send,
  ArrowRight,
  PackageX
} from "lucide-react";
import { useShop } from "@/context/ShopContext";

export default function ReturnsPolicyPage() {
  const { showToast } = useShop();
  
  // Return Request Form State
  const [orderId, setOrderId] = useState("");
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState("Damaged or Defective Item");
  const [details, setDetails] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitReturn = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    showToast("Return request submitted successfully!");
  };

  const policySteps = [
    {
      step: "01",
      title: "Submit Return Request",
      desc: "Fill out the online return form with your Order ID, phone number, and issue details within 7 days of receiving your parcel.",
      icon: FileText
    },
    {
      step: "02",
      title: "Logistics Pickup",
      desc: "Our delivery partner (Steadfast / Pathao) will collect the item directly from your address at zero extra hassle.",
      icon: Truck
    },
    {
      step: "03",
      title: "Quality Verification",
      desc: "Our inspection team checks the returned package to ensure tags and original seal integrity.",
      icon: ShieldCheck
    },
    {
      step: "04",
      title: "Instant Replacement / Refund",
      desc: "Receive immediate product replacement or full cash refund via bKash / Nagad within 24-48 hours.",
      icon: RotateCcw
    }
  ];

  const eligibilityList = [
    { title: "7-Day Return Guarantee", desc: "You can request a return or exchange within 7 calendar days after delivery.", valid: true },
    { title: "Wrong Product Received", desc: "If the item delivered does not match your order selection.", valid: true },
    { title: "Damaged / Defective Goods", desc: "Product was damaged in transit or broken upon opening.", valid: true },
    { title: "Expired / Missing Items", desc: "Product seal broken, expired date, or missing components.", valid: true },
    { title: "Used or Opened Items", desc: "Hygiene/beauty items with unsealed or missing original packaging.", valid: false },
    { title: "Mind Change After 7 Days", desc: "Return requests submitted after the 7-day policy window.", valid: false }
  ];

  return (
    <div className="bg-slate-50 min-h-screen font-sans space-y-12 pb-20">
      
      {/* Hero Header Section */}
      <section className="bg-gradient-to-r from-[#002884] via-[#0A3299] to-[#E50914] text-white py-14 sm:py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-3 relative z-10">
          <span className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-bold text-xs px-4 py-1.5 rounded-full uppercase tracking-wider">
            <RotateCcw className="w-4 h-4 text-emerald-400" /> 100% Hassle-Free Policy
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-wide leading-tight">
            Return &amp; Refund Policy
          </h1>
          <p className="max-w-2xl mx-auto text-blue-100 text-xs sm:text-sm leading-relaxed">
            Your satisfaction is our priority. Enjoy a transparent 7-day replacement and money-back guarantee.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 space-y-12">
        
        {/* 4-Step Return Process Cards */}
        <div className="space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-black text-[#002884]">How Returns Work</h2>
            <p className="text-xs text-slate-500">4 simple steps to replace or refund your purchase</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {policySteps.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div 
                  key={idx} 
                  className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4 relative overflow-hidden group"
                >
                  <span className="text-4xl font-black text-slate-100 group-hover:text-[#002884]/10 transition">
                    {s.step}
                  </span>

                  <div className="space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-[#002884]/10 text-[#002884] flex items-center justify-center">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-sm">{s.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2-Column: Eligibility Criteria + Return Submission Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Return Eligibility Guidelines (Col 7) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4 space-y-1">
              <h3 className="text-xl font-black text-slate-900">Return Eligibility Terms</h3>
              <p className="text-xs text-slate-500">Please review criteria before requesting a return</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {eligibilityList.map((item, idx) => (
                <div 
                  key={idx} 
                  className={`p-4 rounded-2xl border space-y-1.5 ${
                    item.valid 
                      ? "bg-emerald-50/50 border-emerald-200/80" 
                      : "bg-rose-50/50 border-rose-200/80"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {item.valid ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <PackageX className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <h4 className={`text-xs font-bold ${item.valid ? "text-emerald-900" : "text-rose-900"}`}>
                      {item.title}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-800">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p>
                <span className="font-bold">Important Note:</span> For unboxing issues or damaged products, keeping a quick video proof while opening your parcel helps expedite immediate approval.
              </p>
            </div>
          </div>

          {/* Right Column: Online Return Request Form (Col 5) */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-md space-y-6">
            <div className="border-b border-slate-100 pb-4 space-y-1">
              <h3 className="text-xl font-black text-[#002884]">Submit Return Request</h3>
              <p className="text-xs text-slate-500">Request item exchange or cash refund</p>
            </div>

            {submitted ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="font-black text-emerald-900 text-base">Request Submitted!</h4>
                <p className="text-xs text-emerald-700 leading-relaxed">
                  Your return ticket for Order <span className="font-bold">#{orderId.toUpperCase()}</span> has been recorded. Our support agent will call you at <span className="font-bold">{phone}</span> shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="inline-block text-xs font-bold text-[#002884] underline pt-2 cursor-pointer"
                >
                  Submit Another Request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitReturn} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Order Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SHP-2026-8891"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#002884]/30 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Contact Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 01734-340066"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#002884]/30"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Reason for Return</label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#002884]/30 font-medium"
                  >
                    <option>Damaged or Defective Item</option>
                    <option>Received Wrong Product</option>
                    <option>Expired or Missing Seal</option>
                    <option>Quality / Expectation Issue</option>
                    <option>Other Reason</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Additional Details</label>
                  <textarea
                    rows={3}
                    placeholder="Describe product condition or issue..."
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#002884]/30"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#002884] hover:bg-[#E50914] text-white font-bold text-xs py-3 px-6 rounded-xl shadow-md transition flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" /> Submit Return Ticket
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Need Help Banner */}
        <div className="bg-gradient-to-r from-slate-900 to-[#002884] rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-lg font-black">Need assistance with your return?</h4>
            <p className="text-xs text-blue-200">Our customer support hotline is open 7 days a week.</p>
          </div>
          <a
            href="tel:01734340066"
            className="bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold text-xs px-6 py-3 rounded-full transition shadow-md whitespace-nowrap shrink-0"
          >
            Call Support: 01734-340066
          </a>
        </div>

      </div>
    </div>
  );
}
