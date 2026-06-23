"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  Lock,
  Shield,
  Truck,
  CreditCard,
  Check,
  ChevronDown,
  Tag,
  X
} from "lucide-react";
import { useState, useEffect, useCallback, useRef, useMemo, Suspense } from "react";
import Navbar from "@/components/Navbar";
import MobileLogo from "@/components/MobileLogo";
import Footer from "@/components/Footer";
import AddressAutocomplete from "@/components/AddressAutocomplete";
import { useCart } from "@/contexts/CartContext";
import {
  updateCheckoutEmail,
  updateShippingAddress,
  updateBillingAddress,
  completeCheckout as completeCheckoutAPI,
  getPaymentConfig,
  type Address
} from "@/lib/wc-checkout";
import { trackCheckoutStep } from "@/lib/analytics";
import { trackBeginCheckout, type GtagItem } from "@/lib/gtag";
import { tracker } from "@/lib/tracker";
import { trackMetaEvent } from "@/components/MetaPixel";
import { klaviyoStartedCheckout, klaviyoIdentify } from "@/components/Klaviyo";
import { saveAbandonedCart } from "@/lib/abandoned-cart";

// Payment configuration from WordPress REST API
interface PaymentConfig {
  configured: boolean
  provider?: string
  enabledProviders?: string[]
  // Authorize.net
  apiLoginId?: string
  clientKey?: string
  // Stripe
  publishableKey?: string
  // Common
  sandbox?: boolean
  message?: string
}

interface PaymentResult {
  success: boolean
  transactionId?: string
  authCode?: string
  message?: string
  error?: string
  errorCode?: string
  provider?: string
  requiresAction?: boolean
  clientSecret?: string
  paymentIntentId?: string
}

// Stripe payment intent creation (placeholder until Stripe is configured)
async function createStripePaymentIntent(_params: {
  amount: number
  currency?: string
  description?: string
}): Promise<PaymentResult> {
  // WooCommerce Stripe gateway handles this

  return {
    success: false,
    error: "Stripe gateway not configured in WooCommerce"
  };
}

// Declare Accept.js types
declare global {
  interface Window {
    Accept?: {
      dispatchData: (
        secureData: {
          authData: { clientKey: string; apiLoginID: string };
          cardData: { cardNumber: string; month: string; year: string; cardCode: string };
        },
        callback: (response: AcceptJsResponse) => void
      ) => void;
    };
    Stripe?: (publishableKey: string) => StripeInstance;
  }
}

interface AcceptJsResponse {
  opaqueData?: {
    dataDescriptor: string;
    dataValue: string;
  };
  messages: {
    resultCode: "Ok" | "Error";
    message: Array<{ code: string; text: string }>;
  };
}

// Stripe types
interface StripeInstance {
  confirmCardPayment: (
    clientSecret: string,
    data?: {
      payment_method?: {
        card: StripeCardElement;
        billing_details?: {
          name?: string;
          email?: string;
          address?: {
            line1?: string;
            city?: string;
            state?: string;
            postal_code?: string;
            country?: string;
          };
        };
      };
    }
  ) => Promise<{ error?: { message: string }; paymentIntent?: { id: string; status: string } }>;
  elements: () => StripeElements;
}

interface StripeElements {
  create: (type: 'card', options?: Record<string, unknown>) => StripeCardElement;
}

interface StripeCardElement {
  mount: (selector: string | HTMLElement) => void;
  unmount: () => void;
  on: (event: string, handler: (event: { error?: { message: string } }) => void) => void;
}

