/**
 * Chatbot & Live Agent Chat API Service
 */

import { API_V1, getProducts, getFaqs, trackOrder, ApiProduct, ApiFaq } from "./api";

export type SenderType = "customer" | "ai" | "agent" | "system";
export type MessageType = "text" | "product" | "order" | "faq" | "system" | "form";
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
    order?: any;
    faq?: ApiFaq;
    faqs?: ApiFaq[];
    agent_name?: string;
    intent?: string;
    searchKeyword?: string;
    quick_replies?: { label: string; action: string; prompt?: string }[];
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
    // Generate fresh session token so backend history is completely decoupled
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
    message: "How can I help you?",
    metadata: {
      intent: "welcome",
      quick_replies: [
        { label: "🔎 Search Product", action: "search_product" },
        { label: "📦 Track Order", action: "track_order" },
        { label: "❓ Browse FAQs", action: "faq" },
        { label: "👨💼 Connect to Agent", action: "connect_agent" },
      ],
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

  // If customer has an active agent session stored, restore messages & approval status
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

  // Clean initial AI state
  const welcomeMessage: ChatMessage = {
    id: "welcome_1",
    conversation_id: storedId,
    sender_type: "ai",
    message_type: "text",
    message: "How can I help you?",
    metadata: {
      intent: "welcome",
      quick_replies: [
        { label: "🔎 Search Product", action: "search_product" },
        { label: "📦 Track Order", action: "track_order" },
        { label: "❓ Browse FAQs", action: "faq" },
        { label: "👨💼 Connect to Agent", action: "connect_agent" },
      ],
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
  const sessionId = getGuestSessionToken();

  try {
    const res = await fetch(`${API_V1}/chats?session_id=${encodeURIComponent(sessionId)}`, {
      headers: {
        "Accept": "application/json",
      },
    });

    if (res.ok) {
      const data = await res.json();
      const isBlocked = Boolean(data?.is_blocked);
      const isApproved = Boolean(data?.is_approved);
      if (Array.isArray(data?.data)) {
        const msgs = data.data.map((item: any) => ({
          id: item.id || ("msg_" + Math.random().toString(36).substring(2, 9)),
          conversation_id: conversationId,
          sender_type: item.sender === "admin" ? "agent" : (item.sender === "user" ? "customer" : "ai"),
          message_type: item.message_type || "text",
          message: item.message,
          metadata: item.metadata || null,
          created_at: item.created_at || new Date().toISOString(),
        }));
        return { messages: msgs, isBlocked, isApproved };
      }
      return { messages: [], isBlocked, isApproved };
    }
  } catch (err) {
    console.warn(`API /chats?session_id=${sessionId} failed:`, err);
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
  isGuest: boolean = true
): Promise<{ message: ChatMessage; isApproved: boolean; error?: string }> {
  const sessionId = getGuestSessionToken();
  const now = new Date().toISOString();

  try {
    const res = await fetch(`${API_V1}/chats`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        session_id: sessionId,
        message: messageText,
        is_guest: isGuest,
      }),
    });

    const data = await res.json().catch(() => null);

    if (res.ok && data?.data) {
      const item = data.data;
      return {
        message: {
          id: item.id || ("msg_" + Date.now()),
          conversation_id: conversationId,
          sender_type: item.sender === "admin" ? "agent" : "customer",
          message_type: "text",
          message: item.message,
          created_at: item.created_at || now,
        },
        isApproved: Boolean(data?.is_approved),
      };
    } else if (data?.message) {
      return {
        message: {
          id: "err_" + Date.now(),
          conversation_id: conversationId,
          sender_type: "system",
          message_type: "system",
          message: data.message,
          created_at: now,
        },
        isApproved: Boolean(data?.is_approved),
        error: data.message,
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
 * AI Query Processing (Product Search, FAQ Answers, Order Tracking, Agent Handover)
 */
export async function processAIQuery(
  conversationId: string | number,
  userQuery: string,
  actionHint?: "search_product" | "faq" | "track_order" | "connect_agent"
): Promise<ChatMessage> {
  const lowerQuery = userQuery.toLowerCase().trim();
  const now = new Date().toISOString();

  // ─────────────────────────────────────────────────────────────
  // 1. SEARCH PRODUCT FLOW
  // ─────────────────────────────────────────────────────────────
  const isInitialSearchClick =
    (actionHint === "search_product" && (lowerQuery.includes("want to search") || lowerQuery.includes("search product"))) ||
    lowerQuery === "🔎 search product" ||
    lowerQuery === "search product" ||
    lowerQuery === "search products" ||
    lowerQuery === "i want to search for products." ||
    lowerQuery === "i want to search for products";

  if (isInitialSearchClick) {
    return {
      id: "msg_" + Date.now(),
      conversation_id: conversationId,
      sender_type: "ai",
      message_type: "text",
      message: 'Sure! Just type the name or keyword of the product you are looking for in the chat (e.g. "Apple", "Rice", "Milk").',
      metadata: {
        intent: "search_prompt",
        quick_replies: [
          { label: "Apple", action: "search_keyword", prompt: "Apple" },
          { label: "Rice", action: "search_keyword", prompt: "Rice" },
          { label: "Milk", action: "search_keyword", prompt: "Milk" },
          { label: "Samsung", action: "search_keyword", prompt: "Samsung" },
          { label: "Shoes", action: "search_keyword", prompt: "Shoes" },
          { label: "T-shirt", action: "search_keyword", prompt: "T-shirt" },
        ],
      },
      created_at: now,
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 2. TRACK ORDER FLOW
  // ─────────────────────────────────────────────────────────────
  const isInitialTrackClick =
    (actionHint === "track_order" && (lowerQuery.includes("want to track") || lowerQuery.includes("track order"))) ||
    lowerQuery === "📦 track order" ||
    lowerQuery === "track order" ||
    lowerQuery === "i want to track my order." ||
    lowerQuery === "i want to track my order";

  if (isInitialTrackClick) {
    return {
      id: "msg_" + Date.now(),
      conversation_id: conversationId,
      sender_type: "ai",
      message_type: "text",
      message: "Please enter your Order Number (e.g. ORD-123456) in the form below.",
      metadata: {
        intent: "track_order_prompt",
      },
      created_at: now,
    };
  }

  const orderNumberMatch = userQuery.match(/#?([A-Za-z0-9\-_]{3,30})/);
  const isTrackingNumberInput =
    actionHint === "track_order" ||
    lowerQuery.startsWith("ord-") ||
    lowerQuery.startsWith("shp-") ||
    /^\d{3,10}$/.test(lowerQuery) ||
    ((lowerQuery.includes("track") || lowerQuery.includes("order")) &&
      orderNumberMatch &&
      orderNumberMatch[1] &&
      !["track", "order", "want", "help", "please", "my"].includes(orderNumberMatch[1].toLowerCase()));

  if (isTrackingNumberInput) {
    const orderNum = (orderNumberMatch ? orderNumberMatch[1] : userQuery).replace("#", "").trim();
    if (orderNum.length >= 2) {
      try {
        const orderRes = await trackOrder(orderNum);
        if (orderRes?.success && orderRes?.data) {
          const ord = orderRes.data;
          const statusText = ord.status
            ? ord.status.charAt(0).toUpperCase() + ord.status.slice(1)
            : "Processing";
          const formattedTotal = Number(ord.total || 0).toLocaleString("en-BD");

          return {
            id: "msg_" + Date.now(),
            conversation_id: conversationId,
            sender_type: "ai",
            message_type: "order",
            message: `Order #${ord.order_number || orderNum}\nStatus: ${statusText}\nTotal: ৳${formattedTotal}`,
            metadata: {
              order: ord,
              intent: "track_order",
            },
            created_at: now,
          };
        }
      } catch (err) {
        console.warn("trackOrder API failed:", err);
      }

      return {
        id: "msg_" + Date.now(),
        conversation_id: conversationId,
        sender_type: "ai",
        message_type: "text",
        message: "Sorry, I couldn't find an order with that order number. Please check your Order Number and try again.",
        metadata: {
          intent: "track_order_prompt",
        },
        created_at: now,
      };
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 3. BROWSE FAQS FLOW
  // ─────────────────────────────────────────────────────────────
  const isInitialFaqClick =
    (actionHint === "faq" && (lowerQuery.includes("browse faq") || lowerQuery.includes("faqs"))) ||
    lowerQuery === "❓ browse faqs" ||
    lowerQuery === "browse faqs" ||
    lowerQuery === "faq" ||
    lowerQuery === "faqs" ||
    lowerQuery === "i want to browse faqs." ||
    lowerQuery === "i want to browse faqs";

  if (isInitialFaqClick) {
    try {
      const faqRes = await getFaqs();
      const faqList = Array.isArray(faqRes?.data) ? faqRes.data : [];
      if (faqList.length > 0) {
        return {
          id: "msg_" + Date.now(),
          conversation_id: conversationId,
          sender_type: "ai",
          message_type: "faq",
          message: "Here are our frequently asked questions. Click any question to view its answer:",
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
    } catch (err) {
      console.warn("getFaqs API failed:", err);
    }
  }

  // Check if query matches an existing FAQ question or answer
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
              { label: "❓ Browse other FAQs", action: "faq", prompt: "Browse FAQs" },
              { label: "🔎 Search Product", action: "search_product" },
              { label: "👨💼 Connect to Agent", action: "connect_agent" },
            ],
          },
          created_at: now,
        };
      }
    }
  } catch { }

  // ─────────────────────────────────────────────────────────────
  // 4. CONNECT TO AGENT FLOW (FORM PROMPT)
  // ─────────────────────────────────────────────────────────────
  const isInitialAgentClick =
    actionHint === "connect_agent" ||
    lowerQuery === "👨💼 connect to agent" ||
    lowerQuery === "connect to agent" ||
    lowerQuery === "talk to agent" ||
    lowerQuery === "live agent" ||
    lowerQuery === "support agent";

  if (isInitialAgentClick) {
    return {
      id: "msg_" + Date.now(),
      conversation_id: conversationId,
      sender_type: "ai",
      message_type: "form",
      message: "Please complete all required fields before connecting to an agent.",
      metadata: {
        intent: "agent_form_prompt",
      },
      created_at: now,
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 5. PRODUCT SEARCH BY KEYWORD (ACTUAL DATABASE SEARCH)
  // ─────────────────────────────────────────────────────────────
  const cleanKeyword = userQuery
    .replace(/(show me|search for|i need|find|looking for|discounted|products|please|can you find)/gi, "")
    .trim();

  const searchKeyword = cleanKeyword || userQuery;

  if (searchKeyword && searchKeyword.length >= 2) {
    try {
      const prodRes = await getProducts({ search: searchKeyword, per_page: 8 });

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
          message: `Here are the products I found for "${searchKeyword}":`,
          metadata: {
            products: productsList,
            searchKeyword: searchKeyword,
            intent: "product_search",
          },
          created_at: now,
        };
      } else {
        return {
          id: "msg_" + Date.now(),
          conversation_id: conversationId,
          sender_type: "ai",
          message_type: "text",
          message: "Sorry, I couldn't find any products matching your search. Please try another keyword.",
          metadata: {
            intent: "search_prompt",
          },
          created_at: now,
        };
      }
    } catch (err) {
      console.warn("Product search failed:", err);
    }
  }

  // Fallback response
  return {
    id: "msg_" + Date.now(),
    conversation_id: conversationId,
    sender_type: "ai",
    message_type: "text",
    message: "Sorry, I couldn't find any products matching your search. Please try another keyword.",
    metadata: {
      quick_replies: [
        { label: "🔎 Search Product", action: "search_product" },
        { label: "📦 Track Order", action: "track_order" },
        { label: "❓ Browse FAQs", action: "faq" },
        { label: "👨💼 Connect to Agent", action: "connect_agent" },
      ],
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
      id: "sys_" + Date.now(),
      conversation_id: conversationId,
      sender_type: "system",
      message_type: "system",
      message: `Thank you, ${payload.name}. Your connection request has been sent to our Live Agent Queue. Please wait while an agent approves your session.`,
      created_at: now,
    },
  };
}

/**
 * Request Agent Handoff (fallback wrapper)
 */
export async function requestAgentConnect(
  conversationId: string | number
): Promise<{ success: boolean; message: ChatMessage }> {
  const now = new Date().toISOString();

  sendCustomerMessage(conversationId, "Customer requested to connect to agent.", true).catch(() => { });

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
