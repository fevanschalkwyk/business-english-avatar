'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Roleplay {
  id: string
  title: string
  situation: string
  suggested_phrases: string[]
  cefr_level: string
  category: string
  function: string
}

interface Message {
  role: 'avatar' | 'user'
  text: string
  timestamp: Date
}

interface CEFRScore {
  score: string
  comment: string
}

interface GrammarCorrection {
  original: string
  correction: string
  explanation: string
}

interface VocabItem {
  word: string
  definition: string
  example: string
}

interface Feedback {
  accuracy: CEFRScore
  range: CEFRScore
  interaction: CEFRScore
  overall: CEFRScore
  grammar_corrections: GrammarCorrection[]
  new_vocabulary: VocabItem[]
}

type SessionState = 'loading' | 'ready' | 'active' | 'thinking' | 'feedback' | 'complete'

const CEFR_COLORS: Record<string, string> = {
  A1: '#fc8181', A2: '#f6ad55', B1: '#68d391',
  B2: '#4299e1', C1: '#9f7aea', C2: '#f6e05e'
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function RoleplayPage() {
  const params = useParams()
  const router = useRouter()
  const roleplayId = params.id as string

  const [roleplay, setRoleplay] = useState<Roleplay | null>(null)
  const [sessionState, setSessionState] = useState<SessionState>('loading')
  const [messages, setMessages] = useState<Message[]>([])
  const [userInput, setUserInput] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [studentNotes, setStudentNotes] = useState('')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [error, setError] = useState('')
  const [sessionCount, setSessionCount] = useState(0)

  const startTimeRef = useRef<Date | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const supabase = createClient()

  const MAX_SESSION_MINUTES = 20
  const MAX_MINUTES_PER_MONTH = 160

  // ─── Load roleplay and check usage ──────────────────────────────────────────

  useEffect(() => {
    loadRoleplay()
    checkUsage()
  }, [roleplayId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadRoleplay = async () => {
    const { data, error } = await supabase
      .from('roleplays')
      .select('*')
      .eq('id', roleplayId)
      .single()

    if (error || !data) {
      setError('Roleplay not found')
      return
    }
    setRoleplay(data)
    setSessionState('ready')
  }

  const checkUsage = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { data: sessions } = await supabase
      .from('sessions')
      .select('duration_seconds')
      .eq('user_id', user.id)
      .eq('completed', true)
      .gte('created_at', startOfMonth.toISOString())

    const totalMinutes = Math.round(
      (sessions?.reduce((acc, s) => acc + (s.duration_seconds || 0), 0) ?? 0) / 60
    )
    setSessionCount(totalMinutes)
  }

  // ─── Timer ──────────────────────────────────────────────────────────────────

  const startTimer = () => {
    startTimeRef.current = new Date()
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor(
        (new Date().getTime() - startTimeRef.current!.getTime()) / 1000
      )
      setTimeElapsed(elapsed)

      // Auto-end at 20 minutes
      if (elapsed >= MAX_SESSION_MINUTES * 60) {
        endSession()
      }
    }, 1000)
  }

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const timeRemaining = MAX_SESSION_MINUTES * 60 - timeElapsed
  const timeWarning = timeRemaining <= 120 // warn at 2 mins remaining

  // ─── Session management ──────────────────────────────────────────────────────

  const startSession = async () => {
    if (sessionCount >= MAX_MINUTES_PER_MONTH) {
      setError(`You've used all ${MAX_MINUTES_PER_MONTH} minutes this month. Upgrade or buy an add-on pack.`)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/signin'); return }

    // Create session record
    const { data: session } = await supabase
      .from('sessions')
      .insert({
        user_id: user.id,
        roleplay_id: roleplayId,
        completed: false,
      })
      .select()
      .single()

    setSessionId(session?.id || null)
    setSessionState('active')
    startTimer()

    // Send opening message from avatar
    await sendAvatarOpening()
  }

  const sendAvatarOpening = async () => {
    if (!roleplay) return
    setSessionState('thinking')

    const openingMessages = [
      { role: 'user' as const, content: '[START ROLEPLAY - introduce yourself briefly and set up the situation naturally in 1-2 sentences]' }
    ]

    try {
      const response = await fetch('/api/conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: openingMessages,
          roleplay: {
            situation: roleplay.situation,
            suggestedPhrases: roleplay.suggested_phrases,
            cefrLevel: roleplay.cefr_level,
            avatarName: 'Alex',
          }
        })
      })

      const data = await response.json()
      if (data.text) {
        await addAvatarMessage(data.text)
      }
    } catch {
      setError('Failed to start conversation. Please try again.')
    }
    setSessionState('active')
  }

  const addAvatarMessage = async (text: string) => {
    setMessages(prev => [...prev, { role: 'avatar', text, timestamp: new Date() }])
    await playTTS(text)
  }

  // ─── TTS ─────────────────────────────────────────────────────────────────────

  const playTTS = async (text: string) => {
    try {
      setIsPlayingAudio(true)
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, speed: 'slow' })
      })

      if (!response.ok) throw new Error('TTS failed')

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)

      if (audioRef.current) {
        audioRef.current.pause()
        URL.revokeObjectURL(audioRef.current.src)
      }

      const audio = new Audio(audioUrl)
      audioRef.current = audio
      audio.onended = () => {
        setIsPlayingAudio(false)
        URL.revokeObjectURL(audioUrl)
      }
      audio.onerror = () => setIsPlayingAudio(false)
      await audio.play()
    } catch {
      setIsPlayingAudio(false)
      // TTS failure is non-fatal — conversation continues
    }
  }

  // ─── User input ──────────────────────────────────────────────────────────────

  const handleSendMessage = useCallback(async () => {
    if (!userInput.trim() || sessionState !== 'active' || !roleplay) return

    const userText = userInput.trim()
    setUserInput('')
    setMessages(prev => [...prev, { role: 'user', text: userText, timestamp: new Date() }])
    setSessionState('thinking')

    // Build conversation history for AI
    const conversationHistory = messages.map(m => ({
      role: m.role === 'avatar' ? 'assistant' as const : 'user' as const,
      content: m.text,
    }))
    conversationHistory.push({ role: 'user', content: userText })

    try {
      const response = await fetch('/api/conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: conversationHistory,
          roleplay: {
            situation: roleplay.situation,
            suggestedPhrases: roleplay.suggested_phrases,
            cefrLevel: roleplay.cefr_level,
            avatarName: 'Alex',
          }
        })
      })

      const data = await response.json()
      if (data.text) {
        await addAvatarMessage(data.text)
      }
    } catch {
      setError('Failed to get response. Please try again.')
    }
    setSessionState('active')
  }, [userInput, sessionState, roleplay, messages])

  // ─── Speech recognition ───────────────────────────────────────────────────────

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-GB'
    recognition.onresult = (e: any) => {
      setUserInput(e.results[0][0].transcript)
      setIsListening(false)
    }
    recognition.onerror = () => setIsListening(false)
    recognition.onend = () => setIsListening(false)
    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
  }

  const stopListening = () => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }

  // ─── End session & feedback ───────────────────────────────────────────────────

  const endSession = async () => {
    stopTimer()
    setSessionState('feedback')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !roleplay) return

    // Build conversation for feedback
    const conversation = messages.map(m => ({
      role: m.role === 'avatar' ? 'Avatar (Alex)' : 'Student',
      text: m.text,
    }))

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roleplay: {
            situation: roleplay.situation,
            suggestedPhrases: roleplay.suggested_phrases,
          },
          conversation,
          sessionId,
          roleplayId,
        })
      })

      const data = await response.json()
      if (data.feedback) {
        setFeedback(data.feedback)

        // Update session as completed
        if (sessionId) {
          await supabase
            .from('sessions')
            .update({
              completed: true,
              duration_seconds: timeElapsed,
              score: data.feedback.overall?.score ? cefrToPercent(data.feedback.overall.score) : null,
            })
            .eq('id', sessionId)
        }
      }
    } catch {
      setError('Failed to generate feedback. Your session has been saved.')
    }
  }

  const cefrToPercent = (cefr: string): number => {
    const map: Record<string, number> = { A1: 10, A2: 25, B1: 45, B2: 65, C1: 80, C2: 95 }
    return map[cefr] ?? 50
  }

  const saveNotes = async () => {
    if (!sessionId || !studentNotes.trim()) return
    await supabase
      .from('feedback')
      .update({ student_notes: studentNotes })
      .eq('session_id', sessionId)
  }

  // ─── Render ───────────────────────────────────────────────────────────────────

  if (sessionState === 'loading') {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Loading roleplay...</p>
        <Style />
      </div>
    )
  }

  if (error && sessionState === 'ready') {
    return (
      <div className="error-screen">
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <Link href="/dashboard" className="btn-primary">Back to dashboard</Link>
        <Style />
      </div>
    )
  }

  if (sessionState === 'feedback' || sessionState === 'complete') {
    return (
      <FeedbackScreen
        feedback={feedback}
        roleplay={roleplay!}
        timeElapsed={timeElapsed}
        studentNotes={studentNotes}
        onNotesChange={setStudentNotes}
        onSaveNotes={saveNotes}
        onRetry={() => {
          setMessages([])
          setFeedback(null)
          setStudentNotes('')
          setTimeElapsed(0)
          setSessionState('ready')
        }}
      />
    )
  }

  return (
    <div className="page">
      {/* TOP BAR */}
      <div className="topbar">
        <Link href="/dashboard" className="back-btn">← Dashboard</Link>
        <div className="topbar-center">
          <span className="roleplay-title">{roleplay?.title}</span>
          <span className="roleplay-meta">
            <span className="cefr-badge" style={{ background: CEFR_COLORS[roleplay?.cefr_level || 'B1'] }}>
              {roleplay?.cefr_level}
            </span>
            {roleplay?.category}
          </span>
        </div>
        <div className="topbar-right">
          {sessionState === 'active' || sessionState === 'thinking' ? (
            <div className={`timer ${timeWarning ? 'warning' : ''}`}>
              ⏱ {formatTime(timeRemaining)} left
            </div>
          ) : null}
          {(sessionState === 'active' || sessionState === 'thinking') && (
            <button onClick={endSession} className="btn-end">End session</button>
          )}
        </div>
      </div>

      <div className="layout">
        {/* AVATAR PANEL */}
        <div className="avatar-panel">
          <div className="situation-box">
            <div className="situation-label">Situation</div>
            <p>{roleplay?.situation}</p>
          </div>

          <div className="avatar-stage">
            <div className={`avatar-wrap ${sessionState === 'thinking' ? 'thinking' : ''} ${isPlayingAudio ? 'speaking' : ''}`}>
              <div className="avatar-head" />
              <div className="avatar-shoulders" />
              {isPlayingAudio && (
                <div className="sound-waves">
                  <span /><span /><span /><span /><span />
                </div>
              )}
            </div>
            <div className="avatar-name">Alex</div>
            {sessionState === 'thinking' && (
              <div className="thinking-label">Alex is thinking...</div>
            )}
          </div>

          <div className="phrases-box">
            <div className="phrases-label">💡 Suggested phrases</div>
            <div className="phrases-list">
              {roleplay?.suggested_phrases.map((phrase, i) => (
                <div
                  key={i}
                  className="phrase-chip"
                  onClick={() => setUserInput(phrase)}
                >
                  "{phrase}"
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CONVERSATION PANEL */}
        <div className="conversation-panel">
          {sessionState === 'ready' ? (
            <div className="start-screen">
              <div className="start-icon">🎙️</div>
              <h2>Ready to practise?</h2>
              <p>You'll have a {MAX_SESSION_MINUTES}-minute conversation with Alex about this situation. Speak naturally and try to use the suggested phrases.</p>
              {sessionCount >= MAX_MINUTES_PER_MONTH ? (
                <div className="usage-warning">
                  You've used all {MAX_MINUTES_PER_MONTH} minutes this month.
                  <Link href="/upgrade" className="btn-upgrade">Get more sessions →</Link>
                </div>
              ) : (
                <>
                  <div className="usage-info">
                    {MAX_MINUTES_PER_MONTH - sessionCount} of {MAX_MINUTES_PER_MONTH} minutes remaining this month
                  </div>
                  <button onClick={startSession} className="btn-start">
                    Start conversation →
                  </button>
                </>
              )}
            </div>
          ) : (
            <>
              {/* MESSAGES */}
              <div className="messages">
                {messages.map((msg, i) => (
                  <div key={i} className={`message ${msg.role}`}>
                    <div className="message-label">
                      {msg.role === 'avatar' ? 'Alex' : 'You'}
                    </div>
                    <div className="message-bubble">{msg.text}</div>
                  </div>
                ))}
                {sessionState === 'thinking' && (
                  <div className="message avatar">
                    <div className="message-label">Alex</div>
                    <div className="message-bubble thinking-bubble">
                      <span /><span /><span />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* INPUT */}
              {sessionState === 'active' && (
                <div className="input-area">
                  <div className="input-row">
                    <textarea
                      value={userInput}
                      onChange={e => setUserInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                      placeholder="Type your response or use the mic..."
                      rows={2}
                      disabled={isPlayingAudio}
                    />
                    <div className="input-buttons">
                      <button
                        onClick={isListening ? stopListening : startListening}
                        className={`btn-mic ${isListening ? 'listening' : ''}`}
                        disabled={isPlayingAudio}
                      >
                        {isListening ? '⏹' : '🎙️'}
                      </button>
                      <button
                        onClick={handleSendMessage}
                        className="btn-send"
                        disabled={!userInput.trim() || isPlayingAudio}
                      >
                        Send →
                      </button>
                    </div>
                  </div>
                  {isPlayingAudio && (
                    <div className="audio-indicator">🔊 Alex is speaking...</div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Style />
    </div>
  )
}

// ─── Feedback Screen ──────────────────────────────────────────────────────────

function FeedbackScreen({
  feedback,
  roleplay,
  timeElapsed,
  studentNotes,
  onNotesChange,
  onSaveNotes,
  onRetry,
}: {
  feedback: Feedback | null
  roleplay: Roleplay
  timeElapsed: number
  studentNotes: string
  onNotesChange: (v: string) => void
  onSaveNotes: () => void
  onRetry: () => void
}) {
  if (!feedback) {
    return (
      <div className="feedback-loading">
        <div className="loading-spinner" />
        <p>Generating your feedback...</p>
        <Style />
      </div>
    )
  }

  const scores = [
    { label: 'Accuracy', data: feedback.accuracy },
    { label: 'Range', data: feedback.range },
    { label: 'Interaction', data: feedback.interaction },
  ]

  return (
    <div className="feedback-page">
      <div className="feedback-header">
        <Link href="/dashboard" className="back-btn">← Dashboard</Link>
        <h1>Session Feedback</h1>
        <div className="overall-score">
          <div
            className="score-badge-large"
            style={{ background: CEFR_COLORS[feedback.overall?.score] || '#68d391' }}
          >
            {feedback.overall?.score}
          </div>
          <span>Overall level</span>
        </div>
      </div>

      <div className="feedback-body">
        {/* CEFR SCORES */}
        <section className="feedback-section">
          <h2>CEFR Assessment</h2>
          <div className="scores-grid">
            {scores.map(s => (
              <div key={s.label} className="score-card">
                <div
                  className="score-badge"
                  style={{ background: CEFR_COLORS[s.data?.score] || '#68d391' }}
                >
                  {s.data?.score}
                </div>
                <div className="score-label">{s.label}</div>
                <p className="score-comment">{s.data?.comment}</p>
              </div>
            ))}
          </div>
          <div className="overall-comment">
            <strong>Overall:</strong> {feedback.overall?.comment}
          </div>
        </section>

        {/* GRAMMAR CORRECTIONS */}
        <section className="feedback-section">
          <h2>Grammar & Structure</h2>
          <div className="corrections-list">
            {feedback.grammar_corrections?.map((c, i) => (
              <div key={i} className="correction-card">
                <div className="correction-row">
                  <span className="correction-label error">✗ Original</span>
                  <span className="correction-text error-text">"{c.original}"</span>
                </div>
                <div className="correction-row">
                  <span className="correction-label correct">✓ Correct</span>
                  <span className="correction-text correct-text">"{c.correction}"</span>
                </div>
                <p className="correction-explanation">{c.explanation}</p>
              </div>
            ))}
          </div>
        </section>

        {/* VOCABULARY */}
        <section className="feedback-section">
          <h2>New Vocabulary</h2>
          <div className="vocab-list">
            {feedback.new_vocabulary?.map((v, i) => (
              <div key={i} className="vocab-card">
                <div className="vocab-word">{v.word}</div>
                <div className="vocab-definition">{v.definition}</div>
                <div className="vocab-example">e.g. "{v.example}"</div>
              </div>
            ))}
          </div>
        </section>

        {/* STUDENT NOTES */}
        <section className="feedback-section">
          <h2>My Notes</h2>
          <p className="notes-hint">Add your own observations, words to remember, or things to work on.</p>
          <textarea
            value={studentNotes}
            onChange={e => onNotesChange(e.target.value)}
            placeholder="Write your personal notes here..."
            rows={4}
            className="notes-textarea"
          />
          <button onClick={onSaveNotes} className="btn-save-notes">Save notes</button>
        </section>

        {/* ACTIONS */}
        <div className="feedback-actions">
          <button onClick={onRetry} className="btn-outline">
            🔄 Practise again
          </button>
          <Link href="/dashboard" className="btn-primary">
            Back to dashboard →
          </Link>
        </div>
      </div>
      <Style />
    </div>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function Style() {
  return (
    <style>{`
      * { box-sizing: border-box; margin: 0; padding: 0; }
      :root {
        --navy: #0a1628; --navy-mid: #112240; --navy-light: #1e3a5f;
        --gold: #c9a84c; --gold-light: #e8c76a;
        --white: #ffffff; --off-white: #f4f6f9;
        --text: #2d3748; --text-muted: #718096; --border: #e2e8f0;
      }
      body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: var(--off-white); }

      /* LOADING / ERROR */
      .loading-screen, .error-screen, .feedback-loading {
        min-height: 100vh; display: flex; flex-direction: column;
        align-items: center; justify-content: center; gap: 16px;
        font-family: inherit; color: var(--text);
      }
      .loading-spinner {
        width: 40px; height: 40px; border: 3px solid var(--border);
        border-top-color: var(--gold); border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }
      @keyframes spin { to { transform: rotate(360deg); } }

      /* TOPBAR */
      .topbar {
        display: flex; align-items: center; padding: 0 24px; height: 60px;
        background: var(--white); border-bottom: 1px solid var(--border);
        position: sticky; top: 0; z-index: 10; gap: 16px;
      }
      .back-btn { font-size: 14px; color: var(--text-muted); text-decoration: none; flex-shrink: 0; }
      .back-btn:hover { color: var(--navy); }
      .topbar-center { flex: 1; text-align: center; }
      .roleplay-title { display: block; font-family: Georgia, serif; font-size: 16px; color: var(--navy); }
      .roleplay-meta { display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 12px; color: var(--text-muted); }
      .cefr-badge { padding: 2px 8px; border-radius: 100px; font-size: 11px; font-weight: 700; color: var(--navy); }
      .topbar-right { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
      .timer { font-size: 14px; font-weight: 600; color: var(--text-muted); font-variant-numeric: tabular-nums; }
      .timer.warning { color: #e53e3e; animation: pulse 1s ease-in-out infinite; }
      @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
      .btn-end { background: #fff5f5; border: 1px solid #fed7d7; color: #e53e3e; padding: 6px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; }

      /* LAYOUT */
      .layout { display: grid; grid-template-columns: 320px 1fr; height: calc(100vh - 60px); }

      /* AVATAR PANEL */
      .avatar-panel { background: var(--navy); padding: 24px; display: flex; flex-direction: column; gap: 20px; overflow-y: auto; }
      .situation-box { background: rgba(201,168,76,0.1); border: 1px solid rgba(201,168,76,0.2); border-radius: 10px; padding: 14px 16px; }
      .situation-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: var(--gold); font-weight: 600; display: block; margin-bottom: 6px; }
      .situation-box p { font-size: 13px; color: rgba(255,255,255,0.8); line-height: 1.6; }

      .avatar-stage { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 16px 0; }
      .avatar-wrap { position: relative; display: flex; flex-direction: column; align-items: center; transition: all 0.3s; }
      .avatar-head { width: 72px; height: 72px; border-radius: 50%; background: var(--gold); border: 3px solid rgba(201,168,76,0.4); }
      .avatar-wrap.speaking .avatar-head { box-shadow: 0 0 0 8px rgba(201,168,76,0.2), 0 0 0 16px rgba(201,168,76,0.08); animation: speakPulse 1s ease-in-out infinite; }
      .avatar-wrap.thinking .avatar-head { animation: thinkBob 1.5s ease-in-out infinite; }
      @keyframes speakPulse { 0%,100% { box-shadow: 0 0 0 8px rgba(201,168,76,0.2); } 50% { box-shadow: 0 0 0 14px rgba(201,168,76,0.25); } }
      @keyframes thinkBob { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-4px) rotate(-3deg); } }
      .avatar-shoulders { width: 100px; height: 48px; background: var(--navy-mid); border-radius: 50px 50px 0 0; margin-top: -4px; }
      .sound-waves { position: absolute; bottom: 52px; right: -20px; display: flex; gap: 3px; align-items: flex-end; }
      .sound-waves span { width: 4px; background: var(--gold); border-radius: 2px; animation: wave 0.8s ease-in-out infinite; }
      .sound-waves span:nth-child(1) { height: 8px; } .sound-waves span:nth-child(2) { height: 14px; animation-delay: 0.1s; }
      .sound-waves span:nth-child(3) { height: 20px; animation-delay: 0.2s; } .sound-waves span:nth-child(4) { height: 14px; animation-delay: 0.3s; }
      .sound-waves span:nth-child(5) { height: 8px; animation-delay: 0.4s; }
      @keyframes wave { 0%,100% { transform: scaleY(0.6); } 50% { transform: scaleY(1); } }
      .avatar-name { font-size: 14px; color: rgba(255,255,255,0.6); font-style: italic; }
      .thinking-label { font-size: 12px; color: var(--gold); animation: fadePulse 1.5s ease-in-out infinite; }
      @keyframes fadePulse { 0%,100% { opacity: 0.5; } 50% { opacity: 1; } }

      .phrases-box { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 14px; }
      .phrases-label { font-size: 11px; color: rgba(255,255,255,0.5); margin-bottom: 10px; font-weight: 600; }
      .phrases-list { display: flex; flex-direction: column; gap: 6px; }
      .phrase-chip { font-size: 12px; color: rgba(255,255,255,0.8); padding: 8px 10px; background: rgba(201,168,76,0.08); border: 1px solid rgba(201,168,76,0.15); border-radius: 8px; cursor: pointer; transition: all 0.2s; line-height: 1.4; }
      .phrase-chip:hover { background: rgba(201,168,76,0.15); border-color: rgba(201,168,76,0.3); color: var(--white); }

      /* CONVERSATION PANEL */
      .conversation-panel { display: flex; flex-direction: column; background: var(--white); overflow: hidden; }

      .start-screen { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; padding: 48px; text-align: center; }
      .start-icon { font-size: 48px; }
      .start-screen h2 { font-family: Georgia, serif; font-size: 24px; color: var(--navy); }
      .start-screen p { font-size: 15px; color: var(--text-muted); line-height: 1.6; max-width: 400px; }
      .usage-info { font-size: 13px; color: var(--text-muted); background: var(--off-white); padding: 8px 16px; border-radius: 100px; }
      .usage-warning { background: #fff5f5; border: 1px solid #fed7d7; color: #c53030; padding: 16px; border-radius: 10px; font-size: 14px; display: flex; flex-direction: column; gap: 12px; align-items: center; }
      .btn-start { background: var(--gold); color: var(--navy); border: none; padding: 14px 32px; border-radius: 10px; font-size: 16px; font-weight: 700; cursor: pointer; font-family: inherit; transition: all 0.2s; }
      .btn-start:hover { background: var(--gold-light); transform: translateY(-1px); }

      /* MESSAGES */
      .messages { flex: 1; overflow-y: auto; padding: 24px; display: flex; flex-direction: column; gap: 16px; }
      .message { display: flex; flex-direction: column; gap: 4px; max-width: 80%; }
      .message.avatar { align-self: flex-start; }
      .message.user { align-self: flex-end; }
      .message-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); padding: 0 4px; }
      .message.user .message-label { text-align: right; }
      .message-bubble { padding: 12px 16px; border-radius: 16px; font-size: 15px; line-height: 1.6; }
      .message.avatar .message-bubble { background: var(--off-white); border: 1px solid var(--border); color: var(--text); border-bottom-left-radius: 4px; }
      .message.user .message-bubble { background: var(--navy); color: var(--white); border-bottom-right-radius: 4px; }
      .thinking-bubble { display: flex; align-items: center; gap: 4px; padding: 14px 20px; }
      .thinking-bubble span { width: 8px; height: 8px; border-radius: 50%; background: var(--text-muted); animation: typingBounce 1.2s ease-in-out infinite; }
      .thinking-bubble span:nth-child(2) { animation-delay: 0.2s; }
      .thinking-bubble span:nth-child(3) { animation-delay: 0.4s; }
      @keyframes typingBounce { 0%,60%,100% { transform: translateY(0); } 30% { transform: translateY(-6px); } }

      /* INPUT */
      .input-area { padding: 16px 24px; border-top: 1px solid var(--border); background: var(--white); }
      .input-row { display: flex; gap: 10px; align-items: flex-end; }
      .input-row textarea { flex: 1; padding: 12px 14px; border: 1.5px solid var(--border); border-radius: 10px; font-family: inherit; font-size: 15px; color: var(--text); resize: none; outline: none; transition: border-color 0.2s; line-height: 1.5; }
      .input-row textarea:focus { border-color: var(--navy); }
      .input-row textarea:disabled { background: var(--off-white); }
      .input-buttons { display: flex; flex-direction: column; gap: 6px; }
      .btn-mic { width: 44px; height: 44px; border-radius: 10px; border: 1.5px solid var(--border); background: var(--off-white); font-size: 18px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
      .btn-mic:hover:not(:disabled) { border-color: var(--gold); }
      .btn-mic.listening { border-color: #fc8181; background: #fff5f5; animation: recordPulse 1s ease-in-out infinite; }
      .btn-mic:disabled { opacity: 0.4; cursor: not-allowed; }
      @keyframes recordPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(252,129,129,0.3); } 50% { box-shadow: 0 0 0 6px rgba(252,129,129,0.1); } }
      .btn-send { height: 44px; padding: 0 16px; background: var(--gold); color: var(--navy); border: none; border-radius: 10px; font-family: inherit; font-size: 14px; font-weight: 700; cursor: pointer; white-space: nowrap; transition: all 0.2s; }
      .btn-send:hover:not(:disabled) { background: var(--gold-light); }
      .btn-send:disabled { opacity: 0.4; cursor: not-allowed; }
      .audio-indicator { font-size: 12px; color: var(--text-muted); margin-top: 8px; text-align: center; }

      /* FEEDBACK PAGE */
      .feedback-page { min-height: 100vh; background: var(--off-white); }
      .feedback-header { background: var(--navy); padding: 24px 32px; display: flex; align-items: center; gap: 24px; }
      .feedback-header h1 { font-family: Georgia, serif; font-size: 24px; color: var(--white); flex: 1; text-align: center; }
      .overall-score { display: flex; flex-direction: column; align-items: center; gap: 4px; }
      .score-badge-large { width: 56px; height: 56px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: Georgia, serif; font-size: 20px; font-weight: bold; color: var(--navy); }
      .overall-score span { font-size: 11px; color: rgba(255,255,255,0.5); }
      .feedback-body { max-width: 800px; margin: 0 auto; padding: 32px; display: flex; flex-direction: column; gap: 32px; }
      .feedback-section { background: var(--white); border: 1px solid var(--border); border-radius: 16px; padding: 24px; }
      .feedback-section h2 { font-family: Georgia, serif; font-size: 20px; color: var(--navy); margin-bottom: 20px; }
      .scores-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 16px; }
      .score-card { text-align: center; padding: 16px; background: var(--off-white); border-radius: 12px; }
      .score-badge { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: Georgia, serif; font-size: 16px; font-weight: bold; color: var(--navy); margin: 0 auto 8px; }
      .score-label { font-size: 13px; font-weight: 600; color: var(--navy); margin-bottom: 6px; }
      .score-comment { font-size: 13px; color: var(--text-muted); line-height: 1.5; }
      .overall-comment { font-size: 14px; color: var(--text); padding: 12px 16px; background: var(--off-white); border-radius: 10px; line-height: 1.6; }
      .corrections-list { display: flex; flex-direction: column; gap: 16px; }
      .correction-card { padding: 16px; border: 1px solid var(--border); border-radius: 10px; display: flex; flex-direction: column; gap: 8px; }
      .correction-row { display: flex; align-items: flex-start; gap: 10px; }
      .correction-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; padding: 2px 8px; border-radius: 4px; white-space: nowrap; flex-shrink: 0; }
      .correction-label.error { background: #fff5f5; color: #c53030; }
      .correction-label.correct { background: #f0fff4; color: #276749; }
      .correction-text { font-size: 14px; line-height: 1.5; }
      .error-text { color: #c53030; }
      .correct-text { color: #276749; font-weight: 500; }
      .correction-explanation { font-size: 13px; color: var(--text-muted); line-height: 1.5; padding-top: 4px; border-top: 1px solid var(--border); }
      .vocab-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; }
      .vocab-card { padding: 14px; background: var(--off-white); border-radius: 10px; border: 1px solid var(--border); }
      .vocab-word { font-size: 15px; font-weight: 700; color: var(--navy); margin-bottom: 4px; }
      .vocab-definition { font-size: 13px; color: var(--text); line-height: 1.5; margin-bottom: 6px; }
      .vocab-example { font-size: 12px; color: var(--text-muted); font-style: italic; line-height: 1.4; }
      .notes-hint { font-size: 14px; color: var(--text-muted); margin-bottom: 12px; }
      .notes-textarea { width: 100%; padding: 12px 14px; border: 1.5px solid var(--border); border-radius: 10px; font-family: inherit; font-size: 15px; color: var(--text); resize: vertical; outline: none; line-height: 1.6; }
      .notes-textarea:focus { border-color: var(--navy); }
      .btn-save-notes { margin-top: 10px; background: var(--off-white); border: 1px solid var(--border); color: var(--text); padding: 8px 18px; border-radius: 8px; font-family: inherit; font-size: 14px; cursor: pointer; transition: all 0.2s; }
      .btn-save-notes:hover { border-color: var(--gold); }
      .feedback-actions { display: flex; gap: 16px; justify-content: center; padding-bottom: 32px; }
      .btn-primary { background: var(--gold); color: var(--navy); border: none; padding: 12px 28px; border-radius: 10px; font-family: inherit; font-size: 15px; font-weight: 700; cursor: pointer; text-decoration: none; display: inline-block; transition: all 0.2s; }
      .btn-primary:hover { background: var(--gold-light); }
      .btn-outline { background: none; border: 1.5px solid var(--navy); color: var(--navy); padding: 12px 28px; border-radius: 10px; font-family: inherit; font-size: 15px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
      .btn-outline:hover { background: var(--navy); color: var(--white); }
      .btn-upgrade { background: var(--gold); color: var(--navy); border: none; padding: 8px 16px; border-radius: 8px; font-family: inherit; font-size: 14px; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-block; }

      @media (max-width: 768px) {
        .layout { grid-template-columns: 1fr; grid-template-rows: auto 1fr; }
        .avatar-panel { height: auto; }
        .scores-grid { grid-template-columns: 1fr; }
        .feedback-header { flex-direction: column; text-align: center; }
      }
    `}</style>
  )
}
