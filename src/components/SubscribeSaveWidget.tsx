"use client";

import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { type SubscriptionOption } from "@/lib/wc-products";

interface SubscribeSaveWidgetProps {
  subscriptionOptions: SubscriptionOption[];
  basePrice: number;
  isSubscribe: boolean;
  onSubscribeChange: (isSubscribe: boolean) => void;
  selectedFrequency: string | null;
  onFrequencyChange: (key: string) => void;
  formatPrice: (price: number) => string;
}

export default function SubscribeSaveWidget({
  subscriptionOptions,
  basePrice,
  isSubscribe,
  onSubscribeChange,
  selectedFrequency,
  onFrequencyChange,
  formatPrice,
}: SubscribeSaveWidgetProps) {
  // Find the best value option (highest discount)
  const bestValueOption = subscriptionOptions.reduce(
    (best, opt) => (opt.discount_percent > best.discount_percent ? opt : best),
    subscriptionOptions[0]
  );

  // Get selected option details
  const selectedOption = subscriptionOptions.find(
    (opt) => `${opt.interval}-${opt.interval_count}` === selectedFrequency
  );

  const maxDiscount = bestValueOption?.discount_percent || 0;
  const currentDiscount = selectedOption?.discount_percent || 0;
  const discountedPrice = basePrice * (1 - currentDiscount / 100);

  return (
    <div className="space-y-3 mb-8">
      {/* One-time Purchase Option */}
      <button
        onClick={() => onSubscribeChange(false)}
        className={`w-full p-4 rounded-xl text-left transition-all ${
          !isSubscribe
            ? "ring-2 ring-yum-pink bg-yum-pink/10"
            : "ring-1 ring-white/15 hover:ring-white/30"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                !isSubscribe ? "border-yum-pink" : "border-white/30"
              }`}
            >
              {!isSubscribe && (
                <div className="w-2.5 h-2.5 rounded-full bg-yum-pink" />
              )}
            </div>
            <span className="text-white font-medium">One-time purchase</span>
          </div>
          <span className="text-white font-bold">{formatPrice(basePrice)}</span>
        </div>
      </button>

      {/* Subscribe & Save Option */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSubscribeChange(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onSubscribeChange(true);
        }}
        className={`w-full p-4 rounded-xl text-left transition-all cursor-pointer ${
          isSubscribe
            ? "ring-2 ring-yum-pink bg-gradient-to-br from-yum-pink/15 to-yum-pink/5"
            : "ring-1 ring-white/15 hover:ring-white/30"
        }`}
      >
        {/* Header Row */}
        <div className="flex items-center gap-3">
          <div
            className={`w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${
              isSubscribe ? "border-yum-pink" : "border-white/30"
            }`}
          >
            {isSubscribe && (
              <div className="w-2.5 h-2.5 rounded-full bg-yum-pink" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-white font-medium">Subscribe & Save</span>
              {!isSubscribe && (
                <span className="text-white font-bold text-sm">
                  from {formatPrice(basePrice * (1 - maxDiscount / 100))}
                </span>
              )}
            </div>
            {maxDiscount > 0 && !isSubscribe && (
              <span className="mt-1 inline-flex px-2 py-0.5 bg-yum-pink/20 text-yum-pink text-xs font-bold rounded-full items-center gap-1">
                <Sparkles size={10} />
                SAVE UP TO {maxDiscount}%
              </span>
            )}
            {maxDiscount > 0 && isSubscribe && (
              <span className="mt-1 inline-flex px-2 py-0.5 bg-yum-pink/20 text-yum-pink text-xs font-bold rounded-full items-center gap-1">
                <Sparkles size={10} />
                SAVE UP TO {maxDiscount}%
              </span>
            )}
          </div>
        </div>

        {/* Expanded Content */}
        {isSubscribe && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-4 pt-4 border-t border-white/10"
          >
            {/* Delivery Frequency */}
            <p className="text-white/50 text-sm mb-3">Delivery frequency:</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {subscriptionOptions.map((option) => {
                const optionKey = `${option.interval}-${option.interval_count}`;
                const isSelected = selectedFrequency === optionKey;
                const isBestValue =
                  option.discount_percent === maxDiscount &&
                  subscriptionOptions.filter(
                    (o) => o.discount_percent === maxDiscount
                  ).length === 1;

                return (
                  <button
                    key={optionKey}
                    onClick={(e) => {
                      e.stopPropagation();
                      onFrequencyChange(optionKey);
                    }}
                    className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      isSelected
                        ? "bg-yum-pink text-white shadow-lg shadow-yum-pink/30"
                        : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                    }`}
                  >
                    {isBestValue && !isSelected && (
                      <span className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-yum-gold text-[10px] font-bold text-black rounded-full">
                        BEST
                      </span>
                    )}
                    <span>{option.label}</span>
                    <span
                      className={`ml-1.5 ${isSelected ? "text-white/80" : "text-yum-pink"}`}
                    >
                      {option.discount_percent}% off
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Price Display */}
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-white/40 line-through text-lg">
                {formatPrice(basePrice)}
              </span>
              <span className="text-white text-2xl font-bold">
                {formatPrice(discountedPrice)}
              </span>
              <span className="text-white/50 text-sm">/delivery</span>
              {currentDiscount > 0 && (
                <span className="text-green-400 text-sm font-medium">
                  Save {formatPrice(basePrice - discountedPrice)}
                </span>
              )}
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-white/50 text-xs">
              <div className="flex items-center gap-1.5">
                <Check size={14} className="text-green-400" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check size={14} className="text-green-400" />
                <span>Free shipping</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check size={14} className="text-green-400" />
                <span>Skip or pause deliveries</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
