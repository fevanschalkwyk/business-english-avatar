// app/admin/roleplays/page.tsx
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminRoleplaysPage() {
  const supabase = await createClient()

  const { data: roleplays } = await supabase
    .from('roleplays')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1 style={{ color: 'white', fontSize: '24px', fontFamily: 'Georgia, serif' }}>
          Roleplays ({roleplays?.length ?? 0})
        </h1>
        <Link href="/admin/roleplays/new" style={{ backgroundColor: '#d4af37', color: '#0a1628', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '14px' }}>
          + New Roleplay
        </Link>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {roleplays?.map((rp: any) => (
          <div key={rp.id} style={{
            backgroundColor: '#0d1f3c',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <span style={{ color: 'white', fontWeight: 600, fontSize: '15px' }}>{rp.title}</span>
                <span style={{
                  fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '100px',
                  backgroundColor: rp.published ? 'rgba(104,211,145,0.15)' : 'rgba(255,255,255,0.08)',
                  color: rp.published ? '#68d391' : 'rgba(255,255,255,0.4)',
                  border: `1px solid ${rp.published ? 'rgba(104,211,145,0.3)' : 'rgba(255,255,255,0.1)'}`,
                }}>
                  {rp.published ? 'Published' : 'Draft'}
                </span>
                {rp.audio_generated && (
                  <span style={{ fontSize: '11px', color: '#d4af37' }}>🔊 Audio</span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                <span>{rp.cefr_level}</span>
                <span>{rp.category}</span>
                <span>{rp.function}</span>
                <span>{new Date(rp.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              <Link
                href={`/admin/roleplays/edit/${rp.id}`}
                style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.15)', padding: '6px 14px', borderRadius: '6px', textDecoration: 'none' }}
              >
                Edit
              </Link>
              <PublishToggle id={rp.id} published={rp.published} />
            </div>
          </div>
        ))}

        {(!roleplays || roleplays.length === 0) && (
          <div style={{ textAlign: 'center', padding: '64px', color: 'rgba(255,255,255,0.4)' }}>
            <p style={{ marginBottom: '16px' }}>No roleplays yet.</p>
            <Link href="/admin/roleplays/new" style={{ color: '#d4af37', textDecoration: 'none' }}>
              Create your first roleplay →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

function PublishToggle({ id, published }: { id: string; published: boolean }) {
  return (
    <form action={`/api/admin/toggle-publish`} method="POST" style={{ display: 'inline' }}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="published" value={String(!published)} />
      <button
        type="submit"
        style={{
          fontSize: '13px',
          color: published ? 'rgba(229,62,62,0.8)' : 'rgba(104,211,145,0.8)',
          border: `1px solid ${published ? 'rgba(229,62,62,0.2)' : 'rgba(104,211,145,0.2)'}`,
          padding: '6px 14px',
          borderRadius: '6px',
          background: 'none',
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        {published ? 'Unpublish' : 'Publish'}
      </button>
    </form>
  )
}