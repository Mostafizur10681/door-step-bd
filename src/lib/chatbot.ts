/**
 * Chatbot & Live Agent Chat API Service
 * Tailored for Door Step BD Power Solutions (Services, Equipment Categories, Quotes, & Live Agent)
 */

import { API_V1, getProducts, getCategories, getServices, getFaqs, trackOrder, ApiProduct, ApiCategory, ApiService, ApiFaq } from "./api";

export type SenderType = "customer" | "ai" | "agent" | "system";
export type MessageType = "text" | "product" | "service" | "category" | "order" | "faq" | "system" | "form";
export type ChatMode = "ai" | "waiting_agent" | "agent";
export type ChatStatus = "open" | "waiting" | "closed";

export interface ChatMessage {
  id: string | number;
  conversation_id: string | number;
  sender_type: SenderType;
  sender_id?: string | number | null;
  message_type: MessageType;
  message: string;
  metadata?: {
    products?: ApiProduct[];
    services?: ApiService[];
    categories?: ApiCategory[];
    order?: any;
    faq?: ApiFaq;
    faqs?: ApiFaq[];
    agent_name?: string;
    intent?: string;
    searchKeyword?: string;
    quick_replies?: { label: string; action: string; prompt?: string; link?: string }[];
  } | null;
  created_at: string;
}

export interface ChatConversation {
  id: string | number;
  customer_id?: number | string | null;
  guest_token?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  mode: ChatMode;
  status: ChatStatus;
  is_approved?: boolean;
  assigned_agent_id?: number | string | null;
  assigned_agent_name?: string | null;
  last_message_at?: string;
  closed_at?: string | null;
}

export interface AgentConnectPayload {
  name: string;
  email: string;
  phone: string;
}

/**
 * Generate or retrieve persistent guest session token
 */
export function getGuestSessionToken(): string {
  if (typeof window === "undefined") return "guest_session_ssr";
  let token = localStorage.getItem("shopia_chat_guest_token");
  if (!token) {
    token = "sess_" + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
    localStorage.setItem("shopia_chat_guest_token", token);
  }
  return token;
}

/**
 * Get stored active conversation ID
 */
export function getStoredConversationId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("shopia_chat_conversation_id");
}

/**
 * Store active conversation ID
 */
export function setStoredConversationId(id: string | number | null) {
  if (typeof window === "undefined") return;
  if (id) {
    localStorage.setItem("shopia_chat_conversation_id", String(id));
  } else {
    localStorage.removeItem("shopia_chat_conversation_id");
  }
}

/**
 * Get stored customer details for agent handoff
 */
export function getStoredCustomerDetails(): AgentConnectPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("shopia_chat_customer_info");
    if (raw) return JSON.parse(raw);
  } catch { }
  return null;
}

/**
 * Store customer details
 */
export function setStoredCustomerDetails(details: AgentConnectPayload | null) {
  if (typeof window === "undefined") return;
  try {
    if (details) {
      localStorage.setItem("shopia_chat_customer_info", JSON.stringify(details));
    } else {
      localStorage.removeItem("shopia_chat_customer_info");
    }
  } catch { }
}

const DEFAULT_WELCOME_MESSAGE = "Welcome to Door Step BD Power Solutions! 👋\nI can assist you with our industrial engineering services, generator & substation equipment categories, or connect you with a live technical agent.";

const DEFAULT_QUICK_REPLIES = [
  { label: "⚡ Our Services", action: "explore_services" },
  { label: "📦 Equipment Categories", action: "browse_categories" },
  { label: "📋 Request a Quote", action: "request_quote" },
  { label: "👨💼 Connect to Agent", action: "connect_agent" },
];

/**
 * End Chat Session and delete all messages & reset tokens
 */
