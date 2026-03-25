// AI Provider Abstraction
// To switch providers, only change this file
// Current provider: Groq

import Groq from 'groq-sdk'

function getGroqClient() {
  return new Groq({
    apiKey: process.env.GROQ_API_KEY!,
  })
}

export interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface AIResponse {
  text: string
  error?: string
}

export async function generateAIResponse(
  messages: Message[],
  options?: {
    temperature?: number
    maxTokens?: number
  }
): Promise<AIResponse> {
  try {
    const completion = await getGroqClient().chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 300,
    })

    const text = completion.choices[0]?.message?.content ?? ''
    return { text }
  } catch (error) {
    console.error('AI provider error:', error)
    return { text: '', error: 'AI response failed' }
  }
}

// Generate CEFR feedback for a conversation
export async function generateCEFRFeedback(
  roleplay: {
    situation: string
    suggestedPhrases: string[]
  },
  conversation: Array<{ role: string; text: string }>
): Promise<AIResponse> {
  const conversationText = conversation
    .map(m => `${m.role}: ${m.text}`)
    .join('\n')

  const suggestedPhrasesText = roleplay.suggestedPhrases.join('\n- ')

  const prompt = `You are an expert Business English examiner using the CEFR framework.

Assess the following student conversation and provide structured feedback.

ROLEPLAY SITUATION:
${roleplay.situation}

SUGGESTED PHRASES THE STUDENT WAS ENCOURAGED TO USE:
- ${suggestedPhrasesText}

STUDENT CONVERSATION:
${conversationText}

Provide feedback in the following JSON format ONLY — no other text:
{
  "accuracy": {
    "score": "B1",
    "comment": "Brief comment on grammatical accuracy"
  },
  "range": {
    "score": "B2", 
    "comment": "Brief comment on vocabulary and expression range"
  },
  "interaction": {
    "score": "B1",
    "comment": "Brief comment on how well they maintained the conversation"
  },
  "overall": {
    "score": "B1",
    "comment": "Overall assessment"
  },
  "grammar_corrections": [
    {
      "original": "the incorrect phrase used",
      "correction": "the correct version",
      "explanation": "brief explanation"
    }
  ],
  "new_vocabulary": [
    {
      "word": "word or phrase",
      "definition": "simple definition",
      "example": "example sentence"
    }
  ]
}

Provide 3-5 grammar corrections and 3-5 new vocabulary items relevant to the situation.
CEFR scores must be one of: A1, A2, B1, B2, C1, C2.`

  return generateAIResponse(
    [{ role: 'user', content: prompt }],
    { temperature: 0.3, maxTokens: 1000 }
  )
}
