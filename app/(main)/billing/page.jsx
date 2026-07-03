import { redirect } from "next/navigation";
import { getCurrentDbUser } from "@/lib/auth";
import { DEFAULT_PLAN, sanitizeAddOns } from "@/lib/preta-plans";
import PlanManager from "@/components/plan-manager";

export const metadata = { title: "Plan & Add-ons" };

// Reads live values so the form reflects the DB (and therefore the Preta ctx).
export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const user = await getCurrentDbUser();
  if (!user) redirect("/sign-in?redirect=/billing");

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Plan &amp; Add-ons</h1>
        <p className="text-muted-foreground mt-1">
          Change your plan and entitlements. These flow into the Preta policy
          context (<code>preta:user.plan</code> / <code>add_ons</code>) so you
          can test dashboard rules against this account.
        </p>
      </div>

      <PlanManager
        initialPlan={user.plan || DEFAULT_PLAN}
        initialAddOns={sanitizeAddOns(user.addOns)}
      />
    </div>
  );
}
