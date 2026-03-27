// components/settings/SubscriptionManager.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Props {
  subscriptionStatus: string;
  periodEnd: string | null;
  minutesRemaining: number;
}

export default function SubscriptionManager({ subscriptionStatus, periodEnd, minutesRemaining }: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const router = useRouter();

  async function handleAction(action: "pause" | "cancel") {
    const message = action === "cancel"
      ? "Cancel your Pro subscription? You'll keep access until the end of the current billing period."
      : "Pause your subscription for one month? It will resume automatically.";

    if (!window.confirm(message)) return;

    setLoading(action);
    try {
      const res = await fetch(`/api/paddle/${action}-subscription`, { method: "POST" });
      if (!res.ok) throw new Error("Request failed");
      setDone(action === "pause" ? "Subscription paused successfully." : "Subscription cancelled. You'll retain access until your billing period ends.");
      router.refresh();
    } catch {
      alert("Something went wrong. Please try again or contact support@businessenglishai.com");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
      <h2 style={{ fontFamily: "Georgia, serif", fontSize: "18px", color: "#0a1628", margin: 0 }}>Subscription</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #e2e8f0" }}>
          <span style={{ fontSize: "14px", color: "#718096" }}>Status</span>
          <span style={{ fontSize: "14px", fontWeight: 600, color: "#0a1628" }}>⭐ Pro — Active</span>
        </div>
        {periodEnd && (
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "14px", color: "#718096" }}>Next renewal</span>
            <span style={{ fontSize: "14px", fontWeight: 500, color: "#0a1628" }}>
              {new Date(periodEnd).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </span>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
          <span style={{ fontSize: "14px", color: "#718096" }}>Minutes remaining</span>
          <span style={{ fontSize: "14px", fontWeight: 500, color: minutesRemaining <= 20 ? "#e53e3e" : "#0a1628" }}>
            {minutesRemaining} min
          </span>
        </div>
      </div>

      {minutesRemaining <= 20 && (
        <Link href="/pricing" style={{ fontSize: "13px", color: "#c9a84c", fontWeight: 600, textDecoration: "none" }}>
          + Buy 60 extra minutes — $4 →
        </Link>
      )}

      {done ? (
        <div style={{ background: "#f0fff4", border: "1px solid #c6f6d5", borderRadius: "10px", padding: "14px", fontSize: "14px", color: "#276749" }}>
          {done}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", paddingTop: "8px", borderTop: "1px solid #e2e8f0" }}>
          <p style={{ fontSize: "13px", color: "#718096", lineHeight: 1.5 }}>
            💡 Prefer to pause? You can pause for one month and your subscription will resume automatically.
          </p>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              onClick={() => handleAction("pause")}
              disabled={!!loading}
              style={{ fontSize: "13px", border: "1px solid #e2e8f0", color: "#718096", background: "none", borderRadius: "8px", padding: "10px 16px", cursor: "pointer", opacity: loading ? 0.6 : 1 }}
            >
              {loading === "pause" ? "Pausing..." : "Pause for 1 month"}
            </button>
            <button
              onClick={() => handleAction("cancel")}
              disabled={!!loading}
              style={{ fontSize: "13px", border: "1px solid rgba(229,62,62,0.3)", color: "#e53e3e", background: "none", borderRadius: "8px", padding: "10px 16px", cursor: "pointer", opacity: loading ? 0.6 : 1 }}
            >
              {loading === "cancel" ? "Cancelling..." : "Cancel subscription"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}