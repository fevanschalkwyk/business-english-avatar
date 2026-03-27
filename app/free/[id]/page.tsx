'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

// ─── Types ────────────────────────────────────────────────────────────────────

interface DialogueLine {
  speaker: string
  text: string
}

interface Roleplay {
  id: string
  title: string
  situation: string
  suggested_phrases: string[]
  scripted_dialogue: DialogueLine[]
  cefr_level: string
  category: string
  audio_files: { line_index: number; speaker: string; file_path: string }[]
  assigned_role: string
}

type PageState = 'loading' | 'ready' | 'listening' | 'practicing' | 'complete'

const CEFR_COLORS: Record<string, string> = {
  A1: '#fc8181', A2: '#f6ad55', B1: '#68d391',
  B2: '#4299e1', C1: '#9f7aea', C2: '#f6e05e'
}

const SUPABASE_STORAGE_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/roleplay-audio`

// ─── Component ────────────────────────────────────────────────────────────────

export default function FreeTierRoleplayPage() {
  const params = useParams()
  const router = useRouter()
  const roleplayId = params.id as string

  const [roleplay, setRoleplay] = useState<Roleplay | null>(null)
  const [pageState, setPageState] = useState<PageState>('loading')
  const [currentLineIndex, setCurrentLineIndex] = useState(-1)
  const [currentWordIndex, setCurrentWordIndex] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [practiceLine, setPracticeLine] = useState(-1)
  const [completedLines, setCompletedLines] = useState<Set<number>>(new Set())
  const [error, setError] = useState('')
  const [assignedRole, setAssignedRole] = useState('B')

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const wordTimerRef = useRef<NodeJS.Timeout | null>(null)
  const supabase = createClient()
  const transcriptEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadRoleplay()
  }, [roleplayId])

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentLineIndex])

  const loadRoleplay = async () => {
    const { data, error } = await supabase
      .from('roleplays')
      .select('*')
      .eq('id', roleplayId)
      .single()

    if (error || !data) {
      setError('Roleplay not found')
      setPageState('ready')
      return
    }

    if (!data.audio_generated || !data.audio_files?.length) {
      setError('Audio not yet available for this roleplay. Please check back soon.')
      setPageState('ready')
      return
    }

    setRoleplay(data)
    setAssignedRole(data.assigned_role || 'B')
    setPageState('ready')
  }

  // ─── Audio playback ──────────────────────────────────────────────────────────

  const getAudioUrl = (filePath: string) => {
    return `${SUPABASE_STORAGE_URL}/${filePath}`
  }

  const simulateWordHighlighting = (text: string, duration: number, lineIndex: number) => {
    const words = text.split(' ')
    const wordDuration = duration / words.length
    let wordIndex = 0

    const tick = () => {
      if (wordIndex < words.length) {
        setCurrentWordIndex(wordIndex)
        wordIndex++
        wordTimerRef.current = setTimeout(tick, wordDuration)
      }
    }
    tick()
  }

  const playLine = useCallback(async (lineIndex: number, onComplete?: () => void) => {
    if (!roleplay) return

    const audioFile = roleplay.audio_files.find(f => f.line_index === lineIndex)
    if (!audioFile) {
      onComplete?.()
      return
    }

    setCurrentLineIndex(lineIndex)
    setCurrentWordIndex(-1)

    if (audioRef.current) {
      audioRef.current.pause()
    }

    const audio = new Audio(getAudioUrl(audioFile.file_path))
    audioRef.current = audio

    audio.onloadedmetadata = () => {
      simulateWordHighlighting(
        roleplay.scripted_dialogue[lineIndex].text,
        audio.duration * 1000,
        lineIndex
      )
    }

    audio.onended = () => {
      setCurrentWordIndex(-1)
      if (wordTimerRef.current) clearTimeout(wordTimerRef.current)
      onComplete?.()
    }

    audio.onerror = () => {
      onComplete?.()
    }

    await audio.play().catch(() => onComplete?.())
  }, [roleplay])

  // ─── Listen mode — play full conversation ────────────────────────────────────

  const startListening = async () => {
    if (!roleplay) return
    setPageState('listening')
    setIsPlaying(true)
    setCurrentLineIndex(0)

    const playSequence = async (index: number) => {
      if (index >= roleplay.scripted_dialogue.length) {
        setIsPlaying(false)
        setCurrentLineIndex(-1)
        setCurrentWordIndex(-1)
        // Auto-start practice after listening
        setTimeout(() => startPracticing(), 1000)
        return
      }

      await new Promise<void>(resolve => {
        playLine(index, () => {
          setTimeout(() => resolve(), 600) // pause between lines
        })
      })

      playSequence(index + 1)
    }

    playSequence(0)
  }

  // ─── Practice mode ────────────────────────────────────────────────────────────

  const startPracticing = () => {
    if (!roleplay) return
    setPageState('practicing')
    setIsPlaying(false)
    setCurrentLineIndex(-1)
    setPracticeLine(0)
    setCompletedLines(new Set())

    // Play first avatar line
    playNextAvatarLine(0)
  }

  const playNextAvatarLine = useCallback((fromIndex: number) => {
    if (!roleplay) return

    // Find next avatar line (not assigned to student)
    let avatarLineIndex = fromIndex
    while (
      avatarLineIndex < roleplay.scripted_dialogue.length &&
      roleplay.scripted_dialogue[avatarLineIndex].speaker === assignedRole
    ) {
      avatarLineIndex++
    }

    if (avatarLineIndex >= roleplay.scripted_dialogue.length) return

    setCurrentLineIndex(avatarLineIndex)
    playLine(avatarLineIndex, () => {
      setCurrentLineIndex(-1)
      setPracticeLine(avatarLineIndex + 1)
    })
  }, [roleplay, assignedRole, playLine])

  const handleStudentLineDone = (lineIndex: number) => {
    if (!roleplay) return

    setCompletedLines(prev => new Set([...prev, lineIndex]))

    // Find next line
    const nextIndex = lineIndex + 1
    if (nextIndex >= roleplay.scripted_dialogue.length) {
      setPageState('complete')
      return
    }

    // Play next avatar line
    setTimeout(() => playNextAvatarLine(nextIndex), 500)
  }

  const replayLine = (lineIndex: number) => {
    playLine(lineIndex)
  }

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    if (wordTimerRef.current) clearTimeout(wordTimerRef.current)
    setIsPlaying(false)
    setCurrentWordIndex(-1)
  }

  // ─── Render helpers ───────────────────────────────────────────────────────────

  const renderHighlightedText = (text: string, lineIndex: number, isActive: boolean) => {
    if (!isActive || currentWordIndex === -1) {
      // Check if any suggested phrase appears in this text
      const phrases = roleplay?.suggested_phrases || []
      let result = text
      phrases.forEach(phrase => {
        if (text.toLowerCase().includes(phrase.toLowerCase())) {
          result = result.replace(
            new RegExp(`(${phrase})`, 'gi'),
            '|||PHRASE_START|||$1|||PHRASE_END|||'
          )
        }
      })

      if (result.includes('|||PHRASE_START|||')) {
        const parts = result.split('|||PHRASE_START|||')
        return (
          <span>
            {parts.map((part, i) => {
              if (i === 0) return <span key={i}>{part}</span>
              const [highlighted, rest] = part.split('|||PHRASE_END|||')
              return (
                <span key={i}>
                  <mark className="phrase-highlight">{highlighted}</mark>
                  {rest}
                </span>
              )
            })}
          </span>
        )
      }
      return <span>{text}</span>
    }

    const words = text.split(' ')
    return (
      <span>
        {words.map((word, i) => (
          <span
            key={i}
            className={`word ${i === currentWordIndex ? 'word-active' : i < currentWordIndex ? 'word-done' : ''}`}
          >
            {word}{i < words.length - 1 ? ' ' : ''}
          </span>
        ))}
      </span>
    )
  }

  // ─── Loading ──────────────────────────────────────────────────────────────────

  if (pageState === 'loading') {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Loading roleplay...</p>
        <Style />
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-screen">
        <h2>⚠️ {error}</h2>
        <Link href="/dashboard" className="btn-primary">Back to dashboard</Link>
        <Style />
      </div>
    )
  }

  // ─── Complete screen ──────────────────────────────────────────────────────────

  if (pageState === 'complete') {
    return (
      <div className="complete-page">
        <div className="complete-card">
          <div className="complete-icon">🎉</div>
          <h2>Well done!</h2>
          <p>You completed the roleplay. Keep practising to build fluency and confidence.</p>
          <div className="complete-actions">
            <button
              onClick={() => {
                setPageState('ready')
                setCurrentLineIndex(-1)
                setCurrentWordIndex(-1)
                setCompletedLines(new Set())
                setPracticeLine(0)
                stopAudio()
              }}
              className="btn-outline"
            >
              🔄 Practise again
            </button>
            <Link href="/pricing" className="btn-gold">
              Try with AI partner →
            </Link>
            <Link href="/dashboard" className="btn-primary">
              Back to dashboard
            </Link>
          </div>
          <div className="upgrade-nudge">
            <p>Ready for a real conversation? Upgrade to Pro and practise with an AI partner who responds to anything you say.</p>
            <Link href="/pricing" className="btn-upgrade">Upgrade to Pro — $12/month →</Link>
          </div>
        </div>
        <Style />
      </div>
    )
  }

  // ─── Main render ─────────────────────────────────────────────────────────────

  return (
    <div className="page">
      {/* TOPBAR */}
      <div className="topbar">
        <Link href="/dashboard" className="back-btn">← Dashboard</Link>
        <div className="topbar-center">
          <span className="roleplay-title">{roleplay?.title}</span>
          <div className="roleplay-meta">
            <span className="cefr-badge" style={{ background: CEFR_COLORS[roleplay?.cefr_level || 'B1'] }}>
              {roleplay?.cefr_level}
            </span>
            <span>{roleplay?.category}</span>
            {pageState === 'practicing' && (
              <span className="role-badge">Your role: {assignedRole}</span>
            )}
          </div>
        </div>
        <div className="topbar-right">
          {isPlaying && (
            <button onClick={stopAudio} className="btn-stop">⏹ Stop</button>
          )}
        </div>
      </div>

      <div className="layout">
        {/* LEFT PANEL */}
        <div className="left-panel">
          <div className="situation-box">
            <div className="situation-label">Situation</div>
            <p>{roleplay?.situation}</p>
          </div>

          {/* AVATAR */}
          <div className="avatar-stage">
            <div className={`avatar-wrap ${currentLineIndex >= 0 && roleplay?.scripted_dialogue[currentLineIndex]?.speaker !== assignedRole ? 'speaking' : ''}`}>
              <div className="avatar-head" />
              <div className="avatar-shoulders" />
            </div>
            <div className="avatar-name">Alex</div>
            {currentLineIndex >= 0 && roleplay?.scripted_dialogue[currentLineIndex]?.speaker !== assignedRole && (
              <div className="speaking-label">🔊 Speaking...</div>
            )}
          </div>

          {/* SUGGESTED PHRASES */}
          <div className="phrases-box">
            <div className="phrases-label">💡 Suggested phrases</div>
            <div className="phrases-list">
              {roleplay?.suggested_phrases.map((phrase, i) => (
                <div key={i} className="phrase-chip">"{phrase}"</div>
              ))}
            </div>
          </div>

          {/* MODE INDICATOR */}
          <div className="mode-box">
            {pageState === 'ready' && (
              <div className="mode-ready">
                <div className="mode-icon">👂</div>
                <p>First, listen to the full conversation. Then practise your role.</p>
                <p className="mode-role">You will play <strong>Role {assignedRole}</strong></p>
              </div>
            )}
            {pageState === 'listening' && (
              <div className="mode-active">
                <div className="mode-icon">🎧</div>
                <p>Listen carefully to both roles...</p>
              </div>
            )}
            {pageState === 'practicing' && (
              <div className="mode-active">
                <div className="mode-icon">🎙️</div>
                <p>Now it's your turn! Read the highlighted lines out loud.</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL — TRANSCRIPT */}
        <div className="right-panel">
          {pageState === 'ready' ? (
            <div className="start-screen">
              <div className="start-icon">🎭</div>
              <h2>Ready to practise?</h2>
              <p>You'll listen to the full conversation first, then practise speaking <strong>Role {assignedRole}</strong>.</p>
              <div className="steps">
                <div className="step">
                  <span className="step-num">1</span>
                  <span>Listen to the full conversation</span>
                </div>
                <div className="step">
                  <span className="step-num">2</span>
                  <span>Practise speaking your role out loud</span>
                </div>
                <div className="step">
                  <span className="step-num">3</span>
                  <span>Upgrade to practise with an AI partner</span>
                </div>
              </div>
              <button onClick={startListening} className="btn-start">
                🎧 Listen first →
              </button>
            </div>
          ) : (
            <div className="transcript">
              {roleplay?.scripted_dialogue.map((line, i) => {
                const isAssignedRole = line.speaker === assignedRole
                const isCurrentlyPlaying = currentLineIndex === i
                const isPracticeTarget = pageState === 'practicing' && practiceLine === i && isAssignedRole
                const isCompleted = completedLines.has(i)
                const isVisible = pageState === 'listening'
                  ? i <= Math.max(currentLineIndex, 0)
                  : true

                if (!isVisible) return null

                return (
                  <div
                    key={i}
                    className={`chat-line ${isAssignedRole ? 'user-line' : 'avatar-line'} ${isCurrentlyPlaying ? 'playing' : ''} ${isPracticeTarget ? 'practice-target' : ''} ${isCompleted ? 'completed' : ''}`}
                  >
                    <div className="chat-label">
                      {isAssignedRole ? `You (Role ${assignedRole})` : 'Alex'}
                    </div>
                    <div className="chat-bubble">
                      {renderHighlightedText(line.text, i, isCurrentlyPlaying)}
                    </div>

                    {/* Practice controls for student lines */}
                    {pageState === 'practicing' && isAssignedRole && (
                      <div className="practice-controls">
                        {isPracticeTarget && !isCompleted && (
                          <>
                            <div className="read-prompt">👆 Read this line out loud</div>
                            <div className="practice-buttons">
                              <button
                                onClick={() => replayLine(i - 1 >= 0 ? i - 1 : 0)}
                                className="btn-replay"
                              >
                                🔁 Replay previous
                              </button>
                              <button
                                onClick={() => handleStudentLineDone(i)}
                                className="btn-done"
                              >
                                ✓ I said it →
                              </button>
                            </div>
                          </>
                        )}
                        {isCompleted && (
                          <div className="completed-badge">✅ Done</div>
                        )}
                      </div>
                    )}

                    {/* Replay button in listening mode */}
                    {pageState === 'listening' && isCurrentlyPlaying && (
                      <div className="playing-indicator">
                        <span /><span /><span />
                      </div>
                    )}
                  </div>
                )
              })}
              <div ref={transcriptEndRef} />

              {/* Listen again button */}
              {pageState === 'practicing' && (
                <div className="listen-again">
                  <button onClick={startListening} className="btn-listen-again">
                    🎧 Listen again from start
                  </button>
                </div>
              )}
            </div>
          )}
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
        --navy: #0a1628; --navy-mid: #112240;
        --gold: #c9a84c; --gold-light: #e8c76a;
        --white: #ffffff; --off-white: #f4f6f9;
        --text: #2d3748; --text-muted: #718096; --border: #e2e8f0;
      }
      body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: var(--off-white); }

      .loading-screen, .error-screen {
        min-height: 100vh; display: flex; flex-direction: column;
        align-items: center; justify-content: center; gap: 16px; color: var(--text);
      }
      .spinner { width: 40px; height: 40px; border: 3px solid var(--border); border-top-color: var(--gold); border-radius: 50%; animation: spin 0.8s linear infinite; }
      @keyframes spin { to { transform: rotate(360deg); } }

      /* TOPBAR */
      .topbar { display: flex; align-items: center; padding: 0 24px; height: 60px; background: var(--white); border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 10; gap: 16px; }
      .back-btn { font-size: 14px; color: var(--text-muted); text-decoration: none; flex-shrink: 0; }
      .back-btn:hover { color: var(--navy); }
      .topbar-center { flex: 1; text-align: center; }
      .roleplay-title { display: block; font-family: Georgia, serif; font-size: 16px; color: var(--navy); }
      .roleplay-meta { display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 12px; color: var(--text-muted); margin-top: 2px; }
      .cefr-badge { padding: 2px 8px; border-radius: 100px; font-size: 11px; font-weight: 700; color: var(--navy); }
      .role-badge { background: rgba(201,168,76,0.15); color: var(--gold); padding: 2px 8px; border-radius: 100px; font-size: 11px; font-weight: 600; }
      .topbar-right { flex-shrink: 0; }
      .btn-stop { background: #fff5f5; border: 1px solid #fed7d7; color: #e53e3e; padding: 6px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; }

      /* LAYOUT */
      .layout { display: grid; grid-template-columns: 300px 1fr; height: calc(100vh - 60px); }

      /* LEFT PANEL */
      .left-panel { background: var(--navy); padding: 20px; display: flex; flex-direction: column; gap: 16px; overflow-y: auto; }
      .situation-box { background: rgba(201,168,76,0.1); border: 1px solid rgba(201,168,76,0.2); border-radius: 10px; padding: 14px; }
      .situation-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: var(--gold); font-weight: 600; display: block; margin-bottom: 6px; }
      .situation-box p { font-size: 12px; color: rgba(255,255,255,0.8); line-height: 1.6; }

      .avatar-stage { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 12px 0; }
      .avatar-wrap { position: relative; display: flex; flex-direction: column; align-items: center; }
      .avatar-head { width: 60px; height: 60px; border-radius: 50%; background: var(--gold); border: 3px solid rgba(201,168,76,0.4); }
      .avatar-wrap.speaking .avatar-head { animation: speakPulse 1s ease-in-out infinite; box-shadow: 0 0 0 8px rgba(201,168,76,0.15); }
      @keyframes speakPulse { 0%,100% { box-shadow: 0 0 0 6px rgba(201,168,76,0.15); } 50% { box-shadow: 0 0 0 12px rgba(201,168,76,0.2); } }
      .avatar-shoulders { width: 88px; height: 40px; background: var(--navy-mid); border-radius: 44px 44px 0 0; margin-top: -4px; }
      .avatar-name { font-size: 13px; color: rgba(255,255,255,0.5); font-style: italic; }
      .speaking-label { font-size: 11px; color: var(--gold); }

      .phrases-box { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 12px; }
      .phrases-label { font-size: 11px; color: rgba(255,255,255,0.5); margin-bottom: 8px; font-weight: 600; }
      .phrases-list { display: flex; flex-direction: column; gap: 5px; }
      .phrase-chip { font-size: 11px; color: rgba(255,255,255,0.75); padding: 6px 8px; background: rgba(201,168,76,0.08); border: 1px solid rgba(201,168,76,0.15); border-radius: 6px; line-height: 1.4; }

      .mode-box { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 14px; }
      .mode-ready, .mode-active { display: flex; flex-direction: column; gap: 8px; }
      .mode-icon { font-size: 24px; }
      .mode-box p { font-size: 12px; color: rgba(255,255,255,0.7); line-height: 1.5; }
      .mode-role { color: var(--gold) !important; font-weight: 600; }

      /* RIGHT PANEL */
      .right-panel { display: flex; flex-direction: column; background: var(--white); overflow: hidden; }

      .start-screen { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px; padding: 48px; text-align: center; }
      .start-icon { font-size: 48px; }
      .start-screen h2 { font-family: Georgia, serif; font-size: 24px; color: var(--navy); }
      .start-screen p { font-size: 15px; color: var(--text-muted); line-height: 1.6; max-width: 400px; }
      .steps { display: flex; flex-direction: column; gap: 10px; width: 100%; max-width: 360px; }
      .step { display: flex; align-items: center; gap: 12px; background: var(--off-white); padding: 12px 16px; border-radius: 10px; font-size: 14px; color: var(--text); text-align: left; }
      .step-num { width: 24px; height: 24px; border-radius: 50%; background: var(--gold); color: var(--navy); font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
      .btn-start { background: var(--gold); color: var(--navy); border: none; padding: 14px 32px; border-radius: 10px; font-size: 16px; font-weight: 700; cursor: pointer; font-family: inherit; transition: all 0.2s; }
      .btn-start:hover { background: var(--gold-light); transform: translateY(-1px); }

      /* TRANSCRIPT */
      .transcript { flex: 1; overflow-y: auto; padding: 24px; display: flex; flex-direction: column; gap: 16px; }

      .chat-line { display: flex; flex-direction: column; gap: 4px; max-width: 75%; transition: all 0.3s; }
      .chat-line.avatar-line { align-self: flex-start; }
      .chat-line.user-line { align-self: flex-end; }
      .chat-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); padding: 0 4px; }
      .chat-line.user-line .chat-label { text-align: right; }

      .chat-bubble { padding: 12px 16px; border-radius: 16px; font-size: 15px; line-height: 1.7; }
      .chat-line.avatar-line .chat-bubble { background: var(--off-white); border: 1px solid var(--border); color: var(--text); border-bottom-left-radius: 4px; }
      .chat-line.user-line .chat-bubble { background: var(--navy); color: var(--white); border-bottom-right-radius: 4px; }
      .chat-line.playing .chat-bubble { box-shadow: 0 0 0 2px var(--gold); }
      .chat-line.practice-target .chat-bubble { box-shadow: 0 0 0 2px #68d391; background: #f0fff4; color: var(--text); }
      .chat-line.practice-target.user-line .chat-bubble { background: #f0fff4; color: var(--text); border-bottom-right-radius: 4px; }
      .chat-line.completed .chat-bubble { opacity: 0.6; }

      /* WORD HIGHLIGHTING */
      .word { transition: all 0.1s; }
      .word-active { background: rgba(201,168,76,0.4); border-radius: 3px; padding: 0 1px; font-weight: 600; }
      .word-done { opacity: 0.7; }
      .phrase-highlight { background: var(--gold); color: #0a1628 !important; border-radius: 4px; padding: 2px 6px; font-weight: 800; font-size: 1.02em; }
      /* PRACTICE CONTROLS */
      .practice-controls { margin-top: 8px; }
      .read-prompt { font-size: 13px; color: #276749; font-weight: 600; margin-bottom: 8px; }
      .practice-buttons { display: flex; gap: 8px; justify-content: flex-end; }
      .btn-replay { background: var(--off-white); border: 1px solid var(--border); color: var(--text-muted); padding: 7px 14px; border-radius: 8px; font-size: 13px; cursor: pointer; font-family: inherit; transition: all 0.2s; }
      .btn-replay:hover { border-color: var(--gold); color: var(--text); }
      .btn-done { background: #68d391; color: #22543d; border: none; padding: 7px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; transition: all 0.2s; }
      .btn-done:hover { background: #48bb78; }
      .completed-badge { font-size: 12px; color: #276749; text-align: right; margin-top: 4px; }

      .playing-indicator { display: flex; gap: 3px; align-items: flex-end; padding: 4px 0; }
      .playing-indicator span { width: 4px; background: var(--gold); border-radius: 2px; animation: soundWave 0.8s ease-in-out infinite; }
      .playing-indicator span:nth-child(1) { height: 8px; }
      .playing-indicator span:nth-child(2) { height: 14px; animation-delay: 0.15s; }
      .playing-indicator span:nth-child(3) { height: 8px; animation-delay: 0.3s; }
      @keyframes soundWave { 0%,100% { transform: scaleY(0.6); } 50% { transform: scaleY(1); } }

      .listen-again { padding: 16px; text-align: center; border-top: 1px solid var(--border); }
      .btn-listen-again { background: none; border: 1px solid var(--border); color: var(--text-muted); padding: 8px 18px; border-radius: 8px; font-family: inherit; font-size: 14px; cursor: pointer; transition: all 0.2s; }
      .btn-listen-again:hover { border-color: var(--gold); color: var(--text); }

      /* COMPLETE */
      .complete-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--off-white); padding: 32px; }
      .complete-card { background: var(--white); border: 1px solid var(--border); border-radius: 20px; padding: 48px; text-align: center; max-width: 500px; width: 100%; display: flex; flex-direction: column; gap: 20px; }
      .complete-icon { font-size: 56px; }
      .complete-card h2 { font-family: Georgia, serif; font-size: 28px; color: var(--navy); }
      .complete-card p { font-size: 15px; color: var(--text-muted); line-height: 1.6; }
      .complete-actions { display: flex; flex-direction: column; gap: 10px; }
      .btn-primary { background: var(--gold); color: var(--navy); border: none; padding: 12px 24px; border-radius: 10px; font-family: inherit; font-size: 15px; font-weight: 700; cursor: pointer; text-decoration: none; display: inline-block; transition: all 0.2s; }
      .btn-primary:hover { background: var(--gold-light); }
      .btn-outline { background: none; border: 1.5px solid var(--navy); color: var(--navy); padding: 12px 24px; border-radius: 10px; font-family: inherit; font-size: 15px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
      .btn-outline:hover { background: var(--navy); color: var(--white); }
      .btn-gold { background: var(--gold); color: var(--navy); border: none; padding: 12px 24px; border-radius: 10px; font-family: inherit; font-size: 15px; font-weight: 700; cursor: pointer; text-decoration: none; display: inline-block; transition: all 0.2s; }
      .btn-gold:hover { background: var(--gold-light); }
      .upgrade-nudge { background: var(--navy); border-radius: 14px; padding: 20px; display: flex; flex-direction: column; gap: 12px; }
      .upgrade-nudge p { font-size: 13px; color: rgba(255,255,255,0.7); line-height: 1.5; }
      .btn-upgrade { background: var(--gold); color: var(--navy); border: none; padding: 10px 20px; border-radius: 8px; font-family: inherit; font-size: 14px; font-weight: 700; cursor: pointer; text-decoration: none; display: inline-block; }

      @media (max-width: 768px) {
        .layout { grid-template-columns: 1fr; grid-template-rows: auto 1fr; }
        .left-panel { height: auto; }
      }
    `}</style>
  )
}
