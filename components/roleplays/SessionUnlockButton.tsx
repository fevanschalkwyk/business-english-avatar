// components/roleplays/SessionUnlockButton.tsx
"use client";
import { useState } from "react";
import Link from "next/link";
import { getPaddleInstance } from "@/lib/paddle-client";

const PRICE_SINGLE = process.env.NEXT_PUBLIC_PADDLE_PRICE_SINGLE_ROLEPLAY!;

export default function SessionUnlockButton() {
  const [loading, setLoading] = useState(false);

  async function handleUnlock() {
    setLoading(true);
    try {
      const paddle = await getPaddleInstance();
      await paddle.Checkout.open({
        items: [{ priceId: PRICE_SINGLE, quantity: 1 }],
      });
    } catch (err) {
      console.error("Checkout error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <button
        onClick={handleUnlock}
        disabled={loading}
        className="btn-session-unlock"
      >
        {loading ? "Opening..." : "🤖 Buy AI session — $3"}
      </button>
      <p style={{ fontSize: "11px", color: "rgba(0,0,0,0.4)", margin: 0 }}>
        Use on any roleplay + 3 bonus unlocks
      </p>
      <Link href="/pricing" className="btn-upgrade-sm">
        Or get Pro for full access →
      </Link>
      <style>{`
        .btn-session-unlock {
          background: rgba(201,168,76,0.12); color: #c9a84c;
          border: 1px solid rgba(201,168,76,0.3); padding: 8px 14px;
          border-radius: 8px; font-family: inherit; font-size: 13px;
          font-weight: 600; cursor: pointer; transition: all 0.2s; text-align: left;
        }
        .btn-session-unlock:hover:not(:disabled) { background: rgba(201,168,76,0.2); }
        .btn-session-unlock:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>
    </div>
  );
}