export function endChatSession(): {
  conversation: ChatConversation;
  messages: ChatMessage[];
} {
  if (typeof window !== "undefined") {
    localStorage.removeItem("shopia_chat_conversation_id");
    localStorage.removeItem("shopia_chat_customer_info");
    const freshToken = "sess_" + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
    localStorage.setItem("shopia_chat_guest_token", freshToken);
  }

  const freshId = getGuestSessionToken();
  setStoredConversationId(freshId);

  const welcomeMessage: ChatMessage = {
    id: "welcome_" + Date.now(),
    conversation_id: freshId,
    sender_type: "ai",
    message_type: "text",
    message: DEFAULT_WELCOME_MESSAGE,
    metadata: {
      intent: "welcome",
      quick_replies: DEFAULT_QUICK_REPLIES,
    },
    created_at: new Date().toISOString(),
  };

  return {
    conversation: {
      id: freshId,
      guest_token: freshId,
      mode: "ai",
      status: "open",
      is_approved: false,
    },
    messages: [welcomeMessage],
  };
}

/**
 * Start or restore chat conversation
 */
export async function startChatConversation(): Promise<{
  success: boolean;
  conversation: ChatConversation;
  messages: ChatMessage[];
}> {
  const sessionId = getGuestSessionToken();
  const storedId = getStoredConversationId() || sessionId;
  setStoredConversationId(storedId);
  const customerInfo = getStoredCustomerDetails();

  if (customerInfo?.name) {
    const historyStatus = await fetchChatHistoryWithStatus(storedId);
    const existingMessages = historyStatus.messages;
    if (existingMessages.length > 0) {
      const hasAdminMsg = existingMessages.some((m) => m.sender_type === "agent");
      const isApproved = historyStatus.isApproved || hasAdminMsg;
      return {
        success: true,
        conversation: {
          id: storedId,
          guest_token: sessionId,
          customer_name: customerInfo.name,
          customer_email: customerInfo.email,
          customer_phone: customerInfo.phone,
          mode: isApproved ? "agent" : "waiting_agent",
          status: "open",
          is_approved: isApproved,
        },
        messages: existingMessages,
      };
    }
  }

  const welcomeMessage: ChatMessage = {
    id: "welcome_1",
    conversation_id: storedId,
    sender_type: "ai",
    message_type: "text",
    message: DEFAULT_WELCOME_MESSAGE,
    metadata: {
      intent: "welcome",
      quick_replies: DEFAULT_QUICK_REPLIES,
    },
    created_at: new Date().toISOString(),
  };

  return {
    success: true,
    conversation: {
      id: storedId,
      guest_token: sessionId,
      mode: "ai",
      status: "open",
      is_approved: false,
    },
    messages: [welcomeMessage],
  };
}

/**
 * Fetch messages history from Laravel API endpoint `/api/v1/chats?session_id=...`
 */
