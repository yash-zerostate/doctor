"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "./ui/button";

export default function UserMenu({ name, email }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const initial = (name || email || "?").trim().charAt(0).toUpperCase();

  async function handleLogout() {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      // Clear any Preta profile so downstream analytics revert to guest.
      // The signed context token is NOT cleared here — the loader caches it in
      // sessionStorage keyed by the auth token (core/edge.js), so losing the session
      // invalidates that entry on its own, and the token expires in 5 minutes regardless.
      try {
        localStorage.removeItem("preta_sim_user");
      } catch {}
      router.push("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div
        className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-900/40 text-sm font-semibold text-emerald-300 ring-1 ring-emerald-700/40"
        title={email || name}
      >
        {initial}
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLogout}
        disabled={loading}
        className="gap-1"
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden md:inline">{loading ? "..." : "Logout"}</span>
      </Button>
    </div>
  );
}