interface CartItem {
  id: string | number;
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
// MEDUSA API HELPERS
// =============================================================================

async function createCheckoutSession(cartItems: CartItem[]): Promise<CheckoutSession> {
  // Use existing cart from CartContext - no need to create new one


  const session: CheckoutSession = {
    id: generateCheckoutId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    step: 1,
    cartItems,
  };

  return session;
}

async function saveEmailToCart(email: string): Promise<void> {
  try {
    await updateCheckoutEmail(email);

  } catch (err) {
    console.error("[Checkout] Failed to save email:", err);
  }
}

async function savePhoneToCart(phone: string): Promise<void> {
  // Phone is stored in cart metadata or shipping address

}

async function saveShippingAddressToCart(address: {
  firstName: string;
  lastName: string;
  address: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
}): Promise<void> {
  try {
    const medusaAddress: Address = {
      first_name: address.firstName,
      last_name: address.lastName,
      address_1: address.address,
      address_2: address.apartment || "",
      city: address.city,
      province: address.state,
      postal_code: address.zipCode,
      country_code: "us",
      phone: address.phone,
    };
    await updateShippingAddress(medusaAddress);

  } catch (err) {
    console.error("[Checkout] Failed to save shipping address:", err);
  }
}

async function saveBillingAddressToCart(address: {
  firstName: string;
  lastName: string;
  address: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
}): Promise<void> {
  try {
    const medusaAddress: Address = {
      first_name: address.firstName,
      last_name: address.lastName,
      address_1: address.address,
      address_2: address.apartment || "",
      city: address.city,
      province: address.state,
      postal_code: address.zipCode,
      country_code: "us",
    };
    await updateBillingAddress(medusaAddress);

  } catch (err) {
    console.error("[Checkout] Failed to save billing address:", err);
  }
}

// =============================================================================
// COMPONENT
// =============================================================================

function CheckoutPageInner() {
  // Get real cart data from CartContext
  const searchParams = useSearchParams();
  const isFreeSampleOffer = searchParams.get("offer") === "free-sample";
  const {
    items: contextItems,
    isLoading: cartLoading,
    coupons,
    discountTotal,
    shippingTotal,
    availableShippingRates,
    hasCalculatedShipping,
    applyCoupon,
    removeCoupon,
    updateShippingAddress,
    selectShippingRate: selectShippingRateContext,
    refreshCart,
  } = useCart();

  // Transform CartContext items to checkout format
  const cartItems = useMemo(() => contextItems.map(item => ({
    id: item.id,
    name: item.title,
    price: `$${item.unit_price.toFixed(2)}`,
    priceNum: item.unit_price,
    image: item.thumbnail || "/images/product-1.png",
    quantity: item.quantity,
  })), [contextItems]);

  // Check if cart contains any subscription items - require account creation
  const hasSubscription = useMemo(() =>
    contextItems.some(item => item.is_subscription),
    [contextItems]
  );

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
  const [confirmedShippingPrice, setConfirmedShippingPrice] = useState<number | null>(null);
  const [sameAsBilling, setSameAsBilling] = useState(true);

  // Shipping rates from WooCommerce (via cart context)
  const [loadingRates, setLoadingRates] = useState(false);
  // Find the currently selected rate from available rates
  const selectedRate = availableShippingRates.find(r => r.selected) || null;

  // Payment state
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig | null>(null);
  const [acceptJsLoaded, setAcceptJsLoaded] = useState(false);
  const [stripeLoaded, setStripeLoaded] = useState(false);
  const [stripeInstance, setStripeInstance] = useState<StripeInstance | null>(null);
  const [stripeCardElement, setStripeCardElement] = useState<StripeCardElement | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const stripeCardRef = useRef<HTMLDivElement>(null);

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
  
  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Anti-bot & email validation
  const [honeypot, setHoneypot] = useState(""); // Bots fill this, humans don't see it
  const [formStartTime] = useState(Date.now()); // Track when form loaded
  const [emailWarning, setEmailWarning] = useState<string | null>(null);
  const [emailSuggestion, setEmailSuggestion] = useState<string | null>(null);
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);
  
  // reCAPTCHA v3 Site Key
  const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";
  
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

  // Load payment SDK based on provider config
  useEffect(() => {
    const loadPaymentConfig = async () => {
      let config: PaymentConfig;

      try {
        config = await getPaymentConfig();
        setPaymentConfig(config);
      } catch (err) {
        // Endpoint not deployed yet - fall back to manual mode

        config = {
          configured: true,
          enabledProviders: ["manual"],
          provider: "manual",
          sandbox: true,
        };
        setPaymentConfig(config);
      }

      if (!config.configured) {

        return;
      }

      // Load appropriate SDK based on provider
      if (config.provider === "authorize_net") {
        // Load Accept.js script
        if (!document.getElementById("acceptjs-script")) {
          const script = document.createElement("script");
          script.id = "acceptjs-script";
          script.src = config.sandbox
            ? "https://jstest.authorize.net/v1/Accept.js"
            : "https://js.authorize.net/v1/Accept.js";
          script.async = true;
          script.onload = () => setAcceptJsLoaded(true);
          document.head.appendChild(script);
        } else {
          setAcceptJsLoaded(true);
        }
      } else if (config.provider === "stripe") {
        // Load Stripe.js
        if (!document.getElementById("stripejs-script")) {
          const script = document.createElement("script");
          script.id = "stripejs-script";
          script.src = "https://js.stripe.com/v3/";
          script.async = true;
          script.onload = () => {
            if (window.Stripe && config.publishableKey) {
              const stripe = window.Stripe(config.publishableKey);
              setStripeInstance(stripe);
              setStripeLoaded(true);
            }
          };
          document.head.appendChild(script);
        } else if (window.Stripe && config.publishableKey) {
          const stripe = window.Stripe(config.publishableKey);
          setStripeInstance(stripe);
          setStripeLoaded(true);
        }
      } else if (config.provider === "manual") {
        // Manual provider doesn't need any SDK

      }
    };

    loadPaymentConfig();
  }, []);

