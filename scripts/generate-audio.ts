/**
 * Audio Generation Script
 * Generates Azure TTS audio for a roleplay's scripted dialogue
 * and stores it in Supabase Storage
 *
 * Usage: npx ts-node scripts/generate-audio.ts <roleplay-id>
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import * as path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const VOICES = {
  A: 'en-US-AndrewMultilingualNeural',
  B: 'en-US-AvaMultilingualNeural',
}

async function getAzureToken(): Promise<string> {
  const region = process.env.AZURE_SPEECH_REGION!
  const key = process.env.AZURE_SPEECH_KEY!
  const response = await fetch(
    `https://${region}.api.cognitive.microsoft.com/sts/v1.0/issueToken`,
    { method: 'POST', headers: { 'Ocp-Apim-Subscription-Key': key } }
  )
  return response.text()
}

async function generateAudio(text: string, voice: string, token: string): Promise<Buffer> {
  const region = process.env.AZURE_SPEECH_REGION!
  const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US"><voice name="${voice}"><prosody rate="-15%">${text}</prosody></voice></speak>`
  const response = await fetch(
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
  if (!response.ok) throw new Error(`TTS failed: ${response.status}`)
  return Buffer.from(await response.arrayBuffer())
}

async function generateRoleplayAudio(roleplayId: string) {
  console.log(`\n🎙️ Generating audio for roleplay: ${roleplayId}\n`)

  const { data: roleplay, error } = await supabase
    .from('roleplays')
    .select('*')
    .eq('id', roleplayId)
    .single()

  if (error || !roleplay) {
    console.error('❌ Roleplay not found:', error)
    process.exit(1)
  }

  console.log(`📚 Roleplay: ${roleplay.title}`)
  console.log(`📝 Lines: ${roleplay.scripted_dialogue.length}\n`)

  const token = await getAzureToken()
  console.log('✅ Azure token acquired\n')

  const audioFiles: { line_index: number; speaker: string; file_path: string }[] = []

  for (let i = 0; i < roleplay.scripted_dialogue.length; i++) {
    const line = roleplay.scripted_dialogue[i]
    const voice = VOICES[line.speaker as keyof typeof VOICES] || VOICES.A
    const filePath = `${roleplayId}/line_${i}_${line.speaker}.mp3`

    console.log(`🎵 Line ${i + 1}/${roleplay.scripted_dialogue.length}: [${line.speaker}] "${line.text.substring(0, 50)}..."`)

    try {
      const audioBuffer = await generateAudio(line.text, voice, token)

      const { error: uploadError } = await supabase.storage
        .from('roleplay-audio')
        .upload(filePath, audioBuffer, {
          contentType: 'audio/mpeg',
          upsert: true,
        })

      if (uploadError) {
        console.error(`  ❌ Upload failed: ${uploadError.message}`)
        continue
      }

      audioFiles.push({ line_index: i, speaker: line.speaker, file_path: filePath })
      console.log(`  ✅ Uploaded: ${filePath}`)
      await new Promise(r => setTimeout(r, 500))
    } catch (err) {
      console.error(`  ❌ Error:`, err)
    }
  }

  await supabase
    .from('roleplays')
    .update({ audio_generated: true, audio_files: audioFiles })
    .eq('id', roleplayId)

  console.log(`\n✅ Done! ${audioFiles.length} files uploaded.`)
}

const roleplayId = process.argv[2]
if (!roleplayId) {
  console.error('❌ Usage: npx ts-node scripts/generate-audio.ts <roleplay-id>')
  process.exit(1)
}

generateRoleplayAudio(roleplayId).catch(console.error)