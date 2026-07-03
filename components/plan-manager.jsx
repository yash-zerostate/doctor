"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, Loader2, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { PLANS, ADD_ONS, planIsPaid } from "@/lib/preta-plans";
import { updateBilling } from "@/actions/billing";

/**
 * Lets the logged-in user switch their plan + toggle add-ons. On save it writes
 * to the DB and refreshes the route so the root layout re-signs the Preta
 * context token — letting you re-test Phase-1 dashboard rules instantly.
 */
export default function PlanManager({ initialPlan, initialAddOns }) {
  const router = useRouter();
  const [plan, setPlan] = useState(initialPlan);
  const [addOns, setAddOns] = useState(initialAddOns || []);
  const [isPending, startTransition] = useTransition();

  const dirty =
    plan !== initialPlan ||
    addOns.slice().sort().join(",") !==
      (initialAddOns || []).slice().sort().join(",");

  const toggleAddOn = (id) =>
    setAddOns((cur) =>
      cur.includes(id) ? cur.filter((a) => a !== id) : [...cur, id]
    );

  const save = () => {
    startTransition(async () => {
      try {
        await updateBilling({ plan, addOns });
        toast.success("Plan updated — Preta context refreshed");
        router.refresh();
      } catch (e) {
        toast.error(e.message || "Failed to update plan");
      }
    });
  };

  const context = {
    plan,
    add_ons: addOns,
    has_paid: planIsPaid(plan),
  };

  return (
    <div className="space-y-8">
      {/* Plans */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-3">Plan</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {PLANS.map((p) => {
            const active = p.id === plan;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setPlan(p.id)}
                className={`text-left rounded-xl border p-4 transition-all cursor-pointer ${
                  active
                    ? "border-emerald-500 bg-emerald-900/20 ring-1 ring-emerald-500/40"
                    : "border-white/10 bg-white/5 hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">{p.label}</span>
                  {active && <Check className="h-4 w-4 text-emerald-400" />}
                </div>
                <span className="text-sm text-muted-foreground">
                  {p.priceLabel}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Add-ons */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-3">Add-ons</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {ADD_ONS.map((a) => {
            const on = addOns.includes(a.id);
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => toggleAddOn(a.id)}
                className={`flex items-start justify-between text-left rounded-xl border p-4 transition-all cursor-pointer ${
                  on
                    ? "border-emerald-500 bg-emerald-900/20"
                    : "border-white/10 bg-white/5 hover:border-white/20"
                }`}
              >
                <div>
                  <div className="font-medium text-white">{a.label}</div>
                  <div className="text-sm text-muted-foreground">
                    {a.description}
                  </div>
                </div>
                <span
                  className={`ml-3 mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border ${
                    on
                      ? "border-emerald-500 bg-emerald-500 text-black"
                      : "border-white/30"
                  }`}
                >
                  {on && <Check className="h-3.5 w-3.5" />}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Live Preta context preview */}
      <Card className="bg-black/40 border-white/10">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            Preta context (<code>preta:user</code>) sent to policy engine
          </div>
          <pre className="text-xs text-emerald-300 overflow-x-auto">
            {JSON.stringify(context, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button onClick={save} disabled={!dirty || isPending} className="gap-2">
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Save changes
        </Button>
        {!dirty && (
          <Badge variant="outline" className="text-muted-foreground">
            No unsaved changes
          </Badge>
        )}
      </div>
    </div>
  );
}
