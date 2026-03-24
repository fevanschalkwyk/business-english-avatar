'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SignOutButton() {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <button onClick={handleSignOut} className="sign-out-btn">
      Sign out
      <style>{`
        .sign-out-btn {
          width: 100%; padding: 9px; border-radius: 8px;
          background: transparent; border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.4); font-family: inherit; font-size: 13px;
          cursor: pointer; transition: all 0.2s;
        }
        .sign-out-btn:hover { border-color: rgba(255,255,255,0.2); color: rgba(255,255,255,0.7); }
      `}</style>
    </button>
  )
}