'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      setLoading(false)
      return
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-inner">
          <Link href="/" className="logo">
            <span className="logo-mark">BE</span>
            <span className="logo-text">BusinessEnglish<em>AI</em></span>
          </Link>
          <div className="auth-pitch">
            <h2>Start speaking with confidence today.</h2>
            <div className="auth-quotes">
              {[
                { quote: '"I finally feel comfortable leading meetings in English."', name: 'Maria S., Product Manager' },
                { quote: '"The AI scenarios feel so real. My presentation skills improved fast."', name: 'Li Wei, Consultant' },
              ].map(q => (
                <div key={q.name} className="quote-card">
                  <p>{q.quote}</p>
                  <span>— {q.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-container">
          {success ? (
            <div className="success-state">
              <div className="success-icon">✓</div>
              <h2>Check your email</h2>
              <p>We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.</p>
              <Link href="/auth/signin" className="btn-primary btn-full">Back to sign in</Link>
            </div>
          ) : (
            <>
              <div className="form-header">
                <h1>Create your account</h1>
                <p>Free forever. No credit card needed.</p>
              </div>

              <form onSubmit={handleSignUp} className="auth-form">
                <div className="field">
                  <label htmlFor="name">Full name</label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Jane Smith"
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="email">Work email</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="jane@company.com"
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="password">Password</label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                  />
                </div>

                {error && <div className="error-msg">{error}</div>}

                <button type="submit" className="btn-primary btn-full btn-lg" disabled={loading}>
                  {loading ? 'Creating account...' : 'Create free account →'}
                </button>
              </form>

              <p className="auth-switch">
                Already have an account? <Link href="/auth/signin">Sign in</Link>
              </p>

              <p className="auth-legal">
                By signing up you agree to our <Link href="/terms">Terms</Link> and <Link href="/privacy">Privacy Policy</Link>.
              </p>
            </>
          )}
        </div>
      </div>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --navy: #0a1628; --navy-mid: #112240; --gold: #c9a84c; --gold-light: #e8c76a;
          --white: #ffffff; --off-white: #f4f6f9; --text: #2d3748; --text-muted: #718096;
          --border: #e2e8f0; --error: #e53e3e;
        }
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
        .auth-page { display: flex; min-height: 100vh; }
        .auth-left {
          flex: 1; background: var(--navy); display: flex; align-items: center; justify-content: center;
          padding: 48px; position: relative; overflow: hidden;
        }
        .auth-left::before {
          content: ''; position: absolute; top: -200px; right: -200px;
          width: 600px; height: 600px; border-radius: 50%;
          background: radial-gradient(circle, rgba(201,168,76,0.1) 0%, transparent 70%);
        }
        .auth-left-inner { position: relative; z-index: 1; max-width: 400px; }
        .logo { display: flex; align-items: center; gap: 10px; text-decoration: none; margin-bottom: 48px; }
        .logo-mark { width: 36px; height: 36px; background: var(--gold); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-family: Georgia, serif; font-weight: bold; font-size: 14px; color: var(--navy); }
        .logo-text { font-family: Georgia, serif; font-size: 16px; color: var(--white); }
        .logo-text em { color: var(--gold); font-style: normal; }
        .auth-pitch h2 { font-family: Georgia, serif; font-size: 28px; color: var(--white); font-weight: normal; line-height: 1.3; margin-bottom: 32px; }
        .auth-quotes { display: flex; flex-direction: column; gap: 16px; }
        .quote-card { background: rgba(255,255,255,0.05); border: 1px solid rgba(201,168,76,0.15); border-radius: 12px; padding: 20px; }
        .quote-card p { font-size: 14px; color: rgba(255,255,255,0.8); line-height: 1.6; margin-bottom: 8px; font-style: italic; }
        .quote-card span { font-size: 12px; color: var(--gold); font-weight: 500; }

        .auth-right { flex: 1; display: flex; align-items: center; justify-content: center; padding: 48px; background: var(--white); }
        .auth-form-container { width: 100%; max-width: 400px; }
        .form-header { margin-bottom: 32px; }
        .form-header h1 { font-family: Georgia, serif; font-size: 28px; color: var(--navy); margin-bottom: 8px; }
        .form-header p { font-size: 15px; color: var(--text-muted); }
        .auth-form { display: flex; flex-direction: column; gap: 20px; margin-bottom: 24px; }
        .field { display: flex; flex-direction: column; gap: 6px; }
        .field label { font-size: 13px; font-weight: 600; color: var(--text); letter-spacing: 0.2px; }
        .field input {
          padding: 12px 14px; border: 1.5px solid var(--border); border-radius: 8px;
          font-size: 15px; color: var(--text); outline: none; transition: border-color 0.2s;
          font-family: inherit;
        }
        .field input:focus { border-color: var(--navy); }
        .error-msg { background: #fff5f5; border: 1px solid #fed7d7; color: var(--error); padding: 12px 14px; border-radius: 8px; font-size: 14px; }
        .auth-switch { text-align: center; font-size: 14px; color: var(--text-muted); margin-bottom: 16px; }
        .auth-switch a { color: var(--navy); font-weight: 600; text-decoration: none; }
        .auth-switch a:hover { text-decoration: underline; }
        .auth-legal { text-align: center; font-size: 12px; color: var(--text-muted); line-height: 1.5; }
        .auth-legal a { color: var(--text-muted); text-decoration: underline; }

        .btn-primary {
          background: var(--gold); color: var(--navy); border: none;
          padding: 10px 20px; border-radius: 8px; font-family: inherit;
          font-size: 14px; font-weight: 600; cursor: pointer; text-decoration: none;
          display: inline-block; transition: all 0.2s; text-align: center;
        }
        .btn-primary:hover:not(:disabled) { background: var(--gold-light); transform: translateY(-1px); }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-full { display: block; width: 100%; }
        .btn-lg { padding: 14px; font-size: 16px; }

        .success-state { text-align: center; }
        .success-icon { width: 64px; height: 64px; border-radius: 50%; background: #c6f6d5; color: #22543d; font-size: 28px; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; }
        .success-state h2 { font-family: Georgia, serif; font-size: 24px; color: var(--navy); margin-bottom: 12px; }
        .success-state p { font-size: 15px; color: var(--text-muted); line-height: 1.6; margin-bottom: 32px; }

        @media (max-width: 768px) {
          .auth-left { display: none; }
          .auth-right { padding: 32px 24px; }
        }
      `}</style>
    </div>
  )
}
