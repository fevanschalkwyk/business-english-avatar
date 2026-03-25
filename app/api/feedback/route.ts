export const maxDuration = 60

import { NextRequest, NextResponse } from 'next/server'
import { generateCEFRFeedback } from '@/lib/ai/provider'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { roleplay, conversation, sessionId, roleplayId } = await request.json()

    if (!roleplay || !conversation) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const result = await generateCEFRFeedback(roleplay, conversation)

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    // Parse the JSON feedback
    let feedbackData
    try {
      const cleaned = result.text.replace(/```json|```/g, '').trim()
      feedbackData = JSON.parse(cleaned)
    } catch {
      return NextResponse.json({ error: 'Failed to parse feedback' }, { status: 500 })
    }

    // Save feedback to Supabase
    const { data: savedFeedback, error: saveError } = await supabase
      .from('feedback')
      .insert({
        session_id: sessionId || null,
        user_id: user.id,
        roleplay_id: roleplayId || null,
        accuracy: feedbackData.accuracy?.score,
        range: feedbackData.range?.score,
        interaction: feedbackData.interaction?.score,
        overall_score: feedbackData.overall?.score,
        grammar_corrections: feedbackData.grammar_corrections || [],
        new_vocabulary: feedbackData.new_vocabulary || [],
        raw_feedback: result.text,
      })
      .select()
      .single()

    if (saveError) {
      console.error('Error saving feedback:', saveError)
    }

    return NextResponse.json({
      feedback: feedbackData,
      feedbackId: savedFeedback?.id,
    })
  } catch (error) {
    console.error('Feedback API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
