// app/api/admin/toggle-publish/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.id !== process.env.ADMIN_USER_ID) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const formData = await req.formData()
  const id = formData.get('id') as string
  const published = formData.get('published') === 'true'

  await supabase
    .from('roleplays')
    .update({ published })
    .eq('id', id)

  return NextResponse.redirect(new URL('/admin/roleplays', req.url))
}