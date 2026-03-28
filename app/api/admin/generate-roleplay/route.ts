// app/api/admin/generate-roleplay/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.id !== process.env.ADMIN_USER_ID) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { brief, cefrLevel, category, functionField } = await req.json()

  const prompt = `You are an expert Business English curriculum designer. Generate a complete Business English roleplay based on this brief:

Brief: ${brief}
CEFR Level: ${cefrLevel}
Category: ${category}
Function: ${functionField}

Return ONLY a JSON object with this exact structure (no markdown, no explanation):
{
  "title": "Short descriptive title",
  "situation": "2-3 sentence background context explaining the scenario",
  "assigned_role": "B",
  "suggested_phrases": ["phrase 1", "phrase 2", "phrase 3", "phrase 4", "phrase 5"],
  "scripted_dialogue": [
    { "speaker": "A", "text": "Opening line from A" },
    { "speaker": "B", "text": "Response from B" }
  ]
}

Guidelines:
- Write 10-16 dialogue lines total
- Speaker A starts the conversation
- Student is assigned role B
- Language complexity should match ${cefrLevel} level
- Suggested phrases should appear naturally in the dialogue
- Situation should be realistic and professional
- Each line should be 1-3 sentences
- Make the dialogue flow naturally`

try {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama3-70b-8192',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  })

  const data = await response.json()
  console.log('Groq response status:', response.status)
  console.log('Groq response data:', JSON.stringify(data).substring(0, 500))

  if (!response.ok) {
    return NextResponse.json({ error: 'Groq API error', details: data }, { status: 500 })
  }

  const content = data.choices[0]?.message?.content
  if (!content) {
    return NextResponse.json({ error: 'No content from Groq' }, { status: 500 })
  }

  const clean = content.replace(/```json|```/g, '').trim()
  const parsed = JSON.parse(clean)
  return NextResponse.json(parsed)
} catch (err) {
  console.error('Generation error:', err)
  return NextResponse.json({ error: String(err) }, { status: 500 })
}
}