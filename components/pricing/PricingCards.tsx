// components/pricing/PricingCards.tsx
"use client";
import { useState } from "react";
import Link from "next/link";
import { getPaddleInstance } from "@/lib/paddle-client";

const PRICE_PRO = process.env.NEXT_PUBLIC_PADDLE_PRICE_PRO_MONTHLY!;
const PRICE_ADDON = process.env.NEXT_PUBLIC_PADDLE_PRICE_ADDON_MINUTES!;

export function PricingCards() {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleCheckout(priceId: string, label: string) {
    setLoading(label);
    try {
      console.log("Initialising Paddle with token:", process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN);
      const paddle = await getPaddleInstance();
      console.log("Paddle instance:", paddle);
      await paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }],
      });
    } catch (err) {
      console.error("Checkout error:", err);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", alignItems: "start" }}>

      {/* Free */}
      <div style={{ backgroundColor: "#0d1f3c", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", padding: "36px", display: "flex", flexDirection: "column" }}>
        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "16px" }}>Free</div>
        <div style={{ fontSize: "48px", fontWeight: "bold", color: "white", marginBottom: "4px" }}>$0</div>
        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px", marginBottom: "32px" }}>forever</div>
        <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px 0", display: "flex", flexDirection: "column", gap: "12px", flex: 1 }}>
          {["3 new roleplays unlocked per week", "Permanent access once unlocked", "Pre-recorded audio + transcript", "Listen-and-repeat practice", "Unlimited retries"].map(f => (
            <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: "10px", color: "rgba(255,255,255,0.7)", fontSize: "14px", lineHeight: 1.5 }}>
              <span style={{ color: "#d4af37", flexShrink: 0, marginTop: "2px" }}>✓</span>{f}
            </li>
          ))}
        </ul>
        <Link href="/auth/signup" style={{ display: "block", textAlign: "center", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.7)", borderRadius: "12px", padding: "12px", fontSize: "14px", fontWeight: 600, textDecoration: "none" }}>
          Get started free
        </Link>
      </div>

      {/* Pro */}
      <div style={{ backgroundColor: "#0d1f3c", border: "2px solid #d4af37", borderRadius: "20px", padding: "36px", display: "flex", flexDirection: "column", position: "relative" }}>
        <div style={{ position: "absolute", top: "-14px", left: "50%", transform: "translateX(-50%)", backgroundColor: "#d4af37", color: "#0a1628", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", padding: "4px 16px", borderRadius: "999px", whiteSpace: "nowrap" }}>
          Most popular
        </div>
        <div style={{ color: "#d4af37", fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "16px" }}>Pro</div>
        <div style={{ fontSize: "48px", fontWeight: "bold", color: "white", marginBottom: "4px" }}>$12</div>
        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px", marginBottom: "32px" }}>per month</div>
        <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px 0", display: "flex", flexDirection: "column", gap: "12px", flex: 1 }}>
          {[
            "Full access to ALL roleplays",
            "Live AI conversation partner",
            "160 minutes AI conversation/month",
            "Azure TTS avatar voice",
            "CEFR feedback after every session",
            "Grammar corrections + new vocabulary",
            "Session history + progress tracking",
            "Feedback emailed after each session",
            "Pause or cancel anytime",
          ].map(f => (
            <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: "10px", color: "rgba(255,255,255,0.7)", fontSize: "14px", lineHeight: 1.5 }}>
              <span style={{ color: "#d4af37", flexShrink: 0, marginTop: "2px" }}>✓</span>{f}
            </li>
          ))}
        </ul>
        <button
          onClick={() => handleCheckout(PRICE_PRO, "pro")}
          disabled={loading === "pro"}
          style={{ backgroundColor: "#d4af37", color: "#0a1628", border: "none", borderRadius: "12px", padding: "14px", fontSize: "15px", fontWeight: 700, cursor: "pointer", opacity: loading === "pro" ? 0.6 : 1 }}
        >
          {loading === "pro" ? "Opening..." : "Start Pro — $12/month"}
        </button>
      </div>

      {/* Pro Add-on */}
      <div style={{ backgroundColor: "#0d1f3c", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", padding: "36px", display: "flex", flexDirection: "column" }}>
        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "16px" }}>Pro Add-on</div>
        <div style={{ fontSize: "48px", fontWeight: "bold", color: "white", marginBottom: "4px" }}>$4</div>
        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px", marginBottom: "32px" }}>one-time</div>
        <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px 0", display: "flex", flexDirection: "column", gap: "12px", flex: 1 }}>
          {[
            "60 extra AI conversation minutes",
            "Added to your account instantly",
            "Unused minutes carry forward",
            "No expiry while account is active",
          ].map(f => (
            <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: "10px", color: "rgba(255,255,255,0.7)", fontSize: "14px", lineHeight: 1.5 }}>
              <span style={{ color: "#d4af37", flexShrink: 0, marginTop: "2px" }}>✓</span>{f}
            </li>
          ))}
          <li style={{ display: "flex", alignItems: "flex-start", gap: "10px", color: "rgba(255,255,255,0.3)", fontSize: "14px", lineHeight: 1.5 }}>
            <span style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0, marginTop: "2px" }}>✓</span>Requires active Pro subscription
          </li>
        </ul>
        <button
          onClick={() => handleCheckout(PRICE_ADDON, "addon")}
          disabled={loading === "addon"}
          style={{ border: "1px solid rgba(255,255,255,0.2)", backgroundColor: "transparent", color: "rgba(255,255,255,0.7)", borderRadius: "12px", padding: "14px", fontSize: "14px", fontWeight: 600, cursor: "pointer", opacity: loading === "addon" ? 0.6 : 1 }}
        >
          {loading === "addon" ? "Opening..." : "Buy 60 minutes — $4"}
        </button>
      </div>

    </div>
  );
}