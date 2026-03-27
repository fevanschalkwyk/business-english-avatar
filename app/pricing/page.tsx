// app/pricing/page.tsx
import Link from "next/link";
import { PricingCards } from "@/components/pricing/PricingCards";

export const metadata = {
  title: "Pricing | BusinessEnglishAI",
  description: "Start free. Upgrade when you're ready.",
};

export default function PricingPage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0a1628", color: "white" }}>
      <header style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ color: "#d4af37", fontWeight: "bold", fontSize: "20px", textDecoration: "none" }}>
            BusinessEnglishAI
          </Link>
          <Link href="/dashboard" style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px", textDecoration: "none" }}>
            Dashboard
          </Link>
        </div>
      </header>

      <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "80px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <h1 style={{ fontSize: "48px", fontWeight: "bold", color: "white", marginBottom: "16px", lineHeight: 1.15 }}>
            Simple, honest pricing
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "20px", maxWidth: "520px", margin: "0 auto", lineHeight: 1.6 }}>
            Start free. Upgrade when you're ready to practise with a live AI conversation partner.
          </p>
        </div>

        <PricingCards />

        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: "13px", marginTop: "48px" }}>
          All prices in USD. Subscriptions renew monthly. Cancel anytime.{" "}
          <Link href="/refund" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "underline" }}>Refund policy</Link>.
        </p>
      </main>

      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.1)", marginTop: "80px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 24px", display: "flex", justifyContent: "center", gap: "32px" }}>
          <Link href="/terms" style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", textDecoration: "none" }}>Terms</Link>
          <Link href="/privacy" style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", textDecoration: "none" }}>Privacy</Link>
          <Link href="/refund" style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", textDecoration: "none" }}>Refunds</Link>
        </div>
      </footer>
    </div>
  );
}