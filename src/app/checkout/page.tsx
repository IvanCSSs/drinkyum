"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { 
  ChevronLeft,
  Lock,
  Shield,
  Truck,
  CreditCard,
  Check,
  ChevronDown
} from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import Navbar from "@/components/Navbar";
import MobileLogo from "@/components/MobileLogo";
import Footer from "@/components/Footer";
import AddressAutocomplete from "@/components/AddressAutocomplete";

interface CartItem {
  id: number;
  name: string;
  price: string;
  priceNum: number;
  image: string;
  quantity: number;
}

// Checkout session data structure (mirrors what Medusa would store)
interface CheckoutSession {
  id: string;
  createdAt: string;
  updatedAt: string;
  email?: string;
  phone?: string;
  shippingAddress?: {
    firstName: string;
    lastName: string;
    address: string;
    apartment?: string;
    city: string;
    state: string;
    zipCode: string;
  };
  shippingMethod?: "standard" | "express";
  step: number;
  cartItems: CartItem[];
}

type WindowWithCart = typeof window & {
  getFullCartItems?: () => CartItem[];
  onFullCartUpdate?: (callback: (items: CartItem[]) => void) => void;
};

const CART_STORAGE_KEY = "yum-cart";
const CHECKOUT_STORAGE_KEY = "yum-checkout-session";

