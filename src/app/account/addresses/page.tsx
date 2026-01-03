"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Star,
  X,
  CheckCircle,
} from "lucide-react";
import { AccountLayout } from "@/components/account";
import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  Address,
  AddressInput,
  US_STATES,
} from "@/lib/addresses";

const emptyAddress: AddressInput = {
  first_name: "",
  last_name: "",
  company: "",
  address_1: "",
  address_2: "",
  city: "",
  province: "",
  postal_code: "",
  country_code: "us",
  phone: "",
  is_default_shipping: false,
  is_default_billing: false,
};

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState<AddressInput>(emptyAddress);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

  const openModal = (address?: Address) => {
    if (address) {
      setEditingAddress(address);
      setFormData({
        first_name: address.first_name,
        last_name: address.last_name,
        company: address.company || "",
        address_1: address.address_1,
        address_2: address.address_2 || "",
        city: address.city,
        province: address.province,
        postal_code: address.postal_code,
        country_code: address.country_code,
        phone: address.phone || "",
        is_default_shipping: address.is_default_shipping,
        is_default_billing: address.is_default_billing,
      });
    } else {
      setEditingAddress(null);
      setFormData(emptyAddress);
    }
    setError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAddress(null);
    setFormData(emptyAddress);
    setError(null);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (editingAddress) {
        await updateAddress(editingAddress.id, formData);
        setSuccessMessage("Address updated successfully!");
      } else {
        await addAddress(formData);
        setSuccessMessage("Address added successfully!");
      }
      await loadAddresses();
      closeModal();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch {
      setError("Failed to save address. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (addressId: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    try {
      await deleteAddress(addressId);
      await loadAddresses();
      setSuccessMessage("Address deleted successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch {
      setError("Failed to delete address. Please try again.");
    }
  };

  return (
    <AccountLayout
      title="Addresses"
      description="Manage your shipping and billing addresses"
    >
      {/* Success Message */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-2"
          >
            <CheckCircle size={18} className="text-green-400" />
            <p className="text-green-400 text-sm">{successMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Address Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => openModal()}
        className="w-full mb-6 p-4 rounded-xl border-2 border-dashed border-white/20 hover:border-yum-pink/50 text-white/60 hover:text-white transition-all flex items-center justify-center gap-2"
      >
        <Plus size={20} />
        Add New Address
      </motion.button>

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
              <div className="text-white/70 space-y-1 mb-4">
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

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => openModal(address)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-colors text-sm"
                >
                  <Edit2 size={14} />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(address.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors text-sm"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
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

      {/* Address Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-6"
              style={{
                background: "#121212",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              {/* Close Button */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>

              {/* Header */}
              <h2 className="text-xl font-bold text-white mb-6">
                {editingAddress ? "Edit Address" : "Add New Address"}
              </h2>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/60 text-sm mb-1.5 block">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-yum-pink transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-white/60 text-sm mb-1.5 block">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-yum-pink transition-colors"
                    />
                  </div>
                </div>

                {/* Company */}
                <div>
                  <label className="text-white/60 text-sm mb-1.5 block">
                    Company (optional)
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-yum-pink transition-colors"
                  />
                </div>

                {/* Address Line 1 */}
                <div>
                  <label className="text-white/60 text-sm mb-1.5 block">
                    Address *
                  </label>
                  <input
                    type="text"
                    name="address_1"
                    value={formData.address_1}
                    onChange={handleChange}
                    required
                    placeholder="Street address"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-yum-pink transition-colors"
                  />
                </div>

                {/* Address Line 2 */}
                <div>
                  <label className="text-white/60 text-sm mb-1.5 block">
                    Apt, Suite, etc. (optional)
                  </label>
                  <input
                    type="text"
                    name="address_2"
                    value={formData.address_2}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-yum-pink transition-colors"
                  />
                </div>

                {/* City, State, Zip */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-white/60 text-sm mb-1.5 block">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-yum-pink transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-white/60 text-sm mb-1.5 block">
                      State *
                    </label>
                    <select
                      name="province"
                      value={formData.province}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-yum-pink transition-colors"
                    >
                      <option value="">Select</option>
                      {US_STATES.map((state) => (
                        <option key={state.code} value={state.code}>
                          {state.code}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-white/60 text-sm mb-1.5 block">
                      ZIP *
                    </label>
                    <input
                      type="text"
                      name="postal_code"
                      value={formData.postal_code}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-yum-pink transition-colors"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="text-white/60 text-sm mb-1.5 block">
                    Phone (optional)
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-yum-pink transition-colors"
                  />
                </div>

                {/* Default Checkboxes */}
                <div className="flex flex-col gap-3 pt-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_default_shipping"
                      checked={formData.is_default_shipping}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-5 h-5 rounded border-2 border-white/30 peer-checked:bg-yum-pink peer-checked:border-yum-pink flex items-center justify-center transition-colors">
                      {formData.is_default_shipping && (
                        <CheckCircle size={12} className="text-white" />
                      )}
                    </div>
                    <span className="text-white/70">
                      Set as default shipping address
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_default_billing"
                      checked={formData.is_default_billing}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-5 h-5 rounded border-2 border-white/30 peer-checked:bg-yum-cyan peer-checked:border-yum-cyan flex items-center justify-center transition-colors">
                      {formData.is_default_billing && (
                        <CheckCircle size={12} className="text-white" />
                      )}
                    </div>
                    <span className="text-white/70">
                      Set as default billing address
                    </span>
                  </label>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-xl font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 mt-6"
                  style={{
                    background:
                      "linear-gradient(135deg, #E1258F 0%, #C01F7A 100%)",
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>{editingAddress ? "Update Address" : "Add Address"}</>
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AccountLayout>
  );
}
