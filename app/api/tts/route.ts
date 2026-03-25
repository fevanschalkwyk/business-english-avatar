import { NextRequest, NextResponse } from 'next/server'
import { generateSpeech } from '@/lib/tts/provider'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { text, speed = 'slow' } = await request.json()

    if (!text) {
      return NextResponse.json({ error: 'Missing text' }, { status: 400 })
    }

    // Limit text length to prevent abuse
    if (text.length > 500) {
      return NextResponse.json({ error: 'Text too long' }, { status: 400 })
    }

    const result = await generateSpeech({ text, speed })

    if (result.error || !result.audioBuffer) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    // Return audio as MP3
    return new NextResponse(result.audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error) {
    console.error('TTS API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
