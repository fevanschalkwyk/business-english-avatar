import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="landing">
      {/* NAV */}
      <nav className="nav">
        <div className="nav-inner">
          <div className="logo">
            <span className="logo-mark">BE</span>
            <span className="logo-text">BusinessEnglish<em>AI</em></span>
          </div>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#scenarios">Scenarios</a>
          </div>
          <div className="nav-cta">
            <Link href="/auth/signin" className="btn-ghost">Sign in</Link>
            <Link href="/auth/signup" className="btn-primary">Start free</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-grid" />
          <div className="hero-glow" />
        </div>
        <div className="hero-content">
          <div className="hero-badge">AI-Powered Business English Training</div>
          <h1 className="hero-headline">
            Speak confidently<br />
            <span className="accent">in every meeting.</span>
          </h1>
          <p className="hero-sub">
            Practice real business scenarios with AI avatars. Build fluency, reduce anxiety, and advance your career — at your own pace.
          </p>
          <div className="hero-actions">
            <Link href="/auth/signup" className="btn-primary btn-lg">
              Start free — no card needed
            </Link>
            <Link href="#scenarios" className="btn-outline btn-lg">
              See scenarios →
            </Link>
          </div>
          <div className="hero-social-proof">
            <div className="proof-avatars">
              {['A','B','C','D','E'].map(l => (
                <span key={l} className="proof-avatar">{l}</span>
              ))}
            </div>
            <span>Join 500+ professionals improving their Business English</span>
          </div>
        </div>
        <div className="hero-visual">
          <div className="avatar-card">
            <div className="avatar-frame">
              <div className="avatar-figure">
                <div className="avatar-head" />
                <div className="avatar-body" />
                <div className="avatar-pulse" />
              </div>
            </div>
            <div className="chat-bubble left">
              "Could you walk us through the Q3 projections?"
            </div>
            <div className="chat-bubble right user">
              "Of course. Let me share my screen..."
            </div>
            <div className="live-badge">● Live practice session</div>
          </div>
        </div>
      </section>

      {/* LOGOS */}
      <section className="trust-bar">
        <p className="trust-label">Trusted by professionals from</p>
        <div className="trust-logos">
          {['Deloitte', 'Siemens', 'Reckitt', 'KPMG', 'Unilever', 'Philips'].map(name => (
            <span key={name} className="trust-logo">{name}</span>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="features" id="features">
        <div className="section-inner">
          <div className="section-label">Why it works</div>
          <h2>Everything you need to speak<br />Business English fluently</h2>
          <div className="features-grid">
            {[
              {
                icon: '🎯',
                title: 'Real-world scenarios',
                desc: 'Practice meetings, negotiations, presentations, and client calls — not textbook exercises.'
              },
              {
                icon: '🤖',
                title: 'AI conversation partner',
                desc: 'Our AI responds naturally to what you say, so every session is different.'
              },
              {
                icon: '🎙️',
                title: 'Voice-first learning',
                desc: 'Speak out loud and get instant feedback. Reading alone won\'t build fluency.'
              },
              {
                icon: '📊',
                title: 'Progress tracking',
                desc: 'See your improvement over time with session history and skill scores.'
              },
              {
                icon: '🏢',
                title: 'Business-specific vocab',
                desc: 'Learn the exact phrases used in boardrooms, emails, and client calls.'
              },
              {
                icon: '⚡',
                title: 'Zero setup',
                desc: 'Works in your browser — no downloads, no installations, no IT tickets.'
              }
            ].map(f => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SCENARIOS */}
      <section className="scenarios" id="scenarios">
        <div className="section-inner">
          <div className="section-label">Practice scenarios</div>
          <h2>Built for real business situations</h2>
          <div className="scenarios-grid">
            {[
              { title: 'Meetings & Presentations', desc: 'Lead meetings, present data, handle Q&A', tag: 'Available now', available: true },
              { title: 'Job Interviews', desc: 'Practice with a hiring manager avatar', tag: 'Coming soon', available: false },
              { title: 'Client Negotiations', desc: 'Close deals and manage objections', tag: 'Coming soon', available: false },
              { title: 'Performance Reviews', desc: 'Give and receive feedback professionally', tag: 'Coming soon', available: false },
            ].map(s => (
              <div key={s.title} className={`scenario-card ${s.available ? 'available' : ''}`}>
                <div className="scenario-tag">{s.tag}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                {s.available && (
                  <Link href="/auth/signup" className="btn-primary btn-sm">Try now →</Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="pricing" id="pricing">
        <div className="section-inner">
          <div className="section-label">Simple pricing</div>
          <h2>Start free. Upgrade when ready.</h2>
          <div className="pricing-grid">
            <div className="plan-card">
              <div className="plan-name">Free</div>
              <div className="plan-price">$0<span>/forever</span></div>
              <p className="plan-desc">Perfect for getting started</p>
              <ul className="plan-features">
                <li>✓ 1 business scenario</li>
                <li>✓ Scripted dialogue practice</li>
                <li>✓ 2D avatar</li>
                <li>✓ Browser-based voice recognition</li>
                <li>✓ Progress tracking</li>
              </ul>
              <Link href="/auth/signup" className="btn-outline btn-full">Get started free</Link>
            </div>
            <div className="plan-card featured">
              <div className="plan-badge">Most popular</div>
              <div className="plan-name">Pro</div>
              <div className="plan-price">$12<span>/month</span></div>
              <p className="plan-desc">For serious learners</p>
              <ul className="plan-features">
                <li>✓ All scenarios (growing library)</li>
                <li>✓ AI-powered free conversation</li>
                <li>✓ 3D Ready Player Me avatar</li>
                <li>✓ ElevenLabs natural voice</li>
                <li>✓ Detailed feedback & scoring</li>
                <li>✓ Priority support</li>
              </ul>
              <Link href="/auth/signup" className="btn-primary btn-full">Start 7-day free trial</Link>
            </div>
            <div className="plan-card">
              <div className="plan-name">Teams</div>
              <div className="plan-price">Custom</div>
              <p className="plan-desc">For businesses & language schools</p>
              <ul className="plan-features">
                <li>✓ Everything in Pro</li>
                <li>✓ Team dashboard</li>
                <li>✓ Custom scenarios</li>
                <li>✓ Progress reports</li>
                <li>✓ Dedicated account manager</li>
              </ul>
              <a href="mailto:hello@businessenglishai.com" className="btn-outline btn-full">Contact us</a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-inner">
          <h2>Ready to speak with confidence?</h2>
          <p>Join professionals using AI to master Business English.</p>
          <Link href="/auth/signup" className="btn-primary btn-lg">Start free today →</Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="logo">
            <span className="logo-mark">BE</span>
            <span className="logo-text">BusinessEnglish<em>AI</em></span>
          </div>
          <div className="footer-links">
            <a href="mailto:hello@businessenglishai.com">Contact</a>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/refund">Refunds</Link>
          </div>
          <p className="footer-copy">© 2025 BusinessEnglishAI. All rights reserved.</p>
        </div>
      </footer>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --navy: #0a1628;
          --navy-mid: #112240;
          --navy-light: #1e3a5f;
          --gold: #c9a84c;
          --gold-light: #e8c76a;
          --white: #ffffff;
          --off-white: #f4f6f9;
          --text: #2d3748;
          --text-muted: #718096;
          --border: #e2e8f0;
          --radius: 12px;
          --shadow: 0 4px 24px rgba(10,22,40,0.10);
          --shadow-lg: 0 16px 48px rgba(10,22,40,0.16);
        }

        body { font-family: 'Georgia', 'Times New Roman', serif; color: var(--text); background: var(--white); }

        .landing { min-height: 100vh; }

        /* NAV */
        .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          background: rgba(10,22,40,0.96); backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(201,168,76,0.15);
        }
        .nav-inner {
          max-width: 1200px; margin: 0 auto; padding: 0 32px;
          display: flex; align-items: center; height: 68px; gap: 40px;
        }
        .logo { display: flex; align-items: center; gap: 10px; text-decoration: none; flex-shrink: 0; }
        .logo-mark {
          width: 36px; height: 36px; background: var(--gold);
          border-radius: 8px; display: flex; align-items: center; justify-content: center;
          font-family: Georgia, serif; font-weight: bold; font-size: 14px;
          color: var(--navy); letter-spacing: 0.5px;
        }
        .logo-text { font-family: Georgia, serif; font-size: 16px; color: var(--white); letter-spacing: -0.3px; }
        .logo-text em { color: var(--gold); font-style: normal; }
        .nav-links { display: flex; gap: 32px; margin-left: auto; }
        .nav-links a { color: rgba(255,255,255,0.75); text-decoration: none; font-family: -apple-system, sans-serif; font-size: 14px; transition: color 0.2s; }
        .nav-links a:hover { color: var(--white); }
        .nav-cta { display: flex; gap: 12px; align-items: center; }

        /* BUTTONS */
        .btn-primary {
          background: var(--gold); color: var(--navy); border: none;
          padding: 10px 20px; border-radius: 8px; font-family: -apple-system, sans-serif;
          font-size: 14px; font-weight: 600; cursor: pointer; text-decoration: none;
          display: inline-block; transition: all 0.2s; letter-spacing: 0.2px;
        }
        .btn-primary:hover { background: var(--gold-light); transform: translateY(-1px); box-shadow: 0 4px 16px rgba(201,168,76,0.4); }
        .btn-ghost { color: rgba(255,255,255,0.8); background: none; border: none; font-family: -apple-system, sans-serif; font-size: 14px; cursor: pointer; text-decoration: none; padding: 10px 16px; transition: color 0.2s; }
        .btn-ghost:hover { color: var(--white); }
        .btn-outline {
          border: 1.5px solid var(--navy); color: var(--navy); background: transparent;
          padding: 10px 20px; border-radius: 8px; font-family: -apple-system, sans-serif;
          font-size: 14px; font-weight: 500; cursor: pointer; text-decoration: none;
          display: inline-block; transition: all 0.2s;
        }
        .btn-outline:hover { background: var(--navy); color: var(--white); }
        .btn-lg { padding: 14px 28px; font-size: 16px; border-radius: 10px; }
        .btn-sm { padding: 8px 16px; font-size: 13px; }
        .btn-full { display: block; text-align: center; width: 100%; padding: 14px; }

        /* HERO */
        .hero {
          min-height: 100vh; background: var(--navy);
          display: flex; align-items: center; position: relative; overflow: hidden;
          padding: 100px 32px 60px;
        }
        .hero-bg { position: absolute; inset: 0; pointer-events: none; }
        .hero-grid {
          position: absolute; inset: 0;
          background-image: linear-gradient(rgba(201,168,76,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201,168,76,0.06) 1px, transparent 1px);
          background-size: 48px 48px;
        }
        .hero-glow {
          position: absolute; top: -200px; right: -100px;
          width: 700px; height: 700px; border-radius: 50%;
          background: radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%);
        }
        .hero-content { max-width: 1200px; margin: 0 auto; flex: 1; position: relative; z-index: 1; display: flex; flex-direction: column; gap: 24px; max-width: 560px; }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(201,168,76,0.12); border: 1px solid rgba(201,168,76,0.3);
          color: var(--gold); padding: 6px 14px; border-radius: 100px;
          font-family: -apple-system, sans-serif; font-size: 13px; font-weight: 500; width: fit-content;
        }
        .hero-headline { font-family: Georgia, serif; font-size: clamp(40px, 6vw, 64px); font-weight: normal; color: var(--white); line-height: 1.1; letter-spacing: -1px; }
        .hero-headline .accent { color: var(--gold); }
        .hero-sub { font-family: -apple-system, sans-serif; font-size: 18px; color: rgba(255,255,255,0.7); line-height: 1.6; max-width: 460px; }
        .hero-actions { display: flex; gap: 16px; flex-wrap: wrap; }
        .btn-outline.btn-lg { border-color: rgba(255,255,255,0.4); color: rgba(255,255,255,0.9); }
        .btn-outline.btn-lg:hover { border-color: var(--white); color: var(--white); background: rgba(255,255,255,0.08); }
        .hero-social-proof { display: flex; align-items: center; gap: 12px; }
        .proof-avatars { display: flex; }
        .proof-avatar {
          width: 28px; height: 28px; border-radius: 50%; background: var(--navy-light);
          border: 2px solid var(--navy); display: flex; align-items: center; justify-content: center;
          font-family: -apple-system, sans-serif; font-size: 10px; font-weight: 600; color: var(--gold);
          margin-left: -8px;
        }
        .proof-avatar:first-child { margin-left: 0; }
        .hero-social-proof span { font-family: -apple-system, sans-serif; font-size: 13px; color: rgba(255,255,255,0.55); }

        /* HERO VISUAL */
        .hero-visual { position: absolute; right: max(32px, calc(50% - 560px)); top: 50%; transform: translateY(-50%); }
        .avatar-card {
          width: 320px; background: rgba(255,255,255,0.04); border: 1px solid rgba(201,168,76,0.2);
          border-radius: 20px; padding: 24px; backdrop-filter: blur(16px);
          display: flex; flex-direction: column; gap: 16px; position: relative;
        }
        .avatar-frame {
          width: 100%; height: 160px; background: var(--navy-mid);
          border-radius: 12px; display: flex; align-items: center; justify-content: center;
          position: relative; overflow: hidden;
          border: 1px solid rgba(201,168,76,0.1);
        }
        .avatar-figure { display: flex; flex-direction: column; align-items: center; gap: 4px; }
        .avatar-head {
          width: 48px; height: 48px; border-radius: 50%; background: var(--gold);
          animation: float 3s ease-in-out infinite;
        }
        .avatar-body {
          width: 64px; height: 56px; background: var(--navy-light); border-radius: 32px 32px 0 0;
        }
        .avatar-pulse {
          position: absolute; inset: 0; border-radius: 12px;
          background: radial-gradient(circle at 50% 40%, rgba(201,168,76,0.08) 0%, transparent 60%);
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes pulse { 0%,100% { opacity: 0.5; } 50% { opacity: 1; } }
        .chat-bubble {
          background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px; padding: 10px 14px;
          font-family: -apple-system, sans-serif; font-size: 13px; color: rgba(255,255,255,0.85);
          line-height: 1.4;
        }
        .chat-bubble.user { background: rgba(201,168,76,0.12); border-color: rgba(201,168,76,0.2); color: var(--gold-light); text-align: right; }
        .live-badge {
          font-family: -apple-system, sans-serif; font-size: 11px; color: #4ade80;
          font-weight: 600; letter-spacing: 0.5px; text-align: center;
        }

        /* TRUST BAR */
        .trust-bar { background: var(--off-white); border-bottom: 1px solid var(--border); padding: 24px 32px; text-align: center; }
        .trust-label { font-family: -apple-system, sans-serif; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; color: var(--text-muted); margin-bottom: 16px; }
        .trust-logos { display: flex; justify-content: center; gap: 40px; flex-wrap: wrap; }
        .trust-logo { font-family: Georgia, serif; font-size: 16px; color: #b0bec5; letter-spacing: 1px; font-weight: bold; }

        /* SECTIONS */
        .section-inner { max-width: 1200px; margin: 0 auto; padding: 0 32px; }
        .section-label { font-family: -apple-system, sans-serif; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: var(--gold); font-weight: 600; margin-bottom: 12px; }
        .section-inner > h2 { font-family: Georgia, serif; font-size: clamp(28px, 4vw, 44px); color: var(--navy); line-height: 1.2; margin-bottom: 48px; letter-spacing: -0.5px; }

        /* FEATURES */
        .features { padding: 96px 32px; background: var(--white); }
        .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; }
        .feature-card {
          padding: 28px; border: 1px solid var(--border); border-radius: var(--radius);
          transition: all 0.2s; background: var(--white);
        }
        .feature-card:hover { border-color: var(--gold); box-shadow: var(--shadow); transform: translateY(-2px); }
        .feature-icon { font-size: 28px; margin-bottom: 16px; }
        .feature-card h3 { font-family: Georgia, serif; font-size: 18px; color: var(--navy); margin-bottom: 8px; }
        .feature-card p { font-family: -apple-system, sans-serif; font-size: 14px; color: var(--text-muted); line-height: 1.6; }

        /* SCENARIOS */
        .scenarios { padding: 96px 32px; background: var(--off-white); }
        .scenarios-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; }
        .scenario-card {
          padding: 28px; border-radius: var(--radius); background: var(--white);
          border: 1px solid var(--border); position: relative; opacity: 0.75;
          font-family: -apple-system, sans-serif;
        }
        .scenario-card.available { opacity: 1; border-color: var(--gold); box-shadow: 0 0 0 1px rgba(201,168,76,0.2); }
        .scenario-tag { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--text-muted); font-weight: 600; margin-bottom: 12px; }
        .scenario-card.available .scenario-tag { color: var(--gold); }
        .scenario-card h3 { font-family: Georgia, serif; font-size: 18px; color: var(--navy); margin-bottom: 8px; }
        .scenario-card p { font-size: 14px; color: var(--text-muted); line-height: 1.5; margin-bottom: 20px; }

        /* PRICING */
        .pricing { padding: 96px 32px; background: var(--white); }
        .pricing-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; align-items: start; }
        .plan-card {
          padding: 36px; border: 1px solid var(--border); border-radius: 16px;
          position: relative; font-family: -apple-system, sans-serif;
        }
        .plan-card.featured { background: var(--navy); border-color: var(--navy); color: var(--white); }
        .plan-badge {
          position: absolute; top: -12px; left: 50%; transform: translateX(-50%);
          background: var(--gold); color: var(--navy); font-size: 11px; font-weight: 700;
          letter-spacing: 0.5px; padding: 4px 14px; border-radius: 100px;
          text-transform: uppercase; white-space: nowrap;
        }
        .plan-name { font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; color: var(--text-muted); margin-bottom: 8px; }
        .plan-card.featured .plan-name { color: rgba(255,255,255,0.6); }
        .plan-price { font-family: Georgia, serif; font-size: 48px; color: var(--navy); font-weight: normal; margin-bottom: 4px; }
        .plan-price span { font-size: 16px; color: var(--text-muted); }
        .plan-card.featured .plan-price { color: var(--white); }
        .plan-card.featured .plan-price span { color: rgba(255,255,255,0.5); }
        .plan-desc { font-size: 14px; color: var(--text-muted); margin-bottom: 24px; }
        .plan-card.featured .plan-desc { color: rgba(255,255,255,0.6); }
        .plan-features { list-style: none; display: flex; flex-direction: column; gap: 10px; margin-bottom: 32px; }
        .plan-features li { font-size: 14px; color: var(--text); }
        .plan-card.featured .plan-features li { color: rgba(255,255,255,0.85); }
        .plan-card.featured .btn-primary { background: var(--gold); }
        .plan-card.featured .btn-outline { border-color: rgba(255,255,255,0.3); color: var(--white); }
        .plan-card.featured .btn-outline:hover { background: rgba(255,255,255,0.1); border-color: var(--white); }

        /* CTA */
        .cta-section { background: var(--navy); padding: 96px 32px; text-align: center; position: relative; overflow: hidden; }
        .cta-section::before {
          content: ''; position: absolute; top: -200px; left: 50%; transform: translateX(-50%);
          width: 800px; height: 400px; background: radial-gradient(ellipse, rgba(201,168,76,0.1) 0%, transparent 70%);
        }
        .cta-inner { position: relative; z-index: 1; }
        .cta-inner h2 { font-family: Georgia, serif; font-size: clamp(28px, 4vw, 44px); color: var(--white); margin-bottom: 16px; }
        .cta-inner p { font-family: -apple-system, sans-serif; font-size: 18px; color: rgba(255,255,255,0.65); margin-bottom: 32px; }

        /* FOOTER */
        .footer { background: #070f1d; padding: 40px 32px; }
        .footer-inner { max-width: 1200px; margin: 0 auto; display: flex; align-items: center; gap: 32px; flex-wrap: wrap; }
        .footer-links { display: flex; gap: 24px; margin-left: auto; }
        .footer-links a { font-family: -apple-system, sans-serif; font-size: 13px; color: rgba(255,255,255,0.4); text-decoration: none; transition: color 0.2s; }
        .footer-links a:hover { color: rgba(255,255,255,0.8); }
        .footer-copy { font-family: -apple-system, sans-serif; font-size: 12px; color: rgba(255,255,255,0.25); width: 100%; }

        @media (max-width: 900px) {
          .hero { flex-direction: column; padding-top: 120px; }
          .hero-visual { position: static; transform: none; width: 100%; display: flex; justify-content: center; }
          .nav-links { display: none; }
          .hero-content { max-width: 100%; }
        }
      `}</style>
    </main>
  )
}
