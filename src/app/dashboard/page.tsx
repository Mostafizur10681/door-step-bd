"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useShop } from "@/context/ShopContext";
import { 
  changeAuthPassword,
  getServices,
  ApiService,
  getMediaUrl,
  getContactSettings,
  ApiContactSettings
} from "@/lib/api";
import {
  User,
  Edit3,
  Trash2,
  LogOut,
  CheckCircle2,
  PhoneCall,
  Mail,
  MapPin,
  Save,
  AlertTriangle,
  Lock,
  ChevronRight,
  Sparkles,
  Zap,
  Wrench,
  ShieldCheck,
  Building2,
  Clock,
  ArrowRight,
  Headset
} from "lucide-react";

const FALLBACK_SERVICES: ApiService[] = [
  {
    id: 1,
    title: "Solar & Hybrid Power Solutions",
    slug: "solar-power-solutions",
    image: "https://images.unsplash.com/photo-1509391365360-2e959784a276?q=80&w=800&auto=format&fit=crop",
    short_description: "Turnkey commercial & industrial rooftop solar PV installations, Tier-1 panels, and net metering integration.",
    status: "active"
  },
  {
    id: 2,
    title: "Industrial Generator Maintenance & Overhaul",
    slug: "maintenance-overhaul",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800&auto=format&fit=crop",
    short_description: "24/7 emergency response, major engine overhaul, cylinder head skimming, and computerized diagnostic checks.",
    status: "active"
  },
  {
    id: 3,
    title: "Substation & HT/LT Switchgear Engineering",
    slug: "electricity-substation",
    image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=800&auto=format&fit=crop",
    short_description: "11kV/0.415kV substation engineering, HT vacuum circuit breakers, LT distribution boards, and PFI panels.",
    status: "active"
  },
  {
    id: 4,
    title: "Power Plant Construction & Acoustic Canopy",
    slug: "construction-erection",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800&auto=format&fit=crop",
    short_description: "Heavy reinforced generator foundation, acoustic canopy room soundproofing, and exhaust piping installation.",
    status: "active"
  },
  {
    id: 5,
    title: "Harmonic Audits & Energy Optimization",
    slug: "engineering-energy-audits",
    image: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?q=80&w=800&auto=format&fit=crop",
    short_description: "Active harmonic filtration (AHF), load calculations, power factor improvement, and energy audits.",
    status: "active"
  },
  {
    id: 6,
    title: "Automated Synchronization & ATS Panels",
    slug: "automated-systems-sync",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop",
    short_description: "Multi-genset load sharing, automated transfer switches (ATS), SCADA telemetry, and remote monitoring.",
    status: "active"
  }
];

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout, updateProfile, deleteAccount, showToast } = useShop();

  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<"overview" | "profile" | "password" | "delete">("overview");

  useEffect(() => {
    if (tabParam === "profile" || tabParam === "password" || tabParam === "delete") {
      setActiveTab(tabParam as any);
    }
  }, [tabParam]);

  // Profile Edit State
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Dynamic Services & Contact State
  const [services, setServices] = useState<ApiService[]>(FALLBACK_SERVICES);
  const [contactPhone, setContactPhone] = useState("01734340066");

  // Feedback states
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileFieldErrors, setProfileFieldErrors] = useState<Record<string, string[]>>({});
  const [passwordFieldErrors, setPasswordFieldErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (!user) {
      router.push("/account");
    } else {
      setEditName(user.name);
      setEditEmail(user.email);
      setEditPhone(user.phone);
      setEditAddress(user.address);
    }
  }, [user, router]);

  // Fetch dynamic services and contact info
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      if (!user) return;
      try {
        const [servicesRes, contactRes] = await Promise.allSettled([
          getServices({ all: 1 }),
          getContactSettings()
        ]);

        if (!isMounted) return;

        if (servicesRes.status === "fulfilled" && servicesRes.value?.success && Array.isArray(servicesRes.value.data) && servicesRes.value.data.length > 0) {
          setServices(servicesRes.value.data);
        }

        if (contactRes.status === "fulfilled" && contactRes.value?.success && contactRes.value.data) {
          const c = contactRes.value.data as ApiContactSettings;
          if (c.phone) setContactPhone(c.phone);
        }
      } catch {
        // Fallback gracefully
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, [user]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);
    setProfileFieldErrors({});
    setIsSavingProfile(true);
    try {
      await updateProfile({
        name: editName,
        email: editEmail,
        phone: editPhone,
        address: editAddress
      });
      setProfileSuccess("Profile updated successfully!");
    } catch (err: any) {
      if (err?.errors) {
        setProfileFieldErrors(err.errors);
      }
      setProfileError(err.message || "Failed to update profile.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);
    setPasswordFieldErrors({});

    if (!currentPassword) {
      const msg = "Please enter your current password!";
      setPasswordError(msg);
      showToast(msg);
      return;
    }
    if (newPassword !== confirmPassword) {
      const msg = "New password and confirm password do not match!";
      setPasswordError(msg);
      showToast(msg);
      return;
    }
    if (newPassword.length < 6) {
      const msg = "Password must be at least 6 characters long!";
      setPasswordError(msg);
      showToast(msg);
      return;
    }

    setIsSavingPassword(true);
    try {
      const res = await changeAuthPassword({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword
      });
      if (res && res.success) {
        const msg = res.message || "Password changed successfully!";
        setPasswordSuccess(msg);
        showToast(msg);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const msg = res?.message || "Failed to update password.";
        setPasswordError(msg);
        showToast(msg);
      }
    } catch (err: any) {
      if (err?.errors) {
        setPasswordFieldErrors(err.errors);
      }
      const msg = err.message || "Failed to update password. Please verify your current password.";
      setPasswordError(msg);
      showToast(msg);
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm("Are you sure you want to permanently delete your account? All your profile information and saved preferences will be wiped permanently.")) {
      setIsDeletingAccount(true);
      try {
        await deleteAccount();
        router.push("/");
      } catch (err: any) {
        showToast(err.message || "Failed to delete account. Please try again.");
      } finally {
        setIsDeletingAccount(false);
      }
    }
  };

  const cleanPhoneLink = `tel:${contactPhone.replace(/[^0-9+]/g, "")}`;

  if (!user) return null;

  return (
    <div className="bg-slate-50 min-h-screen font-sans py-8 sm:py-10 pb-20">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* 1. Top Header Banner (Industrial Navy & Gold Gradient) */}
        <div className="bg-gradient-to-r from-[#122B5A] via-[#1A3D7C] to-[#0B1B38] rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,184,0,0.15),transparent_50%)] pointer-events-none" />
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#FFB800]/15 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex items-center gap-4 relative z-10">
            <div className="relative w-16 h-16 rounded-2xl bg-white/10 border-2 border-[#FFB800]/40 flex items-center justify-center font-black text-2xl text-[#FFB800] shrink-0 overflow-hidden shadow-inner">
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.name}
                  fill
                  className="object-cover"
                />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 bg-[#FFB800]/20 border border-[#FFB800]/40 text-[#FFB800] font-black text-[10px] sm:text-[11px] px-3 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                <Sparkles className="w-3 h-3 text-[#FFB800]" />
                <span>Authorized Client Portal</span>
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Welcome back, {user.name}!
              </h1>
              <p className="text-xs text-blue-100">{user.email} • {user.phone}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 relative z-10 w-full md:w-auto justify-end">
            <a
              href={cleanPhoneLink}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition flex items-center gap-2 shadow-md cursor-pointer"
              title="24/7 Rapid Emergency Support"
            >
              <PhoneCall className="w-4 h-4 text-emerald-200" />
              <span>24/7 Hotline</span>
            </a>
            <button
              type="button"
              onClick={() => {
                logout();
                router.push("/account");
              }}
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>

        {/* 2. Dashboard 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Navigation Sidebar (Col 3) - Clean Informational Menu */}
          <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200/80 p-4 shadow-xs space-y-1.5">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${activeTab === "overview"
                  ? "bg-[#122B5A] text-[#FFB800] shadow-md shadow-[#122B5A]/20"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
            >
              <User className="w-4 h-4" /> Dashboard Overview
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${activeTab === "profile"
                  ? "bg-[#122B5A] text-[#FFB800] shadow-md shadow-[#122B5A]/20"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
            >
              <Edit3 className="w-4 h-4" /> Company &amp; Profile Info
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("password")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${activeTab === "password"
                  ? "bg-[#122B5A] text-[#FFB800] shadow-md shadow-[#122B5A]/20"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
            >
              <Lock className="w-4 h-4" /> Security &amp; Password
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("delete")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${activeTab === "delete"
                  ? "bg-rose-600 text-white shadow-md shadow-rose-600/20"
                  : "text-rose-600 hover:bg-rose-50"
                }`}
            >
              <Trash2 className="w-4 h-4" /> Delete Account
            </button>
          </div>

          {/* Right Tab Content Container (Col 9) */}
          <div className="lg:col-span-9 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">

            {/* 1. OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-xl font-black text-[#122B5A]">
                      Account &amp; Engineering Overview
                    </h2>
                    <p className="text-xs text-slate-500">Real-time status of your engineering support access, facility profile, and active service packages</p>
                  </div>
                  <Link
                    href="/contact-us"
                    className="inline-flex items-center gap-2 bg-[#FFB800] hover:bg-[#E6A600] text-[#122B5A] text-xs font-black px-4 py-2 rounded-xl transition shadow-xs cursor-pointer self-start sm:self-auto"
                  >
                    <Headset className="w-3.5 h-3.5" />
                    <span>Request Site Survey</span>
                  </Link>
                </div>

                {/* Status Badges Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Client Status</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="text-lg font-black text-emerald-700">Verified Client</div>
                    <p className="text-[11px] text-slate-500">Access to priority technical hotline &amp; site consultations</p>
                  </div>

                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Emergency SLA</span>
                      <Clock className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="text-lg font-black text-[#122B5A]">24/7 Rapid Dispatch</div>
                    <a href={cleanPhoneLink} className="text-[11px] font-bold text-amber-700 hover:underline block">Call: {contactPhone}</a>
                  </div>

                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Engineering Solutions</span>
                      <Zap className="w-4 h-4 text-[#FFB800]" />
                    </div>
                    <div className="text-lg font-black text-[#122B5A]">Nationwide 64 Districts</div>
                    <Link href="/services" className="text-[11px] font-bold text-[#122B5A] hover:underline block">Explore All Services &rarr;</Link>
                  </div>
                </div>

                {/* AVAILABLE ENGINEERING SERVICES SECTION */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-black text-[#122B5A] flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-[#FFB800]" />
                        <span>Available Engineering Services &amp; Solutions</span>
                      </h3>
                      <p className="text-xs text-slate-500">Turnkey engineering packages ready for on-demand dispatch or annual contract (AMC)</p>
                    </div>
                    <Link
                      href="/services"
                      className="text-xs font-bold text-[#122B5A] hover:underline cursor-pointer hidden sm:inline"
                    >
                      Browse All Services &rarr;
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {services.map((svc, idx) => {
                      const img = svc.image 
                        ? (svc.image.startsWith("data:") ? svc.image : getMediaUrl(svc.image))
                        : (FALLBACK_SERVICES[idx % FALLBACK_SERVICES.length].image as string);

                      return (
                        <div
                          key={svc.id || idx}
                          className="bg-slate-50 hover:bg-white border border-slate-200 hover:border-[#122B5A]/40 rounded-2xl p-4 transition-all duration-300 shadow-2xs hover:shadow-md flex flex-col justify-between space-y-3 group"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-900 relative shrink-0 border border-slate-200">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={img} alt={svc.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                            </div>
                            <div className="space-y-1 min-w-0">
                              <span className="inline-block text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                                Available
                              </span>
                              <h4 className="text-xs sm:text-sm font-black text-[#122B5A] group-hover:text-[#0B1B38] transition truncate">
                                {svc.title}
                              </h4>
                              <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                                {svc.short_description || "Certified engineering diagnostic, installation, and preventative field maintenance."}
                              </p>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between gap-2">
                            <Link
                              href={`/services/${svc.slug || svc.id}`}
                              className="text-xs font-bold text-[#122B5A] hover:text-[#FFB800] transition flex items-center gap-1"
                            >
                              <span>View Specs</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </Link>

                            <Link
                              href="/contact-us"
                              className="bg-[#122B5A] hover:bg-[#0A1D3D] text-[#FFB800] text-[11px] font-bold px-3 py-1.5 rounded-lg transition shadow-2xs"
                            >
                              Request Consultation
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Profile Details Card */}
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 text-sm">Account &amp; Facility Contact Information</h3>
                    <button onClick={() => setActiveTab("profile")} className="text-xs font-bold text-[#122B5A] hover:underline cursor-pointer">Edit Info</button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block font-medium">Full Name:</span>
                      <span className="font-bold text-slate-800">{user.name}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Email Address:</span>
                      <span className="font-bold text-slate-800">{user.email}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Phone Number:</span>
                      <span className="font-bold text-slate-800">{user.phone}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Default Facility / Site Address:</span>
                      <span className="font-bold text-slate-800">{user.address || "Not specified"}</span>
                    </div>
                  </div>
                </div>

                {/* 24/7 Technical Support Callout */}
                <div className="bg-gradient-to-r from-[#122B5A] to-[#0B1B38] text-white rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border border-[#FFB800]/20 shadow-md">
                  <div className="space-y-1 text-center sm:text-left">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#FFB800]">24/7 Field Engineering Support</span>
                    <h4 className="text-base font-black">Need Urgent On-Site Diagnostic or Technical Survey?</h4>
                    <p className="text-xs text-blue-100">Our senior electrical and generator field engineers are ready for rapid dispatch.</p>
                  </div>
                  <a
                    href={cleanPhoneLink}
                    className="bg-[#FFB800] hover:bg-[#E6A600] text-[#122B5A] text-xs font-black px-6 py-2.5 rounded-xl transition shadow-md whitespace-nowrap"
                  >
                    Call: {contactPhone}
                  </a>
                </div>

              </div>
            )}

            {/* 2. UPDATE PROFILE TAB */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <h2 className="text-xl font-black text-[#122B5A] border-b border-slate-100 pb-3">
                  Update Account &amp; Facility Profile
                </h2>

                {/* Profile Error Banner */}
                {profileError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-4 rounded-2xl flex items-start gap-3 animate-in fade-in duration-200">
                    <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-rose-800">Update Failed</h4>
                      <p className="mt-0.5 text-rose-600 font-medium">{profileError}</p>
                    </div>
                  </div>
                )}

                {/* Profile Success Banner */}
                {profileSuccess && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-4 rounded-2xl flex items-start gap-3 animate-in fade-in duration-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-emerald-800">Success</h4>
                      <p className="mt-0.5 text-emerald-600 font-medium">{profileSuccess}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleProfileSave} className="space-y-5 w-full">

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">Full Name</label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#122B5A]/30"
                    />
                    {profileFieldErrors.name && (
                      <p className="text-rose-500 text-[11px] mt-1 font-semibold">{profileFieldErrors.name[0]}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">Email Address</label>
                    <input
                      type="email"
                      required
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#122B5A]/30"
                    />
                    {profileFieldErrors.email && (
                      <p className="text-rose-500 text-[11px] mt-1 font-semibold">{profileFieldErrors.email[0]}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#122B5A]/30"
                    />
                    {profileFieldErrors.phone && (
                      <p className="text-rose-500 text-[11px] mt-1 font-semibold">{profileFieldErrors.phone[0]}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">Default Facility / Site Delivery Address</label>
                    <textarea
                      rows={3}
                      required
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#122B5A]/30"
                    />
                    {profileFieldErrors.address && (
                      <p className="text-rose-500 text-[11px] mt-1 font-semibold">{profileFieldErrors.address[0]}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="bg-[#122B5A] hover:bg-[#0A1D3D] disabled:opacity-60 disabled:cursor-not-allowed text-[#FFB800] font-bold text-xs px-6 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 mt-4 cursor-pointer"
                  >
                    <Save className={`w-4 h-4 ${isSavingProfile ? "animate-spin" : ""}`} />
                    {isSavingProfile ? "Saving Profile..." : "Save Profile Details"}
                  </button>
                </form>
              </div>
            )}

            {/* 3. CHANGE PASSWORD TAB */}
            {activeTab === "password" && (
              <div className="space-y-6">
                <h2 className="text-xl font-black text-[#122B5A] border-b border-slate-100 pb-3 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-[#122B5A]" /> Change Security Password
                </h2>

                {/* Error Banner */}
                {passwordError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-4 rounded-2xl flex items-start gap-3 animate-in fade-in duration-200">
                    <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-rose-800">Password Update Failed</h4>
                      <p className="mt-0.5 text-rose-600 font-medium">{passwordError}</p>
                    </div>
                  </div>
                )}

                {/* Success Banner */}
                {passwordSuccess && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-4 rounded-2xl flex items-start gap-3 animate-in fade-in duration-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-emerald-800">Success</h4>
                      <p className="mt-0.5 text-emerald-600 font-medium">{passwordSuccess}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handlePasswordSave} className="space-y-4 w-full">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">Current Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => {
                        setCurrentPassword(e.target.value);
                        setPasswordError(null);
                        setPasswordSuccess(null);
                        setPasswordFieldErrors({});
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#122B5A]/30"
                    />
                    {passwordFieldErrors.current_password && (
                      <p className="text-rose-500 text-[11px] mt-1 font-semibold">{passwordFieldErrors.current_password[0]}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">New Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setPasswordError(null);
                        setPasswordSuccess(null);
                        setPasswordFieldErrors({});
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#122B5A]/30"
                    />
                    {passwordFieldErrors.password && (
                      <p className="text-rose-500 text-[11px] mt-1 font-semibold">{passwordFieldErrors.password[0]}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">Confirm New Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setPasswordError(null);
                        setPasswordSuccess(null);
                        setPasswordFieldErrors({});
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#122B5A]/30"
                    />
                    {passwordFieldErrors.password_confirmation && (
                      <p className="text-rose-500 text-[11px] mt-1 font-semibold">{passwordFieldErrors.password_confirmation[0]}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSavingPassword}
                    className="bg-[#122B5A] hover:bg-[#0A1D3D] disabled:opacity-60 disabled:cursor-not-allowed text-[#FFB800] font-bold text-xs px-6 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 mt-4 cursor-pointer"
                  >
                    <Save className={`w-4 h-4 ${isSavingPassword ? "animate-spin" : ""}`} />
                    {isSavingPassword ? "Updating Password..." : "Update Password"}
                  </button>
                </form>
              </div>
            )}

            {/* 4. DELETE ACCOUNT TAB */}
            {activeTab === "delete" && (
              <div className="space-y-6">
                <h2 className="text-xl font-extrabold text-rose-600 border-b border-slate-100 pb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" /> Danger Zone: Delete Account
                </h2>

                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 space-y-4">
                  <div>
                    <h3 className="font-bold text-rose-900 text-sm">Permanent Account Deletion</h3>
                    <p className="text-xs text-rose-700 leading-relaxed mt-1">
                      Deleting your account is permanent and irreversible. Once deleted:
                    </p>
                    <ul className="mt-2 list-disc list-inside text-xs text-rose-700 space-y-1">
                      <li>Your client profile, name, phone, and saved facility addresses will be permanently removed.</li>
                      <li>Your session tokens will be revoked immediately.</li>
                      <li>You will need to register a new account if you wish to submit site tickets again.</li>
                    </ul>
                  </div>

                  <div className="pt-2 border-t border-rose-200/60">
                    <button
                      type="button"
                      disabled={isDeletingAccount}
                      onClick={handleDeleteAccount}
                      className="bg-rose-600 hover:bg-rose-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Trash2 className={`w-4 h-4 ${isDeletingAccount ? "animate-spin" : ""}`} />
                      {isDeletingAccount ? "Deleting Account..." : "Confirm Account Deletion"}
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="bg-slate-50 min-h-screen flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-[#122B5A] border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
