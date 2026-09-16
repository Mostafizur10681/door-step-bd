"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useShop } from "@/context/ShopContext";
import { User, Mail, Lock, Phone, ArrowRight, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function AccountPage() {
  const router = useRouter();
  const { user, login, showToast } = useShop();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

    // Client-side validations for register
    if (mode === "register") {
      if (password !== confirmPassword) {
        setError("Passwords do not match! Please check and confirm your password.");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters in length.");
        return;
      }
    }

    setLoading(true);

    if (mode === "login") {
      try {
        const res = await fetch(`${apiUrl}/api/v1/auth/customer/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password: password,
          }),
        });

        const data = await res.json();

        if (res.ok && (data.data?.access_token || data.data?.token || data.access_token || data.token)) {
          const token = data.data?.access_token || data.data?.token || data.access_token || data.token;
          const u = data.data?.user || data.user || {};
          login(
            {
              id: u.id,
              name: u.name || email.split("@")[0] || "Customer",
              email: u.email || email.trim(),
              phone: u.phone || "01681-135030",
              address: u.customer_profile?.shipping_address || u.address || "Dhaka, Bangladesh",
            },
            token
          );
          showToast("Welcome back! Successfully signed in.");
          router.push("/dashboard");
          return;
        } else {
          if (data.errors) {
            setFieldErrors(data.errors);
          }
          const errMsg = data.message || (data.errors ? Object.values(data.errors).flat().join(" ") : "Invalid email or password. Please check your credentials.");
          setError(errMsg);
        }
      } catch {
        setError("Unable to connect to login server. Please make sure the API is running.");
      } finally {
        setLoading(false);
      }
    } else {
      // Register new customer account
      try {
        const res = await fetch(`${apiUrl}/api/v1/auth/customer/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim() || undefined,
            password: password,
            password_confirmation: confirmPassword,
          }),
        });

        const data = await res.json();

        if (res.ok && (data.data?.access_token || data.data?.token || data.access_token || data.token)) {
          const token = data.data?.access_token || data.data?.token || data.access_token || data.token;
          const u = data.data?.user || data.user || {};
          login(
            {
              id: u.id,
              name: u.name || name.trim(),
              email: u.email || email.trim(),
              phone: u.phone || phone.trim() || "01700-000000",
              address: u.customer_profile?.shipping_address || u.address || "Dhaka, Bangladesh",
            },
            token
          );
          showToast("Account created successfully! Welcome to Door Step BD.");
          router.push("/dashboard");
          return;
        } else {
          if (data.errors) {
            setFieldErrors(data.errors);
          }
          const errMsg = data.message || (data.errors ? Object.values(data.errors).flat().join(" ") : "Failed to create account. Please verify your details.");
          setError(errMsg);
        }
      } catch {
        setError("Unable to connect to registration server. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans py-14 px-4 flex items-center justify-center pb-20">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 shadow-lg space-y-6">
        
        {/* Toggle Mode Tabs */}
        <div className="flex items-center justify-center p-1.5 bg-slate-100 rounded-full border border-slate-200">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
            }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-full transition-all cursor-pointer ${
              mode === "login"
                ? "bg-[#002884] text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError(null);
            }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-full transition-all cursor-pointer ${
              mode === "register"
                ? "bg-[#002884] text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Register
          </button>
        </div>

        {/* Title */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {mode === "login" ? "Welcome Back" : "Create Customer Account"}
          </h1>
          <p className="text-xs text-slate-500">
            {mode === "login"
              ? "Sign in to access your Door Step BD dashboard & order history."
              : "Register now to enjoy instant checkout & package tracking."}
          </p>
        </div>

        {/* Error Feedback */}
        {error && (
          <div className="bg-rose-50 text-rose-700 p-3.5 rounded-2xl text-xs font-medium border border-rose-200 flex items-start gap-2 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* 1. Full Name (Only on Register) */}
          {mode === "register" && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Full Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Mostafizur Rahman"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#002884]/30"
                />
              </div>
              {fieldErrors.name && (
                <p className="text-rose-500 text-[11px] mt-1 font-semibold">{fieldErrors.name[0]}</p>
              )}
            </div>
          )}

          {/* 2. Email Address (Both Login & Register) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Email Address *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#002884]/30"
              />
            </div>
            {fieldErrors.email && (
              <p className="text-rose-500 text-[11px] mt-1 font-semibold">{fieldErrors.email[0]}</p>
            )}
          </div>

          {/* 3. Phone Number (Only on Register) */}
          {mode === "register" && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Phone Number *</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  placeholder="01700-000000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#002884]/30"
                />
              </div>
              {fieldErrors.phone && (
                <p className="text-rose-500 text-[11px] mt-1 font-semibold">{fieldErrors.phone[0]}</p>
              )}
            </div>
          )}

          {/* 4. Password (Below Phone Number on Register) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Password *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#002884]/30"
              />
            </div>
            {fieldErrors.password && (
              <p className="text-rose-500 text-[11px] mt-1 font-semibold">{fieldErrors.password[0]}</p>
            )}
          </div>

          {/* 5. Confirm Password (Only on Register) */}
          {mode === "register" && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Confirm Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#002884]/30"
                />
              </div>
              {fieldErrors.password_confirmation && (
                <p className="text-rose-500 text-[11px] mt-1 font-semibold">{fieldErrors.password_confirmation[0]}</p>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#002884] hover:bg-[#E50914] text-white font-bold text-xs py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 mt-2 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : mode === "login" ? (
              "Sign In to Account"
            ) : (
              "Create Customer Account"
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="text-center pt-2">
          {mode === "login" ? (
            <p className="text-xs text-slate-500">
              Don&apos;t have an account yet?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setError(null);
                }}
                className="text-[#002884] hover:text-[#E50914] font-bold underline cursor-pointer"
              >
                Register here
              </button>
            </p>
          ) : (
            <p className="text-xs text-slate-500">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError(null);
                }}
                className="text-[#002884] hover:text-[#E50914] font-bold underline cursor-pointer"
              >
                Sign In
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
