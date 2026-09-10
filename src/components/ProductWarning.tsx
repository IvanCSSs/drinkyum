import Link from "next/link";

// Shared regulatory warning block. Full variant goes on PDPs (next to Buy)
// and checkout/cart (above the order button); short variant sits in the
// sitewide footer with a link to the full text (/terms-of-service#product-warning).
// Keep this text in sync with the bottle label and counsel-approved language.

export const FDA_LINE =
  "These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease.";

export function ProductWarningFull({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-4 text-[12px] leading-relaxed text-white/60 ${className}`}
    >
      <p>
        <span className="font-bold text-yellow-300">WARNING:</span> This
        product contains mitragynine (kratom extract). For adults 21 years of
        age or older only. Do not use if you are pregnant or nursing. Consult a
        healthcare professional before use if you have a medical condition or
        are taking any medication. Do not combine with alcohol, prescription
        drugs, or other substances. May be habit-forming — use responsibly and
        avoid daily use. Do not drive or operate heavy machinery after use.
      </p>
      <p className="mt-2 font-bold text-yellow-300 uppercase">
        Keep out of reach of children.
      </p>
      <p className="mt-2 text-white/40">{FDA_LINE}</p>
    </div>
  );
}

export function ProductWarningShort({ className = "" }: { className?: string }) {
  return (
    <p className={`text-[11px] leading-relaxed ${className}`} style={{ color: "rgba(255,255,255,0.45)" }}>
      <span className="font-bold">WARNING:</span> Contains mitragynine (kratom
      extract). Adults 21+ only. May be habit-forming. Do not use if pregnant
      or nursing; consult a healthcare professional before use.{" "}
      <span className="font-bold uppercase">Keep out of reach of children.</span>{" "}
      {FDA_LINE}{" "}
      <Link href="/terms-of-service#product-warning" className="underline hover:text-white/70">
        Read the full warning
      </Link>
      .
    </p>
  );
}
