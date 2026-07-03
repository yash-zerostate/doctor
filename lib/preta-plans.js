// Central taxonomy for billing plans + add-ons.
// Shared by the switch UI (app/(main)/billing), the updateBilling action, and
// the Preta context builder (lib/preta-token.js) so the ids that flow into the
// policy engine (`preta:user.plan` / `preta:user.add_ons`) always line up with
// what the UI can set and what you target in the Phase-1 dashboard rules.

/** Ordered plan tiers. `id` is what gets sent to Preta as `plan`. */
export const PLANS = [
  { id: "free",       label: "Free",       priceLabel: "$0/mo",   paid: false },
  { id: "starter",    label: "Starter",    priceLabel: "$9/mo",   paid: true  },
  { id: "pro",        label: "Pro",        priceLabel: "$29/mo",  paid: true  },
  { id: "business",   label: "Business",   priceLabel: "$79/mo",  paid: true  },
  { id: "enterprise", label: "Enterprise", priceLabel: "Custom",  paid: true  },
];

/** Toggleable entitlements. `id` values populate `preta:user.add_ons` (array). */
export const ADD_ONS = [
  { id: "priority_support",   label: "Priority Support",   description: "24/7 fast-track support queue" },
  { id: "video_visits",       label: "Video Visits",       description: "Unlimited video consultations" },
  { id: "ai_assistant",       label: "AI Assistant",       description: "AI symptom triage + note taking" },
  { id: "advanced_analytics", label: "Advanced Analytics", description: "Practice + patient analytics" },
  { id: "international",       label: "International Access", description: "Cross-border appointments" },
];

export const PLAN_IDS = PLANS.map((p) => p.id);
export const ADD_ON_IDS = ADD_ONS.map((a) => a.id);
export const DEFAULT_PLAN = "free";

export function isValidPlan(plan) {
  return PLAN_IDS.includes(plan);
}

/** Keep only known add-on ids, de-duplicated. */
export function sanitizeAddOns(addOns) {
  if (!Array.isArray(addOns)) return [];
  return [...new Set(addOns.filter((id) => ADD_ON_IDS.includes(id)))];
}

export function planIsPaid(plan) {
  return !!PLANS.find((p) => p.id === plan)?.paid;
}
