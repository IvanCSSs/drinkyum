"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Mail,
  Star,
} from "lucide-react";
import { AccountLayout } from "@/components/account";
import {
  getAddresses,
  Address,
} from "@/lib/addresses";

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAddresses();
  }, []);

  async function loadAddresses() {
    try {
      const { addresses: fetchedAddresses } = await getAddresses();
      setAddresses(fetchedAddresses);
    } catch (error) {
      console.error("Failed to load addresses:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AccountLayout
      title="Addresses"
      description="Your saved shipping and billing addresses"
    >
      {/* Contact Support Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 p-6 rounded-2xl"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
          <Mail size={18} className="text-white/60" />
          Need to Update Your Address?
        </h3>
        <p className="text-white/70 text-sm mb-4">
          To add, edit, or remove addresses, please contact our support team.
        </p>
        <a
          href="mailto:support@drinkyum.com"
          className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-yum-pink text-white font-medium hover:bg-yum-pink/80 transition-colors"
        >
          <Mail size={18} />
          Contact Support
        </a>
      </motion.div>

      {/* Addresses Grid */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-48 bg-white/5 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : addresses.length > 0 ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {addresses.map((address, idx) => (
            <motion.div
              key={address.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-5 rounded-2xl relative"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {/* Default Badges */}
              <div className="flex flex-wrap gap-2 mb-3">
                {address.is_default_shipping && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-yum-pink/20 text-yum-pink border border-yum-pink/30">
                    <Star size={10} /> Default Shipping
                  </span>
                )}
                {address.is_default_billing && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-yum-cyan/20 text-yum-cyan border border-yum-cyan/30">
                    <Star size={10} /> Default Billing
                  </span>
                )}
              </div>

              {/* Address Details */}
              <div className="text-white/70 space-y-1">
                <p className="text-white font-medium">
                  {address.first_name} {address.last_name}
                </p>
                {address.company && <p>{address.company}</p>}
                <p>{address.address_1}</p>
                {address.address_2 && <p>{address.address_2}</p>}
                <p>
                  {address.city}, {address.province} {address.postal_code}
                </p>
                <p>{address.country_code.toUpperCase()}</p>
                {address.phone && (
                  <p className="text-white/50 text-sm">{address.phone}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <MapPin size={48} className="text-white/20 mx-auto mb-4" />
          <p className="text-white/50 mb-2">No addresses saved yet</p>
          <p className="text-white/40 text-sm">
            Add an address to speed up checkout
          </p>
        </motion.div>
      )}
    </AccountLayout>
  );
}