  // Mount Stripe card element when on payment step
  useEffect(() => {
    if (currentStep !== 3 || paymentConfig?.provider !== "stripe" || !stripeInstance) {
      return;
    }

    // Create and mount Stripe card element
    if (stripeCardRef.current && !stripeCardElement) {
      const elements = stripeInstance.elements();
      const cardElement = elements.create("card", {
        style: {
          base: {
            color: "#ffffff",
            fontFamily: "system-ui, sans-serif",
            fontSize: "16px",
            "::placeholder": { color: "rgba(255,255,255,0.3)" },
          },
          invalid: { color: "#ff6b6b" },
        },
      });
      cardElement.mount(stripeCardRef.current);
      cardElement.on("change", (event) => {
        if (event.error) {
          setPaymentError(event.error.message);
        } else {
          setPaymentError(null);
        }
      });
      setStripeCardElement(cardElement);
    }

    // Cleanup on unmount
    return () => {
      if (stripeCardElement) {
        stripeCardElement.unmount();
        setStripeCardElement(null);
      }
    };
  }, [currentStep, paymentConfig?.provider, stripeInstance, stripeCardElement]);

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

  // Save cart to abandoned cart system (for Klaviyo recovery emails)
  const saveToAbandonedCart = useCallback(async (customerInfo?: {
    email?: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
  }) => {
    if (!cartItems.length) return;

    const cartTotal = cartItems.reduce((sum, item) => sum + item.priceNum * item.quantity, 0);
    await saveAbandonedCart({
      cart: cartItems.map(item => ({
        product_id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.priceNum,
        image: item.image,
        permalink: `https://www.drinkyum.com/products/${item.id}`,
      })),
      cart_total: cartTotal,
      ...customerInfo,
    });
  }, [cartItems]);

  // EMAIL - Most critical field for abandoned cart recovery
  const handleEmailBlur = useCallback(async () => {
    if (!email) return;

    // Save to backend immediately (enables recovery emails)
    await saveEmailToCart(email);
    saveCheckoutSession();

    // Save to abandoned cart system with email (enables Klaviyo recovery)
    await saveToAbandonedCart({
      email,
      first_name: firstName || undefined,
      last_name: lastName || undefined,
      phone: phone || undefined,
    });

    // Track email entered event for customer tracking/abandoned cart
    const cartTotal = cartItems.reduce((sum, item) => sum + item.priceNum * item.quantity, 0);
    trackCheckoutStep('email_entered', {
      email,
      cart_total: cartTotal,
      item_count: cartItems.length,
    });
  }, [email, firstName, lastName, phone, saveCheckoutSession, cartItems, saveToAbandonedCart]);

  // PHONE - Secondary contact for SMS recovery
  const handlePhoneBlur = useCallback(async () => {
    if (!phone) return;

    await savePhoneToCart(phone);
    saveCheckoutSession();
  }, [phone, saveCheckoutSession]);

  // ADDRESS FIELDS - Save on blur for any address field
  const handleAddressFieldBlur = useCallback(async () => {
    if (!firstName) return;

    const addressData = {
      firstName,
      lastName,
      address,
      apartment: apartment || undefined,
      city,
      state,
      zipCode,
      phone: phone || undefined,
    };

    // Only save if we have minimum required fields
    if (firstName && lastName && address && city && state && zipCode) {
      await saveShippingAddressToCart(addressData);
    }

    // Update abandoned cart with customer info
    if (email) {
      await saveToAbandonedCart({
        email,
        first_name: firstName || undefined,
        last_name: lastName || undefined,
        phone: phone || undefined,
      });
    }

    saveCheckoutSession();
  }, [firstName, lastName, address, apartment, city, state, zipCode, phone, email, saveCheckoutSession, saveToAbandonedCart]);

  // SHIPPING METHOD - Save on selection change (for fallback options)
  const handleShippingMethodChange = useCallback(async (method: "standard" | "express") => {
    setSelectedShipping(method);
    if (method === "express") {
      setConfirmedShippingPrice(12.99);
    } else {
      const cartSubtotal = cartItems.reduce((sum, item) => sum + item.priceNum * item.quantity, 0);
      setConfirmedShippingPrice(isFreeSampleOffer ? 8.99 : cartSubtotal >= 50 ? 0 : 5.99);
    }
    saveCheckoutSession();
  }, [saveCheckoutSession, isFreeSampleOffer, cartItems]);

