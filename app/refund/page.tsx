// app/refund/page.tsx
import Link from "next/link";

export const metadata = {
  title: "Refund Policy | BusinessEnglishAI",
  description: "Refund and cancellation policy for BusinessEnglishAI.",
};

const LAST_UPDATED = "June 2025";
const COMPANY_NAME = "BusinessEnglishAI";
const CONTACT_EMAIL = "support@businessenglishai.com";

export default function RefundPage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0a1628", color: "white" }}>
      <header style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", backgroundColor: "rgba(10,22,40,0.9)", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ color: "#d4af37", fontWeight: "bold", fontSize: "20px", textDecoration: "none" }}>BusinessEnglishAI</Link>
          <Link href="/" style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px", textDecoration: "none" }}>← Back to home</Link>
        </div>
      </header>

      <div style={{ background: "linear-gradient(to bottom, #0d1f3c, #0a1628)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "64px 24px" }}>
          <div style={{ display: "inline-block", backgroundColor: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.3)", borderRadius: "999px", padding: "4px 16px", color: "#d4af37", fontSize: "13px", fontWeight: 500, marginBottom: "24px" }}>Legal</div>
          <h1 style={{ fontSize: "36px", fontWeight: "bold", color: "white", margin: "0 0 12px 0" }}>Refund Policy</h1>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px", margin: 0 }}>Last updated: {LAST_UPDATED}</p>
        </div>
      </div>

      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "64px 24px" }}>

        {/* Summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "64px" }}>
          <SummaryCard icon="🔄" label="Pro Subscription" value="7-day refund" detail="Full refund within 7 days of first payment" />
          <SummaryCard icon="🎭" label="Single Roleplay ($3)" value="No refund" detail="Digital content unlocked on purchase" />
          <SummaryCard icon="⏱️" label="Add-on Minutes ($4)" value="No refund" detail="Unused minutes carry forward monthly" />
        </div>

        <LegalSection title="1. Overview">
          <P>{COMPANY_NAME} wants you to be satisfied with your purchase. This policy explains when refunds are available and how to request one.</P>
          <P>All payments are processed by Paddle, who acts as Merchant of Record. Refunds are issued via the original payment method.</P>
        </LegalSection>

        <LegalSection title="2. Pro Subscription — $12/month">
          <SubHeading>First payment</SubHeading>
          <P>If you subscribe to {COMPANY_NAME} Pro for the first time and are not satisfied, you may request a full refund within <strong style={{ color: "white" }}>7 days</strong> of your initial subscription payment.</P>
          <SubHeading>Renewal payments</SubHeading>
          <P>Refunds are not available for renewal payments after the 7-day first-payment window. You can cancel at any time from your account settings — cancellation takes effect at the end of the current billing period.</P>
          <SubHeading>Pausing your subscription</SubHeading>
          <P>If you need a break, we recommend <strong style={{ color: "white" }}>pausing</strong> rather than cancelling. You can pause for up to one calendar month from your account settings. Your subscription resumes automatically.</P>
          <div style={{ backgroundColor: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.3)", borderRadius: "12px", padding: "16px", marginTop: "16px" }}>
            <p style={{ color: "#d4af37", fontWeight: 500, fontSize: "14px", margin: 0 }}>
              💡 Tip: Pausing is better than cancelling if you plan to return — it keeps your progress, unlock history, and favourites intact.
            </p>
          </div>
        </LegalSection>

        <LegalSection title="3. Single Roleplay Purchase — $3">
          <P>Single roleplay purchases unlock a specific roleplay permanently and grant 3 bonus unlocks. Because access is granted immediately upon payment, these purchases are <strong style={{ color: "white" }}>non-refundable</strong>.</P>
          <P>Exception: if you were charged twice for the same roleplay due to a technical error, contact us and we will issue a full refund for the duplicate charge.</P>
        </LegalSection>

        <LegalSection title="4. Add-on Minute Packs — $4 (60 minutes)">
          <P>Add-on minute packs are <strong style={{ color: "white" }}>non-refundable</strong> once purchased. Unused minutes carry forward each month and do not expire while your account remains active.</P>
        </LegalSection>

        <LegalSection title="5. Technical Issues and Exceptions">
          <P>We will consider refund requests on a case-by-case basis where a technical issue on our side prevented you from accessing the service. This includes:</P>
          <UL items={[
            "Platform outages lasting more than 24 hours during your paid period.",
            "Duplicate charges caused by a payment processing error.",
            "Access to paid features not functioning as described at time of purchase.",
          ]} />
          <P>To request a refund under this exception, contact us within 14 days of the issue at <A href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</A> with a description of the issue and your account email.</P>
        </LegalSection>

        <LegalSection title="6. Consumer Rights">
          <P>If you are a consumer in the European Union or United Kingdom, you may have statutory rights including a 14-day right of withdrawal for digital services, unless you have already begun using the service.</P>
          <P>By starting a roleplay session, you acknowledge that you have begun using the digital service and the right of withdrawal may no longer apply.</P>
          <P>Nothing in this policy limits any statutory rights you may have under applicable consumer protection law.</P>
        </LegalSection>

        <LegalSection title="7. How to Request a Refund">
          <P>To request a refund:</P>
          <ol style={{ paddingLeft: "24px", marginBottom: "12px", marginTop: 0 }}>
            <li style={{ color: "rgba(255,255,255,0.7)", lineHeight: "1.75", marginBottom: "8px" }}>Email <A href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</A> with the subject line: <em>Refund Request</em>.</li>
            <li style={{ color: "rgba(255,255,255,0.7)", lineHeight: "1.75", marginBottom: "8px" }}>Include your account email address and the date of the charge.</li>
            <li style={{ color: "rgba(255,255,255,0.7)", lineHeight: "1.75", marginBottom: "8px" }}>Briefly describe the reason for your request.</li>
          </ol>
          <P>We aim to respond within <strong style={{ color: "white" }}>3 business days</strong>. Approved refunds are processed by Paddle and typically appear within 5–10 business days.</P>
        </LegalSection>

        <LegalSection title="8. Changes to This Policy">
          <P>We reserve the right to update this Refund Policy at any time. Changes will be posted on this page with an updated date.</P>
        </LegalSection>

        <LegalSection title="9. Contact">
          <P><strong style={{ color: "white" }}>Email:</strong> <A href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</A></P>
        </LegalSection>

        <div style={{ marginTop: "64px", paddingTop: "32px", borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", flexWrap: "wrap" as const, gap: "24px", fontSize: "14px" }}>
          <Link href="/terms" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>Terms of Service</Link>
          <Link href="/privacy" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>Privacy Policy</Link>
          <Link href="/refund" style={{ color: "#d4af37", fontWeight: 500, textDecoration: "none" }}>Refund Policy</Link>
        </div>
      </main>

      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.1)", backgroundColor: "#080f1e" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "32px 24px", display: "flex", flexWrap: "wrap" as const, alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
          <span style={{ color: "#d4af37", fontWeight: "bold", fontSize: "18px" }}>BusinessEnglishAI</span>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px", margin: 0 }}>© {new Date().getFullYear()} {COMPANY_NAME}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function SummaryCard({ icon, label, value, detail }: { icon: string; label: string; value: string; detail: string }) {
  return (
    <div style={{ backgroundColor: "#0d1f3c", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "20px" }}>
      <div style={{ fontSize: "24px", marginBottom: "12px" }}>{icon}</div>
      <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: "4px" }}>{label}</div>
      <div style={{ color: "#d4af37", fontWeight: "bold", fontSize: "18px", marginBottom: "8px" }}>{value}</div>
      <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", lineHeight: "1.5" }}>{detail}</div>
    </div>
  );
}

function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: "40px" }}>
      <h2 style={{ fontSize: "18px", fontWeight: "bold", color: "white", marginBottom: "16px", paddingBottom: "8px", borderBottom: "1px solid rgba(255,255,255,0.1)", marginTop: 0 }}>{title}</h2>
      <div>{children}</div>
    </section>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return <h3 style={{ color: "white", fontWeight: 600, fontSize: "15px", marginTop: "20px", marginBottom: "8px" }}>{children}</h3>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p style={{ marginBottom: "12px", color: "rgba(255,255,255,0.7)", lineHeight: "1.75", marginTop: 0 }}>{children}</p>;
}

function UL({ items }: { items: React.ReactNode[] }) {
  return (
    <ul style={{ paddingLeft: "24px", marginBottom: "12px", marginTop: 0 }}>
      {items.map((item, i) => (
        <li key={i} style={{ color: "rgba(255,255,255,0.7)", lineHeight: "1.75", marginBottom: "6px", listStyleType: "disc" }}>{item}</li>
      ))}
    </ul>
  );
}

function A({ href, children }: { href: string; children: React.ReactNode }) {
  return <a href={href} style={{ color: "#d4af37", textDecoration: "underline" }}>{children}</a>;
}
