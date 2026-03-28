// app/admin/layout.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.id !== process.env.ADMIN_USER_ID) {
    redirect('/')
  }

  const links = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/roleplays', label: 'Roleplays' },
    { href: '/admin/roleplays/new', label: '+ New Roleplay' },
  ]

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a1628' }}>
      <nav style={{
        backgroundColor: '#080f1e',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        padding: '0 24px',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <span style={{ color: '#d4af37', fontWeight: 'bold', fontSize: '16px' }}>
            Admin
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            {links.map(link => (
              <a key={link.href} href={link.href} style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '14px', padding: '6px 12px', borderRadius: '6px' }}>
                {link.label}
              </a>
            ))}
          </div>
        </div>
        <a href="/dashboard" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', textDecoration: 'none' }}>
          Back to app
        </a>
      </nav>
      <div style={{ padding: '32px' }}>
        {children}
      </div>
    </div>
  )
}
