'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function UnlockButton({ roleplayId }: { roleplayId: string }) {
  const [loading, setLoading] = useState(false)
  const [unlocked, setUnlocked] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleUnlock = async () => {
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('unlocks')
      .insert({ user_id: user.id, roleplay_id: roleplayId })

    if (!error) {
      setUnlocked(true)
      setTimeout(() => router.refresh(), 500)
    }

    setLoading(false)
  }

  if (unlocked) {
    return <div className="unlock-success">🔓 Unlocked! Refreshing...</div>
  }

  return (
    <>
      <button onClick={handleUnlock} disabled={loading} className="btn-unlock">
        {loading ? 'Unlocking...' : '🔓 Use an unlock'}
      </button>
      <style>{`
        .btn-unlock {
          background: rgba(201,168,76,0.12); color: #c9a84c;
          border: 1px solid rgba(201,168,76,0.3); padding: 8px 14px;
          border-radius: 8px; font-family: inherit; font-size: 13px;
          font-weight: 600; cursor: pointer; transition: all 0.2s;
        }
        .btn-unlock:hover:not(:disabled) { background: rgba(201,168,76,0.2); }
        .btn-unlock:disabled { opacity: 0.6; cursor: not-allowed; }
        .unlock-success { font-size: 13px; color: #276749; font-weight: 600; }
      `}</style>
    </>
  )
}
