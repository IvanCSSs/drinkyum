// Single source of truth for states we cannot ship kratom products to.
// Referenced by: checkout UI, /api/checkout server validation, terms-of-service,
// shipping-returns, and FAQ copy. Update HERE only.
//
// Rhode Island stays blocked even though the 2017 ban was lifted — it is now
// licensed 21+, 7-OH banned, with a possible drink/food restriction (per counsel).
// DC is pending counsel review — add { code: "DC", name: "District of Columbia" }
// if counsel includes it.

export interface RestrictedState {
  code: string;
  name: string;
  /** 3-digit ZIP prefixes assigned to this state (zero-padded). */
  zipPrefixes: [number, number][]; // inclusive ranges of the numeric 3-digit prefix
}

export const RESTRICTED_STATES: RestrictedState[] = [
  { code: "AL", name: "Alabama", zipPrefixes: [[350, 369]] },
  { code: "AR", name: "Arkansas", zipPrefixes: [[716, 729]] },
  { code: "CT", name: "Connecticut", zipPrefixes: [[60, 69]] },
  { code: "IN", name: "Indiana", zipPrefixes: [[460, 479]] },
  { code: "KS", name: "Kansas", zipPrefixes: [[660, 679]] },
  { code: "LA", name: "Louisiana", zipPrefixes: [[700, 714]] },
  { code: "RI", name: "Rhode Island", zipPrefixes: [[28, 29]] },
  { code: "TN", name: "Tennessee", zipPrefixes: [[370, 385]] },
  // 055 is IRS-only (Andover MA processing center), no residential addresses —
  // including it in the VT range is intentional and harmless.
  { code: "VT", name: "Vermont", zipPrefixes: [[50, 59]] },
  { code: "WI", name: "Wisconsin", zipPrefixes: [[530, 549]] },
];

export const RESTRICTED_STATE_CODES = new Set(
  RESTRICTED_STATES.map((s) => s.code)
);

const RESTRICTED_STATE_NAMES_LOWER = new Set(
  RESTRICTED_STATES.map((s) => s.name.toLowerCase())
);

/** Human-readable list for copy: "Alabama, Arkansas, ..., and Wisconsin". */
export function restrictedStatesSentence(): string {
  const names = RESTRICTED_STATES.map((s) => s.name);
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

/** Accepts a 2-letter code or full state name. */
export function isRestrictedState(stateCodeOrName: string): boolean {
  const value = stateCodeOrName.trim();
  if (!value) return false;
  if (value.length === 2) return RESTRICTED_STATE_CODES.has(value.toUpperCase());
  return RESTRICTED_STATE_NAMES_LOWER.has(value.toLowerCase());
}

/**
 * ZIP-level check: returns the restricted state a ZIP code belongs to, or null.
 * Catches mismatches where the customer selects an allowed state in the
 * dropdown but enters a ZIP inside a restricted state.
 */
export function restrictedStateForZip(zip: string): RestrictedState | null {
  const digits = zip.trim().slice(0, 5);
  if (!/^\d{5}/.test(digits)) return null;
  const prefix = parseInt(digits.slice(0, 3), 10);
  for (const state of RESTRICTED_STATES) {
    for (const [lo, hi] of state.zipPrefixes) {
      if (prefix >= lo && prefix <= hi) return state;
    }
  }
  return null;
}

/**
 * Full shipping-destination check used by checkout (client + server).
 * Returns an error message if the destination is restricted, else null.
 */
export function shippingRestrictionError(
  state: string,
  zip: string
): string | null {
  if (isRestrictedState(state)) {
    const name =
      RESTRICTED_STATES.find(
        (s) =>
          s.code === state.toUpperCase() ||
          s.name.toLowerCase() === state.toLowerCase()
      )?.name ?? state;
    return `We're sorry — due to state regulations we cannot ship to ${name}.`;
  }
  const zipState = restrictedStateForZip(zip);
  if (zipState) {
    return `We're sorry — due to state regulations we cannot ship to ${zipState.name} (ZIP ${zip.trim().slice(0, 5)}).`;
  }
  return null;
}
