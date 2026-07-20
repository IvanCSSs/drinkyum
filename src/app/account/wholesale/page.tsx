"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Package, Send, Loader2 } from "lucide-react";
import { AccountLayout } from "@/components/account";
import { getCustomer, getAuthHeaders } from "@/lib/auth";
import { buildWpApiUrl } from "@/lib/wp-api-url";
import { getProducts, Product } from "@/lib/wc-products";

interface Line {
  product: Product;
  qty: number;
}

export default function WholesalePage() {
  const router = useRouter();
  const [approved, setApproved] = useState<boolean | null>(null);
  const [status, setStatus] = useState<string>("none");
  const [lines, setLines] = useState<Line[]>([]);
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Gate on approved wholesale status, then load products.
  useEffect(() => {
    (async () => {
      try {
        const { customer } = await getCustomer();
        const ws = customer.wholesale;
        setStatus(ws?.status ?? "none");
        const ok = !!ws?.approved;
        setApproved(ok);
        if (ok) {
          const { products } = await getProducts({ limit: 100 });
          setLines(products.map((p) => ({ product: p, qty: 0 })));
        }
      } catch {
        setApproved(false);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const setQty = (id: string, qty: number) =>
    setLines((prev) =>
      prev.map((l) => (l.product.id === id ? { ...l, qty: Math.max(0, qty) } : l))
    );

  const selected = lines.filter((l) => l.qty > 0);
  const totalUnits = selected.reduce((s, l) => s + l.qty, 0);

  const submit = async () => {
    setError("");
    if (selected.length === 0) {
      setError("Add a quantity to at least one product.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(buildWpApiUrl("/store/v1/wholesale-order"), {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({
          items: selected.map((l) => ({
            product_id: l.product.id,
            name: l.product.title,
            quantity: l.qty,
          })),
          note,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Request failed");
      setSubmitted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <AccountLayout title="Wholesale" description="Bulk ordering for approved wholesale accounts">
        <div className="flex items-center justify-center py-20 text-white/50">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      </AccountLayout>
    );
  }

  // Not approved — show status message instead of the ordering UI.
  if (!approved) {
    return (
      <AccountLayout title="Wholesale" description="Bulk ordering for approved wholesale accounts">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
          <Package className="w-10 h-10 text-white/30 mx-auto mb-4" />
          {status === "pending" ? (
            <>
              <h3 className="text-white font-semibold mb-2">Application under review</h3>
              <p className="text-white/60 text-sm">
                Your wholesale application is pending. We&apos;ll email you once it&apos;s approved,
                then bulk ordering will unlock here.
              </p>
            </>
          ) : status === "rejected" ? (
            <>
              <h3 className="text-white font-semibold mb-2">Application not approved</h3>
              <p className="text-white/60 text-sm">
                Your wholesale application wasn&apos;t approved. Contact us if you think this is a mistake.
              </p>
            </>
          ) : (
            <>
              <h3 className="text-white font-semibold mb-2">Wholesale not enabled</h3>
              <p className="text-white/60 text-sm mb-4">
                This account isn&apos;t set up for wholesale. Apply to unlock bulk ordering.
              </p>
              <button
                onClick={() => router.push("/wholesale")}
                className="cta_button px-6 py-2 rounded-full text-sm"
              >
                Apply for Wholesale
              </button>
            </>
          )}
        </div>
      </AccountLayout>
    );
  }

  if (submitted) {
    return (
      <AccountLayout title="Wholesale" description="Bulk ordering for approved wholesale accounts">
        <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-8 text-center">
          <Send className="w-10 h-10 text-green-400 mx-auto mb-4" />
          <h3 className="text-white font-semibold mb-2">Request submitted</h3>
          <p className="text-white/60 text-sm">
            Thanks — our team will confirm wholesale pricing and send you an invoice shortly.
          </p>
        </div>
      </AccountLayout>
    );
  }

  // Approved — the bulk-order selection UI.
  return (
    <AccountLayout
      title="Wholesale Bulk Order"
      description="Select products and quantities. We'll confirm wholesale pricing and invoice you."
    >
      <div className="space-y-3">
        {lines.map((l) => {
          const price = l.product.variants?.[0]?.prices?.[0]?.amount;
          return (
            <div
              key={l.product.id}
              className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-3"
            >
              {l.product.thumbnail && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={l.product.thumbnail}
                  alt={l.product.title}
                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-medium truncate">{l.product.title}</div>
                {typeof price === "number" && (
                  <div className="text-white/40 text-xs">
                    Retail ${(price / 100).toFixed(2)} · wholesale price confirmed on invoice
                  </div>
                )}
              </div>
              <input
                type="number"
                min={0}
                value={l.qty || ""}
                onChange={(e) => setQty(l.product.id, parseInt(e.target.value) || 0)}
                placeholder="0"
                className="w-20 bg-black/30 border border-white/15 rounded-lg px-2 py-1.5 text-white text-center text-sm focus:outline-none focus:border-white/40"
              />
            </div>
          );
        })}
      </div>

      <div className="mt-6 space-y-4">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="Notes for our team (delivery timing, special requests, etc.)"
          className="w-full bg-black/30 border border-white/15 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-white/40"
        />

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex items-center justify-between">
          <div className="text-white/60 text-sm">
            {selected.length} product{selected.length !== 1 ? "s" : ""} · {totalUnits} unit
            {totalUnits !== 1 ? "s" : ""}
          </div>
          <button
            onClick={submit}
            disabled={submitting || selected.length === 0}
            className="cta_button px-6 py-2.5 rounded-full text-sm flex items-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Submitting…
              </>
            ) : (
              <>
                <Send className="w-4 h-4" /> Submit Bulk Order Request
              </>
            )}
          </button>
        </div>
      </div>
    </AccountLayout>
  );
}