export async function fetchChatHistoryWithStatus(
  conversationId: string | number
): Promise<{ messages: ChatMessage[]; isBlocked: boolean; isApproved: boolean }> {
  try {
    const sessionId = getGuestSessionToken();
    const res = await fetch(`${API_V1}/chats?session_id=${encodeURIComponent(sessionId)}`, {
      cache: "no-store",
      headers: { "Accept": "application/json" },
    });

    if (res.ok) {
      const json = await res.json();
      const rawList = Array.isArray(json?.data) ? json.data : (Array.isArray(json) ? json : []);

      const normalized: ChatMessage[] = rawList.map((m: any) => {
        const rawSender = String(m.sender_type || m.sender || m.type || m.user_type || "").toLowerCase();
        const isAdminFlag = Boolean(
          m.is_admin === true ||
          m.is_admin === 1 ||
          m.is_admin === "1" ||
          m.is_agent === true ||
          m.is_agent === 1 ||
          m.is_agent === "1" ||
          m.from_admin === true ||
          m.from_admin === 1 ||
          m.from_admin === "1" ||
          (typeof m.admin_id !== "undefined" && m.admin_id !== null && Number(m.admin_id) > 0) ||
          (m.admin !== null && typeof m.admin === "object") ||
          rawSender === "admin" ||
          rawSender === "agent" ||
          rawSender === "staff" ||
          rawSender === "support"
        );

        const msgText = String(m.message || m.body || "");
        const isAgentGreeting =
          msgText.toLowerCase().includes("an agent has accepted") ||
          msgText.toLowerCase().includes("support representative has joined") ||
          msgText.toLowerCase().includes("agent has joined");

        let senderType: SenderType = "customer";
        if (rawSender === "system" || m.message_type === "system" || Boolean(m.is_system)) {
          senderType = "system";
        } else if (isAdminFlag || isAgentGreeting) {
          senderType = "agent";
        } else if (rawSender === "ai" || rawSender === "bot" || rawSender === "assistant") {
          senderType = "ai";
        } else if (rawSender === "customer" || rawSender === "user" || rawSender === "client" || rawSender === "guest") {
          senderType = "customer";
        } else {
          senderType = "customer";
        }

        return {
          id: m.id || "msg_" + Math.random(),
          conversation_id: conversationId,
          sender_type: senderType,
          sender_id: m.sender_id || m.user_id || m.admin_id,
          message_type: (m.message_type || "text") as MessageType,
          message: msgText,
          metadata: m.metadata || null,
          created_at: m.created_at || new Date().toISOString(),
        };
      });

      const isBlocked = Boolean(json?.is_blocked || json?.customer_blocked || false);
      const isApproved = Boolean(
        json?.is_approved ||
        json?.session_approved ||
        json?.conversation?.is_approved ||
        normalized.some((m) => m.sender_type === "agent")
      );

      return { messages: normalized, isBlocked, isApproved };
    }
  } catch (err) {
    console.warn(`API /chats?session_id=${conversationId} failed:`, err);
  }
  return { messages: [], isBlocked: false, isApproved: false };
}

export async function fetchChatHistory(
  conversationId: string | number
): Promise<ChatMessage[]> {
  const result = await fetchChatHistoryWithStatus(conversationId);
  return result.messages;
}

/**
 * Send customer message to Laravel Backend `/api/v1/chats` (Only when in live agent session)
 */
export async function sendCustomerMessage(
  conversationId: string | number,
  messageText: string,
  isSystemNotification: boolean = false
): Promise<{ message: ChatMessage; isApproved: boolean; error?: string }> {
  const now = new Date().toISOString();
  const customerInfo = getStoredCustomerDetails();
  const sessionId = getGuestSessionToken();

  try {
    const res = await fetch(`${API_V1}/chats`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session_id: sessionId,
        conversation_id: conversationId,
        message: messageText,
        sender_type: isSystemNotification ? "system" : "customer",
        customer_name: customerInfo?.name || "Guest Customer",
        customer_email: customerInfo?.email || "guest@doorstepbd.com",
        customer_phone: customerInfo?.phone || "",
      }),
    });

    if (res.ok) {
      const json = await res.json();
      const serverMsg = json.data || json;
      const isApproved = Boolean(json.is_approved || json.conversation?.is_approved || serverMsg?.is_approved || false);

      return {
        message: {
          id: serverMsg.id || "msg_" + Date.now(),
          conversation_id: conversationId,
          sender_type: "customer",
          message_type: "text",
          message: messageText,
          created_at: serverMsg.created_at || now,
        },
        isApproved,
      };
    } else {
      let errText = "Failed to send message.";
      try {
        const errJson = await res.json();
        if (errJson.message) errText = errJson.message;
      } catch { }
      return {
        message: {
          id: "msg_err_" + Date.now(),
          conversation_id: conversationId,
          sender_type: "customer",
          message_type: "text",
          message: messageText,
          created_at: now,
        },
        isApproved: false,
        error: errText,
      };
    }
  } catch (err) {
    console.warn("API POST /chats error:", err);
  }

  return {
    message: {
      id: "msg_" + Date.now(),
      conversation_id: conversationId,
      sender_type: "customer",
      message_type: "text",
      message: messageText,
      created_at: now,
    },
    isApproved: false,
  };
}

