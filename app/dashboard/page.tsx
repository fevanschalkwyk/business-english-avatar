import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import SignOutButton from '@/components/SignOutButton'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/signin')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: sessions } = await supabase
    .from('sessions')
    .select('*, roleplays(title)')
    .eq('user_id', user.id)
    .eq('completed', true)
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: roleplays } = await supabase
    .from('roleplays')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })

  // Session count this month
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { data: monthlySessions } = await supabase
  .from('sessions')
  .select('duration_seconds')
  .eq('user_id', user.id)
  .eq('completed', true)
  .gte('created_at', startOfMonth.toISOString())

const monthlyMinutesUsed = Math.round(
  (monthlySessions?.reduce((acc, s: any) => acc + (s.duration_seconds || 0), 0) ?? 0) / 60
)

const displayName = profile?.full_name || user.email?.split('@')[0] || 'there'
const sessionCount = sessions?.length ?? 0
const totalMinutes = sessions?.reduce((acc: number, s: any) => acc + Math.round((s.duration_seconds || 0) / 60), 0) ?? 0
const isPro = profile?.subscription_tier === 'pro'
const minutesRemaining = Math.max(0, 160 - monthlyMinutesUsed)

  const CEFR_COLORS: Record<string, string> = {
    A1: '#fc8181', A2: '#f6ad55', B1: '#68d391',
    B2: '#4299e1', C1: '#9f7aea', C2: '#f6e05e'
  }

  return (
    <div className="dashboard">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-top">
          <Link href="/" className="logo">
            <span className="logo-mark">BE</span>
            <span className="logo-text">BusinessEnglish<em>AI</em></span>
          </Link>
          <nav className="sidebar-nav">
            <Link href="/dashboard" className="nav-item active">
              <span className="nav-icon">🏠</span> Dashboard
            </Link>
            <Link href="/dashboard/roleplays" className="nav-item">
              <span className="nav-icon">🎭</span> Roleplays
            </Link>
            <Link href="/dashboard/progress" className="nav-item">
              <span className="nav-icon">📊</span> My Progress
            </Link>
            <Link href="/dashboard/settings" className="nav-item">
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

      {/* MAIN */}
      <main className="main">
        <div className="page-header">
          <div>
            <h1>Good day, {displayName.split(' ')[0]} 👋</h1>
            <p className="page-sub">Ready to practise your Business English today?</p>
          </div>
          {isPro && (
          <div className="sessions-remaining">
            <span className="sessions-count">{minutesRemaining}</span>
            <span className="sessions-label">minutes remaining this month</span>
          </div>
        )}
        </div>

        {/* STATS */}
        <div className="stats-row">
          {[
            { label: 'Sessions completed', value: sessionCount, icon: '🎯' },
            { label: 'Minutes practised', value: totalMinutes, icon: '⏱️' },
            { label: 'Roleplays available', value: roleplays?.length ?? 0, icon: '🎭' },
            { label: 'Day streak', value: sessionCount > 0 ? 1 : 0, icon: '🔥' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ROLEPLAYS */}
        <section className="section">
          <div className="section-head">
            <h2>Available roleplays</h2>
            <Link href="/dashboard/roleplays" className="see-all">See all →</Link>
          </div>
          <div className="roleplays-grid">
            {roleplays?.slice(0, 3).map((rp: any) => (
              <div key={rp.id} className="roleplay-card">
                <div className="roleplay-header">
                  <span
                    className="cefr-badge"
                    style={{ background: CEFR_COLORS[rp.cefr_level] || '#68d391' }}
                  >
                    {rp.cefr_level}
                  </span>
                  <span className="category-tag">{rp.category}</span>
                </div>
                <h3>{rp.title}</h3>
                <p>{rp.situation.substring(0, 100)}...</p>
                <div className="roleplay-footer">
                  <span className="function-tag">{rp.function}</span>
                  {isPro ? (
                    <Link href={`/roleplay/${rp.id}`} className="btn-practice">
                      Start AI session →
                    </Link>
                  ) : (
                    <Link href={`/roleplay/${rp.id}`} className="btn-practice">
                      Practice →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* RECENT SESSIONS */}
        <section className="section">
          <div className="section-head">
            <h2>Recent sessions</h2>
          </div>
          {sessionCount === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎙️</div>
              <h3>No sessions yet</h3>
              <p>Start your first roleplay to see your history here.</p>
              {roleplays && roleplays.length > 0 && (
                <Link href={`/roleplay/${roleplays[0].id}`} className="btn-primary">
                  Start first roleplay →
                </Link>
              )}
            </div>
          ) : (
            <div className="sessions-table">
              <div className="table-head">
                <span>Roleplay</span>
                <span>Date</span>
                <span>Duration</span>
                <span>Score</span>
              </div>
              {sessions?.map((s: any) => (
                <div key={s.id} className="table-row">
                  <span>{s.roleplays?.title || 'Roleplay session'}</span>
                  <span>{new Date(s.created_at).toLocaleDateString()}</span>
                  <span>{s.duration_seconds ? `${Math.round(s.duration_seconds / 60)} min` : '—'}</span>
                  <span className="score">{s.score ? `${s.score}%` : '—'}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* UPGRADE BANNER (free users only) */}
        {!isPro && (
          <div className="upgrade-banner">
            <div className="upgrade-content">
              <div className="upgrade-badge">⭐ Pro</div>
              <div>
                <h3>Unlock AI-powered conversations</h3>
                <p>Upgrade to Pro for live AI conversation, natural voice, and detailed CEFR feedback on every session.</p>
              </div>
            </div>
            <Link href="/upgrade" className="btn-gold">Upgrade for $12/mo →</Link>
          </div>
        )}
      </main>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --navy: #0a1628; --navy-mid: #112240; --gold: #c9a84c; --gold-light: #e8c76a;
          --white: #ffffff; --off-white: #f4f6f9; --text: #2d3748; --text-muted: #718096; --border: #e2e8f0;
        }
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: var(--off-white); }
        .dashboard { display: flex; min-height: 100vh; }
        .sidebar { width: 240px; background: var(--navy); display: flex; flex-direction: column; padding: 24px 16px; position: fixed; top: 0; left: 0; bottom: 0; z-index: 10; }
        .sidebar-top { flex: 1; }
        .logo { display: flex; align-items: center; gap: 10px; text-decoration: none; margin-bottom: 36px; padding: 0 8px; }
        .logo-mark { width: 32px; height: 32px; background: var(--gold); border-radius: 7px; display: flex; align-items: center; justify-content: center; font-family: Georgia, serif; font-weight: bold; font-size: 12px; color: var(--navy); flex-shrink: 0; }
        .logo-text { font-family: Georgia, serif; font-size: 14px; color: var(--white); }
        .logo-text em { color: var(--gold); font-style: normal; }
        .sidebar-nav { display: flex; flex-direction: column; gap: 2px; }
        .nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; color: rgba(255,255,255,0.6); text-decoration: none; font-size: 14px; transition: all 0.2s; }
        .nav-item:hover { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.9); }
        .nav-item.active { background: rgba(201,168,76,0.15); color: var(--gold); }
        .nav-icon { font-size: 16px; }
        .user-pill { display: flex; align-items: center; gap: 10px; padding: 12px; border-radius: 10px; background: rgba(255,255,255,0.05); margin-bottom: 8px; }
        .user-avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--gold); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; color: var(--navy); flex-shrink: 0; }
        .user-info { display: flex; flex-direction: column; min-width: 0; }
        .user-name { font-size: 13px; color: var(--white); font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .user-plan { font-size: 11px; color: rgba(255,255,255,0.4); }
        .main { flex: 1; margin-left: 240px; padding: 32px; max-width: calc(100vw - 240px); }
        .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; }
        .page-header h1 { font-family: Georgia, serif; font-size: 26px; color: var(--navy); margin-bottom: 4px; }
        .page-sub { font-size: 15px; color: var(--text-muted); }
        .sessions-remaining { text-align: center; background: var(--white); border: 1px solid var(--border); border-radius: 12px; padding: 16px 24px; }
        .sessions-count { display: block; font-family: Georgia, serif; font-size: 32px; color: var(--navy); }
        .sessions-label { font-size: 12px; color: var(--text-muted); }
        .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
        .stat-card { background: var(--white); border: 1px solid var(--border); border-radius: 12px; padding: 20px; text-align: center; }
        .stat-icon { font-size: 24px; margin-bottom: 8px; }
        .stat-value { font-family: Georgia, serif; font-size: 28px; color: var(--navy); }
        .stat-label { font-size: 12px; color: var(--text-muted); margin-top: 4px; }
        .section { margin-bottom: 32px; }
        .section-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
        .section-head h2 { font-family: Georgia, serif; font-size: 20px; color: var(--navy); }
        .see-all { font-size: 14px; color: var(--gold); text-decoration: none; font-weight: 500; }
        .roleplays-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; }
        .roleplay-card { background: var(--white); border: 1px solid var(--border); border-radius: 14px; padding: 20px; display: flex; flex-direction: column; gap: 10px; transition: all 0.2s; }
        .roleplay-card:hover { border-color: var(--gold); box-shadow: 0 4px 16px rgba(201,168,76,0.1); }
        .roleplay-header { display: flex; align-items: center; gap: 8px; }
        .cefr-badge { padding: 3px 10px; border-radius: 100px; font-size: 11px; font-weight: 700; color: var(--navy); }
        .category-tag { font-size: 12px; color: var(--text-muted); }
        .roleplay-card h3 { font-family: Georgia, serif; font-size: 16px; color: var(--navy); }
        .roleplay-card p { font-size: 13px; color: var(--text-muted); line-height: 1.5; flex: 1; }
        .roleplay-footer { display: flex; align-items: center; justify-content: space-between; }
        .function-tag { font-size: 11px; color: var(--text-muted); background: var(--off-white); padding: 3px 8px; border-radius: 6px; }
        .btn-practice { background: var(--gold); color: var(--navy); border: none; padding: 8px 14px; border-radius: 8px; font-family: inherit; font-size: 13px; font-weight: 600; cursor: pointer; text-decoration: none; transition: all 0.2s; }
        .btn-practice:hover { background: var(--gold-light); }
        .sessions-table { background: var(--white); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
        .table-head { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; padding: 12px 20px; background: var(--off-white); border-bottom: 1px solid var(--border); font-size: 12px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
        .table-row { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; padding: 14px 20px; border-bottom: 1px solid var(--border); font-size: 14px; color: var(--text); }
        .table-row:last-child { border-bottom: none; }
        .score { font-weight: 600; color: var(--navy); }
        .empty-state { background: var(--white); border: 1px dashed var(--border); border-radius: 14px; padding: 48px; text-align: center; }
        .empty-icon { font-size: 40px; margin-bottom: 16px; }
        .empty-state h3 { font-family: Georgia, serif; font-size: 20px; color: var(--navy); margin-bottom: 8px; }
        .empty-state p { font-size: 14px; color: var(--text-muted); margin-bottom: 24px; }
        .upgrade-banner { background: var(--navy); border-radius: 16px; padding: 28px 32px; display: flex; align-items: center; justify-content: space-between; gap: 24px; }
        .upgrade-content { display: flex; align-items: flex-start; gap: 16px; }
        .upgrade-badge { background: var(--gold); color: var(--navy); font-size: 11px; font-weight: 700; letter-spacing: 0.5px; padding: 4px 10px; border-radius: 100px; white-space: nowrap; }
        .upgrade-content h3 { font-family: Georgia, serif; font-size: 18px; color: var(--white); margin-bottom: 4px; }
        .upgrade-content p { font-size: 14px; color: rgba(255,255,255,0.6); line-height: 1.5; }
        .btn-primary { background: var(--gold); color: var(--navy); border: none; padding: 10px 20px; border-radius: 8px; font-family: inherit; font-size: 14px; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-block; transition: all 0.2s; }
        .btn-primary:hover { background: var(--gold-light); }
        .btn-gold { background: var(--gold); color: var(--navy); border: none; padding: 12px 24px; border-radius: 10px; font-family: inherit; font-size: 15px; font-weight: 700; cursor: pointer; text-decoration: none; display: inline-block; white-space: nowrap; transition: all 0.2s; }
        .btn-gold:hover { background: var(--gold-light); }
        @media (max-width: 900px) {
          .sidebar { display: none; }
          .main { margin-left: 0; max-width: 100vw; padding: 24px 16px; }
          .stats-row { grid-template-columns: repeat(2, 1fr); }
          .upgrade-banner { flex-direction: column; align-items: flex-start; }
        }
      `}</style>
    </div>
  )
}
