/**
 * Medusa Integration Library
 *
 * Central export file for all Medusa integration functions.
 * Import from '@/lib' for clean imports.
 */

// API Client
export { medusa, apiCall } from './medusa-client'
export type { ApiResponse, MedusaError } from './medusa-client'

// Authentication
export {
  registerCustomer,
  loginCustomer,
  logoutCustomer,
  getCustomer,
  updateCustomer,
  changePassword,
  requestPasswordReset,
  confirmPasswordReset,
  verifyEmail,
  resendVerificationEmail,
  getAccountSummary,
  isAuthenticated,
} from './auth'
export type { RegisterData, Customer, AuthResponse } from './auth'

// Cart
export {
  getOrCreateCart,
  getCart,
  addToCart,
  addSubscriptionToCart,
  updateCartItem,
  removeCartItem,
  updateCart,
  getCartItemCount,
  clearStoredCartId,
} from './cart'
export type { Cart, CartItem, Address, PaymentSession, ShippingMethod } from './cart'

// Products
export {
  getProducts,
  getProduct,
  getProductByHandle,
  searchProducts,
  getSubscriptionOptions,
  getCollections,
  getCollectionByHandle,
  getProductsByCollection,
  formatPrice,
  getProductPrice,
} from './products'
export type {
  Product,
  ProductVariant,
  ProductOption,
  ProductImage,
  Collection,
  SubscriptionOption,
  ProductListParams,
} from './products'

// Checkout
export {
  updateCheckoutEmail,
  updateShippingAddress,
  updateBillingAddress,
  getShippingRates,
  getShippingOptions,
  selectShippingMethod,
  createPaymentSessions,
  selectPaymentProvider,
  updatePaymentSession,
  completeCheckout,
  getOrder,
  trackShipment,
  applyDiscountCode,
  removeDiscountCode,
} from './checkout'
export type {
  ShippingOption,
  Order,
  OrderItem,
  Fulfillment,
  Payment,
  ShippingRateRequest,
  ShippingRate,
  ShippingRatesResponse,
} from './checkout'

// Subscriptions
export {
  getMySubscriptions,
  getSubscription,
  pauseSubscription,
  resumeSubscription,
  cancelSubscription,
  skipNextShipment,
  changeFrequency,
  updatePaymentMethod,
  updateShippingAddress as updateSubscriptionShippingAddress,
  updateItemQuantity,
  getSubscriptionOrders,
  formatFrequency,
  formatStatus,
  getStatusColor,
} from './subscriptions'
export type {
  Subscription,
  SubscriptionItem,
  SubscriptionOrder,
  SubscriptionFrequency,
  SubscriptionStatus,
} from './subscriptions'

// Content/CMS
export {
  getContent,
  getContentBySlug,
  getBlogPosts,
  getBlogPost,
  getPage,
  getFAQs,
  getActiveBanners,
  getBlogTags,
  searchContent,
  formatContentDate,
  getExcerpt,
} from './content'
export type { ContentEntry, ContentType, ContentStatus, ContentListParams } from './content'

// Analytics
export {
  trackEvent,
  identifyCustomer,
  trackPageView,
  trackProductView,
  trackCollectionBrowse,
  trackSearch,
  trackAddToCart,
  trackRemoveFromCart,
  trackCartUpdate,
  trackCheckoutStep,
  trackRegistration,
  trackLogin,
  initAnalytics,
} from './analytics'
export type { EventType } from './analytics'

// Addresses
export {
  getAddresses,
  getAddress,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultShipping,
  setDefaultBilling,
  getDefaultShippingAddress,
  getDefaultBillingAddress,
  formatAddress,
  formatAddressLine,
  US_STATES,
} from './addresses'
export type { Address as CustomerAddress, AddressInput } from './addresses'

// Payment Methods
export {
  getPaymentMethods,
  getSetupIntent,
  addPaymentMethod,
  setDefaultPaymentMethod,
  removePaymentMethod,
  getDefaultPaymentMethod,
  formatCardBrand,
  formatCardExpiry,
  isCardExpired,
  getCardIconName,
} from './payments'
export type { PaymentMethod, SetupIntent } from './payments'

// Orders
export {
  getOrders,
  getOrder as getOrderDetails,
  getRecentOrders,
  createReturn,
  getReturns,
  getReturn,
  formatOrderStatus,
  formatFulfillmentStatus,
  formatPaymentStatus,
  getOrderStatusColor,
  formatOrderDate,
  formatOrderAmount,
  canRequestReturn,
} from './orders'
export type { Order as CustomerOrder, Return, OrderListParams } from './orders'