/**
 * AI Query Processing (Engineering Services, Equipment Categories, Quote, FAQs, Agent Handover)
 */
export async function processAIQuery(
  conversationId: string | number,
  userQuery: string,
  actionHint?: "explore_services" | "browse_categories" | "request_quote" | "search_product" | "faq" | "track_order" | "connect_agent"
): Promise<ChatMessage> {
  const lowerQuery = userQuery.toLowerCase().trim();
  const now = new Date().toISOString();

  // ─────────────────────────────────────────────────────────────
  // 1. EXPLORE SERVICES FLOW
  // ─────────────────────────────────────────────────────────────
  const isServicesClick =
    actionHint === "explore_services" ||
    lowerQuery.includes("our services") ||
    lowerQuery.includes("service") ||
    lowerQuery.includes("services") ||
    lowerQuery.includes("maintenance") ||
    lowerQuery.includes("substation") ||
    lowerQuery.includes("overhaul") ||
    lowerQuery.includes("solar power") ||
    lowerQuery.includes("energy audit") ||
    lowerQuery === "⚡ our services" ||
    lowerQuery === "our services";

  if (isServicesClick) {
    try {
      const servicesRes = await getServices({ all: 1 });
      const servicesList: ApiService[] = (servicesRes?.success && Array.isArray(servicesRes.data)) ? servicesRes.data : [];

      if (servicesList.length > 0) {
        return {
          id: "msg_" + Date.now(),
          conversation_id: conversationId,
          sender_type: "ai",
          message_type: "service",
          message: "Here are our core industrial engineering and field services across Bangladesh. Select any service to explore detailed specifications or book certified field support:",
          metadata: {
            services: servicesList.slice(0, 6),
            intent: "services_list",
            quick_replies: [
              { label: "📦 Equipment Categories", action: "browse_categories" },
              { label: "📋 Request a Quote", action: "request_quote" },
              { label: "👨💼 Connect to Agent", action: "connect_agent" },
            ],
          },
          created_at: now,
        };
      }
    } catch (err) {
      console.warn("getServices API failed in chatbot:", err);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 2. EQUIPMENT & CATEGORIES FLOW
  // ─────────────────────────────────────────────────────────────
  const isCategoriesClick =
    actionHint === "browse_categories" ||
    lowerQuery.includes("equipment categories") ||
    lowerQuery.includes("category") ||
    lowerQuery.includes("categories") ||
    lowerQuery.includes("equipment") ||
    lowerQuery.includes("generator category") ||
    lowerQuery === "📦 equipment categories" ||
    lowerQuery === "equipment categories";

  if (isCategoriesClick) {
    try {
      const catsRes = await getCategories(true);
      const catsList: ApiCategory[] = (catsRes?.success && Array.isArray(catsRes.data)) ? catsRes.data : [];

      if (catsList.length > 0) {
        return {
          id: "msg_" + Date.now(),
          conversation_id: conversationId,
          sender_type: "ai",
          message_type: "category",
          message: "Explore our certified power engineering equipment portfolio and product categories:",
          metadata: {
            categories: catsList.slice(0, 6),
            intent: "categories_list",
            quick_replies: [
              { label: "⚡ Our Services", action: "explore_services" },
              { label: "🔎 Search Generator", action: "search_product", prompt: "Generator" },
              { label: "🔎 Search Solar", action: "search_product", prompt: "Solar" },
              { label: "👨💼 Connect to Agent", action: "connect_agent" },
            ],
          },
          created_at: now,
        };
      }
    } catch (err) {
      console.warn("getCategories API failed in chatbot:", err);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 3. REQUEST A QUOTE / CONTACT CONSULTATION FLOW
  // ─────────────────────────────────────────────────────────────
  const isQuoteClick =
    actionHint === "request_quote" ||
    lowerQuery.includes("request a quote") ||
    lowerQuery.includes("quote") ||
    lowerQuery.includes("quotation") ||
    lowerQuery.includes("price estimate") ||
    lowerQuery.includes("contact") ||
    lowerQuery.includes("hotline") ||
    lowerQuery.includes("phone number") ||
    lowerQuery.includes("office address") ||
    lowerQuery === "📋 request a quote" ||
    lowerQuery === "request a quote";

  if (isQuoteClick) {
    return {
      id: "msg_" + Date.now(),
      conversation_id: conversationId,
      sender_type: "ai",
      message_type: "text",
      message: `**Door Step BD Power Solutions - Industrial Engineering & Equipment**\n\n📞 **Direct Hotline:** 01734-340066\n✉️ **Email:** info@doorstepbd.com\n🏢 **Head Office:** 41/1, Sher-E-Bangla Rd, Mohammadpur, Dhaka 1207\n⏰ **Hours:** Sat–Thu: 9:00 AM – 10:00 PM | Fri: 3:00 PM – 11:00 PM\n\nYou can request an official project estimate through our portal or connect directly with our engineering team right now.`,
      metadata: {
        intent: "quote_info",
        quick_replies: [
          { label: "👨💼 Connect to Agent", action: "connect_agent" },
          { label: "⚡ Explore Services", action: "explore_services" },
          { label: "📦 Equipment Categories", action: "browse_categories" },
        ],
      },
      created_at: now,
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 4. CONNECT TO AGENT FLOW (FORM PROMPT) - UNTOUCHED & ROBUST
  // ─────────────────────────────────────────────────────────────
  const isInitialAgentClick =
    actionHint === "connect_agent" ||
    lowerQuery === "👨💼 connect to agent" ||
    lowerQuery === "connect to agent" ||
    lowerQuery === "talk to agent" ||
    lowerQuery === "live agent" ||
    lowerQuery === "support agent" ||
    lowerQuery === "human agent";

  if (isInitialAgentClick) {
    return {
      id: "msg_" + Date.now(),
      conversation_id: conversationId,
      sender_type: "ai",
      message_type: "form",
      message: "Please complete your details below to connect directly with a technical support engineer in live chat.",
      metadata: {
        intent: "agent_form_prompt",
      },
      created_at: now,
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 5. SEARCH PRODUCT / EQUIPMENT BY KEYWORD
  // ─────────────────────────────────────────────────────────────
  const isInitialSearchClick =
    actionHint === "search_product" && (lowerQuery.includes("want to search") || lowerQuery.includes("search product"));

  if (isInitialSearchClick) {
    return {
      id: "msg_" + Date.now(),
      conversation_id: conversationId,
      sender_type: "ai",
      message_type: "text",
      message: 'Type the equipment name, brand, or model you are looking for (e.g. "Generator", "Perkins", "Substation", "Solar", "ATS", "UPS").',
      metadata: {
        intent: "search_prompt",
        quick_replies: [
          { label: "Generator", action: "search_keyword", prompt: "Generator" },
          { label: "Perkins", action: "search_keyword", prompt: "Perkins" },
          { label: "Substation", action: "search_keyword", prompt: "Substation" },
          { label: "Solar", action: "search_keyword", prompt: "Solar" },
          { label: "ATS Panel", action: "search_keyword", prompt: "ATS" },
        ],
      },
      created_at: now,
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 6. FAQS FLOW
  // ─────────────────────────────────────────────────────────────
  if (actionHint === "faq" || lowerQuery === "faq" || lowerQuery === "faqs" || lowerQuery.includes("frequently asked")) {
    try {
      const faqRes = await getFaqs();
      const faqList = Array.isArray(faqRes?.data) ? faqRes.data : [];
      if (faqList.length > 0) {
        return {
          id: "msg_" + Date.now(),
          conversation_id: conversationId,
          sender_type: "ai",
          message_type: "faq",
          message: "Here are frequently asked questions regarding our engineering installations, warranty, and field services:",
          metadata: {
            intent: "faq_list",
            faqs: faqList,
            quick_replies: faqList.map((f) => ({
              label: f.question,
              action: "faq_question",
              prompt: f.question,
            })),
          },
          created_at: now,
        };
      }
    } catch { }
  }

  // Check matching FAQ
  try {
    const faqRes = await getFaqs();
    const faqList = Array.isArray(faqRes?.data) ? faqRes.data : [];
    if (faqList.length > 0) {
      const matchedFaq = faqList.find(
        (f) =>
          f.question.toLowerCase().trim() === lowerQuery ||
          f.question.toLowerCase().includes(lowerQuery) ||
          lowerQuery.includes(f.question.toLowerCase())
      );

      if (matchedFaq) {
        return {
          id: "msg_" + Date.now(),
          conversation_id: conversationId,
          sender_type: "ai",
          message_type: "faq",
          message: `${matchedFaq.answer}`,
          metadata: {
            faq: matchedFaq,
            faqs: faqList,
            intent: "faq_answer",
            quick_replies: [
              { label: "⚡ Explore Services", action: "explore_services" },
              { label: "📦 Equipment Categories", action: "browse_categories" },
              { label: "👨💼 Connect to Agent", action: "connect_agent" },
            ],
          },
          created_at: now,
        };
      }
    }
  } catch { }

  // ─────────────────────────────────────────────────────────────
  // 7. KEYWORD SEARCH IN PRODUCTS & EQUIPMENT
  // ─────────────────────────────────────────────────────────────
  const cleanKeyword = userQuery
    .replace(/(show me|search for|i need|find|looking for|discounted|products|please|can you find)/gi, "")
    .trim();

  const searchKeyword = cleanKeyword || userQuery;

  if (searchKeyword && searchKeyword.length >= 2) {
    try {
      const prodRes = await getProducts({ search: searchKeyword, per_page: 6 });

      let productsList: ApiProduct[] = [];
      if (prodRes?.success && prodRes?.data) {
        if (Array.isArray(prodRes.data)) {
          productsList = prodRes.data;
        } else if (Array.isArray((prodRes.data as any).data)) {
          productsList = (prodRes.data as any).data;
        }
      }

      if (productsList.length > 0) {
        return {
          id: "msg_" + Date.now(),
          conversation_id: conversationId,
          sender_type: "ai",
          message_type: "product",
          message: `Here is the equipment matching "${searchKeyword}":`,
          metadata: {
            products: productsList,
            searchKeyword: searchKeyword,
            intent: "product_search",
          },
          created_at: now,
        };
      }
    } catch (err) {
      console.warn("Product search failed:", err);
    }
  }

  // Default Fallback
  return {
    id: "msg_" + Date.now(),
    conversation_id: conversationId,
    sender_type: "ai",
    message_type: "text",
    message: `I'm here to assist with Door Step BD's power solutions and services. How can I help you today?`,
    metadata: {
      quick_replies: DEFAULT_QUICK_REPLIES,
    },
    created_at: now,
  };
}

/**
 * Connect Customer to Agent after form submission (Starts Live Session)
 */
export async function submitAgentConnect(
  conversationId: string | number,
  payload: AgentConnectPayload
): Promise<{ success: boolean; message: ChatMessage }> {
  const now = new Date().toISOString();

  setStoredCustomerDetails(payload);

  const requestNotification = `Customer requested live agent support:\n• Full Name: ${payload.name}\n• Email: ${payload.email}\n• Phone Number: ${payload.phone}`;

  // Notify backend live chat system as a guest request so it does not attach admin token
  await sendCustomerMessage(conversationId, requestNotification, true).catch(() => { });

  return {
    success: true,
    message: {
      id: "msg_" + Date.now(),
      conversation_id: conversationId,
      sender_type: "system",
      message_type: "system",
      message: "You have been connected to Live Agent Queue. A support representative will join your chat shortly.",
      created_at: now,
    },
  };
}