  // Initialize checkout session (cart data now comes from CartContext)
  useEffect(() => {
    // Prevent re-initialization after first load (e.g., when cartItems changes due to coupon)
    if (isInitialized) return;

    const initCheckout = async () => {
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

      // If we have a valid existing session, restore form fields
      if (existingSession && existingSession.id) {


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
        const newSession = await createCheckoutSession(cartItems);
        setCheckoutId(newSession.id);


        // Track checkout started event
        trackCheckoutStep('started', {
          checkout_id: newSession.id,
          cart_total: newSession.cartItems.reduce((sum: number, item: { priceNum: number; quantity: number }) => sum + item.priceNum * item.quantity, 0),
          item_count: newSession.cartItems.length,
        });

        // GA4 begin_checkout event
        const gtagItems: GtagItem[] = newSession.cartItems.map((item: { id: string | number; name: string; priceNum: number; quantity: number }) => ({
          item_id: String(item.id),
          item_name: item.name,
          price: item.priceNum,
          quantity: item.quantity,
          currency: 'USD',
        }));
        trackBeginCheckout(
          gtagItems,
          newSession.cartItems.reduce((sum: number, item: { priceNum: number; quantity: number }) => sum + item.priceNum * item.quantity, 0),
          'USD'
        );
        // First-party tracker (ad-blocker resistant)
        const checkoutValue = newSession.cartItems.reduce((sum: number, item: { priceNum: number; quantity: number }) => sum + item.priceNum * item.quantity, 0);
        tracker.beginCheckout(
          newSession.cartItems.map((item: { id: string | number; name: string; priceNum: number; quantity: number }) => ({
            id: String(item.id),
            name: item.name,
            price: item.priceNum,
            quantity: item.quantity,
          })),
          checkoutValue,
          'USD'
        );
        // Browser pixel
        trackMetaEvent('InitiateCheckout', {
          content_ids: newSession.cartItems.map((item: { id: string | number }) => String(item.id)),
          content_type: 'product',
          num_items: newSession.cartItems.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0),
          value: checkoutValue,
          currency: 'USD',
        });
        // Klaviyo started checkout
        klaviyoStartedCheckout({
          $value: checkoutValue,
          CheckoutURL: window.location.href,
          Items: newSession.cartItems.map((item: { id: string | number; name: string; priceNum: number; quantity: number }) => ({
            ProductID: String(item.id),
            ProductName: item.name,
            Quantity: item.quantity,
            Price: item.priceNum,
          })),
        });

        // Save to abandoned cart system (initial save without email)
        saveAbandonedCart({
          cart: newSession.cartItems.map((item: { id: string | number; name: string; priceNum: number; quantity: number; image: string }) => ({
            product_id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.priceNum,
            image: item.image,
          })),
          cart_total: checkoutValue,
        });
      }

      setIsInitialized(true);
    };

    // Only init once cart is loaded
    if (!cartLoading) {
      initCheckout();
    }
  }, [cartLoading, cartItems, isInitialized]);

  // Update cart shipping address when address fields change
  // This triggers WooCommerce to calculate shipping rates
  const updateCartShippingAddress = useCallback(async () => {
    if (!firstName || !lastName || !address || !city || !state || !zipCode) return;

    setLoadingRates(true);
    try {
      await updateShippingAddress({
        first_name: firstName,
        last_name: lastName,
        address_1: address,
        address_2: apartment || undefined,
        city,
        province: state,
        postal_code: zipCode,
        country_code: "US",
        phone: phone || undefined,
      });
      // Shipping rates are now available in availableShippingRates from context
    } catch (err) {
      console.error("Failed to update shipping address:", err);
    } finally {
      setLoadingRates(false);
    }
  }, [firstName, lastName, address, apartment, city, state, zipCode, phone, updateShippingAddress]);

  // Debounce timer ref for shipping address calculation
  const shippingAddressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch rates when address is complete (even on Step 1 for accurate sidebar)
  // Debounced to prevent API calls on every keystroke
  useEffect(() => {
    // Clear any pending debounce
    if (shippingAddressTimerRef.current) {
      clearTimeout(shippingAddressTimerRef.current);
    }

    // Only trigger if all required fields are filled
    if (firstName && lastName && address && city && state && zipCode && !hasCalculatedShipping) {
      // Debounce the API call by 500ms
      shippingAddressTimerRef.current = setTimeout(() => {
        updateCartShippingAddress();
      }, 500);
    }

    return () => {
      if (shippingAddressTimerRef.current) {
        clearTimeout(shippingAddressTimerRef.current);
      }
    };
  }, [firstName, lastName, address, city, state, zipCode, hasCalculatedShipping, updateCartShippingAddress]);

  // Calculations
  const subtotal = cartItems.reduce((sum, item) => sum + item.priceNum * item.quantity, 0);
  // Use confirmed shipping price (set when user selects a method or clicks Continue to Payment)
  // Fall back to shippingTotal from cart, then selectedRate, then null
  const shippingCost = confirmedShippingPrice !== null
    ? confirmedShippingPrice
    : hasCalculatedShipping && shippingTotal > 0
      ? shippingTotal
      : selectedRate
        ? selectedRate.price
        : null;
  const tax = (subtotal - discountTotal) * 0.08; // 8% tax estimate on discounted subtotal
  const total = subtotal - discountTotal + (shippingCost ?? 0) + tax;

  // Coupon handlers
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setIsApplyingCoupon(true);
    setCouponError("");

    try {
      await applyCoupon(couponCode.trim());
      setCouponCode("");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Invalid or expired code";
      setCouponError(errorMessage);
      console.error("Coupon apply error:", err);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = async (code: string) => {
    try {
      await removeCoupon(code);
    } catch (err) {
      console.error("Failed to remove coupon:", err);
    }
  };
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Only treat the cart as empty once it has actually loaded — otherwise
  // a fresh navigation (or a cart handoff from .co) briefly flashes the
  // "your cart is empty" state while the cart hydrates.
  const isEmpty = !cartLoading && cartItems.length === 0;

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
    // Scroll to top on step change for better UX
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  };
  
  // Load saved customer info
  // TODO: Replace with backend API call to fetch saved customer data
  const loadCustomerInfo = async (): Promise<SavedCustomerInfo | null> => {

    
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

    const checkoutStartedAt = performance.now();
    console.log('[Checkout][TIMING] submit_start', { checkoutId, startedAt: checkoutStartedAt });
    
    // Bot detection checks
    if (honeypot) {

      // Silently fail for bots (don't tell them why)
      return;
    }
    
    if (isFormFilledTooFast()) {

      // Silently fail for bots
      return;
    }
    
    // Only trigger reCAPTCHA for suspicious users
    if (isSuspiciousUser()) {

      
      const recaptchaToken = await executeRecaptcha();
      if (recaptchaToken) {

        // TODO: Send this token to backend for verification
        // Backend should call Google's API: POST https://www.google.com/recaptcha/api/siteverify
        // with secret key: 6Lef7TUsAAAAAE9Rvra5rkPkZ5D7RCDUaeg-Yfme
        // If score < 0.5, reject the order
        
        // For now, just log and continue (backend will do actual verification)
      } else {

        // Block suspicious users who can't complete reCAPTCHA
        return;
      }
    } else {

    }
    
    setProcessingPayment(true);
    setPaymentError(null);

    try {
      // Save billing address if different from shipping
      if (!sameAsBilling && billingFirstName && billingAddress && billingCity && billingState && billingZipCode) {
        await saveBillingAddressToCart({
          firstName: billingFirstName,
          lastName: billingLastName,
          address: billingAddress,
          apartment: billingApartment,
          city: billingCity,
          state: billingState,
          zipCode: billingZipCode,
        });
      }

      // Process payment based on configured provider
      if (!paymentConfig?.configured) {
        throw new Error("Payment processing is not configured");
      }

      const provider = paymentConfig.provider;

      const billingInfo = {
        firstName: sameAsBilling ? firstName : billingFirstName,
        lastName: sameAsBilling ? lastName : billingLastName,
        address: sameAsBilling ? address : billingAddress,
        city: sameAsBilling ? city : billingCity,
        state: sameAsBilling ? state : billingState,
        zip: sameAsBilling ? zipCode : billingZipCode,
        country: "US",
        email: email,
      };

      if (provider === "authorize_net") {
        // AUTHORIZE.NET: Use Accept.js to tokenize the card
        if (!paymentConfig.apiLoginId) {
          throw new Error("Authorize.net is not properly configured");
        }

        if (!acceptJsLoaded || !window.Accept) {
          throw new Error("Payment system is still loading. Please wait and try again.");
        }

        // Validate card fields
        if (!cardNumber || !cardExpiry || !cardCvc) {
          throw new Error("Please fill in all card details");
        }

        const [expMonth, expYear] = cardExpiry.split("/");
        if (!expMonth || !expYear) {
          throw new Error("Invalid expiry date format");
        }



        const tokenizationStartedAt = performance.now();
        const opaqueData = await new Promise<{ dataDescriptor: string; dataValue: string }>((resolve, reject) => {
          const secureData = {
            authData: {
              clientKey: paymentConfig.clientKey || "",
              apiLoginID: paymentConfig.apiLoginId!,
            },
            cardData: {
              cardNumber: cardNumber.replace(/\s/g, ""),
              month: expMonth.padStart(2, "0"),
              year: "20" + expYear,
              cardCode: cardCvc,
            },
          };

          window.Accept!.dispatchData(secureData, (response: AcceptJsResponse) => {
            if (response.messages.resultCode === "Ok" && response.opaqueData) {
              resolve(response.opaqueData);
            } else {
              const errorMsg = response.messages.message[0]?.text || "Card tokenization failed";
              reject(new Error(errorMsg));
            }
          });
        });
        console.log('[Checkout][TIMING] authorizenet_tokenized', {
          elapsedMs: Math.round(performance.now() - tokenizationStartedAt),
        });

        // WooCommerce handles payment processing in completeCheckout
        // Pass opaque data via payment_data array (WooCommerce Store API format)
        // For subscriptions, we must create an account
        const checkoutApiStartedAt = performance.now();
        const result = await completeCheckoutAPI({
          payment_method: "authorizenet",
          payment_data: [
            { key: "authorizenet-data-descriptor", value: opaqueData.dataDescriptor },
            { key: "authorizenet-data-value", value: opaqueData.dataValue },
          ],
          billing_address: {
            first_name: billingInfo.firstName,
            last_name: billingInfo.lastName,
            address_1: billingInfo.address,
            address_2: sameAsBilling ? (apartment || "") : (billingApartment || ""),
            city: billingInfo.city,
            state: billingInfo.state,
            postcode: billingInfo.zip,
            country: billingInfo.country,
            email: billingInfo.email,
            phone: phone || "",
          },
          shipping_address: {
            first_name: firstName,
            last_name: lastName,
            address_1: address,
            address_2: apartment || "",
            city: city,
            state: state,
            postcode: zipCode,
            country: "US",
            phone: phone || "",
          },
          create_account: hasSubscription, // Create account for subscription orders
        });

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

        if (result.type === "order") {
          const order = result.data as { id: string; display_id: number; order_key: string };


          // Track checkout completed event
          trackCheckoutStep('completed', {
            order_id: order.id,
            order_display_id: order.display_id,
            total: total,
            item_count: cartItems.length,
            payment_method: 'authorizenet',
          });

          // Subscribe to Klaviyo marketing per the checkout consent boxes.
          // Server-side (the only way to set real marketing consent — the
          // client identify calls don't). Fire-and-forget so it never blocks
          // the redirect; keepalive lets it complete after navigation.
          if (emailMarketing || smsMarketing) {
            fetch("/api/klaviyo/subscribe", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              keepalive: true,
              body: JSON.stringify({
                email,
                phone: phone || undefined,
                firstName,
                lastName,
                emailConsent: emailMarketing,
                smsConsent: smsMarketing,
              }),
            }).catch(() => {});
          }

          window.location.href = `/order-confirmation/${order.id}?key=${order.order_key}`;
          return;
        } else {
          throw new Error("Checkout failed - order not created");
        }

      } else if (provider === "stripe") {
        // STRIPE: Use Stripe.js to confirm payment
        // Note: Stripe is not currently configured - this is placeholder code
        if (!stripeInstance || !stripeCardElement) {
          throw new Error("Stripe is still loading. Please wait and try again.");
        }



        // First create a payment intent on our backend
        const intentResult = await createStripePaymentIntent({
          amount: Math.round(total * 100),
          description: "DrinkYUM Order",
        });

        if (!intentResult.clientSecret) {
          throw new Error(intentResult.error || "Failed to create payment intent");
        }



        // Confirm payment with Stripe.js
        const { error, paymentIntent } = await stripeInstance.confirmCardPayment(
          intentResult.clientSecret,
          {
            payment_method: {
              card: stripeCardElement,
              billing_details: {
                name: `${billingInfo.firstName} ${billingInfo.lastName}`,
                email: billingInfo.email,
                address: {
                  line1: billingInfo.address,
                  city: billingInfo.city,
                  state: billingInfo.state,
                  postal_code: billingInfo.zip,
                  country: billingInfo.country,
                },
              },
            },
          }
        );

        if (error) {
          throw new Error(error.message);
        }

        if (paymentIntent?.status !== "succeeded") {
          throw new Error("Payment was not successful");
        }



        // Complete checkout via WooCommerce with Stripe payment data
        const result = await completeCheckoutAPI({
          payment_method: "stripe",
          payment_data: [
            { key: "stripe_payment_intent_id", value: paymentIntent.id },
          ],
          billing_address: {
            first_name: billingInfo.firstName,
            last_name: billingInfo.lastName,
            address_1: billingInfo.address,
            address_2: sameAsBilling ? (apartment || "") : (billingApartment || ""),
            city: billingInfo.city,
            state: billingInfo.state,
            postcode: billingInfo.zip,
            country: billingInfo.country,
            email: billingInfo.email,
            phone: phone || "",
          },
          shipping_address: {
            first_name: firstName,
            last_name: lastName,
            address_1: address,
            address_2: apartment || "",
            city: city,
            state: state,
            postcode: zipCode,
            country: "US",
            phone: phone || "",
          },
          create_account: hasSubscription, // Create account for subscription orders
        });

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

        if (result.type === "order") {
          const order = result.data as { id: string; display_id: number; order_key: string };


          // Track checkout completed event
          trackCheckoutStep('completed', {
            order_id: order.id,
            order_display_id: order.display_id,
            total: total,
            item_count: cartItems.length,
            payment_method: 'stripe',
          });

          window.location.href = `/order-confirmation/${order.id}?key=${order.order_key}`;
          return;
        } else {
          throw new Error("Checkout failed - order not created");
        }

      } else if (provider === "manual" || provider === "cod" || provider === "bacs") {
        // MANUAL/COD/BACS: No card processing needed


        const result = await completeCheckoutAPI({
          payment_method: provider,
          billing_address: {
            first_name: billingInfo.firstName,
            last_name: billingInfo.lastName,
            address_1: billingInfo.address,
            address_2: sameAsBilling ? (apartment || "") : (billingApartment || ""),
            city: billingInfo.city,
            state: billingInfo.state,
            postcode: billingInfo.zip,
            country: billingInfo.country,
            email: billingInfo.email,
            phone: phone || "",
          },
          shipping_address: {
            first_name: firstName,
            last_name: lastName,
            address_1: address,
            address_2: apartment || "",
            city: city,
            state: state,
            postcode: zipCode,
            country: "US",
            phone: phone || "",
          },
          create_account: hasSubscription, // Create account for subscription orders
        });

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

        if (result.type === "order") {
          const order = result.data as { id: string; display_id: number; order_key: string };


          // Track checkout completed event
          trackCheckoutStep('completed', {
            order_id: order.id,
            order_display_id: order.display_id,
            total: total,
            item_count: cartItems.length,
            payment_method: provider,
          });

          window.location.href = `/order-confirmation/${order.id}?key=${order.order_key}`;
          return;
        } else {
          throw new Error("Checkout failed - order not created");
        }

      } else {
        throw new Error(`Unsupported payment provider: ${provider}`);
      }

    } catch (error: unknown) {
      console.error("Checkout failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setPaymentError(errorMessage);
    } finally {
      setProcessingPayment(false);
    }
  }, [
    sameAsBilling, billingFirstName, billingLastName, billingAddress, billingApartment,
    billingCity, billingState, billingZipCode, saveInfo, email, phone, firstName,
    lastName, address, apartment, city, state, zipCode, emailMarketing, smsMarketing,
    cardNumber, cardExpiry, cardCvc, paymentConfig, acceptJsLoaded, checkoutId, total
  ]);

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
                      {loadingRates ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="w-8 h-8 border-2 border-yum-pink border-t-transparent rounded-full animate-spin" />
                          <span className="ml-3 text-white/60">Fetching shipping rates...</span>
                        </div>
                      ) : availableShippingRates.length > 0 ? (
                        // Dynamic rates from WooCommerce
                        availableShippingRates.map((rate) => (
                          <button
                            key={rate.id}
                            onClick={() => selectShippingRateContext(rate.id)}
                            className={`w-full p-4 rounded-xl text-left flex items-center justify-between transition-all ${
                              rate.selected ? "ring-2 ring-yum-pink bg-yum-pink/10" : "bg-white/5 hover:bg-white/10"
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <Truck size={24} className={rate.selected ? "text-yum-pink" : "text-white/40"} />
                              <div>
                                <p className="text-white font-medium">{rate.name}</p>
                                <p className="text-white/50 text-sm">
                                  {rate.delivery_time || 'Estimated delivery varies'}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-white font-bold">
                                {rate.price === 0 ? <span className="text-green-400">Free</span> : `$${rate.price.toFixed(2)}`}
                              </p>
                            </div>
                          </button>
                        ))
                      ) : (
                        // Fallback to hardcoded options if no rates
                        <>
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
                                {isFreeSampleOffer ? "$8.99" : subtotal >= 50 ? <span className="text-green-400">Free</span> : "$5.99"}
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
                        </>
                      )}
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
                      onClick={async () => {
                        // Capture the shipping price before moving to payment
                        if (confirmedShippingPrice === null) {
                          const currentRate = availableShippingRates.find(r => r.selected);
                          if (currentRate) {
                            setConfirmedShippingPrice(currentRate.price);
                          } else if (shippingTotal > 0) {
                            setConfirmedShippingPrice(shippingTotal);
                          } else {
                            const cartSubtotal = cartItems.reduce((sum, item) => sum + item.priceNum * item.quantity, 0);
                            setConfirmedShippingPrice(isFreeSampleOffer ? 8.99 : cartSubtotal >= 50 ? 0 : 5.99);
                          }
                        }
                        handleStepChange(3);
                      }}
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
                        <span className="text-xs font-semibold text-white/70">
                          {paymentConfig?.provider === "stripe" ? "Stripe" :
                           paymentConfig?.provider === "authorize_net" ? "Authorize.net" :
                           paymentConfig?.provider === "manual" ? "Manual" : "Secure Payment"}
                        </span>
                      </div>
                    </div>

                    {/* Security notice */}
                    <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <Shield size={16} className="text-green-400 flex-shrink-0" />
                      <p className="text-xs text-green-300/80">
                        Your card details are encrypted and securely tokenized. We never store your full card number.
                      </p>
                    </div>

                    {/* STRIPE Payment Form */}
                    {paymentConfig?.provider === "stripe" && (
                      <div className="space-y-4">
                        <div>
                          <label className="text-white/60 text-sm mb-1.5 block">Card Details <span className="text-yum-pink">*</span></label>
                          <div
                            ref={stripeCardRef}
                            className="w-full px-4 py-4 rounded-xl bg-white/5 border border-white/10 focus-within:border-yum-pink transition-colors"
                          />
                          {!stripeLoaded && (
                            <p className="text-white/40 text-sm mt-2">Loading secure payment form...</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* AUTHORIZE.NET Payment Form */}
                    {paymentConfig?.provider === "authorize_net" && (
                      <div className="space-y-4">
                        <div>
                          <label className="text-white/60 text-sm mb-1.5 block">Card Number <span className="text-yum-pink">*</span></label>
                          <div className="relative">
                            <input
                              type="text"
                              id="cardNumber"
                              data-authorize="cardNumber"
                              value={cardNumber}
                              onChange={(e) => {
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
                    )}

                    {/* MANUAL Payment (for testing) */}
                    {paymentConfig?.provider === "manual" && (
                      <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                        <p className="text-yellow-300 text-sm">
                          <strong>Test Mode:</strong> No payment will be processed. Click "Complete Order" to place a test order.
                        </p>
                      </div>
                    )}

                    {/* No payment configured */}
                    {!paymentConfig?.configured && (
                      <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                        <p className="text-red-300 text-sm">
                          Payment processing is not configured. Please contact support.
                        </p>
                      </div>
                    )}

                    {/* Accepted cards */}
                    {(paymentConfig?.provider === "stripe" || paymentConfig?.provider === "authorize_net") && (
                      <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-3">
                        <span className="text-xs text-white/40">We accept:</span>
                        <div className="flex gap-2">
                          <div className="px-2 py-1 rounded bg-white/10 text-xs text-white/60 font-medium">Visa</div>
                          <div className="px-2 py-1 rounded bg-white/10 text-xs text-white/60 font-medium">Mastercard</div>
                          <div className="px-2 py-1 rounded bg-white/10 text-xs text-white/60 font-medium">Amex</div>
                          <div className="px-2 py-1 rounded bg-white/10 text-xs text-white/60 font-medium">Discover</div>
                        </div>
                      </div>
                    )}
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

                  {/* Payment Error Display */}
                  {paymentError && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 mb-4">
                      <p className="text-red-400 text-sm font-medium">Payment Failed</p>
                      <p className="text-red-300/80 text-sm mt-1">{paymentError}</p>
                    </div>
                  )}

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
                      disabled={
                        processingPayment ||
                        !paymentConfig?.configured ||
                        (paymentConfig.provider === "authorize_net" && !acceptJsLoaded) ||
                        (paymentConfig.provider === "stripe" && !stripeLoaded)
                      }
                      className="flex-1 py-4 rounded-xl font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      style={{
                        background: processingPayment
                          ? "linear-gradient(135deg, #666 0%, #555 100%)"
                          : "linear-gradient(135deg, #E1258F 0%, #C01F7A 100%)",
                        boxShadow: processingPayment ? "none" : "0 4px 20px rgba(225,37,143,0.4)",
                      }}
                    >
                      {processingPayment ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : (paymentConfig?.provider === "authorize_net" && !acceptJsLoaded) ||
                           (paymentConfig?.provider === "stripe" && !stripeLoaded) ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Loading...
                        </>
                      ) : paymentConfig?.provider === "manual" ? (
                        <>
                          <Check size={18} />
                          Complete Order
                        </>
                      ) : (
                        <>
                          <Lock size={18} />
                          Pay ${total.toFixed(2)}
                        </>
                      )}
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

                {/* Coupon Input */}
                <div className="py-4 border-t border-white/10">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                      <input
                        type="text"
                        placeholder="Discount code"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value);
                          setCouponError("");
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleApplyCoupon();
                        }}
                        disabled={isApplyingCoupon}
                        className="w-full h-10 pl-9 pr-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-yum-pink/50 text-sm disabled:opacity-50"
                      />
                    </div>
                    <button
                      onClick={handleApplyCoupon}
                      disabled={isApplyingCoupon || !couponCode.trim()}
                      className="px-4 h-10 rounded-lg font-medium text-sm transition-all disabled:opacity-50 bg-white/10 text-white hover:bg-white/15"
                    >
                      {isApplyingCoupon ? "..." : "Apply"}
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-red-400 text-xs mt-1">{couponError}</p>
                  )}
                  {/* Applied Coupons */}
                  {coupons.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {coupons.map((coupon) => (
                        <div
                          key={coupon.code}
                          className="flex items-center justify-between p-2 rounded-lg bg-green-500/10 border border-green-500/20"
                        >
                          <div className="flex items-center gap-2">
                            <Tag size={12} className="text-green-400" />
                            <span className="text-green-400 text-xs font-medium">{coupon.label}</span>
                            {(coupon.discount_type === 'free_shipping' || (coupon.discount === 0 && coupon.code.toLowerCase() === 'free')) && (
                              <span className="text-green-400/70 text-xs">· Free Shipping</span>
                            )}
                          </div>
                          <button
                            onClick={() => handleRemoveCoupon(coupon.code)}
                            className="text-green-400/70 hover:text-green-400 transition-colors p-0.5"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Totals */}
                <div className="space-y-2 py-4 border-t border-white/10">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Subtotal</span>
                    <span className="text-white">${subtotal.toFixed(2)}</span>
                  </div>
                  {discountTotal > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-400">Discount</span>
                      <span className="text-green-400">-${discountTotal.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Shipping</span>
                    <span className="text-white">
                      {shippingCost === null ? (
                        <span className="text-white/40">Calculated at next step</span>
                      ) : shippingCost === 0 && !isFreeSampleOffer ? (
                        <span className="text-green-400">Free</span>
                      ) : isFreeSampleOffer && (shippingCost === 0 || shippingCost === null) ? (
                        <span className="text-white/40">Calculated at next step</span>
                      ) : (
                        `${shippingCost.toFixed(2)}`
                      )}
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

export default function CheckoutPage() {
  return (
    <Suspense>
      <CheckoutPageInner />
    </Suspense>
  );
}
