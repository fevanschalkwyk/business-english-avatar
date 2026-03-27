// app/dashboard/settings/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import SignOutButton from '@/components/SignOutButton'
import SubscriptionManager from '@/components/settings/SubscriptionManager'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/signin')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const isPro = profile?.subscription_status === 'pro'
  const displayName = profile?.full_name || user.email?.split('@')[0] || 'there'

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="sidebar-top">
          <Link href="/" className="logo">
            <span className="logo-mark">BE</span>
            <span className="logo-text">BusinessEnglish<em>AI</em></span>
          </Link>
          <nav className="sidebar-nav">
            <Link href="/dashboard" className="nav-item">
              <span className="nav-icon">🏠</span> Dashboard
            </Link>
            <Link href="/dashboard/roleplays" className="nav-item">
              <span className="nav-icon">🎭</span> Roleplays
            </Link>
            <Link href="/dashboard/progress" className="nav-item">
              <span className="nav-icon">📊</span> My Progress
            </Link>
            <Link href="/dashboard/settings" className="nav-item active">
              <span className="nav-icon">⚙️</span> Settings
            </Link>
          </nav>
        </div>
        <div className="sidebar-bottom">
          <div className="user-pill">
            <div className="user-avatar">{displayName[0].toUpperCase()}</div>
            <div className="user-info">
              <span className="user-name">{displayName}</span>
              <span className="user-plan">{isPro ? 'Pro plan' : 'Free plan'}</span>
            </div>
          </div>
          <SignOutButton />
        </div>
      </aside>

      <main className="main">
        <div className="page-header">
          <h1>Settings</h1>
        </div>

        <div className="settings-sections">

          {/* Account */}
          <div className="settings-card">
            <h2>Account</h2>
            <div className="settings-row">
              <span className="settings-label">Email</span>
              <span className="settings-value">{user.email}</span>
            </div>
            <div className="settings-row">
              <span className="settings-label">Name</span>
              <span className="settings-value">{profile?.full_name || '—'}</span>
            </div>
            <div className="settings-row">
              <span className="settings-label">Plan</span>
              <span className="settings-value">{isPro ? '⭐ Pro' : 'Free'}</span>
            </div>
          </div>

          {/* Subscription */}
          {isPro ? (
            <SubscriptionManager
              subscriptionStatus={profile?.subscription_status}
              periodEnd={profile?.subscription_current_period_end}
              minutesRemaining={profile?.minutes_remaining ?? 0}
            />
          ) : (
            <div className="settings-card">
              <h2>Subscription</h2>
              <p className="settings-desc">You're on the free plan. Upgrade to Pro for full access to all roleplays and live AI conversation.</p>
              <Link href="/pricing" className="btn-gold">Upgrade to Pro — $12/month →</Link>
            </div>
          )}

        </div>
      </main>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --navy: #0a1628; --gold: #c9a84c; --gold-light: #e8c76a;
          --white: #ffffff; --off-white: #f4f6f9; --text: #2d3748;
          --text-muted: #718096; --border: #e2e8f0;
        }
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: var(--off-white); }
        .dashboard { display: flex; min-height: 100vh; }
        .sidebar { width: 240px; background: var(--navy); display: flex; flex-direction: column; padding: 24px 16px; position: fixed; top: 0; left: 0; bottom: 0; z-index: 10; }
        .sidebar-top { flex: 1; }
        .logo { display: flex; align-items: center; gap: 10px; text-decoration: none; margin-bottom: 36px; padding: 0 8px; }
        .logo-mark { width: 32px; height: 32px; background: var(--gold); border-radius: 7px; display: flex; align-items: center; justify-content: center; font-family: Georgia, serif; font-weight: bold; font-size: 12px; color: var(--navy); }
        .logo-text { font-family: Georgia, serif; font-size: 14px; color: white; }
        .logo-text em { color: var(--gold); font-style: normal; }
        .sidebar-nav { display: flex; flex-direction: column; gap: 2px; }
        .nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; color: rgba(255,255,255,0.6); text-decoration: none; font-size: 14px; transition: all 0.2s; }
        .nav-item:hover { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.9); }
        .nav-item.active { background: rgba(201,168,76,0.15); color: var(--gold); }
        .nav-icon { font-size: 16px; }
        .user-pill { display: flex; align-items: center; gap: 10px; padding: 12px; border-radius: 10px; background: rgba(255,255,255,0.05); margin-bottom: 8px; }
        .user-avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--gold); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; color: var(--navy); flex-shrink: 0; }
        .user-info { display: flex; flex-direction: column; min-width: 0; }
        .user-name { font-size: 13px; color: white; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .user-plan { font-size: 11px; color: rgba(255,255,255,0.4); }
        .main { flex: 1; margin-left: 240px; padding: 32px; max-width: calc(100vw - 240px); }
        .page-header { margin-bottom: 28px; }
        .page-header h1 { font-family: Georgia, serif; font-size: 26px; color: var(--navy); }
        .settings-sections { display: flex; flex-direction: column; gap: 20px; max-width: 600px; }
        .settings-card { background: var(--white); border: 1px solid var(--border); border-radius: 16px; padding: 24px; display: flex; flex-direction: column; gap: 16px; }
        .settings-card h2 { font-family: Georgia, serif; font-size: 18px; color: var(--navy); }
        .settings-row { display: flex; align-items: center; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border); }
        .settings-row:last-of-type { border-bottom: none; }
        .settings-label { font-size: 14px; color: var(--text-muted); }
        .settings-value { font-size: 14px; color: var(--text); font-weight: 500; }
        .settings-desc { font-size: 14px; color: var(--text-muted); line-height: 1.6; }
        .btn-gold { background: var(--gold); color: var(--navy); border: none; padding: 12px 24px; border-radius: 10px; font-family: inherit; font-size: 14px; font-weight: 700; cursor: pointer; text-decoration: none; display: inline-block; transition: all 0.2s; }
        .btn-gold:hover { background: var(--gold-light); }
        @media (max-width: 900px) {
          .sidebar { display: none; }
          .main { margin-left: 0; max-width: 100vw; padding: 24px 16px; }
        }
      `}</style>
    </div>
  )
}