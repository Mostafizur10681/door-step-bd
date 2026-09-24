"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageSquare,
  Send,
  CheckCircle2,
  AlertCircle,
  Headphones,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  ArrowRight,
  Building
} from "lucide-react";
import { getContactSettings, sendContactMessage, ApiContactSettings, getFaqs } from "@/lib/api";

const iconMap: Record<string, any> = {
  Headphones,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Phone,
  Mail,
  Clock,
  MapPin,
  MessageSquare
};

export default function ContactUsPage() {
  const [settings, setSettings] = useState<ApiContactSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [faqs, setFaqs] = useState<any[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    async function loadData() {
      try {
        const [settingsRes, faqsRes] = await Promise.allSettled([
          getContactSettings(),
          getFaqs()
        ]);

        if (settingsRes.status === "fulfilled" && settingsRes.value?.data) {
          const s = settingsRes.value.data;
          setSettings(s);
          if (s.form_topics && s.form_topics.length > 0) {
            setFormData(prev => ({
              ...prev,
              subject: prev.subject || s.form_topics![0]
            }));
          }
        }

        if (faqsRes.status === "fulfilled" && faqsRes.value?.success && Array.isArray(faqsRes.value.data)) {
          const mapped = faqsRes.value.data.map((f: any) => ({
            q: f.question || f.q,
            a: f.answer || f.a,
          }));
          setFaqs(mapped);
        }
      } catch (err) {
        console.error("Error loading contact page data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });
    setFieldErrors({});

    try {
      if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
        throw new Error("Please complete all required fields (Name, Email, and Message).");
      }

      const res = await sendContactMessage({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        subject: formData.subject || "General Inquiry",
        message: formData.message.trim()
      });

      if (res?.success) {
        setSubmitStatus({
          type: "success",
          message: res.message || "Thank you! Your message has been received. Our team will get back to you shortly."
        });
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: settings?.form_topics?.[0] || "General Inquiry",
          message: ""
        });
      } else {
        throw new Error(res?.message || "Failed to submit message. Please try again.");
      }
    } catch (err: any) {
      if (err?.errors) {
        setFieldErrors(err.errors);
      }
      setSubmitStatus({
        type: "error",
        message: err?.message || "An unexpected error occurred. Please try contacting us via phone or WhatsApp."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fallback defaults
  const badgeText = settings?.badge_text || "💬 Get in Touch • 24/7 Dedicated Support";
  const heroTitle = settings?.hero_title || "We're Here to Help You Thrive";
  const heroSubtitle =
    settings?.hero_subtitle ||
    "Have questions about our authentic organic products, order delivery, or partnership opportunities? Reach out to our friendly team anytime.";
  const phone = settings?.phone || "+880 1800-000000";
  const secondaryPhone = settings?.secondary_phone || "+880 1700-000000";
  const email = (settings?.email || "support@doorstepbd.com").replace(/@shopia\.com|@shopiabd\.com/gi, "@doorstepbd.com");
  const secondaryEmail = (settings?.secondary_email || "wholesale@doorstepbd.com").replace(/@shopia\.com|@shopiabd\.com/gi, "@doorstepbd.com");
  const whatsappNumber = settings?.whatsapp_number || "8801800000000";
  const address = settings?.address || "41/1, Sher-E-Bangla Rd, Mohammadpur, Dhaka 1207";
  const businessHoursWeekday = settings?.business_hours_weekday || "Saturday - Thursday: 9:00 AM - 10:00 PM";
  const businessHoursWeekend = settings?.business_hours_weekend || "Friday: 3:00 PM - 10:00 PM";
  const responseTimeNote = settings?.response_time_note || "Average reply time: Under 15 mins during business hours";
  const mapTitle = settings?.map_title || "Visit Our Store & Experience Center";
  const mapSubtitle =
    settings?.map_subtitle || "Experience our 100% natural, fresh organic food & wellness products in person.";
  const mapUrl =
    settings?.map_url ||
    "https://maps.google.com/maps?q=Mohammadpur%2C%20Dhaka&t=&z=14&ie=UTF8&iwloc=&output=embed";
  const locationDirections =
    settings?.location_directions || "Near Mohammadpur Bus Stand, easy parking available for shoppers.";
  const formTitle = settings?.form_title || "Send Us a Message";
  const formSubtitle =
    settings?.form_subtitle ||
    "Fill out the form below and our customer care team will get in touch with you within 24 hours.";
  const emergencyNotice =
    settings?.emergency_notice ||
    "⚡ Fast Order Hotline: For immediate order modifications or urgent delivery inquiries, call our hotline directly.";
  const formTopics = settings?.form_topics || [
    "Order Tracking & Delivery Status",
    "Product Inquiry & Authenticity",
    "Returns, Refunds & Replacements",
    "Wholesale & B2B Bulk Orders",
    "Payment & Billing Assistance",
    "Other General Inquiries"
  ];
  const features = settings?.features || [
    {
      icon: "Headphones",
      title: "24/7 Dedicated Care",
      desc: "Friendly support team ready to assist via live phone, email & chat."
    },
    {
      icon: "ShieldCheck",
      title: "100% Genuine Products",
      desc: "All items tested and directly sourced with authenticity guarantee."
    },
    {
      icon: "Truck",
      title: "Nationwide Delivery",
      desc: "Fast delivery across 64 districts in Bangladesh with open parcel check."
    },
    {
      icon: "RotateCcw",
      title: "7-Day Easy Returns",
      desc: "Hassle-free replacement or refund for damaged or inaccurate orders."
    }
  ];
  const supportTitle = settings?.support_title || "Need Immediate Assistance?";
  const supportDesc =
    settings?.support_desc || "Our customer service specialists are active and eager to assist you right now.";
  const supportPhone = settings?.support_phone || phone;
  const supportImage = settings?.support_image;

  // Clean WhatsApp phone number for link
  const cleanWaNumber = whatsappNumber.replace(/[^0-9]/g, "");

  const defaultFaqs = [
    {
      q: "How soon will I receive a reply to my contact form inquiry?",
      a: "Our customer support team typically responds within 15 to 30 minutes during active business hours (9:00 AM - 10:00 PM), and within 12 hours during holidays or overnight."
    },
    {
      q: "Can I place or modify an urgent order directly over WhatsApp or phone?",
      a: "Yes! You can message our WhatsApp helpline or call our direct phone hotline to place instant orders, change delivery addresses, or add items to existing pending orders."
    },
    {
      q: "Where is your physical outlet / showroom located?",
      a: `Our flagship showroom is located at ${address}. You are welcome to visit during our open hours to inspect and purchase products in person.`
    },
    {
      q: "What is the procedure for returning a damaged product?",
      a: "Simply take a quick photo of the parcel and defective item, contact our support team via WhatsApp or the contact form, and we will arrange a free exchange or full refund within 48 hours."
    }
  ];

  const displayFaqs = faqs.length > 0 ? faqs.slice(0, 5) : defaultFaqs;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* 1. Emergency Hotline & Response Strip */}
      {emergencyNotice && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-slate-950 py-2.5 px-4 shadow-sm">
          <div className="max-w-[1500px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-bold text-center sm:text-left">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-950"></span>
              </span>
              <span>{emergencyNotice}</span>
            </div>
            <a
              href={`tel:${phone.replace(/\s+/g, "")}`}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-950 hover:bg-slate-900 text-white text-[11px] font-bold rounded-lg transition-all shadow-xs"
            >
              <Phone className="w-3 h-3 text-amber-400" />
              <span>Call Hotline Now</span>
            </a>
          </div>
        </div>
      )}

      {/* 2. Hero Header Section matching Delivery Page Gradient */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#122B5A] via-[#0A3299] to-[#E50914] text-white pt-16 pb-28 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_50%)] pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#FFB800]/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#122B5A]/30 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-4xl mx-auto text-center space-y-4 z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{badgeText}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            {heroTitle}
          </h1>

          <p className="text-sm sm:text-base text-blue-100/90 max-w-2xl mx-auto leading-relaxed">
            {heroSubtitle}
          </p>
        </div>
      </section>

      {/* 3. Four Core Communication Cards (Floating Overlap) */}
      <section className="relative max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 -mt-16 z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">

          {/* Card 1: Direct Hotline */}
          <div className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-900/5 border border-slate-100 flex flex-col justify-between hover:border-[#122B5A]/50 hover:shadow-[#122B5A]/10 transition-all duration-300 group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#122B5A]/10 text-[#122B5A] flex items-center justify-center group-hover:scale-110 group-hover:bg-[#122B5A] group-hover:text-white transition-all duration-300 shadow-sm">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Phone Support</h3>
                <p className="text-xs text-slate-500">Live agents available daily</p>
              </div>
              <div className="space-y-1">
                <a
                  href={`tel:${phone.replace(/\s+/g, "")}`}
                  className="block font-bold text-sm text-slate-900 hover:text-[#122B5A] transition-colors"
                >
                  {phone}
                </a>
                {secondaryPhone && (
                  <a
                    href={`tel:${secondaryPhone.replace(/\s+/g, "")}`}
                    className="block font-medium text-xs text-slate-500 hover:text-[#122B5A] transition-colors"
                  >
                    {secondaryPhone}
                  </a>
                )}
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#122B5A]" />
              <span className="truncate">{businessHoursWeekday}</span>
            </div>
          </div>

          {/* Card 2: WhatsApp Chat */}
          <div className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-900/5 border border-slate-100 flex flex-col justify-between hover:border-[#122B5A]/50 hover:shadow-[#122B5A]/10 transition-all duration-300 group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#122B5A]/10 text-[#122B5A] flex items-center justify-center group-hover:scale-110 group-hover:bg-[#122B5A] group-hover:text-white transition-all duration-300 shadow-sm">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">WhatsApp Chat</h3>
                <p className="text-xs text-slate-500">Instant order & query support</p>
              </div>
              <div>
                <span className="font-bold text-sm text-slate-900">{whatsappNumber}</span>
                <span className="block text-xs text-[#122B5A] font-semibold mt-0.5">● Online & Ready</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100">
              <a
                href={
                  typeof navigator !== "undefined" &&
                  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
                    ? `https://wa.me/${cleanWaNumber}?text=Hello%20Door%20Step%20BD,%20I%20would%20like%20to%20inquire%20about...`
                    : `https://web.whatsapp.com/send?phone=${cleanWaNumber}&text=Hello%20Door%20Step%20BD,%20I%20would%20like%20to%20inquire%20about...`
                }
                target={
                  typeof navigator !== "undefined" &&
                  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
                    ? "_self"
                    : "_blank"
                }
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#122B5A] hover:text-[#082c63] transition-colors"
              >
                <span>Chat on WhatsApp</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Card 3: Email Channels */}
          <div className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-900/5 border border-slate-100 flex flex-col justify-between hover:border-[#122B5A]/50 hover:shadow-[#122B5A]/10 transition-all duration-300 group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#122B5A]/10 text-[#122B5A] flex items-center justify-center group-hover:scale-110 group-hover:bg-[#122B5A] group-hover:text-white transition-all duration-300 shadow-sm">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Email Support</h3>
                <p className="text-xs text-slate-500">For tickets & wholesale inquiries</p>
              </div>
              <div className="space-y-1">
                <a
                  href={`mailto:${email}`}
                  className="block font-bold text-xs text-slate-900 hover:text-[#122B5A] transition-colors truncate"
                  title={email}
                >
                  {email}
                </a>
                {secondaryEmail && (
                  <a
                    href={`mailto:${secondaryEmail}`}
                    className="block font-medium text-xs text-slate-500 hover:text-[#122B5A] transition-colors truncate"
                    title={secondaryEmail}
                  >
                    {secondaryEmail}
                  </a>
                )}
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#122B5A]" />
              <span className="truncate">{responseTimeNote}</span>
            </div>
          </div>

          {/* Card 4: Store & Location */}
          <div className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-900/5 border border-slate-100 flex flex-col justify-between hover:border-[#122B5A]/50 hover:shadow-[#122B5A]/10 transition-all duration-300 group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#122B5A]/10 text-[#122B5A] flex items-center justify-center group-hover:scale-110 group-hover:bg-[#122B5A] group-hover:text-white transition-all duration-300 shadow-sm">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Showroom / Store</h3>
                <p className="text-xs text-slate-500">Visit us in person</p>
              </div>
              <p className="text-xs text-slate-700 font-medium line-clamp-2 leading-relaxed">
                {address}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-[#122B5A]" />
              <span className="truncate">{locationDirections}</span>
            </div>
          </div>

        </div>
      </section>

      {/* 4. Brand Trust Promises / Feature Badges */}
      <section className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => {
            const IconComp = (feat.icon && iconMap[feat.icon]) ? iconMap[feat.icon] : Sparkles;
            return (
              <div key={idx} className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-2xl bg-[#122B5A]/10 text-[#122B5A] flex items-center justify-center shrink-0 shadow-xs border border-[#122B5A]/20">
                  <IconComp className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-xs text-slate-900">{feat.title}</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Main Split Section: Contact Form + Interactive Map & Experience Info */}
      <section className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* Left Column (7 Cols): Contact Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-lg shadow-slate-900/5 space-y-6">
            <div className="space-y-2 border-b border-slate-100 pb-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#122B5A]/10 text-[#122B5A] text-xs font-bold">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Direct Inquiry Desk</span>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">{formTitle}</h2>
              <p className="text-xs text-slate-500 leading-relaxed">{formSubtitle}</p>
            </div>

            {/* Submission Alerts */}
            {submitStatus.type === "success" && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-3 text-xs font-semibold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Message Sent Successfully!</p>
                  <p className="font-normal mt-0.5">{submitStatus.message}</p>
                </div>
              </div>
            )}

            {submitStatus.type === "error" && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3 text-xs font-semibold">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Submission Failed</p>
                  <p className="font-normal mt-0.5">{submitStatus.message}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter Your Name"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#122B5A] focus:ring-2 focus:ring-[#122B5A]/20 font-medium transition-all"
                  />
                  {fieldErrors.name && (
                    <p className="text-rose-500 text-[11px] mt-1 font-semibold">{fieldErrors.name[0]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter Email Address"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#122B5A] focus:ring-2 focus:ring-[#122B5A]/20 font-medium transition-all"
                  />
                  {fieldErrors.email && (
                    <p className="text-rose-500 text-[11px] mt-1 font-semibold">{fieldErrors.email[0]}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Phone / Mobile (Optional)
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. 01800000000"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#122B5A] focus:ring-2 focus:ring-[#122B5A]/20 font-medium transition-all"
                  />
                  {fieldErrors.phone && (
                    <p className="text-rose-500 text-[11px] mt-1 font-semibold">{fieldErrors.phone[0]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Inquiry Topic / Department
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#122B5A] focus:ring-2 focus:ring-[#122B5A]/20 font-medium transition-all"
                  >
                    {formTopics.map((topic, i) => (
                      <option key={i} value={topic}>
                        {topic}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.subject && (
                    <p className="text-rose-500 text-[11px] mt-1 font-semibold">{fieldErrors.subject[0]}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Your Message or Question <span className="text-rose-500">*</span>
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  placeholder="Please describe your question, order number, or product inquiry in detail..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#122B5A] focus:ring-2 focus:ring-[#122B5A]/20 font-medium transition-all leading-relaxed"
                ></textarea>
                {fieldErrors.message && (
                  <p className="text-rose-500 text-[11px] mt-1 font-semibold">{fieldErrors.message[0]}</p>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <p className="text-[11px] text-slate-400">
                  🔒 We protect your data privacy. No spam guaranteed.
                </p>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-[#122B5A] hover:bg-[#082c63] text-white font-bold text-xs shadow-lg shadow-[#122B5A]/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? "Sending..." : "Submit Inquiry"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Column (5 Cols): Map & Showroom Box */}
          <div className="lg:col-span-5 space-y-6">

            {/* Google Map Box */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-lg shadow-slate-900/5 space-y-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#122B5A]/10 text-[#122B5A] text-xs font-bold">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Location Map</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">{mapTitle}</h3>
                <p className="text-xs text-slate-500">{mapSubtitle}</p>
              </div>

              {/* Map Embed Container */}
              <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100 relative">
                {mapUrl ? (
                  <iframe
                    src={mapUrl}
                    className="w-full h-full border-0"
                    allowFullScreen={false}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                    Map preview unavailable
                  </div>
                )}
              </div>

              {/* Address & Hours Summary */}
              <div className="space-y-3 pt-2 text-xs">
                <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <MapPin className="w-4 h-4 text-[#122B5A] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block">Address:</span>
                    <span className="text-slate-600">{address}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-0.5">
                    <span className="font-bold text-slate-900 block">Sat - Thu:</span>
                    <span className="text-slate-600">{businessHoursWeekday}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-0.5">
                    <span className="font-bold text-slate-900 block">Friday:</span>
                    <span className="text-slate-600">{businessHoursWeekend}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Urgent Help / Representative Box with Delivery Signature Gradient */}
            <div className="bg-gradient-to-r from-[#122B5A] via-[#0A3299] to-[#E50914] text-white rounded-3xl p-6 shadow-xl shadow-[#122B5A]/20 border border-white/10 relative overflow-hidden flex flex-col sm:flex-row items-center gap-5">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_50%)] pointer-events-none" />
              <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md overflow-hidden shrink-0 border border-white/20 relative flex items-center justify-center z-10">
                {supportImage ? (
                  <img
                    src={supportImage}
                    alt="Support Representative"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Headphones className="w-10 h-10 text-amber-300" />
                )}
              </div>

              <div className="space-y-2 text-center sm:text-left flex-1 relative z-10">
                <h4 className="font-bold text-base text-white">{supportTitle}</h4>
                <p className="text-xs text-blue-100/90 leading-relaxed">{supportDesc}</p>
                <a
                  href={`tel:${supportPhone.replace(/\s+/g, "")}`}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#FFB800] hover:bg-[#E6A600] text-[#122B5A] font-bold text-xs transition-all shadow-md mt-1 cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call {supportPhone}</span>
                </a>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 6. Frequently Asked Questions Accordion */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#122B5A]/10 text-[#122B5A] text-xs font-bold">
            <HelpCircle className="w-3.5 h-3.5 text-[#122B5A]" />
            <span>Quick Resolution</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-slate-500">
            Need immediate guidance? Here are the most common questions from customers.
          </p>
        </div>

        <div className="space-y-3">
          {displayFaqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden transition-all"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-900 hover:text-[#122B5A] transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-[#122B5A] shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </button>
              {openFaq === idx && (
                <div className="px-6 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-50 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/faq"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#122B5A] hover:text-[#082c63] bg-[#122B5A]/10 hover:bg-[#122B5A]/20 px-5 py-2.5 rounded-xl transition-all"
          >
            <span>Explore All FAQ Support Topics</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

    </div>
  );
}
