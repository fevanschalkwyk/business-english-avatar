'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) {
      setError('Invalid email or password. Please try again.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
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
            <h2>Practice Business English.<br />Sound like a native speaker.</h2>
            <div className="feature-list">
              {[
                '🎯 Real workplace scenarios',
                '🤖 AI conversation partner',
                '🎙️ Voice-first practice',
                '📊 Progress tracking',
              ].map(f => (
                <div key={f} className="feature-item">{f}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-container">
          <div className="form-header">
            <h1>Welcome back</h1>
            <p>Sign in to continue your practice.</p>
          </div>

          <form onSubmit={handleSignIn} className="auth-form">
            <div className="field">
              <label htmlFor="email">Email</label>
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
                placeholder="Your password"
                required
              />
            </div>

            {error && <div className="error-msg">{error}</div>}

            <button type="submit" className="btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in →'}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account? <Link href="/auth/signup">Sign up free</Link>
          </p>
        </div>
      </div>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --navy: #0a1628; --navy-mid: #112240; --gold: #c9a84c; --gold-light: #e8c76a;
          --white: #ffffff; --text: #2d3748; --text-muted: #718096; --border: #e2e8f0; --error: #e53e3e;
        }
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
        .auth-page { display: flex; min-height: 100vh; }
        .auth-left { flex: 1; background: var(--navy); display: flex; align-items: center; justify-content: center; padding: 48px; position: relative; overflow: hidden; }
        .auth-left::before { content: ''; position: absolute; bottom: -200px; left: -100px; width: 500px; height: 500px; border-radius: 50%; background: radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%); }
        .auth-left-inner { position: relative; z-index: 1; max-width: 360px; }
        .logo { display: flex; align-items: center; gap: 10px; text-decoration: none; margin-bottom: 48px; }
        .logo-mark { width: 36px; height: 36px; background: var(--gold); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-family: Georgia, serif; font-weight: bold; font-size: 14px; color: var(--navy); }
        .logo-text { font-family: Georgia, serif; font-size: 16px; color: var(--white); }
        .logo-text em { color: var(--gold); font-style: normal; }
        .auth-pitch h2 { font-family: Georgia, serif; font-size: 28px; color: var(--white); font-weight: normal; line-height: 1.3; margin-bottom: 32px; }
        .feature-list { display: flex; flex-direction: column; gap: 12px; }
        .feature-item { font-size: 15px; color: rgba(255,255,255,0.75); padding: 12px 16px; background: rgba(255,255,255,0.04); border: 1px solid rgba(201,168,76,0.12); border-radius: 10px; }
        .auth-right { flex: 1; display: flex; align-items: center; justify-content: center; padding: 48px; background: var(--white); }
        .auth-form-container { width: 100%; max-width: 380px; }
        .form-header { margin-bottom: 32px; }
        .form-header h1 { font-family: Georgia, serif; font-size: 28px; color: var(--navy); margin-bottom: 8px; }
        .form-header p { font-size: 15px; color: var(--text-muted); }
        .auth-form { display: flex; flex-direction: column; gap: 20px; margin-bottom: 24px; }
        .field { display: flex; flex-direction: column; gap: 6px; }
        .field label { font-size: 13px; font-weight: 600; color: var(--text); }
        .field input { padding: 12px 14px; border: 1.5px solid var(--border); border-radius: 8px; font-size: 15px; color: var(--text); outline: none; transition: border-color 0.2s; font-family: inherit; }
        .field input:focus { border-color: var(--navy); }
        .error-msg { background: #fff5f5; border: 1px solid #fed7d7; color: var(--error); padding: 12px 14px; border-radius: 8px; font-size: 14px; }
        .auth-switch { text-align: center; font-size: 14px; color: var(--text-muted); }
        .auth-switch a { color: var(--navy); font-weight: 600; text-decoration: none; }
        .auth-switch a:hover { text-decoration: underline; }
        .btn-primary { background: var(--gold); color: var(--navy); border: none; padding: 10px 20px; border-radius: 8px; font-family: inherit; font-size: 14px; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-block; transition: all 0.2s; text-align: center; }
        .btn-primary:hover:not(:disabled) { background: var(--gold-light); transform: translateY(-1px); }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-full { display: block; width: 100%; }
        .btn-lg { padding: 14px; font-size: 16px; }
        @media (max-width: 768px) { .auth-left { display: none; } .auth-right { padding: 32px 24px; } }
      `}</style>
    </div>
  )
}
