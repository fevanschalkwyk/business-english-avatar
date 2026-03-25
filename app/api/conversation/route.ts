import { NextRequest, NextResponse } from 'next/server'
import { generateAIResponse, Message } from '@/lib/ai/provider'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { messages, roleplay } = await request.json()

    if (!messages || !roleplay) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Build system prompt for the avatar
    const systemPrompt = `You are a professional Business English conversation partner named ${roleplay.avatarName || 'Alex'}.

You are doing a roleplay with a student who is practising Business English.

ROLEPLAY SITUATION:
${roleplay.situation}

YOUR ROLE: You are playing the other person in this conversation. Keep responses natural, professional and concise (2-3 sentences maximum). 

IMPORTANT RULES:
- Stay in character at all times
- Use natural Business English at ${roleplay.cefrLevel} level
- Keep responses brief and conversational — this is a dialogue, not a monologue
- Occasionally use one of these suggested phrases naturally if appropriate: ${roleplay.suggestedPhrases?.join(', ')}
- If the student makes a significant grammar error, gently model the correct form in your response without explicitly correcting them
- Move the conversation forward naturally toward a conclusion
- Speak at a measured, clear pace appropriate for a language learner`

    const fullMessages: Message[] = [
      { role: 'system', content: systemPrompt },
      ...messages,
    ]

    const response = await generateAIResponse(fullMessages, {
      temperature: 0.7,
      maxTokens: 150,
    })

    if (response.error) {
      return NextResponse.json({ error: response.error }, { status: 500 })
    }

    return NextResponse.json({ text: response.text })
  } catch (error) {
    console.error('Conversation API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
