/**
 * /need-to-know — the cloak's checkout gateway.
 *
 * The .co (cloak) cart "Checkout" button routes here instead of going
 * straight to a checkout. We:
 *   1. Show a 21+ confirmation + product compliance disclaimers
 *   2. Fire Meta Pixel InitiateCheckout
 *   3. On "Yes, I am 21+" → open the handoff URL on .com in a new tab
 *
 * The handoff URL is built from the cloak's existing cart and signed with
 * CART_HANDOFF_SECRET. The .com side verifies, restores the cart, and
 * redirects to checkout.
 */

import NeedToKnowClient from "./NeedToKnowClient";

export const metadata = {
	title: "Need to Know | YUM",
	description: "Before you continue.",
	robots: { index: false, follow: false },
};

export default function NeedToKnowPage() {
	return <NeedToKnowClient />;
}