// Generate a simple checkout ID (in production, this comes from Medusa)
const generateCheckoutId = () => `chk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// US States for dropdown
const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
  "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
  "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
  "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
  "Wisconsin", "Wyoming"
];

// =============================================================================
// MEDUSA API PLACEHOLDERS
// These functions will be replaced with actual Medusa SDK calls
// =============================================================================

async function createCheckoutSession(cartItems: CartItem[]): Promise<CheckoutSession> {
  // TODO: Replace with Medusa API call
  // const { cart } = await medusa.carts.create({ region_id: "reg_xxx", items: cartItems });
  console.log("[Medusa Placeholder] Creating checkout session...");
  
  const session: CheckoutSession = {
    id: generateCheckoutId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    step: 1,
    cartItems,
  };
  
  return session;
}

async function updateCheckoutEmail(sessionId: string, email: string): Promise<void> {
  // TODO: Replace with Medusa API call
  // await medusa.carts.update(sessionId, { email });
  console.log(`[Medusa Placeholder] Saving email for session ${sessionId}:`, email);
  // This is the CRITICAL save for abandoned cart recovery
}

async function updateCheckoutPhone(sessionId: string, phone: string): Promise<void> {
  // TODO: Replace with Medusa API call
  console.log(`[Medusa Placeholder] Saving phone for session ${sessionId}:`, phone);
}

async function updateCheckoutShippingAddress(
  sessionId: string, 
  address: CheckoutSession["shippingAddress"]
): Promise<void> {
  // TODO: Replace with Medusa API call
  // await medusa.carts.update(sessionId, { shipping_address: address });
  console.log(`[Medusa Placeholder] Saving shipping address for session ${sessionId}:`, address);
}

async function updateCheckoutShippingMethod(sessionId: string, method: "standard" | "express"): Promise<void> {
  // TODO: Replace with Medusa API call
  // await medusa.carts.addShippingMethod(sessionId, { option_id: method });
  console.log(`[Medusa Placeholder] Saving shipping method for session ${sessionId}:`, method);
}

async function completeCheckout(sessionId: string): Promise<{ orderId: string }> {
  // TODO: Replace with Medusa API call
  // const { order } = await medusa.carts.complete(sessionId);
  console.log(`[Medusa Placeholder] Completing checkout for session ${sessionId}`);
  return { orderId: `order_${Date.now()}` };
}

// =============================================================================
// COMPONENT
// =============================================================================

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [checkoutId, setCheckoutId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Form state
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [apartment, setApartment] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [saveInfo, setSaveInfo] = useState(true);
  const [selectedShipping, setSelectedShipping] = useState<"standard" | "express">("standard");
  const [sameAsBilling, setSameAsBilling] = useState(true);
  
  // Billing address (only used if different from shipping)
  const [billingFirstName, setBillingFirstName] = useState("");
  const [billingLastName, setBillingLastName] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [billingApartment, setBillingApartment] = useState("");
  const [billingCity, setBillingCity] = useState("");
  const [billingState, setBillingState] = useState("");
  const [billingZipCode, setBillingZipCode] = useState("");
  
  // Marketing opt-ins (pre-checked for better conversion, user can uncheck)
  const [emailMarketing, setEmailMarketing] = useState(true);
  const [smsMarketing, setSmsMarketing] = useState(false);
  
  // Anti-bot & email validation
  const [honeypot, setHoneypot] = useState(""); // Bots fill this, humans don't see it
  const [formStartTime] = useState(Date.now()); // Track when form loaded
  const [emailWarning, setEmailWarning] = useState<string | null>(null);
  const [emailSuggestion, setEmailSuggestion] = useState<string | null>(null);
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);
  
  // reCAPTCHA v3 Site Key
  const RECAPTCHA_SITE_KEY = "6Lef7TUsAAAAANALvxWg6MERR4J_O6i2evG9bd91";
  
  // Load reCAPTCHA script
  useEffect(() => {
    if (document.getElementById("recaptcha-script")) {
      setRecaptchaLoaded(true);
      return;
    }
    
    const script = document.createElement("script");
    script.id = "recaptcha-script";
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
    script.async = true;
    script.defer = true;
    script.onload = () => setRecaptchaLoaded(true);
    document.head.appendChild(script);
  }, []);
  
  // Execute reCAPTCHA and get token
  const executeRecaptcha = async (): Promise<string | null> => {
    if (!recaptchaLoaded || typeof window === "undefined") return null;
    
    try {
      const grecaptcha = (window as typeof window & { grecaptcha: { ready: (cb: () => void) => void; execute: (key: string, options: { action: string }) => Promise<string> } }).grecaptcha;
      
      return new Promise((resolve) => {
        grecaptcha.ready(async () => {
          try {
            const token = await grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: "checkout" });
            resolve(token);
          } catch (err) {
            console.error("[reCAPTCHA] Execute error:", err);
            resolve(null);
          }
        });
      });
    } catch (err) {
      console.error("[reCAPTCHA] Error:", err);
      return null;
    }
  };
  
  // Common typos in email domains
  const EMAIL_TYPOS: Record<string, string> = {
    // Gmail typos
    "gmial.com": "gmail.com",
    "gmal.com": "gmail.com",
    "gmaill.com": "gmail.com",
    "gamil.com": "gmail.com",
    "gnail.com": "gmail.com",
    "gmail.co": "gmail.com",
    "gmail.con": "gmail.com",
    "gmali.com": "gmail.com",
    "gmali.om": "gmail.com",
    "gmail.om": "gmail.com",
    "gmai.com": "gmail.com",
    "gmil.com": "gmail.com",
    "gmaio.com": "gmail.com",
    "gmaikl.com": "gmail.com",
    "gmaik.com": "gmail.com",
    "gemail.com": "gmail.com",
    "gimail.com": "gmail.com",
    "hmail.com": "gmail.com",
    "g]mail.com": "gmail.com",
    // Hotmail typos
    "hotmal.com": "hotmail.com",
    "hotmai.com": "hotmail.com",
    "hotmail.co": "hotmail.com",
    "hotmial.com": "hotmail.com",
    "hotamil.com": "hotmail.com",
    "hotmeil.com": "hotmail.com",
    "hotmaill.com": "hotmail.com",
    // Outlook typos
    "outlok.com": "outlook.com",
    "outloo.com": "outlook.com",
    "outlool.com": "outlook.com",
    "outllok.com": "outlook.com",
    "outlook.co": "outlook.com",
    // Yahoo typos
    "yahooo.com": "yahoo.com",
    "yaho.com": "yahoo.com",
    "yahoo.co": "yahoo.com",
    "yhoo.com": "yahoo.com",
    "yhaoo.com": "yahoo.com",
    "yaoo.com": "yahoo.com",
    // iCloud typos
    "iclod.com": "icloud.com",
    "icloud.co": "icloud.com",
    "icoud.com": "icloud.com",
    "iclould.com": "icloud.com",
    // Common TLD typos
    "gmail.cmo": "gmail.com",
    "gmail.ocm": "gmail.com",
    "yahoo.cmo": "yahoo.com",
    "hotmail.cmo": "hotmail.com",
  };
  
  // Disposable email domains to block
  const DISPOSABLE_DOMAINS = [
    "mailinator.com", "tempmail.com", "throwaway.email", "guerrillamail.com",
    "10minutemail.com", "fakeinbox.com", "trashmail.com", "yopmail.com",
    "getnada.com", "maildrop.cc", "discard.email", "mailnesia.com",
    "temp-mail.org", "emailondeck.com", "mohmal.com", "tempail.com",
    "sharklasers.com", "spam4.me", "grr.la", "burnermail.io"
  ];
  
  // Check for suspicious bot patterns (firstname_lastname###@gmail.com)
  const checkSuspiciousPattern = (email: string): boolean => {
    const localPart = email.split("@")[0];
    // Pattern: word_word followed by 2-4 digits
    const suspiciousPattern = /^[a-z]+[._][a-z]+\d{2,4}$/i;
    // Pattern: just random looking with lots of numbers
    const tooManyNumbers = /\d{4,}/.test(localPart);
    return suspiciousPattern.test(localPart) || tooManyNumbers;
  };
  
  // Validate email on change/blur
  const validateEmail = (emailValue: string, isBlur: boolean = false) => {
    setEmailWarning(null);
    setEmailSuggestion(null);
    
    // Only show "required" message on blur, not while typing
    if (isBlur && !emailValue.trim()) {
      setEmailWarning("Email is required for order updates");
      return;
    }
    
    // Check for basic format on blur
    if (isBlur && emailValue && !emailValue.includes("@")) {
      setEmailWarning("Please enter a valid email address");
      return;
    }
    
    if (!emailValue || !emailValue.includes("@")) return;
    
    const domain = emailValue.split("@")[1]?.toLowerCase();
    if (!domain) {
      if (isBlur) setEmailWarning("Please enter a complete email address");
      return;
    }
    
    // Check for typos
    if (EMAIL_TYPOS[domain]) {
      const correctedEmail = emailValue.replace(domain, EMAIL_TYPOS[domain]);
      setEmailSuggestion(correctedEmail);
      return;
    }
    
    // Check for disposable emails
    if (DISPOSABLE_DOMAINS.includes(domain)) {
      setEmailWarning("Please use a permanent email address for order updates.");
      return;
    }
    
    // Check for suspicious bot patterns
    if (checkSuspiciousPattern(emailValue)) {
      // Don't show warning to user (they might be legit), but flag internally
      console.log("[Bot Detection] Suspicious email pattern:", emailValue);
    }
  };
  
  // Check if form was filled too fast (bot behavior)
  const isFormFilledTooFast = (): boolean => {
    const timeSpent = Date.now() - formStartTime;
    return timeSpent < 3000; // Less than 3 seconds = definitely a bot
  };
  
  // Check if user seems suspicious (but not definitely a bot)
  const isSuspiciousUser = (): boolean => {
    const timeSpent = Date.now() - formStartTime;
    const filledQuickly = timeSpent < 15000; // Less than 15 seconds is suspicious
    const suspiciousEmail = checkSuspiciousPattern(email);
    return filledQuickly || suspiciousEmail;
  };
  
  // Payment state (placeholder - will be tokenized via Stripe/payment provider)
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardName, setCardName] = useState("");

  // Debounce timer ref for auto-save
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fix: Prevent Google Maps from blocking keyboard shortcuts on all inputs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If Cmd/Ctrl is pressed and target is an input, ensure shortcuts work
      if ((e.metaKey || e.ctrlKey) && e.target instanceof HTMLInputElement) {
        const input = e.target;
        switch (e.key.toLowerCase()) {
          case 'a':
            e.preventDefault();
            e.stopPropagation();
            input.select();
            break;
          case 'c':
          case 'v':
          case 'x':
          case 'z':
            // Let browser handle but stop propagation to prevent Google Maps interference
            e.stopPropagation();
            break;
        }
      }
    };

    // Use capture phase to intercept before Google Maps
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, []);

  // =============================================================================
  // CHECKOUT SESSION MANAGEMENT
  // =============================================================================

  // Save checkout session to localStorage (and eventually to Medusa)
  const saveCheckoutSession = useCallback(() => {
    if (!checkoutId || !isInitialized) return;

    const session: CheckoutSession = {
      id: checkoutId,
      createdAt: "", // Would come from server
      updatedAt: new Date().toISOString(),
      email: email || undefined,
      phone: phone || undefined,
      shippingAddress: firstName ? {
        firstName,
        lastName,
        address,
        apartment: apartment || undefined,
        city,
        state,
        zipCode,
      } : undefined,
      shippingMethod: selectedShipping,
      step: currentStep,
      cartItems,
    };

    try {
      localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(session));
      console.log("[Checkout] Session saved locally:", session.id);
    } catch (e) {
      console.error("Failed to save checkout session:", e);
    }
  }, [checkoutId, isInitialized, email, phone, firstName, lastName, address, apartment, city, state, zipCode, selectedShipping, currentStep, cartItems]);

  // Auto-save with debounce (saves 2 seconds after last change)
  const triggerAutoSave = useCallback(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    autoSaveTimerRef.current = setTimeout(() => {
      saveCheckoutSession();
    }, 2000);
  }, [saveCheckoutSession]);

  // =============================================================================
  // FIELD-LEVEL SAVE HANDLERS (for abandoned checkout recovery)
  // =============================================================================

  // EMAIL - Most critical field for abandoned cart recovery
  const handleEmailBlur = useCallback(async () => {
    if (!email || !checkoutId) return;
    
    // Save to backend immediately (enables recovery emails)
    await updateCheckoutEmail(checkoutId, email);
    saveCheckoutSession();
  }, [email, checkoutId, saveCheckoutSession]);

  // PHONE - Secondary contact for SMS recovery
  const handlePhoneBlur = useCallback(async () => {
    if (!phone || !checkoutId) return;
    
    await updateCheckoutPhone(checkoutId, phone);
    saveCheckoutSession();
  }, [phone, checkoutId, saveCheckoutSession]);

  // ADDRESS FIELDS - Save on blur for any address field
  const handleAddressFieldBlur = useCallback(async () => {
    if (!checkoutId || !firstName) return;
    
    const addressData = {
      firstName,
      lastName,
      address,
      apartment: apartment || undefined,
      city,
      state,
      zipCode,
    };
    
    // Only save if we have minimum required fields
    if (firstName && lastName && address && city && state && zipCode) {
      await updateCheckoutShippingAddress(checkoutId, addressData);
    }
    
    saveCheckoutSession();
  }, [checkoutId, firstName, lastName, address, apartment, city, state, zipCode, saveCheckoutSession]);

  // SHIPPING METHOD - Save on selection change
  const handleShippingMethodChange = useCallback(async (method: "standard" | "express") => {
    setSelectedShipping(method);
    
    if (checkoutId) {
      await updateCheckoutShippingMethod(checkoutId, method);
      saveCheckoutSession();
    }
  }, [checkoutId, saveCheckoutSession]);

  // Initialize checkout session and load cart
  useEffect(() => {
    const initCheckout = async () => {
      const win = window as WindowWithCart;
      let initialItems: CartItem[] = [];
      
      // Try to get cart from global state first
      if (win.getFullCartItems) {
        initialItems = win.getFullCartItems();
      }
      
      // Fallback: read cart from localStorage
      if (initialItems.length === 0) {
        try {
          const saved = localStorage.getItem(CART_STORAGE_KEY);
          if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
              initialItems = parsed;
            }
          }
        } catch (e) {
          console.error("Failed to load cart:", e);
        }
      }
      
      if (initialItems.length > 0) {
        setCartItems(initialItems);
      }

      // Try to recover existing checkout session
      let existingSession: CheckoutSession | null = null;
      try {
        const savedSession = localStorage.getItem(CHECKOUT_STORAGE_KEY);
        if (savedSession) {
          existingSession = JSON.parse(savedSession);
        }
      } catch (e) {
        console.error("Failed to load checkout session:", e);
      }

      // If we have a valid existing session with same cart, restore it
      if (existingSession && existingSession.cartItems.length > 0) {
        console.log("[Checkout] Recovering session:", existingSession.id);
        
        setCheckoutId(existingSession.id);
        setCurrentStep(existingSession.step || 1);
        
        // Restore form fields
        if (existingSession.email) setEmail(existingSession.email);
        if (existingSession.phone) setPhone(existingSession.phone);
        if (existingSession.shippingAddress) {
          setFirstName(existingSession.shippingAddress.firstName || "");
          setLastName(existingSession.shippingAddress.lastName || "");
          setAddress(existingSession.shippingAddress.address || "");
          setApartment(existingSession.shippingAddress.apartment || "");
          setCity(existingSession.shippingAddress.city || "");
          setState(existingSession.shippingAddress.state || "");
          setZipCode(existingSession.shippingAddress.zipCode || "");
        }
        if (existingSession.shippingMethod) {
          setSelectedShipping(existingSession.shippingMethod);
        }
      } else {
        // Create new checkout session
        const newSession = await createCheckoutSession(initialItems);
        setCheckoutId(newSession.id);
        console.log("[Checkout] Created new session:", newSession.id);
      }

      setIsInitialized(true);
      
      // Subscribe to cart updates from Navbar
      if (win.onFullCartUpdate) {
        win.onFullCartUpdate((items) => {
          setCartItems(items);
        });
      }
    };

    initCheckout();
  }, []);

  // Calculations
  const subtotal = cartItems.reduce((sum, item) => sum + item.priceNum * item.quantity, 0);
  const shippingCost = subtotal >= 50 ? 0 : (selectedShipping === "express" ? 12.99 : 5.99);
  const tax = subtotal * 0.08; // 8% tax estimate
  const total = subtotal + shippingCost + tax;
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const isEmpty = cartItems.length === 0;

  const steps = [
    { id: 1, name: "Information" },
    { id: 2, name: "Shipping" },
    { id: 3, name: "Payment" },
  ];

  const canProceed = () => {
    if (currentStep === 1) {
      return email && firstName && lastName && address && city && state && zipCode;
    }
    if (currentStep === 2) {
      return selectedShipping;
    }
    return true;
  };

  // Handle step transitions (save session on each step)
  const handleStepChange = useCallback((newStep: number) => {
    setCurrentStep(newStep);
    // Save session with new step
    setTimeout(() => saveCheckoutSession(), 0);
  }, [saveCheckoutSession]);

  // Customer info structure for saving/loading
  interface SavedCustomerInfo {
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
    address: string;
    apartment: string;
    city: string;
    state: string;
    zipCode: string;
    emailMarketing: boolean;
    smsMarketing: boolean;
  }
  
  // Save customer info for next time
  // TODO: Replace with backend API call to Medusa customer endpoint
  const saveCustomerInfo = async (info: SavedCustomerInfo): Promise<void> => {
    console.log("[Customer Info] Saving for next time:", info);
    
    // Placeholder: In production, this would be an API call like:
    // await fetch('/api/customer/save-info', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(info)
    // });
    
    // Or with Medusa:
    // await medusa.customers.update(customerId, {
    //   metadata: { saved_checkout_info: info }
    // });
    
    // For now, just log it
    console.log("[Customer Info] Ready to save to backend:", JSON.stringify(info, null, 2));
  };
  
  // Load saved customer info
  // TODO: Replace with backend API call to fetch saved customer data
  const loadCustomerInfo = async (): Promise<SavedCustomerInfo | null> => {
    console.log("[Customer Info] Loading saved info...");
    
    // Placeholder: In production, this would be an API call like:
    // const response = await fetch('/api/customer/get-info');
    // return response.json();
    
    // Or with Medusa:
    // const customer = await medusa.customers.retrieve();
    // return customer.metadata?.saved_checkout_info;
    
    // For now, return null (no saved info)
    return null;
  };
  
  // Load saved customer info on mount (if logged in)
  useEffect(() => {
    const loadSavedInfo = async () => {
      const savedInfo = await loadCustomerInfo();
      if (savedInfo) {
        console.log("[Customer Info] Found saved info, pre-filling form");
        setEmail(savedInfo.email || "");
        setPhone(savedInfo.phone || "");
        setFirstName(savedInfo.firstName || "");
        setLastName(savedInfo.lastName || "");
        setAddress(savedInfo.address || "");
        setApartment(savedInfo.apartment || "");
        setCity(savedInfo.city || "");
        setState(savedInfo.state || "");
        setZipCode(savedInfo.zipCode || "");
        setEmailMarketing(savedInfo.emailMarketing ?? true);
        setSmsMarketing(savedInfo.smsMarketing ?? false);
      }
    };
    
    loadSavedInfo();
  }, []);

  // Handle final submission
  const handleSubmit = useCallback(async () => {
    if (!checkoutId) return;
    
    // Bot detection checks
    if (honeypot) {
      console.log("[Bot Detection] Honeypot filled - blocking submission");
      // Silently fail for bots (don't tell them why)
      return;
    }
    
    if (isFormFilledTooFast()) {
      console.log("[Bot Detection] Form filled too fast - blocking submission");
      // Silently fail for bots
      return;
    }
    
    // Only trigger reCAPTCHA for suspicious users
    if (isSuspiciousUser()) {
      console.log("[Bot Detection] Suspicious activity detected - verifying with reCAPTCHA");
      
      const recaptchaToken = await executeRecaptcha();
      if (recaptchaToken) {
        console.log("[reCAPTCHA] Token obtained for suspicious user, length:", recaptchaToken.length);
        // TODO: Send this token to backend for verification
        // Backend should call Google's API: POST https://www.google.com/recaptcha/api/siteverify
        // with secret key: 6Lef7TUsAAAAAE9Rvra5rkPkZ5D7RCDUaeg-Yfme
        // If score < 0.5, reject the order
        
        // For now, just log and continue (backend will do actual verification)
      } else {
        console.log("[reCAPTCHA] Failed to get token for suspicious user - blocking");
        // Block suspicious users who can't complete reCAPTCHA
        return;
      }
    } else {
      console.log("[Bot Detection] User appears legitimate - skipping reCAPTCHA");
    }
    
    try {
      // Complete checkout via Medusa
      const result = await completeCheckout(checkoutId);
      
      // Clear checkout session from localStorage
      localStorage.removeItem(CHECKOUT_STORAGE_KEY);
      
      // Save customer info if they opted in
      if (saveInfo) {
        await saveCustomerInfo({
          email,
          phone,
          firstName,
          lastName,
          address,
          apartment,
          city,
          state,
          zipCode,
          emailMarketing,
          smsMarketing,
        });
      }
      
      // Show success (in production, redirect to order confirmation page)
      alert(`Order submitted! Order ID: ${result.orderId}\n\n(This is a demo - no actual payment processed)`);
      
      // TODO: Redirect to /order-confirmation/[orderId]
      // router.push(`/order-confirmation/${result.orderId}`);
      
    } catch (error) {
      console.error("Checkout failed:", error);
      alert("Checkout failed. Please try again.");
    }
  }, [checkoutId]);

  if (isEmpty) {
    return (
      <main className="min-h-screen bg-yum-dark relative">
        <MobileLogo />
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <h1 className="text-3xl font-bold text-white mb-4">Your cart is empty</h1>
          <p className="text-white/60 mb-8">Add some items before checking out.</p>
          <Link 
            href="/collections"
            className="px-6 py-3 rounded-xl text-white font-medium transition-all hover:scale-105"
            style={{ background: "#E1258F" }}
          >
            Start Shopping
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-yum-dark relative">
      <MobileLogo />
      <Navbar />
      
      <section className="relative pt-28 lg:pt-36 pb-16 px-4">
        <div className="max-w-[1200px] mx-auto">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <Link 
              href="/cart"
              className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm"
            >
              <ChevronLeft size={16} />
              <span>Back to Cart</span>
            </Link>
          </motion.div>

          {/* Page Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 
              className="text-3xl lg:text-4xl font-bold mb-2"
              style={{
                background: "linear-gradient(180deg, #FFFFFF 0%, #CCCCCC 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Checkout
            </h1>
            
            {/* Step Indicator */}
            <div className="flex items-center gap-2 mt-6">
              {steps.map((step, idx) => (
                <div key={step.id} className="flex items-center">
                  <button
                    onClick={() => step.id < currentStep && handleStepChange(step.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      step.id === currentStep
                        ? "bg-yum-pink text-white"
                        : step.id < currentStep
                        ? "bg-green-500/20 text-green-400 cursor-pointer hover:bg-green-500/30"
                        : "bg-white/5 text-white/40"
                    }`}
                    disabled={step.id > currentStep}
                  >
                    {step.id < currentStep ? (
                      <Check size={14} />
                    ) : (
                      <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-xs">
                        {step.id}
                      </span>
                    )}
                    <span className="hidden sm:inline">{step.name}</span>
                  </button>
                  {idx < steps.length - 1 && (
                    <div className={`w-8 h-px mx-2 ${step.id < currentStep ? "bg-green-400" : "bg-white/20"}`} />
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Form Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-3"
            >
              {/* Step 1: Contact & Shipping Info */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  {/* Contact */}
                  <div 
                    className="p-6 rounded-2xl"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    <h2 className="text-lg font-semibold text-white mb-4">Contact Information</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="text-white/60 text-sm mb-1.5 block">Email <span className="text-yum-pink">*</span></label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => { 
                            setEmail(e.target.value); 
                            triggerAutoSave();
                            validateEmail(e.target.value);
                          }}
                          onBlur={() => {
                            handleEmailBlur();
                            validateEmail(email, true);
                          }}
                          placeholder="your@email.com"
                          required
                          className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder:text-white/30 focus:outline-none transition-colors ${
                            emailWarning ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-yum-pink'
                          }`}
                        />
                        
                        {/* Email typo suggestion */}
                        {emailSuggestion && (
                          <button
                            type="button"
                            onClick={() => {
                              setEmail(emailSuggestion);
                              setEmailSuggestion(null);
                              triggerAutoSave();
                            }}
                            className="mt-2 text-sm text-yum-cyan hover:text-yum-cyan/80 transition-colors"
                          >
                            Did you mean <span className="font-semibold underline">{emailSuggestion}</span>?
                          </button>
                        )}
                        
                        {/* Email warning */}
                        {emailWarning && (
                          <p className="mt-2 text-sm text-red-400">{emailWarning}</p>
                        )}
                      </div>
                      
                      {/* Honeypot field - hidden from humans, bots will fill it */}
                      <div className="absolute -left-[9999px]" aria-hidden="true">
                        <label htmlFor="website">Website</label>
                        <input
                          type="text"
                          id="website"
                          name="website"
                          value={honeypot}
                          onChange={(e) => setHoneypot(e.target.value)}
                          tabIndex={-1}
                          autoComplete="off"
                        />
                      </div>
                      <div>
                        <label className="text-white/60 text-sm mb-1.5 block">
                          Phone <span className="text-white/40">— for delivery updates & faster support</span>
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => { 
                            setPhone(e.target.value); 
                            triggerAutoSave();
                            // Auto-check SMS opt-in when user starts typing phone
                            if (e.target.value.length > 0 && !smsMarketing) {
                              setSmsMarketing(true);
                            }
                          }}
                          onBlur={handlePhoneBlur}
                          placeholder="(555) 123-4567"
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-yum-pink transition-colors"
                        />
                      </div>

                      {/* Marketing Opt-ins */}
                      <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                        <p className="text-white/50 text-sm">
                          Get real-time updates on your order status & delivery tracking
                        </p>
                        
                        {/* Email Marketing */}
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={emailMarketing}
                              onChange={(e) => setEmailMarketing(e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${emailMarketing ? 'bg-yum-pink border-yum-pink' : 'border-white/30 bg-transparent'}`}>
                              {emailMarketing && (
                                <Check size={12} className="text-white" strokeWidth={3} />
                              )}
                            </div>
                          </div>
                          <span className="text-white/70 text-sm group-hover:text-white/90 transition-colors">
                            Send me exclusive drops & early access deals
                          </span>
                        </label>

                        {/* SMS Marketing */}
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={smsMarketing}
                              onChange={(e) => setSmsMarketing(e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${smsMarketing ? 'bg-yum-cyan border-yum-cyan' : 'border-white/30 bg-transparent'}`}>
                              {smsMarketing && (
                                <Check size={12} className="text-white" strokeWidth={3} />
                              )}
                            </div>
                          </div>
                          <span className="text-white/70 text-sm group-hover:text-white/90 transition-colors">
                            Text me VIP-only flash sales & restock alerts
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div 
                    className="p-6 rounded-2xl"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    <h2 className="text-lg font-semibold text-white mb-4">Shipping Address</h2>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-white/60 text-sm mb-1.5 block">First Name <span className="text-yum-pink">*</span></label>
                          <input
                            type="text"
                            value={firstName}
                            onChange={(e) => { setFirstName(e.target.value); triggerAutoSave(); }}
                            onBlur={handleAddressFieldBlur}
                            placeholder="John"
                            required
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-yum-pink transition-colors"
                          />
                        </div>
                        <div>
                          <label className="text-white/60 text-sm mb-1.5 block">Last Name <span className="text-yum-pink">*</span></label>
                          <input
                            type="text"
                            value={lastName}
                            onChange={(e) => { setLastName(e.target.value); triggerAutoSave(); }}
                            onBlur={handleAddressFieldBlur}
                            placeholder="Doe"
                            required
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-yum-pink transition-colors"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-white/60 text-sm mb-1.5 block">Address <span className="text-yum-pink">*</span></label>
                        <AddressAutocomplete
                          value={address}
                          onChange={(val) => { setAddress(val); triggerAutoSave(); }}
                          onAddressSelect={(components) => {
                            // Auto-fill city, state, zip from selected address
                            if (components.city) setCity(components.city);
                            if (components.state) setState(components.state);
                            if (components.zipCode) setZipCode(components.zipCode);
                            triggerAutoSave();
                            handleAddressFieldBlur();
                          }}
                          placeholder="Start typing your address..."
                          required
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-yum-pink transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-white/60 text-sm mb-1.5 block">Apartment, suite, etc. <span className="text-white/40">(optional)</span></label>
                        <input
                          type="text"
                          value={apartment}
                          onChange={(e) => { setApartment(e.target.value); triggerAutoSave(); }}
                          onBlur={handleAddressFieldBlur}
                          placeholder="Apt 4B"
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-yum-pink transition-colors"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="text-white/60 text-sm mb-1.5 block">City <span className="text-yum-pink">*</span></label>
                          <input
                            type="text"
                            value={city}
                            onChange={(e) => { setCity(e.target.value); triggerAutoSave(); }}
                            onBlur={handleAddressFieldBlur}
                            placeholder="New York"
                            required
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-yum-pink transition-colors"
                          />
                        </div>
                        <div>
                          <label className="text-white/60 text-sm mb-1.5 block">State <span className="text-yum-pink">*</span></label>
                          <div className="relative">
                            <select
                              value={state}
                              onChange={(e) => { setState(e.target.value); triggerAutoSave(); handleAddressFieldBlur(); }}
                              required
                              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-yum-pink transition-colors appearance-none cursor-pointer"
                            >
                              <option value="" className="bg-yum-dark">Select</option>
                              {US_STATES.map((s) => (
                                <option key={s} value={s} className="bg-yum-dark">{s}</option>
                              ))}
                            </select>
                            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                          </div>
                        </div>
                        <div>
                          <label className="text-white/60 text-sm mb-1.5 block">ZIP Code <span className="text-yum-pink">*</span></label>
                          <input
                            type="text"
                            value={zipCode}
                            onChange={(e) => { setZipCode(e.target.value); triggerAutoSave(); }}
                            onBlur={handleAddressFieldBlur}
                            placeholder="10001"
                            required
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-yum-pink transition-colors"
                          />
                        </div>
                      </div>
                      <label className="flex items-center gap-3 cursor-pointer mt-2">
                        <input
                          type="checkbox"
                          checked={saveInfo}
                          onChange={(e) => setSaveInfo(e.target.checked)}
                          className="w-5 h-5 rounded border-white/20 bg-white/5 text-yum-pink focus:ring-yum-pink"
                        />
                        <span className="text-white/60 text-sm">Save this information for next time</span>
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={() => canProceed() && handleStepChange(2)}
                    disabled={!canProceed()}
                    className="w-full py-4 rounded-xl font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    style={{
                      background: canProceed() 
                        ? "linear-gradient(135deg, #E1258F 0%, #C01F7A 100%)"
                        : "rgba(255,255,255,0.1)",
                      boxShadow: canProceed() ? "0 4px 20px rgba(225,37,143,0.4)" : "none",
                    }}
                  >
                    Continue to Shipping
                  </button>
                </div>
              )}

              {/* Step 2: Shipping Method */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div 
                    className="p-6 rounded-2xl"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    <h2 className="text-lg font-semibold text-white mb-4">Shipping Method</h2>
                    <div className="space-y-3">
                      <button
                        onClick={() => handleShippingMethodChange("standard")}
                        className={`w-full p-4 rounded-xl text-left flex items-center justify-between transition-all ${
                          selectedShipping === "standard" ? "ring-2 ring-yum-pink bg-yum-pink/10" : "bg-white/5 hover:bg-white/10"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <Truck size={24} className={selectedShipping === "standard" ? "text-yum-pink" : "text-white/40"} />
                          <div>
                            <p className="text-white font-medium">Standard Shipping</p>
                            <p className="text-white/50 text-sm">5-7 business days</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-bold">
                            {subtotal >= 50 ? <span className="text-green-400">Free</span> : "$5.99"}
                          </p>
                        </div>
                      </button>
                      <button
                        onClick={() => handleShippingMethodChange("express")}
                        className={`w-full p-4 rounded-xl text-left flex items-center justify-between transition-all ${
                          selectedShipping === "express" ? "ring-2 ring-yum-pink bg-yum-pink/10" : "bg-white/5 hover:bg-white/10"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <Truck size={24} className={selectedShipping === "express" ? "text-yum-pink" : "text-white/40"} />
                          <div>
                            <p className="text-white font-medium">Express Shipping</p>
                            <p className="text-white/50 text-sm">2-3 business days</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-bold">$12.99</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Shipping Summary */}
                  <div 
                    className="p-4 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <p className="text-white/60 text-sm mb-1">Ship to:</p>
                    <p className="text-white">
                      {firstName} {lastName}, {address}{apartment ? `, ${apartment}` : ""}, {city}, {state} {zipCode}
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => handleStepChange(1)}
                      className="px-6 py-4 rounded-xl font-medium text-white/60 hover:text-white transition-colors"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                    >
                      Back
                    </button>
                    <button
                      onClick={() => handleStepChange(3)}
                      className="flex-1 py-4 rounded-xl font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                      style={{
                        background: "linear-gradient(135deg, #E1258F 0%, #C01F7A 100%)",
                        boxShadow: "0 4px 20px rgba(225,37,143,0.4)",
                      }}
                    >
                      Continue to Payment
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Payment */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div 
                    className="p-6 rounded-2xl"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <Lock size={20} className="text-green-400" />
                      <h2 className="text-lg font-semibold text-white">Payment</h2>
                      <div className="ml-auto flex items-center gap-2">
                        <span className="text-xs text-white/40">Powered by</span>
                        <span className="text-xs font-semibold text-white/70">Authorize.net</span>
                      </div>
                    </div>
                    
                    {/* Security notice */}
                    <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <Shield size={16} className="text-green-400 flex-shrink-0" />
                      <p className="text-xs text-green-300/80">
                        Your card details are encrypted and securely tokenized. We never store your full card number.
                      </p>
                    </div>
                    
                    {/* Accept.js hosted fields container */}
                    {/* TODO: Replace with actual Authorize.net Accept.js hosted fields */}
                    {/* See: https://developer.authorize.net/api/reference/features/acceptjs.html */}
                    <div className="space-y-4">
                      <div>
                        <label className="text-white/60 text-sm mb-1.5 block">Card Number <span className="text-yum-pink">*</span></label>
                        <div className="relative">
                          {/* In production, this would be an Accept.js hosted field */}
                          <input
                            type="text"
                            id="cardNumber"
                            data-authorize="cardNumber"
                            value={cardNumber}
                            onChange={(e) => {
                              // Format card number with spaces
                              const value = e.target.value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
                              setCardNumber(value);
                            }}
                            placeholder="1234 5678 9012 3456"
                            maxLength={19}
                            required
                            autoComplete="cc-number"
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-yum-pink transition-colors font-mono tracking-wider"
                          />
                          <CreditCard size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30" />
                        </div>
                      </div>
                      <div>
                        <label className="text-white/60 text-sm mb-1.5 block">Name on Card <span className="text-yum-pink">*</span></label>
                        <input
                          type="text"
                          id="cardName"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          placeholder="John Doe"
                          required
                          autoComplete="cc-name"
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-yum-pink transition-colors"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-white/60 text-sm mb-1.5 block">Expiry Date <span className="text-yum-pink">*</span></label>
                          <input
                            type="text"
                            id="cardExpiry"
                            data-authorize="expDate"
                            value={cardExpiry}
                            onChange={(e) => {
                              // Auto-format MM/YY
                              let value = e.target.value.replace(/\D/g, '');
                              if (value.length >= 2) {
                                value = value.slice(0, 2) + '/' + value.slice(2, 4);
                              }
                              setCardExpiry(value);
                            }}
                            placeholder="MM/YY"
                            maxLength={5}
                            required
                            autoComplete="cc-exp"
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-yum-pink transition-colors font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-white/60 text-sm mb-1.5 block">CVV <span className="text-yum-pink">*</span></label>
                          <input
                            type="text"
                            id="cardCvc"
                            data-authorize="cvv"
                            value={cardCvc}
                            onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ''))}
                            placeholder="123"
                            maxLength={4}
                            required
                            autoComplete="cc-csc"
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-yum-pink transition-colors font-mono"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Accepted cards */}
                    <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-3">
                      <span className="text-xs text-white/40">We accept:</span>
                      <div className="flex gap-2">
                        <div className="px-2 py-1 rounded bg-white/10 text-xs text-white/60 font-medium">Visa</div>
                        <div className="px-2 py-1 rounded bg-white/10 text-xs text-white/60 font-medium">Mastercard</div>
                        <div className="px-2 py-1 rounded bg-white/10 text-xs text-white/60 font-medium">Amex</div>
                        <div className="px-2 py-1 rounded bg-white/10 text-xs text-white/60 font-medium">Discover</div>
                      </div>
                    </div>
                  </div>

                  {/* Billing Address */}
                  <div 
                    className="p-6 rounded-2xl"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    <h2 className="text-lg font-semibold text-white mb-4">Billing Address</h2>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sameAsBilling}
                        onChange={(e) => setSameAsBilling(e.target.checked)}
                        className="w-5 h-5 rounded border-white/20 bg-white/5 text-yum-pink focus:ring-yum-pink"
                      />
                      <span className="text-white/80">Same as shipping address</span>
                    </label>
                    
                    {/* Billing address form - shown when not same as shipping */}
                    {!sameAsBilling && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 pt-4 border-t border-white/10 space-y-4"
                      >
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-white/60 text-sm mb-1.5 block">First Name <span className="text-yum-pink">*</span></label>
                            <input
                              type="text"
                              value={billingFirstName}
                              onChange={(e) => setBillingFirstName(e.target.value)}
                              placeholder="First name"
                              required
                              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-yum-pink transition-colors"
                            />
                          </div>
                          <div>
                            <label className="text-white/60 text-sm mb-1.5 block">Last Name <span className="text-yum-pink">*</span></label>
                            <input
                              type="text"
                              value={billingLastName}
                              onChange={(e) => setBillingLastName(e.target.value)}
                              placeholder="Last name"
                              required
                              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-yum-pink transition-colors"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-white/60 text-sm mb-1.5 block">Address <span className="text-yum-pink">*</span></label>
                          <input
                            type="text"
                            value={billingAddress}
                            onChange={(e) => setBillingAddress(e.target.value)}
                            placeholder="Street address"
                            required
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-yum-pink transition-colors"
                          />
                        </div>
                        
                        <div>
                          <label className="text-white/60 text-sm mb-1.5 block">Apartment, suite, etc. <span className="text-white/40">(optional)</span></label>
                          <input
                            type="text"
                            value={billingApartment}
                            onChange={(e) => setBillingApartment(e.target.value)}
                            placeholder="Apt, suite, unit, etc."
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-yum-pink transition-colors"
                          />
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="text-white/60 text-sm mb-1.5 block">City <span className="text-yum-pink">*</span></label>
                            <input
                              type="text"
                              value={billingCity}
                              onChange={(e) => setBillingCity(e.target.value)}
                              placeholder="City"
                              required
                              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-yum-pink transition-colors"
                            />
                          </div>
                          <div>
                            <label className="text-white/60 text-sm mb-1.5 block">State <span className="text-yum-pink">*</span></label>
                            <input
                              type="text"
                              value={billingState}
                              onChange={(e) => setBillingState(e.target.value)}
                              placeholder="State"
                              required
                              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-yum-pink transition-colors"
                            />
                          </div>
                          <div>
                            <label className="text-white/60 text-sm mb-1.5 block">ZIP <span className="text-yum-pink">*</span></label>
                            <input
                              type="text"
                              value={billingZipCode}
                              onChange={(e) => setBillingZipCode(e.target.value)}
                              placeholder="ZIP"
                              required
                              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-yum-pink transition-colors"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Order Summary */}
                  <div 
                    className="p-4 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <div className="flex justify-between mb-2">
                      <span className="text-white/60 text-sm">Ship to:</span>
                      <span className="text-white text-sm">{firstName} {lastName}, {city}, {state}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60 text-sm">Shipping:</span>
                      <span className="text-white text-sm">{selectedShipping === "express" ? "Express (2-3 days)" : "Standard (5-7 days)"}</span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => handleStepChange(2)}
                      className="px-6 py-4 rounded-xl font-medium text-white/60 hover:text-white transition-colors"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                    >
                      Back
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="flex-1 py-4 rounded-xl font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                      style={{
                        background: "linear-gradient(135deg, #E1258F 0%, #C01F7A 100%)",
                        boxShadow: "0 4px 20px rgba(225,37,143,0.4)",
                      }}
                    >
                      <Lock size={18} />
                      Pay ${total.toFixed(2)}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Order Summary Sidebar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2"
            >
              <div 
                className="sticky top-32 rounded-2xl p-6"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <h2 className="text-lg font-semibold text-white mb-4">
                  Order Summary ({itemCount} {itemCount === 1 ? "item" : "items"})
                </h2>

                {/* Items - padding to prevent badge clipping at edges */}
                <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto py-1 px-1 -mx-1 -my-1">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative flex-shrink-0">
                        <div 
                          className="w-16 h-16 rounded-lg overflow-hidden"
                          style={{ background: "rgba(20,20,20,0.5)" }}
                        >
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <span 
                          className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                          style={{ background: "#E1258F" }}
                        >
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium line-clamp-2">{item.name}</p>
                        <p className="text-white/50 text-sm">{item.price}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">
                          ${(item.priceNum * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-2 py-4 border-t border-white/10">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Subtotal</span>
                    <span className="text-white">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Shipping</span>
                    <span className="text-white">
                      {shippingCost === 0 ? <span className="text-green-400">Free</span> : `$${shippingCost.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Estimated Tax</span>
                    <span className="text-white">${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-white/10">
                    <span className="text-white font-semibold">Total</span>
                    <span className="text-white text-xl font-bold">${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="pt-4 border-t border-white/10 space-y-3">
                  <div className="flex items-center gap-2 text-white/50 text-xs">
                    <Lock size={14} className="text-green-400" />
                    <span>256-bit SSL Encryption</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/50 text-xs">
                    <Shield size={14} className="text-yum-cyan" />
                    <span>100% Satisfaction Guarantee</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/50 text-xs">
                    <Truck size={14} className="text-yum-gold" />
                    <span>Free shipping on orders $50+</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

