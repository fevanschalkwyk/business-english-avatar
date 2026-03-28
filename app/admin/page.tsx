// app/admin/page.tsx
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminPage() {
  const supabase = await createClient()

  const { count: totalRoleplays } = await supabase
    .from('roleplays')
    .select('*', { count: 'exact', head: true })

  const { count: publishedRoleplays } = await supabase
    .from('roleplays')
    .select('*', { count: 'exact', head: true })
    .eq('published', true)

  const { count: audioGenerated } = await supabase
    .from('roleplays')
    .select('*', { count: 'exact', head: true })
    .eq('audio_generated', true)

  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  const { count: proUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('subscription_status', 'pro')

  const stats = [
    { label: 'Total roleplays', value: totalRoleplays ?? 0, icon: '🎭' },
    { label: 'Published', value: publishedRoleplays ?? 0, icon: '✅' },
    { label: 'Audio generated', value: audioGenerated ?? 0, icon: '🔊' },
    { label: 'Total users', value: totalUsers ?? 0, icon: '👥' },
    { label: 'Pro users', value: proUsers ?? 0, icon: '⭐' },
  ]

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ color: 'white', fontSize: '28px', fontFamily: 'Georgia, serif', marginBottom: '8px' }}>
          Admin Dashboard
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
          Manage roleplays, monitor usage, and configure the platform.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '40px' }}>
        {stats.map(stat => (
          <div key={stat.label} style={{
            backgroundColor: '#0d1f3c',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>{stat.icon}</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#d4af37', marginBottom: '4px' }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        {[
          { href: '/admin/roleplays/new', label: '+ Create new roleplay', desc: 'Add a roleplay manually or with AI assistance', color: '#d4af37' },
          { href: '/admin/roleplays', label: '📋 Manage roleplays', desc: 'Edit, publish, delete, and generate audio', color: 'rgba(255,255,255,0.7)' },
        ].map(action => (
          <Link
            key={action.href}
            href={action.href}
            style={{
              backgroundColor: '#0d1f3c',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '24px',
              textDecoration: 'none',
              display: 'block',
              transition: 'border-color 0.2s',
            }}
          >
            <div style={{ color: action.color, fontWeight: 600, fontSize: '15px', marginBottom: '8px' }}>
              {action.label}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', lineHeight: 1.5 }}>
              {action.desc}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
