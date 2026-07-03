"use server";

import { db } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  DEFAULT_PLAN,
  isValidPlan,
  sanitizeAddOns,
} from "@/lib/preta-plans";

/**
 * Updates the logged-in user's billing plan + add-ons. These feed the Preta
 * policy context (preta:user.plan / add_ons), so changing them here lets you
 * re-test dashboard rules without touching code. Revalidates "/" so the root
 * layout re-signs a fresh context token on the next render.
 */
export async function updateBilling({ plan, addOns } = {}) {
  const userId = await getAuthUserId();
  if (!userId) throw new Error("Unauthorized");

  const nextPlan = isValidPlan(plan) ? plan : DEFAULT_PLAN;
  const nextAddOns = sanitizeAddOns(addOns);

  await db.user.update({
    where: { id: userId },
    data: { plan: nextPlan, addOns: nextAddOns },
  });

  revalidatePath("/");
  return { success: true, plan: nextPlan, addOns: nextAddOns };
}
