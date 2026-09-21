"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  HelpCircle, 
  ChevronDown, 
  Search, 
  Truck, 
  RotateCcw, 
  CreditCard, 
  ShieldCheck, 
  MessageCircleQuestion,
  Phone
} from "lucide-react";
import { API_V1 } from "@/lib/api";

export default function FAQPage() {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  useEffect(() => {
    fetch(`${API_V1}/faqs`)
      .then((res) => res.json())
      .then((data) => {
        const list = data?.data || (Array.isArray(data) ? data : []);
        if (Array.isArray(list) && list.length > 0) {
          const mapped = list.map((f: any) => ({
            category: f.category?.name || f.category || "General",
            q: f.question || f.q,
            a: f.answer || f.a,
          }));
          setFaqs(mapped);
        }
      })
      .catch(() => {});
  }, []);

  const categories = ["All", "Orders & Shipping", "Returns & Refunds", "Payments", "Products & Quality"];

  const faqData = [
    {
      category: "Orders & Shipping",
      q: "How can I track my shipment package?",
      a: "Simply click 'Track Order' in the website header or visit /track-order and enter your Order Number (e.g. SHP-2026-8891) for live courier updates."
    },
    {
      category: "Orders & Shipping",
      q: "What courier partners do you use for delivery?",
      a: "We work with Bangladesh's most reliable courier logistics partners: Steadfast Express, Pathao Courier, Sundarban Courier, and SA Paribahan."
    },
    {
      category: "Orders & Shipping",
      q: "What are your delivery charges and timelines?",
      a: "Inside Dhaka City delivery is ৳80 (24–48 hrs) and Outside Dhaka (All 64 Districts) is ৳120 (2–4 days)."
    },
    {
      category: "Orders & Shipping",
      q: "Can I inspect the parcel before paying Cash on Delivery?",
      a: "Yes! All Door Step BD packages permit customer parcel inspection in front of the courier rider before handing over Cash on Delivery."
    },
    {
      category: "Returns & Refunds",
      q: "What is your return & exchange policy?",
      a: "We offer a 7-day hassle-free replacement and money-back guarantee for damaged items, wrong deliveries, or broken seals."
    },
    {
      category: "Returns & Refunds",
      q: "How do I request a product return?",
      a: "You can submit an online return ticket at /returns with your Order Number and phone number."
    },
    {
      category: "Returns & Refunds",
      q: "How fast do I receive my refund money?",
      a: "Once the returned parcel is verified by our team, refunds are issued within 24 to 48 hours via bKash, Nagad, or Bank Transfer."
    },
    {
      category: "Payments",
      q: "What payment methods are supported on Door Step BD?",
      a: "We accept 100% Cash on Delivery (COD) nationwide, as well as bKash, Nagad, Visa, Mastercard, and DBBL Rocket digital payments."
    },
    {
      category: "Payments",
      q: "Is Cash on Delivery available outside Dhaka?",
      a: "Yes! Cash on Delivery is available across all 64 districts in Bangladesh without any advance payment requirements."
    },
    {
      category: "Products & Quality",
      q: "Are all products 100% authentic and organic?",
      a: "Yes, 100%! All organic foods, supplements, and skin care products are directly imported or sourced from certified authentic producers."
    }
  ];

  const activeFaqs = faqs.length > 0 ? faqs : faqData;
  const filteredFaqs = activeFaqs.filter((item) => {
    const matchesCat = activeCategory === "All" || item.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch = item.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.a.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="bg-slate-50 min-h-screen font-sans space-y-12 pb-20">
      
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-[#002884] via-[#0A3299] to-[#E50914] text-white py-14 sm:py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-4 relative z-10">
          <span className="inline-flex items-center gap-2 bg-amber-400/20 border border-amber-300/30 text-amber-300 font-bold text-xs px-4 py-1.5 rounded-full uppercase tracking-wider">
            <HelpCircle className="w-4 h-4 text-amber-400" /> Help Center &amp; Support
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-wide leading-tight">
            Frequently Asked Questions
          </h1>
          <p className="max-w-2xl mx-auto text-blue-100 text-xs sm:text-sm leading-relaxed">
            Have questions about your order, shipping, returns, or payments? Find quick answers below.
          </p>

          {/* Search Bar inside Hero */}
          <div className="max-w-xl mx-auto pt-2 relative">
            <input
              type="text"
              placeholder="Search questions (e.g. tracking, refund, delivery rate)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/95 border border-white/20 rounded-full pl-6 pr-12 py-3.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:bg-white focus:ring-4 focus:ring-amber-400/30 text-left shadow-lg placeholder:text-slate-400"
            />
            <Search className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 space-y-8">
        
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 justify-start sm:justify-center">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? "bg-[#002884] text-white shadow-xs"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Accordion FAQ Items List */}
        {filteredFaqs.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
            <MessageCircleQuestion className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No FAQs Matched</h3>
            <p className="text-xs text-slate-400">Try adjusting your search terms or filter category.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFaqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs transition duration-200"
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-extrabold text-slate-900 text-xs sm:text-sm hover:text-[#002884] transition"
                  >
                    <span className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-[#002884] shrink-0" />
                      {faq.q}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180 text-[#002884]" : ""}`} />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Still Have Questions CTA */}
        <div className="bg-gradient-to-r from-[#002884] via-[#0A3299] to-[#E50914] rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg font-black">Still have questions?</h3>
            <p className="text-xs text-blue-200">Our customer support team is available 7 days a week.</p>
          </div>
          <a
            href="tel:01734340066"
            className="bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold text-xs px-6 py-3 rounded-full transition shadow-md whitespace-nowrap shrink-0 flex items-center gap-2"
          >
            <Phone className="w-4 h-4" /> Call 01734-340066
          </a>
        </div>

      </div>
    </div>
  );
}
