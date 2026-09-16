"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useShop } from "@/context/ShopContext";
import {
  startChatConversation,
  processAIQuery,
  submitAgentConnect,
  sendCustomerMessage,
  fetchChatHistoryWithStatus,
  getStoredCustomerDetails,
  endChatSession,
  ChatMessage,
  ChatConversation,
  AgentConnectPayload,
} from "@/lib/chatbot";
import { getMediaUrl, getFaqs, ApiFaq, getWhatsAppSettings, getContactSettings } from "@/lib/api";
import {
  Send,
  X,
  Sparkles,
  RefreshCw,
  ShoppingCart,
  ExternalLink,
  Search,
  Package,
  HelpCircle,
  Headphones,
  Monitor,
  ChevronRight,
  User,
  Mail,
  Phone,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  CreditCard,
  LogOut,
  ShieldAlert,
} from "lucide-react";

function ChatBubbleDotsIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.5 4C3.12 4 2 5.12 2 6.5v8C2 15.88 3.12 17 4.5 17H6.5v4.2c0 .44.53.66.85.35L11.5 17H19.5c1.38 0 2.5-1.12 2.5-2.5v-8C22 5.12 20.88 4 19.5 4H4.5ZM7.5 11.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm4.5 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm4.5 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
      />
    </svg>
  );
}

