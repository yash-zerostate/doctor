"use client";

import React from "react";
import { Card, CardContent } from "./ui/card";

// Billing/checkout was provided by Clerk and is not part of the custom
// MongoDB auth setup. Patients receive starter credits on sign-up; an admin
// can adjust credits. This is a simple placeholder for the pricing area.
const Pricing = () => {
  return (
    <Card className="border-emerald-900/30 shadow-lg bg-gradient-to-b from-emerald-950/30 to-transparent">
      <CardContent className="p-6 md:p-8 text-center text-muted-foreground">
        Consultation credits are managed by your account. New patients start
        with free credits.
      </CardContent>
    </Card>
  );
};

export default Pricing;
