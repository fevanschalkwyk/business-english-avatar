import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import SignOutButton from '@/components/SignOutButton'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/signin')

  // Fetch user profile and recent sessions
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: sessions } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const displayName = profile?.full_name || user.email?.split('@')[0] || 'there'
  const sessionCount = sessions?.length ?? 0

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
            <Link href="/dashboard/scenarios" className="nav-item">
              <span className="nav-icon">🎯</span> Scenarios
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
            <div className="user-avatar">
              {displayName[0].toUpperCase()}
            </div>
            <div className="user-info">
              <span className="user-name">{displayName}</span>
              <span className="user-plan">Free plan</span>
            </div>
          </div>
          <SignOutButton />
        </div>
      </aside>

      {/* MAIN */}
      <main className="main">
        {/* HEADER */}
        <div className="page-header">
          <div>
            <h1>Good day, {displayName.split(' ')[0]} 👋</h1>
            <p className="page-sub">Ready to practice your Business English today?</p>
          </div>
          <Link href="/dashboard/scenarios" className="btn-primary">
            Start a session →
          </Link>
        </div>

        {/* STATS */}
        <div className="stats-row">
          {[
            { label: 'Sessions completed', value: sessionCount, icon: '🎯' },
            { label: 'Minutes practiced', value: sessionCount * 8, icon: '⏱️' },
            { label: 'Scenarios unlocked', value: 1, icon: '🔓' },
            { label: 'Day streak', value: sessionCount > 0 ? 1 : 0, icon: '🔥' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* AVAILABLE SCENARIOS */}
        <section className="section">
          <div className="section-head">
            <h2>Available scenarios</h2>
            <Link href="/dashboard/scenarios" className="see-all">See all →</Link>
          </div>
          <div className="scenarios-row">
            <div className="scenario-card featured">
              <div className="scenario-tag">Free · Available now</div>
              <h3>Meetings & Presentations</h3>
              <p>Practice leading meetings, presenting data, and handling Q&A sessions with confidence.</p>
              <div className="scenario-meta">
                <span>📚 5 exercises</span>
                <span>⏱️ ~15 min</span>
                <span>🟢 Beginner–Advanced</span>
              </div>
              <Link href="/scenarios/meetings" className="btn-primary">Practice now →</Link>
            </div>

            <div className="scenario-card locked">
              <div className="scenario-tag pro-tag">Pro · Upgrade to unlock</div>
              <h3>Job Interviews</h3>
              <p>Simulate interviews with an AI hiring manager. Get confident fast.</p>
              <div className="scenario-meta">
                <span>📚 8 exercises</span>
                <span>⏱️ ~20 min</span>
                <span>🟡 Intermediate+</span>
              </div>
              <Link href="/upgrade" className="btn-upgrade">Upgrade to Pro →</Link>
            </div>

            <div className="scenario-card locked">
              <div className="scenario-tag pro-tag">Pro · Upgrade to unlock</div>
              <h3>Client Negotiations</h3>
              <p>Close deals and manage objections with an AI client avatar.</p>
              <div className="scenario-meta">
                <span>📚 6 exercises</span>
                <span>⏱️ ~25 min</span>
                <span>🔴 Advanced</span>
              </div>
              <Link href="/upgrade" className="btn-upgrade">Upgrade to Pro →</Link>
            </div>
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
              <p>Start your first practice session to see your history here.</p>
              <Link href="/scenarios/meetings" className="btn-primary">Start practising →</Link>
            </div>
          ) : (
            <div className="sessions-table">
              <div className="table-head">
                <span>Scenario</span>
                <span>Date</span>
                <span>Duration</span>
                <span>Score</span>
              </div>
              {sessions?.map(s => (
                <div key={s.id} className="table-row">
                  <span>{s.scenario_id || 'Meetings & Presentations'}</span>
                  <span>{new Date(s.created_at).toLocaleDateString()}</span>
                  <span>{s.duration_seconds ? `${Math.round(s.duration_seconds / 60)} min` : '—'}</span>
                  <span className="score">{s.score ? `${s.score}%` : '—'}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* UPGRADE BANNER */}
        <div className="upgrade-banner">
          <div className="upgrade-content">
            <div className="upgrade-badge">⭐ Pro</div>
            <div>
              <h3>Unlock AI-powered conversations</h3>
              <p>Upgrade to Pro for unlimited scenarios, ElevenLabs voice, and a 3D avatar that responds to anything you say.</p>
            </div>
          </div>
          <Link href="/upgrade" className="btn-gold">Upgrade for $12/mo →</Link>
        </div>
      </main>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --navy: #0a1628; --navy-mid: #112240; --navy-light: #1e3a5f;
          --gold: #c9a84c; --gold-light: #e8c76a;
          --white: #ffffff; --off-white: #f4f6f9; --text: #2d3748; --text-muted: #718096;
          --border: #e2e8f0;
        }
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: var(--off-white); }

        .dashboard { display: flex; min-height: 100vh; }

        /* SIDEBAR */
        .sidebar {
          width: 240px; background: var(--navy); display: flex; flex-direction: column;
          padding: 24px 16px; position: fixed; top: 0; left: 0; bottom: 0; z-index: 10;
        }
        .sidebar-top { flex: 1; }
        .sidebar-bottom { }
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

        /* MAIN */
        .main { flex: 1; margin-left: 240px; padding: 32px; max-width: calc(100vw - 240px); }
        .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; }
        .page-header h1 { font-family: Georgia, serif; font-size: 26px; color: var(--navy); margin-bottom: 4px; }
        .page-sub { font-size: 15px; color: var(--text-muted); }

        /* STATS */
        .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
        .stat-card { background: var(--white); border: 1px solid var(--border); border-radius: 12px; padding: 20px; text-align: center; }
        .stat-icon { font-size: 24px; margin-bottom: 8px; }
        .stat-value { font-family: Georgia, serif; font-size: 28px; color: var(--navy); font-weight: normal; }
        .stat-label { font-size: 12px; color: var(--text-muted); margin-top: 4px; }

        /* SECTIONS */
        .section { margin-bottom: 32px; }
        .section-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
        .section-head h2 { font-family: Georgia, serif; font-size: 20px; color: var(--navy); }
        .see-all { font-size: 14px; color: var(--gold); text-decoration: none; font-weight: 500; }

        /* SCENARIO CARDS */
        .scenarios-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; }
        .scenario-card { background: var(--white); border: 1px solid var(--border); border-radius: 14px; padding: 24px; display: flex; flex-direction: column; gap: 12px; }
        .scenario-card.featured { border-color: var(--gold); box-shadow: 0 0 0 1px rgba(201,168,76,0.2); }
        .scenario-card.locked { opacity: 0.7; }
        .scenario-tag { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; color: var(--text-muted); }
        .scenario-card.featured .scenario-tag { color: var(--gold); }
        .pro-tag { color: #805ad5 !important; }
        .scenario-card h3 { font-family: Georgia, serif; font-size: 18px; color: var(--navy); }
        .scenario-card p { font-size: 14px; color: var(--text-muted); line-height: 1.5; flex: 1; }
        .scenario-meta { display: flex; gap: 12px; flex-wrap: wrap; }
        .scenario-meta span { font-size: 12px; color: var(--text-muted); }

        /* BUTTONS */
        .btn-primary { background: var(--gold); color: var(--navy); border: none; padding: 10px 20px; border-radius: 8px; font-family: inherit; font-size: 14px; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-block; transition: all 0.2s; }
        .btn-primary:hover { background: var(--gold-light); transform: translateY(-1px); }
        .btn-upgrade { background: rgba(128,90,213,0.1); color: #805ad5; border: 1px solid rgba(128,90,213,0.3); padding: 10px 20px; border-radius: 8px; font-family: inherit; font-size: 14px; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-block; transition: all 0.2s; }
        .btn-upgrade:hover { background: rgba(128,90,213,0.15); }
        .btn-gold { background: var(--gold); color: var(--navy); border: none; padding: 12px 24px; border-radius: 10px; font-family: inherit; font-size: 15px; font-weight: 700; cursor: pointer; text-decoration: none; display: inline-block; white-space: nowrap; transition: all 0.2s; }
        .btn-gold:hover { background: var(--gold-light); }

        /* SESSIONS TABLE */
        .sessions-table { background: var(--white); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
        .table-head { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; padding: 12px 20px; background: var(--off-white); border-bottom: 1px solid var(--border); font-size: 12px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
        .table-row { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; padding: 14px 20px; border-bottom: 1px solid var(--border); font-size: 14px; color: var(--text); }
        .table-row:last-child { border-bottom: none; }
        .score { font-weight: 600; color: var(--navy); }

        /* EMPTY STATE */
        .empty-state { background: var(--white); border: 1px dashed var(--border); border-radius: 14px; padding: 48px; text-align: center; }
        .empty-icon { font-size: 40px; margin-bottom: 16px; }
        .empty-state h3 { font-family: Georgia, serif; font-size: 20px; color: var(--navy); margin-bottom: 8px; }
        .empty-state p { font-size: 14px; color: var(--text-muted); margin-bottom: 24px; }

        /* UPGRADE BANNER */
        .upgrade-banner { background: var(--navy); border-radius: 16px; padding: 28px 32px; display: flex; align-items: center; justify-content: space-between; gap: 24px; }
        .upgrade-content { display: flex; align-items: flex-start; gap: 16px; }
        .upgrade-badge { background: var(--gold); color: var(--navy); font-size: 11px; font-weight: 700; letter-spacing: 0.5px; padding: 4px 10px; border-radius: 100px; white-space: nowrap; }
        .upgrade-content h3 { font-family: Georgia, serif; font-size: 18px; color: var(--white); margin-bottom: 4px; }
        .upgrade-content p { font-size: 14px; color: rgba(255,255,255,0.6); line-height: 1.5; }

        @media (max-width: 900px) {
          .sidebar { display: none; }
          .main { margin-left: 0; max-width: 100vw; padding: 24px 16px; }
          .stats-row { grid-template-columns: repeat(2, 1fr); }
          .upgrade-banner { flex-direction: column; align-items: flex-start; }
        }
        @media (max-width: 600px) {
          .stats-row { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
    </div>
  )
}
