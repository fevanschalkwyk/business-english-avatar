// app/privacy/page.tsx
import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | BusinessEnglishAI",
  description: "Privacy Policy for BusinessEnglishAI.",
};

const LAST_UPDATED = "June 2025";
const COMPANY_NAME = "BusinessEnglishAI";
const CONTACT_EMAIL = "support@businessenglishai.com";

export default function PrivacyPage() {
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
          <h1 style={{ fontSize: "36px", fontWeight: "bold", color: "white", margin: "0 0 12px 0" }}>Privacy Policy</h1>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px", margin: 0 }}>Last updated: {LAST_UPDATED}</p>
        </div>
      </div>

      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "64px 24px" }}>

        <LegalSection title="1. Introduction">
          <P>{COMPANY_NAME} ("we", "us", or "our") is committed to protecting your personal data. This Privacy Policy explains how we collect, use, store, and share information when you use our platform.</P>
          <P>By using our platform, you agree to the collection and use of information in accordance with this policy.</P>
        </LegalSection>

        <LegalSection title="2. Information We Collect">
          <SubHeading>2.1 Information you provide directly</SubHeading>
          <UL items={[
            <><strong style={{ color: "white" }}>Account information:</strong> Email address, full name, and password when you register.</>,
            <><strong style={{ color: "white" }}>Payment information:</strong> Billing details processed by Paddle. We do not store your card details.</>,
            <><strong style={{ color: "white" }}>Session notes:</strong> Any personal notes you choose to save alongside AI feedback.</>,
            <><strong style={{ color: "white" }}>Communications:</strong> Messages you send us via email or support channels.</>,
          ]} />

          <SubHeading>2.2 Information collected automatically</SubHeading>
          <UL items={[
            <><strong style={{ color: "white" }}>Usage data:</strong> Roleplays accessed, session duration, completion status, and weekly unlock activity.</>,
            <><strong style={{ color: "white" }}>AI session transcripts:</strong> Text transcripts of your AI conversation sessions, used to generate CEFR feedback.</>,
            <><strong style={{ color: "white" }}>Performance data:</strong> CEFR scores (Accuracy, Range, Interaction) saved per session to track your progress.</>,
            <><strong style={{ color: "white" }}>Device and log data:</strong> IP address, browser type, and basic device information collected via Vercel and Supabase infrastructure.</>,
          ]} />

          <SubHeading>2.3 Voice data</SubHeading>
          <P>In the free tier, your voice is not recorded or stored. In the paid tier, your spoken input is processed in real time by the browser's speech recognition. We do not store audio recordings of your voice on our servers.</P>
        </LegalSection>

        <LegalSection title="3. How We Use Your Information">
          <P>We use your information to:</P>
          <UL items={[
            "Provide, operate, and improve the platform and its features.",
            "Process payments and manage your subscription via Paddle.",
            "Generate personalised AI feedback on your Business English performance.",
            "Track your learning progress and maintain session history.",
            "Send session feedback summaries via email.",
            "Send transactional emails (account verification, password reset, receipts).",
            "Enforce usage limits as described in our Terms.",
            "Detect and prevent fraud, abuse, and violations of our Terms.",
            "Comply with legal obligations.",
          ]} />
          <P>We do not use your data to train AI models, sell to advertisers, or share with third parties for marketing purposes.</P>
        </LegalSection>

        <LegalSection title="4. Legal Basis for Processing (GDPR)">
          <P>If you are located in the EEA or United Kingdom, we process your personal data under the following legal bases:</P>
          <UL items={[
            <><strong style={{ color: "white" }}>Contract performance:</strong> Processing necessary to provide the service you signed up for.</>,
            <><strong style={{ color: "white" }}>Legitimate interests:</strong> Improving the platform, fraud prevention, and security.</>,
            <><strong style={{ color: "white" }}>Legal obligation:</strong> Where required by applicable law.</>,
            <><strong style={{ color: "white" }}>Consent:</strong> Where we have asked for and received your consent.</>,
          ]} />
        </LegalSection>

        <LegalSection title="5. Data Sharing and Third Parties">
          <P>We share your data only with trusted third-party service providers necessary to operate the platform:</P>
          <UL items={[
            <><strong style={{ color: "white" }}>Supabase</strong> — Database and authentication. SOC 2 Type II certified.</>,
            <><strong style={{ color: "white" }}>Vercel</strong> — Hosting and deployment.</>,
            <><strong style={{ color: "white" }}>Groq</strong> — AI conversation (paid tier). Does not use your data to train models.</>,
            <><strong style={{ color: "white" }}>Microsoft Azure TTS</strong> — Text-to-speech voice synthesis for avatar audio.</>,
            <><strong style={{ color: "white" }}>Paddle</strong> — Payment processing. PCI-DSS compliant. Acts as Merchant of Record.</>,
            <><strong style={{ color: "white" }}>Resend</strong> — Transactional email delivery.</>,
          ]} />
          <P>We do not sell, rent, or share your personal data with any other third parties for their own commercial purposes.</P>
        </LegalSection>

        <LegalSection title="6. Data Retention">
          <UL items={[
            "Account and profile data: retained while your account exists.",
            "Session transcripts: retained for up to 12 months.",
            "CEFR feedback and scores: retained to show your progress over time.",
            "Payment records: retained as required by financial regulations (typically 7 years).",
          ]} />
          <P>When you delete your account, we delete or anonymise your personal data within 30 days, except where required by law.</P>
        </LegalSection>

        <LegalSection title="7. Your Rights">
          <P>Depending on your location, you may have the right to:</P>
          <UL items={[
            <><strong style={{ color: "white" }}>Access:</strong> Request a copy of the personal data we hold about you.</>,
            <><strong style={{ color: "white" }}>Correction:</strong> Request correction of inaccurate data.</>,
            <><strong style={{ color: "white" }}>Deletion:</strong> Request deletion of your account and associated data.</>,
            <><strong style={{ color: "white" }}>Portability:</strong> Request your data in a machine-readable format.</>,
            <><strong style={{ color: "white" }}>Objection:</strong> Object to processing based on legitimate interests.</>,
            <><strong style={{ color: "white" }}>Withdraw consent:</strong> Where processing is based on consent, withdraw it at any time.</>,
          ]} />
          <P>To exercise any of these rights, email <A href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</A>. We will respond within 30 days.</P>
        </LegalSection>

        <LegalSection title="8. Cookies">
          <P>We use essential cookies and browser storage to maintain your session and authentication state. These are strictly necessary and cannot be disabled.</P>
          <P>We do not use advertising or tracking cookies, or any third-party analytics cookies that track you across sites.</P>
        </LegalSection>

        <LegalSection title="9. Data Security">
          <UL items={[
            "All data transmitted over HTTPS/TLS.",
            "Passwords hashed and never stored in plain text (managed by Supabase Auth).",
            "Row-level security (RLS) policies ensure users can only access their own data.",
            "Payment data processed exclusively by Paddle — we never receive card details.",
          ]} />
          <P>In the event of a data breach affecting your rights, we will notify you as required by applicable law.</P>
        </LegalSection>

        <LegalSection title="10. International Data Transfers">
          <P>Our service providers may process data in countries outside your own, including the United States. Where data is transferred outside the EEA or UK, we ensure appropriate safeguards are in place.</P>
        </LegalSection>

        <LegalSection title="11. Children's Privacy">
          <P>Our platform is not directed at children under 16. If you believe we have inadvertently collected data from a child under 16, please contact us at <A href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</A>.</P>
        </LegalSection>

        <LegalSection title="12. Changes to This Policy">
          <P>We may update this Privacy Policy from time to time. We will notify you of material changes by posting the updated policy on this page.</P>
        </LegalSection>

        <LegalSection title="13. Contact Us">
          <P><strong style={{ color: "white" }}>Email:</strong> <A href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</A></P>
          <P style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>If you are in the EU/EEA and unsatisfied with our response, you have the right to lodge a complaint with your local data protection authority.</P>
        </LegalSection>

        <div style={{ marginTop: "64px", paddingTop: "32px", borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", flexWrap: "wrap" as const, gap: "24px", fontSize: "14px" }}>
          <Link href="/terms" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>Terms of Service</Link>
          <Link href="/privacy" style={{ color: "#d4af37", fontWeight: 500, textDecoration: "none" }}>Privacy Policy</Link>
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

function P({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <p style={{ marginBottom: "12px", color: "rgba(255,255,255,0.7)", lineHeight: "1.75", marginTop: 0, ...style }}>{children}</p>;
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
