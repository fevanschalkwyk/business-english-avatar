// app/terms/page.tsx
import Link from "next/link";

export const metadata = {
  title: "Terms of Service | BusinessEnglishAI",
  description: "Terms of Service for BusinessEnglishAI.",
};

const LAST_UPDATED = "June 2025";
const COMPANY_NAME = "BusinessEnglishAI";
const CONTACT_EMAIL = "support@businessenglishai.com";
const SITE_URL = "https://business-english-avatar.vercel.app";

export default function TermsPage() {
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
          <h1 style={{ fontSize: "36px", fontWeight: "bold", color: "white", marginBottom: "12px", margin: "0 0 12px 0" }}>Terms of Service</h1>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px", margin: 0 }}>Last updated: {LAST_UPDATED}</p>
        </div>
      </div>

      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "64px 24px" }}>

        <LegalSection title="1. Acceptance of Terms">
          <P>By accessing or using {COMPANY_NAME} at <A href={SITE_URL}>{SITE_URL}</A>, you agree to be bound by these Terms of Service. If you do not agree, please do not use our platform.</P>
          <P>These Terms apply to all users, including free tier users, paid subscribers, and visitors.</P>
        </LegalSection>

        <LegalSection title="2. Description of Service">
          <P>{COMPANY_NAME} is a Business English roleplay learning platform. We provide:</P>
          <UL items={[
            <><strong style={{ color: "white" }}>Free tier:</strong> Access to scripted Business English roleplays with pre-recorded audio, listen-and-repeat practice, and a weekly unlock allowance of 3 roleplays.</>,
            <><strong style={{ color: "white" }}>Pro subscription ($12/month):</strong> Full access to all roleplays, live AI-powered conversation, and 160 minutes of AI conversation time per month.</>,
            <><strong style={{ color: "white" }}>Single roleplay purchase ($3):</strong> Permanent access to one specific roleplay plus 3 bonus unlocks.</>,
            <><strong style={{ color: "white" }}>Add-on minute pack ($4):</strong> 60 additional AI conversation minutes.</>,
          ]} />
        </LegalSection>

        <LegalSection title="3. Account Registration">
          <P>To access certain features, you must create an account. You agree to:</P>
          <UL items={[
            "Provide accurate, complete, and current information during registration.",
            <>Notify us immediately of any unauthorised use at <A href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</A>.</>,
            "Not share your account credentials with any other person.",
          ]} />
          <P>You must be at least 16 years old to create an account.</P>
        </LegalSection>

        <LegalSection title="4. Subscriptions and Payments">
          <SubHeading>4.1 Billing</SubHeading>
          <P>Paid subscriptions are billed monthly through Paddle, our authorised payment processor. By subscribing, you authorise Paddle to charge your payment method on a recurring basis until you cancel.</P>
          <SubHeading>4.2 Cancellation</SubHeading>
          <P>You may cancel your subscription at any time from your account settings. Cancellation takes effect at the end of the current billing period. You retain access to paid features until that date.</P>
          <SubHeading>4.3 Pausing</SubHeading>
          <P>Pro subscribers may pause their subscription for up to one calendar month. It resumes automatically at the end of the pause period.</P>
          <SubHeading>4.4 Price Changes</SubHeading>
          <P>We will give at least 30 days' notice before any price change takes effect. Continued use after the effective date constitutes acceptance of the new price.</P>
          <SubHeading>4.5 Taxes</SubHeading>
          <P>Prices may be exclusive of applicable taxes. Paddle collects and remits taxes as required by law.</P>
        </LegalSection>

        <LegalSection title="5. Usage Limits">
          <UL items={[
            "Maximum session length: 20 minutes per session.",
            "Pro subscribers receive 160 minutes of AI conversation per calendar month, resetting on the 1st.",
            "Only actual minutes used are deducted — ending early does not waste remaining minutes.",
            "Free tier users receive 3 new roleplay unlocks per week, permanently accessible once unlocked.",
          ]} />
        </LegalSection>

        <LegalSection title="6. Acceptable Use">
          <P>You agree not to:</P>
          <UL items={[
            "Use the platform for any unlawful purpose.",
            "Attempt to reverse-engineer or extract source code from the platform.",
            "Use automated scripts, bots, or scrapers.",
            "Attempt to circumvent usage limits or subscription restrictions.",
            "Share, sell, or transfer your account to any third party.",
            "Interfere with or disrupt the platform's integrity or performance.",
          ]} />
        </LegalSection>

        <LegalSection title="7. Intellectual Property">
          <P>All content on {COMPANY_NAME} — including roleplay scripts, audio recordings, software code, and AI feedback methodology — is owned by or licensed to us and protected by applicable intellectual property laws.</P>
          <P>You are granted a limited, non-exclusive, non-transferable licence to access and use the platform for personal learning purposes only.</P>
        </LegalSection>

        <LegalSection title="8. AI-Generated Content">
          <P>The platform uses third-party AI services (including Groq) to generate conversational responses for educational purposes only. We do not guarantee the accuracy or completeness of AI-generated feedback.</P>
          <P>CEFR-level assessments are indicative and for self-improvement purposes only. They are not equivalent to official language certifications.</P>
        </LegalSection>

        <LegalSection title="9. Privacy">
          <P>Your use of the platform is governed by our <A href="/privacy">Privacy Policy</A>, incorporated into these Terms by reference.</P>
        </LegalSection>

        <LegalSection title="10. Disclaimers">
          <P>THE PLATFORM IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. We do not warrant that the platform will be uninterrupted or error-free.</P>
        </LegalSection>

        <LegalSection title="11. Limitation of Liability">
          <P>TO THE MAXIMUM EXTENT PERMITTED BY LAW, {COMPANY_NAME.toUpperCase()} SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES. OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID IN THE 12 MONTHS PRECEDING THE CLAIM.</P>
        </LegalSection>

        <LegalSection title="12. Termination">
          <P>We reserve the right to suspend or terminate your access at any time for violation of these Terms. Your right to use the platform ceases immediately upon termination.</P>
        </LegalSection>

        <LegalSection title="13. Changes to Terms">
          <P>We may update these Terms from time to time. Continued use after changes constitutes acceptance of the revised Terms.</P>
        </LegalSection>

        <LegalSection title="14. Governing Law">
          <P>These Terms shall be governed by applicable law. Disputes shall first be resolved through good-faith negotiation.</P>
        </LegalSection>

        <LegalSection title="15. Contact Us">
          <P><strong style={{ color: "white" }}>Email:</strong> <A href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</A></P>
        </LegalSection>

        <div style={{ marginTop: "64px", paddingTop: "32px", borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", flexWrap: "wrap" as const, gap: "24px", fontSize: "14px" }}>
          <Link href="/terms" style={{ color: "#d4af37", fontWeight: 500, textDecoration: "none" }}>Terms of Service</Link>
          <Link href="/privacy" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>Privacy Policy</Link>
          <Link href="/refund" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>Refund Policy</Link>
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