export function AIChatbot() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isApproved, setIsApproved] = useState(false);

  // Form states
  const [inlineOrderInput, setInlineOrderInput] = useState("");
  const [agentForm, setAgentForm] = useState<AgentConnectPayload>({
    name: "",
    email: "",
    phone: "",
  });
  const [agentFormErrors, setAgentFormErrors] = useState<Record<string, string>>({});
  const [agentFormSubmitted, setAgentFormSubmitted] = useState(false);

  // FAQ cache
  const [cachedFaqs, setCachedFaqs] = useState<ApiFaq[]>([]);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const userScrolledUpRef = useRef(false);

  // Shop context with fallback safety
  const shopContext = useShop();
  const addToCart = shopContext?.addToCart || (() => { });
  const showToast = shopContext?.showToast || (() => { });

  // WhatsApp Settings & Floating Speed-Dial Menu state
  const [waNumber, setWaNumber] = useState("8801685594315");
  const [waMessage, setWaMessage] = useState("Hello! I have an inquiry regarding your products on Door Step BD.");
  const [waEnabled, setWaEnabled] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  // Load WhatsApp settings
  useEffect(() => {
    async function loadWaSettings() {
      try {
        const waRes = await getWhatsAppSettings();
        if (waRes?.success && waRes?.data) {
          const d = waRes.data as any;
          const num = d.whatsapp_number || d.whatsapp || d.phone_number;
          const msg = d.default_message || d.whatsapp_default_message;
          const en = typeof d.enabled === "boolean" ? d.enabled : (typeof d.whatsapp_is_enabled === "boolean" ? d.whatsapp_is_enabled : true);
          if (num) setWaNumber(num);
          if (msg) setWaMessage(msg);
          if (typeof en === "boolean") setWaEnabled(en);
          return;
        }

        const contactRes = await getContactSettings();
        if (contactRes?.success && contactRes?.data) {
          const d = contactRes.data as any;
          const num = d.whatsapp_number || d.whatsapp || d.phone;
          const msg = d.whatsapp_default_message || d.default_message;
          const en = typeof d.whatsapp_is_enabled === "boolean" ? d.whatsapp_is_enabled : true;
          if (num) setWaNumber(num);
          if (msg) setWaMessage(msg);
          if (typeof en === "boolean") setWaEnabled(en);
        }
      } catch { }
    }
    loadWaSettings();
  }, []);

  // Close speed dial menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [menuOpen]);

  // Track scroll position to float above ScrollToTop button when it appears
  const [showScrollTop, setShowScrollTop] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 250);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Mount guard
  useEffect(() => {
    setMounted(true);
    const stored = getStoredCustomerDetails();
    if (stored) {
      setAgentForm(stored);
    }
  }, []);

  // Fetch FAQ list for rapid browsing
  useEffect(() => {
    if (!mounted) return;
    getFaqs()
      .then((res) => {
        if (Array.isArray(res?.data)) {
          setCachedFaqs(res.data);
        }
      })
      .catch(() => { });
  }, [mounted]);

  // Handle auto-scroll logic
  const scrollToBottom = (force = false) => {
    if (force || !userScrolledUpRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    userScrolledUpRef.current = !isNearBottom;
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom(true);
      setUnreadCount(0);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom(false);
  }, [messages, isTyping]);

  // Close popup when clicking outside on desktop
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
        if (window.innerWidth >= 640) {
          setIsOpen(false);
        }
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Initialize or restore conversation on mount
  useEffect(() => {
    if (!mounted) return;
    async function init() {
      setIsLoading(true);
      try {
        const res = await startChatConversation();
        if (res && res.success) {
          setConversation(res.conversation);
          setMessages(res.messages || []);
          if (typeof res.conversation.is_approved !== "undefined") {
            setIsApproved(res.conversation.is_approved);
          }
        }
        const statusCheck = await fetchChatHistoryWithStatus(res?.conversation?.id || "init");
        if (statusCheck?.isBlocked) {
          setIsBlocked(true);
        }
        if (typeof statusCheck?.isApproved !== "undefined") {
          setIsApproved(statusCheck.isApproved);
        }
      } catch (err) {
        console.warn("Chatbot init fallback:", err);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, [mounted]);

  // Live polling for agent replies: ONLY active when user has connected to agent
  useEffect(() => {
    if (!mounted || !conversation) return;
    const isLiveAgentMode = conversation.mode === "agent" || conversation.mode === "waiting_agent";
    if (!isLiveAgentMode) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetchChatHistoryWithStatus(conversation.id);
        if (typeof res.isBlocked !== "undefined") {
          setIsBlocked(res.isBlocked);
        }
        if (typeof res.isApproved !== "undefined") {
          setIsApproved(res.isApproved);
        }
        const history = res.messages;
        if (history && history.length > 0) {
          setMessages((prev) => {
            if (history.length !== prev.length) {
              return history;
            }
            return prev;
          });

          const hasAgentMsg = history.some((m) => m.sender_type === "agent");
          if ((hasAgentMsg || res.isApproved) && conversation.mode !== "agent") {
            setConversation((c) => (c ? { ...c, mode: "agent", status: "open", is_approved: true } : c));
          }
        }
      } catch { }
    }, 2500);

    return () => clearInterval(interval);
  }, [mounted, conversation]);

  if (!mounted) return null;

  // Format timestamp helper (e.g. 05:20 PM)
  const formatMessageTime = (isoString?: string) => {
    if (!isoString) return "";
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return "";
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  // Format Price in Bangladeshi Taka
  const formatPrice = (val: string | number) => {
    const num = Number(val) || 0;
    return `৳${num.toLocaleString("en-BD")}`;
  };

  // End Session: deletes all messages & resets to clean AI initial state
  const handleEndSession = () => {
    const res = endChatSession();
    setConversation(res.conversation);
    setMessages(res.messages);
    setIsApproved(false);
    setAgentFormSubmitted(false);
    setAgentForm({ name: "", email: "", phone: "" });
    setAgentFormErrors({});
    setInputText("");
    setInlineOrderInput("");
    showToast("Chat session ended. All messages have been cleared.");
  };

  // Quick Action Click Handler
  const handleQuickAction = async (
    actionType: "search_product" | "faq" | "track_order" | "connect_agent",
    customPrompt?: string
  ) => {
    if (isLoading) return;

    if (actionType === "search_product") {
      const activeConvId = conversation?.id || "local_chat";
      const userMsg: ChatMessage = {
        id: "usr_" + Date.now(),
        conversation_id: activeConvId,
        sender_type: "customer",
        message_type: "text",
        message: "Search Product",
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsTyping(true);

      const aiResponse = await processAIQuery(activeConvId, "Search Product", "search_product");
      setIsTyping(false);
      setMessages((prev) => [...prev, aiResponse]);

      setTimeout(() => inputRef.current?.focus(), 150);
      return;
    }

    if (actionType === "track_order") {
      const activeConvId = conversation?.id || "local_chat";
      const userMsg: ChatMessage = {
        id: "usr_" + Date.now(),
        conversation_id: activeConvId,
        sender_type: "customer",
        message_type: "text",
        message: "Track Order",
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsTyping(true);

      const aiResponse = await processAIQuery(activeConvId, "Track Order", "track_order");
      setIsTyping(false);
      setMessages((prev) => [...prev, aiResponse]);
      return;
    }

    if (actionType === "faq") {
      const activeConvId = conversation?.id || "local_chat";
      const userMsg: ChatMessage = {
        id: "usr_" + Date.now(),
        conversation_id: activeConvId,
        sender_type: "customer",
        message_type: "text",
        message: customPrompt || "Browse FAQs",
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsTyping(true);

      const aiResponse = await processAIQuery(activeConvId, customPrompt || "Browse FAQs", "faq");
      setIsTyping(false);
      setMessages((prev) => [...prev, aiResponse]);
      return;
    }

    if (actionType === "connect_agent") {
      const activeConvId = conversation?.id || "local_chat";
      const userMsg: ChatMessage = {
        id: "usr_" + Date.now(),
        conversation_id: activeConvId,
        sender_type: "customer",
        message_type: "text",
        message: "Connect to Agent",
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsTyping(true);

      const aiResponse = await processAIQuery(activeConvId, "Connect to Agent", "connect_agent");
      setIsTyping(false);
      setMessages((prev) => [...prev, aiResponse]);
      return;
    }
  };

  // Handle Agent Connect Form Validation & Submission (Starts Live Session, Waiting for Approval)
  const handleAgentFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    const cleanName = agentForm.name.trim();
    const cleanEmail = agentForm.email.trim();
    const cleanPhone = agentForm.phone.trim();

    if (!cleanName) {
      errors.name = "Full Name is required.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail) {
      errors.email = "Email is required.";
    } else if (!emailRegex.test(cleanEmail)) {
      errors.email = "Please enter a valid email address.";
    }

    const phoneRegex = /^(\+?[0-9]{8,16})$/;
    const cleanDigits = cleanPhone.replace(/[\s\-()]/g, "");
    if (!cleanPhone) {
      errors.phone = "Phone Number is required.";
    } else if (!phoneRegex.test(cleanDigits) || cleanDigits.length < 8) {
      errors.phone = "Please enter a valid phone number (e.g. 017XXXXXXXX).";
    }

    setAgentFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    const activeConvId = conversation?.id || "local_chat";
    setIsTyping(true);

    try {
      const payload: AgentConnectPayload = {
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
      };

      const res = await submitAgentConnect(activeConvId, payload);
      setIsTyping(false);
      setAgentFormSubmitted(true);
      setIsApproved(false);

      if (res.success && res.message) {
        setConversation((prev) =>
          prev
            ? {
              ...prev,
              customer_name: cleanName,
              customer_email: cleanEmail,
              customer_phone: cleanPhone,
              mode: "waiting_agent",
              status: "waiting",
              is_approved: false,
            }
            : {
              id: activeConvId,
              customer_name: cleanName,
              customer_email: cleanEmail,
              customer_phone: cleanPhone,
              mode: "waiting_agent",
              status: "waiting",
              is_approved: false,
            }
        );
        setMessages((prev) => [...prev, res.message]);
      }
    } catch {
      setIsTyping(false);
      showToast("Could not connect to agent right now. Please try again.");
    }
  };

  // Handle Send Message Form Submit
  const handleSendMessage = async (
    customText?: string,
    actionHint?: "search_product" | "faq" | "track_order" | "connect_agent"
  ) => {
    const textToSend = (customText || inputText).trim();
    if (!textToSend || isLoading) return;

    if (!customText) setInputText("");

    const activeConvId = conversation?.id || "local_chat";
    const isLiveAgentMode = conversation?.mode === "agent" || conversation?.mode === "waiting_agent";

    // If waiting for agent approval and user tries to message live agent, block until approved
    if (isLiveAgentMode && !isApproved && !actionHint) {
      showToast("Please wait for an agent to approve your request before sending messages.");
      return;
    }

    // Append User Message
    const userMsg: ChatMessage = {
      id: "usr_" + Date.now(),
      conversation_id: activeConvId,
      sender_type: "customer",
      message_type: "text",
      message: textToSend,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    // If currently connected to Live Agent, send message directly to backend chat session
    if (isLiveAgentMode && !actionHint) {
      const agentRes = await sendCustomerMessage(activeConvId, textToSend, true);
      setIsTyping(false);
      if (agentRes.isApproved) {
        setIsApproved(true);
      }
      if (agentRes.message && agentRes.message.id !== userMsg.id) {
        setMessages((prev) => [...prev, agentRes.message]);
      }
      return;
    }

    // Process via local AI Assistant (Search Products, FAQs, Order Tracking)
    const aiResponse = await processAIQuery(activeConvId, textToSend, actionHint);
    setIsTyping(false);
    setMessages((prev) => [...prev, aiResponse]);

    if (!isOpen) {
      setUnreadCount((prev) => prev + 1);
    }
  };

  // Format text with bold and newlines cleanly
  const renderFormattedText = (text: string) => {
    return text.split("\n").map((line, lineIdx) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <span key={lineIdx} className="block min-h-[1.1rem]">
          {parts.map((part, partIdx) => {
            if (part.startsWith("**") && part.endsWith("**")) {
              return (
                <strong key={partIdx} className="font-bold text-slate-900 dark:text-white">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return part;
          })}
        </span>
      );
    });
  };

  const isLiveAgentActive = conversation?.mode === "agent" || conversation?.mode === "waiting_agent";

  return (
    <>
      {/* ── MOBILE BACKDROP OVERLAY (WHEN OPEN) ── */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-[99998] sm:hidden animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* ── CHATBOT WIDGET WRAPPER ── */}
      <div
        ref={widgetRef}
        className={
          isOpen
            ? "fixed inset-x-0 bottom-0 sm:bottom-6 sm:right-6 sm:inset-x-auto z-[99999] font-sans flex items-end justify-center sm:justify-end"
            : `fixed right-5 sm:right-6 z-[9999] font-sans flex items-end transition-all duration-300 ease-in-out ${
                showScrollTop ? "bottom-18 sm:bottom-20" : "bottom-5 sm:bottom-6"
              }`
        }
      >
        {/* ── UNIFIED SPEED DIAL MENU (WHEN CLOSED & EXPANDED) ── */}
        {!isOpen && (
          <div className="relative flex items-center">
            {/* Speed Dial Popup Menu */}
            {menuOpen && (
              <div className="absolute bottom-16 right-0 mb-2 flex flex-col items-end space-y-2.5 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
                {/* 1. WhatsApp Support Option */}
                {waEnabled && (() => {
                  const cleanPhone = waNumber.replace(/[^0-9]/g, "");
                  const encodedWaMsg = encodeURIComponent(waMessage);
                  const isMobileDevice =
                    typeof navigator !== "undefined" &&
                    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                      navigator.userAgent
                    );
                  const waUrl = isMobileDevice
                    ? `https://wa.me/${cleanPhone}?text=${encodedWaMsg}`
                    : `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encodedWaMsg}`;

                  return (
                    <a
                      href={waUrl}
                      target={isMobileDevice ? "_self" : "_blank"}
                      rel="noopener noreferrer"
                      onClick={() => setMenuOpen(false)}
                      className="group flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xl rounded-2xl p-2.5 sm:px-4 sm:py-3 hover:border-emerald-500 transition-all duration-200 hover:scale-[1.02] active:scale-95 text-slate-800 dark:text-slate-100 min-w-[210px]"
                    >
                      <div className="flex-1 text-right">
                        <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 justify-end">
                          <span>WhatsApp Chat</span>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">Order & Fast Support</div>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center shadow-md shadow-emerald-500/25 group-hover:scale-105 transition shrink-0">
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-1.104 4.032 4.147-1.085zm12.351-4.708c-.287-.144-1.696-.837-1.958-.933-.263-.096-.454-.144-.645.144-.191.288-.742.933-.91 1.125-.168.192-.336.216-.623.072-.287-.144-1.214-.447-2.313-1.427-.855-.763-1.433-1.705-1.601-1.993-.168-.288-.018-.444.126-.587.13-.13.287-.336.431-.504.144-.168.192-.288.288-.48.096-.192.048-.36-.024-.504-.072-.144-.645-1.559-.884-2.135-.233-.561-.47-.484-.645-.493-.168-.009-.36-.009-.552-.009-.192 0-.504.072-.767.36-.264.288-1.008.985-1.008 2.401 0 1.416 1.032 2.784 1.176 2.976.144.192 2.035 3.107 4.931 4.358.689.298 1.228.476 1.648.609.692.22 1.322.189 1.82.115.556-.083 1.696-.693 1.935-1.364.239-.672.239-1.248.168-1.364-.072-.116-.264-.192-.551-.336z" />
                        </svg>
                      </div>
                    </a>
                  );
                })()}

                {/* 2. AI Assistant & Live Support Option */}
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setIsOpen(true);
                  }}
                  className="group flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xl rounded-2xl p-2.5 sm:px-4 sm:py-3 hover:border-[#E50914] transition-all duration-200 hover:scale-[1.02] active:scale-95 text-slate-800 dark:text-slate-100 text-left min-w-[210px] cursor-pointer"
                >
                  <div className="flex-1 text-right">
                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 justify-end">
                      <span>AI & Live Agent</span>
                      <span className="w-2 h-2 rounded-full bg-[#E50914]"></span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">Instant Help & Orders</div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#002884] via-[#0A3299] to-[#E50914] text-white flex items-center justify-center shadow-md shadow-orange-500/25 group-hover:scale-105 transition shrink-0">
                    <ChatBubbleDotsIcon className="w-5 h-5" />
                  </div>
                </button>
              </div>
            )}

            {/* Main Trigger Floating Action Button */}
            <div className="relative group">
              {/* Tooltip */}
              {!menuOpen && (
                <div className="absolute right-full mr-3 whitespace-nowrap bg-slate-900/90 text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-xl backdrop-blur-xs border border-slate-700/50 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none -translate-x-1 group-hover:translate-x-0 hidden sm:block">
                  Support & Chat
                  <div className="absolute top-1/2 -translate-y-1/2 -right-1 w-0 h-0 border-y-4 border-y-transparent border-l-4 border-l-slate-900/90" />
                </div>
              )}

              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Door Step Support Options"
                className={`relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 border-2 border-white cursor-pointer ${
                  menuOpen
                    ? "bg-slate-900 text-white rotate-90"
                    : "bg-gradient-to-r from-[#002884] via-[#0A3299] to-[#E50914] text-white hover:shadow-red-600/40"
                }`}
              >
                {menuOpen ? (
                  <X className="w-6 h-6 text-white" />
                ) : (
                  <>
                    <ChatBubbleDotsIcon className="w-6 h-6 sm:w-7 sm:h-7" />

                    {/* Dual Online Badge (Green WhatsApp + Orange AI) */}
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-[#25D366] border-2 border-white items-center justify-center">
                        <Sparkles className="w-2.5 h-2.5 text-white" />
                      </span>
                    </span>

                    {/* Unread Counter Badge */}
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -left-1 bg-[#E50914] text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-bounce shadow-md">
                        {unreadCount}
                      </span>
                    )}
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── CHATBOT POPUP WINDOW ── */}
        {isOpen && (
          <div className="w-full sm:w-[380px] md:w-[410px] h-[88vh] max-h-[660px] sm:h-[620px] sm:max-h-[calc(100vh-4.5rem)] bg-[#f9fafb] dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 animate-in slide-in-from-bottom-6 sm:zoom-in-95">

            {/* ── HEADER ── */}
            <div className="bg-gradient-to-r from-[#002884] via-[#0A3299] to-[#E50914] px-4 py-3.5 text-white shadow-sm shrink-0">
              {/* Mobile Drag Handle */}
              <div className="w-10 h-1 bg-white/30 rounded-full mx-auto mb-2 sm:hidden" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/25 shrink-0 shadow-inner">
                      <Monitor className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-[15px] leading-tight text-white">
                      Door Step BD Support
                    </h3>
                    <p className="text-[11px] font-medium flex items-center gap-1.5 mt-0.5">
                      {isLiveAgentActive ? (
                        isApproved ? (
                          <>
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            <span className="text-emerald-300">Live Agent Connected</span>
                          </>
                        ) : (
                          <>
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                            <span className="text-amber-300">Waiting for Agent Approval...</span>
                          </>
                        )
                      ) : (
                        <>
                          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                          <span className="text-emerald-300">Online to help</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                {/* Header Action Buttons */}
                <div className="flex items-center gap-1.5">
                  {/* End Session Button when live agent session is active */}
                  {isLiveAgentActive ? (
                    <button
                      type="button"
                      onClick={handleEndSession}
                      title="End Session & Clear Messages"
                      className="px-2.5 py-1 bg-rose-500/85 hover:bg-rose-600 active:scale-95 text-white text-[11px] font-bold rounded-lg transition shadow-xs flex items-center gap-1 cursor-pointer"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>End Session</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleEndSession}
                      title="Reset Chat"
                      className="w-8 h-8 rounded-full hover:bg-white/15 active:scale-90 text-white/90 hover:text-white flex items-center justify-center transition cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    aria-label="Close Chat"
                    className="w-8 h-8 rounded-full hover:bg-white/15 active:scale-90 text-white/90 hover:text-white flex items-center justify-center transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* ── MESSAGES CONTAINER ── */}
            <div
              ref={messagesContainerRef}
              onScroll={handleScroll}
              className="flex-1 p-4 overflow-y-auto space-y-4 custom-chat-scroll bg-[#f9fafb] dark:bg-[#0b1120]"
            >
              {messages.map((msg) => {
                const isCustomer = msg.sender_type === "customer";
                const isSystem = msg.sender_type === "system";
                const timeString = formatMessageTime(msg.created_at) || "Just now";

                if (isSystem) {
                  return (
                    <div key={msg.id} className="flex justify-center my-2">
                      <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-[11px] px-3.5 py-1.5 rounded-full font-medium text-center shadow-2xs max-w-[92%] flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        <span>{msg.message}</span>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={msg.id} className="space-y-1">
                    {/* Sender & Timestamp header label */}
                    <div
                      className={`text-[11px] font-medium text-slate-400 dark:text-slate-500 px-1 ${isCustomer ? "text-right" : "text-left"
                        }`}
                    >
                      {isCustomer
                        ? `You • ${timeString}`
                        : msg.sender_type === "agent"
                          ? `Support Agent • ${timeString}`
                          : `Assistant • ${timeString}`}
                    </div>

                    {/* Message Bubble Card */}
                    <div
                      className={`rounded-2xl p-4 text-sm leading-relaxed shadow-xs break-words ${isCustomer
                          ? "bg-[#002884] text-white ml-auto max-w-[85%]"
                          : msg.sender_type === "agent"
                            ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-l-4 border-l-[#E50914] border-slate-200 dark:border-slate-700 mr-auto max-w-[92%]"
                            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700/60 mr-auto max-w-[92%]"
                        }`}
                    >
                      <div className="space-y-1">{renderFormattedText(msg.message)}</div>

                      {/* ── SEARCH PRODUCT KEYWORD CHIPS ── */}
                      {msg.metadata?.intent === "search_prompt" &&
                        msg.metadata.quick_replies &&
                        msg.metadata.quick_replies.length > 0 && (
                          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex flex-wrap gap-1.5">
                            {msg.metadata.quick_replies.map((qr, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleSendMessage(qr.prompt || qr.label, "search_product")}
                                className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-700/70 hover:bg-[#E50914] hover:text-white dark:hover:bg-[#E50914] text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-200/90 dark:border-slate-600 transition shadow-2xs cursor-pointer active:scale-95"
                              >
                                {qr.label}
                              </button>
                            ))}
                          </div>
                        )}

                      {/* ── WORKABLE PRODUCT CARDS ── */}
                      {msg.message_type === "product" &&
                        msg.metadata?.products &&
                        msg.metadata.products.length > 0 && (
                          <div className="mt-3 space-y-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                            {msg.metadata.products.map((prod) => (
                              <div
                                key={prod.id}
                                className="bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 rounded-xl p-3 flex items-center justify-between gap-3 hover:border-[#E50914] dark:hover:border-orange-400 transition shadow-2xs group"
                              >
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                  <div className="relative w-12 h-12 rounded-lg bg-slate-50 dark:bg-slate-900 overflow-hidden shrink-0 border border-slate-100 dark:border-slate-800">
                                    <Image
                                      src={getMediaUrl(prod.image || (prod.images && prod.images[0]))}
                                      alt={prod.name}
                                      fill
                                      className="object-contain p-1"
                                    />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <h4 className="font-bold text-xs text-slate-800 dark:text-slate-100 group-hover:text-[#002884] dark:group-hover:text-orange-400 truncate">
                                      {prod.name}
                                    </h4>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                      <span className="font-bold text-xs text-[#E50914] dark:text-orange-400">
                                        {formatPrice(prod.sale_price || prod.price)}
                                      </span>
                                      {prod.sale_price && (
                                        <span className="text-[10px] text-slate-400 line-through">
                                          {formatPrice(prod.price)}
                                        </span>
                                      )}
                                      {typeof prod.stock !== "undefined" && (
                                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${Number(prod.stock) > 0 ? "text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/60" : "text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/60"}`}>
                                          {Number(prod.stock) > 0 ? "In Stock" : "Out of Stock"}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      addToCart(prod, 1);
                                      showToast(`${prod.name} added to cart!`);
                                    }}
                                    className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-[#002884] hover:text-white text-slate-700 dark:text-slate-200 flex items-center justify-center transition shadow-2xs cursor-pointer"
                                    title="Add to Cart"
                                  >
                                    <ShoppingCart className="w-3.5 h-3.5" />
                                  </button>
                                  <Link
                                    href={`/product/${prod.slug || prod.id}`}
                                    onClick={() => {
                                      if (window.innerWidth < 640) setIsOpen(false);
                                    }}
                                    className="px-2.5 py-1.5 bg-[#E50914] hover:bg-[#C80000] text-white text-[11px] font-bold rounded-lg transition shadow-2xs flex items-center gap-1"
                                  >
                                    <span>View</span>
                                    <ChevronRight className="w-3 h-3" />
                                  </Link>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                      {/* ── INLINE ORDER TRACKER FORM ── */}
                      {msg.metadata?.intent === "track_order_prompt" && (
                        <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2.5">
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              if (inlineOrderInput.trim()) {
                                handleSendMessage(inlineOrderInput.trim(), "track_order");
                                setInlineOrderInput("");
                              }
                            }}
                            className="flex flex-col sm:flex-row gap-2"
                          >
                            <input
                              type="text"
                              value={inlineOrderInput}
                              onChange={(e) => setInlineOrderInput(e.target.value)}
                              placeholder="📦 Enter Order Number"
                              className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#E50914]"
                            />
                            <button
                              type="submit"
                              disabled={!inlineOrderInput.trim()}
                              className="px-4 py-2 bg-[#002884] hover:bg-[#E50914] disabled:opacity-40 text-white text-xs font-bold rounded-xl transition cursor-pointer shrink-0"
                            >
                              Track Order
                            </button>
                          </form>
                          <div className="flex items-center gap-1 text-[11px] text-slate-400">
                            <span>Or visit full tracking page:</span>
                            <Link
                              href="/track-order"
                              onClick={() => {
                                if (window.innerWidth < 640) setIsOpen(false);
                              }}
                              className="text-[#E50914] dark:text-orange-400 font-semibold underline flex items-center gap-0.5"
                            >
                              /track-order <ExternalLink className="w-2.5 h-2.5" />
                            </Link>
                          </div>
                        </div>
                      )}

                      {/* ── REAL ORDER DETAILS CARD ── */}
                      {msg.message_type === "order" && msg.metadata?.order && (
                        <div className="mt-3 p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2.5 text-xs">
                          <div className="flex justify-between items-center font-bold">
                            <span className="text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                              <Package className="w-4 h-4 text-[#002884] dark:text-orange-400" />
                              Order #{msg.metadata.order.order_number || msg.metadata.order.id}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold uppercase tracking-wider">
                              {msg.metadata.order.status || "Processing"}
                            </span>
                          </div>

                          <div className="text-slate-600 dark:text-slate-300 space-y-1.5 pt-2 border-t border-slate-200/60 dark:border-slate-800 text-[11px]">
                            {msg.metadata.order.created_at && (
                              <p className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                <span>Order Date: <strong className="text-slate-800 dark:text-slate-200">{new Date(msg.metadata.order.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</strong></span>
                              </p>
                            )}
                            {msg.metadata.order.payment_method && (
                              <p className="flex items-center gap-1.5">
                                <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                                <span>Payment: <strong className="text-slate-800 dark:text-slate-200">{msg.metadata.order.payment_method.toUpperCase()} ({msg.metadata.order.payment_status || "Pending"})</strong></span>
                              </p>
                            )}
                            {msg.metadata.order.shipping_address && (
                              <p className="flex items-start gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                                <span>Delivery Address: <strong className="text-slate-800 dark:text-slate-200">{msg.metadata.order.shipping_address}</strong></span>
                              </p>
                            )}

                            {/* Ordered Items Preview */}
                            {Array.isArray(msg.metadata.order.items) && msg.metadata.order.items.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800 space-y-1.5">
                                <span className="font-semibold text-slate-700 dark:text-slate-300 block">Ordered Items:</span>
                                {msg.metadata.order.items.map((item: any, idx: number) => (
                                  <div key={idx} className="flex justify-between items-center text-[11px] bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-100 dark:border-slate-700">
                                    <span className="truncate flex-1 mr-2 text-slate-800 dark:text-slate-200 font-medium">
                                      {item.product?.name || item.product_name || `Item #${item.id || idx + 1}`} × {item.quantity || 1}
                                    </span>
                                    <span className="font-bold text-slate-900 dark:text-white">
                                      {formatPrice(item.price || item.total || 0)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}

                            <p className="flex justify-between items-center pt-2 border-t border-slate-200/60 dark:border-slate-800 text-xs">
                              <span>Total Amount:</span>
                              <strong className="text-[#E50914] dark:text-orange-400 font-black text-sm">
                                {formatPrice(msg.metadata.order.total || 0)}
                              </strong>
                            </p>
                          </div>

                          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                            <Link
                              href={`/track-order?order_number=${encodeURIComponent(msg.metadata.order.order_number || msg.metadata.order.id)}`}
                              onClick={() => {
                                if (window.innerWidth < 640) setIsOpen(false);
                              }}
                              className="text-xs text-[#002884] dark:text-orange-400 font-bold hover:underline flex items-center gap-1"
                            >
                              <span>View Full Tracking Timeline</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      )}

                      {/* ── BROWSE FAQS INTERACTIVE LIST ── */}
                      {msg.metadata?.intent === "faq_list" && cachedFaqs.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700 space-y-1.5">
                          {cachedFaqs.slice(0, 6).map((faq) => (
                            <button
                              key={faq.id}
                              type="button"
                              onClick={() => handleSendMessage(faq.question, "faq")}
                              className="w-full text-left p-2.5 bg-slate-50 dark:bg-slate-700/60 hover:bg-[#002884] hover:text-white dark:hover:bg-[#002884] text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-200/80 dark:border-slate-600 transition shadow-2xs flex items-center justify-between gap-2 cursor-pointer group"
                            >
                              <span className="truncate">{faq.question}</span>
                              <ChevronRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition shrink-0" />
                            </button>
                          ))}
                        </div>
                      )}

                      {/* ── FAQ ANSWER FOLLOW-UP QUICK REPLIES ── */}
                      {msg.metadata?.intent === "faq_answer" && (
                        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700 flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleQuickAction("faq")}
                            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-700/70 hover:bg-[#002884] hover:text-white text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-200/90 dark:border-slate-600 transition shadow-2xs cursor-pointer"
                          >
                            ❓ Browse more FAQs
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickAction("connect_agent")}
                            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-700/70 hover:bg-[#002884] hover:text-white text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-200/90 dark:border-slate-600 transition shadow-2xs cursor-pointer"
                          >
                            👨💼 Connect to Agent
                          </button>
                        </div>
                      )}

                      {/* ── CONNECT TO AGENT FORM ── */}
                      {msg.metadata?.intent === "agent_form_prompt" && !agentFormSubmitted && (
                        <div className="mt-3 p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
                          <form onSubmit={handleAgentFormSubmit} className="space-y-2.5">
                            {/* Full Name */}
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                                Full Name <span className="text-rose-500">*</span>
                              </label>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                                  <User className="w-3.5 h-3.5" />
                                </div>
                                <input
                                  type="text"
                                  placeholder="Full Name"
                                  value={agentForm.name}
                                  onChange={(e) => {
                                    setAgentForm({ ...agentForm, name: e.target.value });
                                    if (agentFormErrors.name) setAgentFormErrors({ ...agentFormErrors, name: "" });
                                  }}
                                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#E50914]"
                                />
                              </div>
                              {agentFormErrors.name && (
                                <p className="text-[10px] text-rose-500 font-medium mt-0.5 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" /> {agentFormErrors.name}
                                </p>
                              )}
                            </div>

                            {/* Email */}
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                                Email <span className="text-rose-500">*</span>
                              </label>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                                  <Mail className="w-3.5 h-3.5" />
                                </div>
                                <input
                                  type="email"
                                  placeholder="Email"
                                  value={agentForm.email}
                                  onChange={(e) => {
                                    setAgentForm({ ...agentForm, email: e.target.value });
                                    if (agentFormErrors.email) setAgentFormErrors({ ...agentFormErrors, email: "" });
                                  }}
                                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#E50914]"
                                />
                              </div>
                              {agentFormErrors.email && (
                                <p className="text-[10px] text-rose-500 font-medium mt-0.5 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" /> {agentFormErrors.email}
                                </p>
                              )}
                            </div>

                            {/* Phone Number */}
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                                Phone Number <span className="text-rose-500">*</span>
                              </label>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                                  <Phone className="w-3.5 h-3.5" />
                                </div>
                                <input
                                  type="tel"
                                  placeholder="Phone Number"
                                  value={agentForm.phone}
                                  onChange={(e) => {
                                    setAgentForm({ ...agentForm, phone: e.target.value });
                                    if (agentFormErrors.phone) setAgentFormErrors({ ...agentFormErrors, phone: "" });
                                  }}
                                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#E50914]"
                                />
                              </div>
                              {agentFormErrors.phone && (
                                <p className="text-[10px] text-rose-500 font-medium mt-0.5 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" /> {agentFormErrors.phone}
                                </p>
                              )}
                            </div>

                            {/* Submit Button */}
                            <button
                              type="submit"
                              className="w-full py-2.5 bg-[#E50914] hover:bg-[#C80000] text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5 active:scale-98"
                            >
                              <Headphones className="w-4 h-4" />
                              <span>Connect to Agent</span>
                            </button>
                          </form>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="space-y-1">
                  <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 px-1">
                    Assistant is typing...
                  </div>
                  <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-4 py-3 rounded-2xl flex items-center gap-1.5 shadow-xs w-fit">
                    <span className="w-2 h-2 bg-[#E50914] dark:bg-orange-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-2 h-2 bg-[#E50914] dark:bg-orange-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 bg-[#E50914] dark:bg-orange-400 rounded-full animate-bounce"></span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ── 4 MAIN OPTIONS (QUICK ACTIONS SECTION) ── */}
            <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickAction("search_product")}
                  className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 dark:bg-slate-800/90 hover:bg-blue-50 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-[#002884] dark:hover:text-blue-400 transition shadow-2xs cursor-pointer text-left active:scale-95"
                >
                  <Search className="w-4 h-4 text-[#E50914] shrink-0" />
                  <span className="truncate">Search Product</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickAction("track_order")}
                  className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 dark:bg-slate-800/90 hover:bg-blue-50 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-[#002884] dark:hover:text-blue-400 transition shadow-2xs cursor-pointer text-left active:scale-95"
                >
                  <Package className="w-4 h-4 text-[#E50914] shrink-0" />
                  <span className="truncate">Track Order</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickAction("faq")}
                  className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 dark:bg-slate-800/90 hover:bg-blue-50 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-[#002884] dark:hover:text-blue-400 transition shadow-2xs cursor-pointer text-left active:scale-95"
                >
                  <HelpCircle className="w-4 h-4 text-[#E50914] shrink-0" />
                  <span className="truncate">Browse FAQs</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickAction("connect_agent")}
                  className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 dark:bg-slate-800/90 hover:bg-blue-50 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-[#002884] dark:hover:text-blue-400 transition shadow-2xs cursor-pointer text-left active:scale-95"
                >
                  <Headphones className="w-4 h-4 text-[#E50914] shrink-0" />
                  <span className="truncate">Connect to Agent</span>
                </button>
              </div>
            </div>

            {/* ── FOOTER / INPUT BAR ── */}
            {isBlocked ? (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border-t border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-semibold text-center flex items-center justify-center gap-2 shrink-0">
                <span className="text-sm">🚫</span>
                <span>You have been blocked from live chat support.</span>
              </div>
            ) : isLiveAgentActive && !isApproved ? (
              <div className="p-3 bg-amber-50/90 dark:bg-amber-950/50 border-t border-amber-200/80 dark:border-amber-900/60 text-amber-800 dark:text-amber-300 text-xs font-medium text-center flex items-center justify-center gap-2 shrink-0">
                <span className="w-2 h-2 rounded-full bg-[#E50914] animate-ping"></span>
                <span>Waiting for support agent to accept and approve your chat...</span>
              </div>
            ) : (
              <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={
                      isLiveAgentActive
                        ? isApproved
                          ? "Message live agent..."
                          : "Waiting for agent approval..."
                        : "Type your message or product name..."
                    }
                    className="flex-1 bg-slate-100/90 dark:bg-slate-800 border border-transparent focus:border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:ring-1 focus:ring-[#E50914] transition"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim() || isTyping}
                    className="w-10 h-10 rounded-2xl bg-[#E50914] hover:bg-[#C80000] active:scale-90 disabled:opacity-35 disabled:cursor-not-allowed text-white flex items-center justify-center transition shadow-xs cursor-pointer shrink-0"
                    aria-label="Send message"
                  >
                    <Send className="w-4.5 h-4.5" />
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
