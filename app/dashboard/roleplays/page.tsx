import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import SignOutButton from '@/components/SignOutButton'
import UnlockButton from '@/components/UnlockButton'
import SessionUnlockButton from '@/components/roleplays/SessionUnlockButton'



export default async function RoleplaysPage({
  searchParams,
}: {
  searchParams: { level?: string; category?: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/signin')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch all published roleplays
  let query = supabase
    .from('roleplays')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })

  if (searchParams.level) query = query.eq('cefr_level', searchParams.level)
  if (searchParams.category) query = query.eq('category', searchParams.category)

  const { data: roleplays } = await query

  // Fetch user's unlocks
  const { data: unlocks } = await supabase
    .from('unlocks')
    .select('roleplay_id')
    .eq('user_id', user.id)

  const unlockedIds = new Set(unlocks?.map(u => u.roleplay_id) || [])

  // Check weekly unlocks used
  const startOfWeek = new Date()
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
  startOfWeek.setHours(0, 0, 0, 0)

  const { count: weeklyUnlocksUsed } = await supabase
    .from('unlocks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('unlocked_at', startOfWeek.toISOString())

  const isPro = profile?.subscription_tier === 'pro'
  const weeklyUnlocksRemaining = Math.max(0, 3 - (weeklyUnlocksUsed || 0))
  const displayName = profile?.full_name || user.email?.split('@')[0] || 'there'

  const CEFR_COLORS: Record<string, string> = {
    A1: '#fc8181', A2: '#f6ad55', B1: '#68d391',
    B2: '#4299e1', C1: '#9f7aea', C2: '#f6e05e'
  }

  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
  const categories = ['Meetings', 'Negotiations', 'Presentations', 'Small Talk', 'Job Interviews', 'Performance Reviews']

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
            <Link href="/dashboard" className="nav-item">
              <span className="nav-icon">🏠</span> Dashboard
            </Link>
            <Link href="/dashboard/roleplays" className="nav-item active">
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
            <h1>Roleplays</h1>
            <p className="page-sub">
              {isPro
                ? 'Full access to all roleplays'
                : `${weeklyUnlocksRemaining} unlock${weeklyUnlocksRemaining !== 1 ? 's' : ''} remaining this week`
              }
            </p>
          </div>
          {!isPro && (
            <div className="unlock-info">
              <div className="unlock-dots">
                {[0, 1, 2].map(i => (
                  <div key={i} className={`unlock-dot ${i < (3 - weeklyUnlocksRemaining) ? 'used' : ''}`} />
                ))}
              </div>
              <span>{weeklyUnlocksRemaining} of 3 weekly unlocks left</span>
            </div>
          )}
        </div>

        {/* FILTERS */}
        <div className="filters">
          <div className="filter-group">
            <span className="filter-label">Level:</span>
            <Link
              href="/dashboard/roleplays"
              className={`filter-chip ${!searchParams.level ? 'active' : ''}`}
            >
              All
            </Link>
            {levels.map(level => (
              <Link
                key={level}
                href={`/dashboard/roleplays?level=${level}${searchParams.category ? `&category=${searchParams.category}` : ''}`}
                className={`filter-chip ${searchParams.level === level ? 'active' : ''}`}
                style={searchParams.level === level ? { background: CEFR_COLORS[level], color: '#0a1628' } : {}}
              >
                {level}
              </Link>
            ))}
          </div>
          <div className="filter-group">
            <span className="filter-label">Category:</span>
            <Link
              href={`/dashboard/roleplays${searchParams.level ? `?level=${searchParams.level}` : ''}`}
              className={`filter-chip ${!searchParams.category ? 'active' : ''}`}
            >
              All
            </Link>
            {categories.map(cat => (
              <Link
                key={cat}
                href={`/dashboard/roleplays?category=${cat}${searchParams.level ? `&level=${searchParams.level}` : ''}`}
                className={`filter-chip ${searchParams.category === cat ? 'active' : ''}`}
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>

        {/* ROLEPLAYS GRID */}
        <div className="roleplays-grid">
          {roleplays?.map((rp: any) => {
            const isUnlocked = isPro || unlockedIds.has(rp.id)
            const canUnlock = !isPro && weeklyUnlocksRemaining > 0 && !isUnlocked

            return (
              <div key={rp.id} className={`roleplay-card ${isUnlocked ? 'unlocked' : 'locked'}`}>
                <div className="card-header">
                  <span
                    className="cefr-badge"
                    style={{ background: CEFR_COLORS[rp.cefr_level] || '#68d391' }}
                  >
                    {rp.cefr_level}
                  </span>
                  <span className="category-tag">{rp.category}</span>
                  <span className="function-tag">{rp.function}</span>
                  {isUnlocked && <span className="unlocked-badge">🔓 Unlocked</span>}
                </div>

                <h3>{rp.title}</h3>
                <p>{rp.situation.substring(0, 120)}...</p>

                <div className="card-footer">
                  {isUnlocked ? (
                    <div className="action-buttons">
                      {rp.audio_generated && (
                        <Link href={`/free/${rp.id}`} className="btn-free">
                          🎧 Listen & practise
                        </Link>
                      )}
                      {isPro ? (
                        <Link href={`/roleplay/${rp.id}`} className="btn-ai">
                          🤖 AI session →
                        </Link>
                      ) : (
                        <Link href={`/roleplay/${rp.id}`} className="btn-ai-upgrade">
                          🤖 AI session (Pro) →
                        </Link>
                      )}
                    </div>
                  ) : canUnlock ? (
                    <UnlockButton roleplayId={rp.id} />
                  ) : (
                    <div className="locked-message">
                      <SessionUnlockButton />
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {(!roleplays || roleplays.length === 0) && (
            <div className="empty-state">
              <p>No roleplays found for these filters.</p>
              <Link href="/dashboard/roleplays" className="btn-primary">Clear filters</Link>
            </div>
          )}
        </div>

        {/* UPGRADE BANNER */}
        {!isPro && (
          <div className="upgrade-banner">
            <div className="upgrade-content">
              <div className="upgrade-badge">⭐ Pro</div>
              <div>
                <h3>Unlock everything</h3>
                <p>Get full access to all roleplays plus AI conversation, voice, and CEFR feedback.</p>
              </div>
            </div>
            <Link href="/pricing" className="btn-gold">Upgrade for $12/mo →</Link>
          </div>
        )}
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
        .main { flex: 1; margin-left: 240px; padding: 32px; }
        .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
        .page-header h1 { font-family: Georgia, serif; font-size: 26px; color: var(--navy); margin-bottom: 4px; }
        .page-sub { font-size: 15px; color: var(--text-muted); }
        .unlock-info { display: flex; align-items: center; gap: 10px; background: var(--white); border: 1px solid var(--border); border-radius: 12px; padding: 12px 16px; }
        .unlock-dots { display: flex; gap: 6px; }
        .unlock-dot { width: 12px; height: 12px; border-radius: 50%; background: var(--border); }
        .unlock-dot.used { background: var(--gold); }
        .unlock-info span { font-size: 13px; color: var(--text-muted); }
        .filters { display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px; background: var(--white); border: 1px solid var(--border); border-radius: 12px; padding: 16px; }
        .filter-group { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .filter-label { font-size: 12px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; flex-shrink: 0; width: 64px; }
        .filter-chip { padding: 4px 12px; border-radius: 100px; font-size: 13px; color: var(--text-muted); background: var(--off-white); border: 1px solid var(--border); text-decoration: none; transition: all 0.2s; }
        .filter-chip:hover { border-color: var(--gold); color: var(--text); }
        .filter-chip.active { background: var(--navy); color: white; border-color: var(--navy); }
        .roleplays-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; margin-bottom: 32px; }
        .roleplay-card { background: var(--white); border: 1px solid var(--border); border-radius: 14px; padding: 20px; display: flex; flex-direction: column; gap: 10px; transition: all 0.2s; }
        .roleplay-card.unlocked { border-color: var(--gold); box-shadow: 0 0 0 1px rgba(201,168,76,0.15); }
        .roleplay-card.locked { opacity: 0.8; }
        .card-header { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
        .cefr-badge { padding: 3px 10px; border-radius: 100px; font-size: 11px; font-weight: 700; color: var(--navy); }
        .category-tag { font-size: 12px; color: var(--text-muted); }
        .function-tag { font-size: 11px; color: var(--text-muted); background: var(--off-white); padding: 2px 8px; border-radius: 6px; }
        .unlocked-badge { font-size: 11px; color: #276749; background: #f0fff4; padding: 2px 8px; border-radius: 6px; margin-left: auto; }
        .roleplay-card h3 { font-family: Georgia, serif; font-size: 16px; color: var(--navy); }
        .roleplay-card p { font-size: 13px; color: var(--text-muted); line-height: 1.5; flex: 1; }
        .card-footer { display: flex; flex-direction: column; gap: 8px; margin-top: 4px; }
        .action-buttons { display: flex; gap: 8px; flex-wrap: wrap; }
        .btn-free { background: rgba(104,211,145,0.15); color: #276749; border: 1px solid rgba(104,211,145,0.3); padding: 8px 14px; border-radius: 8px; font-family: inherit; font-size: 13px; font-weight: 600; cursor: pointer; text-decoration: none; transition: all 0.2s; }
        .btn-free:hover { background: rgba(104,211,145,0.25); }
        .btn-ai { background: var(--gold); color: var(--navy); border: none; padding: 8px 14px; border-radius: 8px; font-family: inherit; font-size: 13px; font-weight: 600; cursor: pointer; text-decoration: none; transition: all 0.2s; }
        .btn-ai:hover { background: var(--gold-light); }
        .btn-ai-upgrade { background: rgba(128,90,213,0.1); color: #805ad5; border: 1px solid rgba(128,90,213,0.3); padding: 8px 14px; border-radius: 8px; font-family: inherit; font-size: 13px; font-weight: 600; cursor: pointer; text-decoration: none; transition: all 0.2s; }
        .locked-message { display: flex; flex-direction: column; gap: 8px; font-size: 13px; color: var(--text-muted); }
        .btn-upgrade-sm { font-size: 12px; color: var(--gold); text-decoration: none; font-weight: 600; }
        .empty-state { grid-column: 1/-1; text-align: center; padding: 48px; background: var(--white); border-radius: 14px; border: 1px dashed var(--border); }
        .empty-state p { color: var(--text-muted); margin-bottom: 16px; }
        .upgrade-banner { background: var(--navy); border-radius: 16px; padding: 28px 32px; display: flex; align-items: center; justify-content: space-between; gap: 24px; }
        .upgrade-content { display: flex; align-items: flex-start; gap: 16px; }
        .upgrade-badge { background: var(--gold); color: var(--navy); font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 100px; white-space: nowrap; }
        .upgrade-content h3 { font-family: Georgia, serif; font-size: 18px; color: white; margin-bottom: 4px; }
        .upgrade-content p { font-size: 14px; color: rgba(255,255,255,0.6); line-height: 1.5; }
        .btn-primary { background: var(--gold); color: var(--navy); border: none; padding: 10px 20px; border-radius: 8px; font-family: inherit; font-size: 14px; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-block; transition: all 0.2s; }
        .btn-gold { background: var(--gold); color: var(--navy); border: none; padding: 12px 24px; border-radius: 10px; font-family: inherit; font-size: 15px; font-weight: 700; cursor: pointer; text-decoration: none; display: inline-block; white-space: nowrap; transition: all 0.2s; }
        .btn-gold:hover { background: var(--gold-light); }
        @media (max-width: 900px) {
          .sidebar { display: none; }
          .main { margin-left: 0; padding: 24px 16px; }
        }
      `}</style>
    </div>
  )
}
