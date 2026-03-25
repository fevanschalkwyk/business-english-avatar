// TTS Provider Abstraction
// To switch providers, only change this file
// Current provider: Azure Cognitive Services Speech SDK

export interface TTSOptions {
  text: string
  speed?: 'slow' | 'normal' | 'fast'
  voice?: string
}

export interface TTSResponse {
  audioBuffer?: ArrayBuffer
  error?: string
}

// Azure voice options — natural, slow-paced voices
const AZURE_VOICE = 'en-US-AndrewMultilingualNeural' // Warm, professional male voice
const AZURE_VOICE_FEMALE = 'en-US-AvaMultilingualNeural' // Warm, professional female voice

export async function generateSpeech(options: TTSOptions): Promise<TTSResponse> {
  try {
    const { text, speed = 'slow', voice = AZURE_VOICE } = options

    // Map speed to SSML rate
    const rateMap = {
      slow: '-15%',
      normal: '0%',
      fast: '+10%',
    }
    const rate = rateMap[speed]

    // Build SSML for natural speech
    const ssml = `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
        <voice name="${voice}">
          <prosody rate="${rate}">
            ${text}
          </prosody>
        </voice>
      </speak>
    `.trim()

    const region = process.env.AZURE_SPEECH_REGION!
    const key = process.env.AZURE_SPEECH_KEY!

    // Get access token
    const tokenResponse = await fetch(
      `https://${region}.api.cognitive.microsoft.com/sts/v1.0/issueToken`,
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': key,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    )

    if (!tokenResponse.ok) {
      throw new Error(`Token request failed: ${tokenResponse.status}`)
    }

    const token = await tokenResponse.text()

    // Generate speech
    const speechResponse = await fetch(
      `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
        },
        body: ssml,
      }
    )

    if (!speechResponse.ok) {
      throw new Error(`Speech synthesis failed: ${speechResponse.status}`)
    }

    const audioBuffer = await speechResponse.arrayBuffer()
    return { audioBuffer }
  } catch (error) {
    console.error('TTS provider error:', error)
    return { error: 'Speech generation failed' }
  }
}
