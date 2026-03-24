'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

// ─── Types ────────────────────────────────────────────────────────────────────

interface DialogueLine {
  speaker: 'avatar' | 'user'
  text: string
  hint?: string
  keywords?: string[]
}

interface Exercise {
  id: string
  title: string
  context: string
  dialogue: DialogueLine[]
}

// ─── Scenario Data ─────────────────────────────────────────────────────────────

const exercises: Exercise[] = [
  {
    id: 'opening-meeting',
    title: 'Opening a Meeting',
    context: 'You are chairing a team meeting. Your colleague, Alex, is ready to start.',
    dialogue: [
      { speaker: 'avatar', text: "Good morning, everyone's here. Should we get started?" },
      {
        speaker: 'user',
        text: "Right, let's get started. Thank you all for joining.",
        hint: "Start the meeting and thank participants",
        keywords: ['start', 'begin', 'thank', 'welcome', 'joining', 'agenda']
      },
      { speaker: 'avatar', text: "What's our main objective for today?" },
      {
        speaker: 'user',
        text: "Today's objective is to review Q3 results and align on our Q4 priorities.",
        hint: "State the meeting objective clearly",
        keywords: ['objective', 'goal', 'agenda', 'review', 'discuss', 'today', 'purpose']
      },
      { speaker: 'avatar', text: "How long do we have for this meeting?" },
      {
        speaker: 'user',
        text: "We have one hour. Let's make sure we stay on track.",
        hint: "State the time available and keep focus",
        keywords: ['hour', 'minutes', 'time', 'track', 'schedule', 'agenda']
      },
    ]
  },
  {
    id: 'presenting-data',
    title: 'Presenting Data',
    context: 'You are presenting the Q3 sales results to your manager.',
    dialogue: [
      { speaker: 'avatar', text: "Can you walk us through the Q3 numbers?" },
      {
        speaker: 'user',
        text: "Of course. If you look at slide three, you'll see our revenue grew by 12% year-on-year.",
        hint: "Reference your visual and highlight the key metric",
        keywords: ['slide', 'chart', 'revenue', 'growth', 'percent', 'increase', 'results', 'figures']
      },
      { speaker: 'avatar', text: "Impressive. What drove that growth?" },
      {
        speaker: 'user',
        text: "The main driver was our new enterprise segment, which contributed 60% of total new business.",
        hint: "Explain the key driver behind the result",
        keywords: ['driver', 'segment', 'contributed', 'because', 'due to', 'primarily', 'mainly']
      },
      { speaker: 'avatar', text: "Were there any underperforming areas?" },
      {
        speaker: 'user',
        text: "Yes, our SMB channel fell short of target by 8%. We're already addressing this with a new outreach programme.",
        hint: "Acknowledge the gap and explain your plan",
        keywords: ['fell', 'short', 'below', 'target', 'addressing', 'plan', 'improve', 'however']
      },
    ]
  },
  {
    id: 'handling-questions',
    title: 'Handling Questions',
    context: 'After your presentation, colleagues are asking questions.',
    dialogue: [
      { speaker: 'avatar', text: "Can you explain the methodology behind that forecast?" },
      {
        speaker: 'user',
        text: "Great question. We used a combination of historical data and market trends over the past 24 months.",
        hint: "Acknowledge the question and explain your approach",
        keywords: ['methodology', 'based on', 'used', 'historical', 'data', 'analysis', 'approach']
      },
      { speaker: 'avatar', text: "I'm not sure I follow. Can you clarify that?" },
      {
        speaker: 'user',
        text: "Certainly. What I mean is we looked at 24 months of sales data and adjusted for seasonal patterns.",
        hint: "Rephrase and simplify your explanation",
        keywords: ['mean', 'clarify', 'rephrase', 'simply put', 'in other words', 'what I mean']
      },
      { speaker: 'avatar', text: "That's a tough question. I don't want to put you on the spot." },
      {
        speaker: 'user',
        text: "No, it's a fair point. I'll look into that and follow up with you by end of day.",
        hint: "Commit to following up rather than guessing",
        keywords: ['follow up', 'get back', 'look into', 'check', 'confirm', 'end of day', 'tomorrow']
      },
    ]
  },
  {
    id: 'closing-meeting',
    title: 'Closing a Meeting',
    context: 'The meeting is coming to an end. You need to wrap up professionally.',
    dialogue: [
      { speaker: 'avatar', text: "We're running low on time. What are the next steps?" },
      {
        speaker: 'user',
        text: "Let me summarise. Sarah will finalise the budget by Friday, and Tom will prepare the client brief.",
        hint: "Summarise the action items with owners and deadlines",
        keywords: ['summarise', 'action', 'next steps', 'will', 'by', 'deadline', 'responsible']
      },
      { speaker: 'avatar', text: "Should we schedule a follow-up?" },
      {
        speaker: 'user',
        text: "Good idea. Let's reconvene next Tuesday at 10am to review progress.",
        hint: "Propose a specific time for the next meeting",
        keywords: ['schedule', 'reconvene', 'follow-up', 'next week', 'tuesday', 'monday', 'time']
      },
      { speaker: 'avatar', text: "Thanks for running this. Is there anything else?" },
      {
        speaker: 'user',
        text: "Nothing else from me. Thanks everyone — great discussion today. Have a good rest of your day.",
        hint: "Close positively and thank participants",
        keywords: ['thank', 'great', 'good work', 'close', 'end', 'meeting', 'everyone']
      },
    ]
  },
]

// ─── Utilities ────────────────────────────────────────────────────────────────

function scoreResponse(userInput: string, keywords: string[]): number {
  if (!keywords?.length) return 100
  const lower = userInput.toLowerCase()
  const hits = keywords.filter(k => lower.includes(k.toLowerCase())).length
  return Math.round((hits / keywords.length) * 100)
}

function checkSpeechSupport(): boolean {
  return typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MeetingsScenario() {
  const [exerciseIndex, setExerciseIndex] = useState(0)
  const [lineIndex, setLineIndex] = useState(0)
  const [userInput, setUserInput] = useState('')
  const [feedback, setFeedback] = useState<{ score: number; message: string } | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [sessionScores, setSessionScores] = useState<number[]>([])
  const [sessionComplete, setSessionComplete] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [startTime] = useState(Date.now())
  const [hasSpeechSupport] = useState(checkSpeechSupport)

  const recognitionRef = useRef<any>(null)
  const supabase = createClient()

  const currentExercise = exercises[exerciseIndex]
  const currentLine = currentExercise?.dialogue[lineIndex]
  const totalExercises = exercises.length
  const isUserTurn = currentLine?.speaker === 'user'
  const overallProgress = ((exerciseIndex * currentExercise?.dialogue.length + lineIndex) /
    exercises.reduce((a, e) => a + e.dialogue.length, 0)) * 100

  // Auto-advance avatar lines
  useEffect(() => {
    if (currentLine?.speaker === 'avatar') {
      const timer = setTimeout(() => advance(), 2200)
      return () => clearTimeout(timer)
    }
  }, [lineIndex, exerciseIndex])

  const advance = useCallback(() => {
    const exercise = exercises[exerciseIndex]
    if (lineIndex + 1 < exercise.dialogue.length) {
      setLineIndex(l => l + 1)
      setFeedback(null)
      setShowHint(false)
      setUserInput('')
    } else if (exerciseIndex + 1 < totalExercises) {
      setExerciseIndex(e => e + 1)
      setLineIndex(0)
      setFeedback(null)
      setShowHint(false)
      setUserInput('')
    } else {
      finishSession()
    }
  }, [exerciseIndex, lineIndex, totalExercises])

  const handleSubmit = useCallback(async () => {
    if (!userInput.trim() || !isUserTurn) return
    const line = currentLine as DialogueLine
    const score = scoreResponse(userInput, line.keywords || [])
    const message = score >= 80
      ? '✅ Excellent! Natural and professional.'
      : score >= 50
      ? '🟡 Good attempt. Try to include more key business phrases.'
      : '💡 Keep practising — use the hint to try again.'

    setSessionScores(s => [...s, score])
    setFeedback({ score, message })

    // Auto advance after feedback
    setTimeout(() => advance(), 2000)
  }, [userInput, isUserTurn, currentLine, advance])

  const finishSession = async () => {
    const avgScore = sessionScores.length > 0
      ? Math.round(sessionScores.reduce((a, b) => a + b, 0) / sessionScores.length)
      : 0
    const duration = Math.round((Date.now() - startTime) / 1000)

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('sessions').insert({
        user_id: user.id,
        scenario_id: 'meetings-presentations',
        score: avgScore,
        duration_seconds: duration,
        completed: true,
      })
    }
    setSessionComplete(true)
  }

  const startListening = () => {
    if (!hasSpeechSupport) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-GB'
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript
      setUserInput(transcript)
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

  const avgScore = sessionScores.length > 0
    ? Math.round(sessionScores.reduce((a, b) => a + b, 0) / sessionScores.length)
    : 0

  if (sessionComplete) {
    return (
      <div className="page">
        <div className="complete-screen">
          <div className="complete-icon">🎉</div>
          <h1>Session Complete!</h1>
          <p>You finished all {totalExercises} exercises in the Meetings & Presentations scenario.</p>
          <div className="final-score">
            <div className="score-ring">
              <span className="score-number">{avgScore}</span>
              <span className="score-label">Average score</span>
            </div>
          </div>
          <div className="score-breakdown">
            {sessionScores.map((s, i) => (
              <div key={i} className="score-row">
                <span>Response {i + 1}</span>
                <div className="score-bar">
                  <div className="score-fill" style={{ width: `${s}%`, background: s >= 80 ? '#48bb78' : s >= 50 ? '#f6ad55' : '#fc8181' }} />
                </div>
                <span className="score-pct">{s}%</span>
              </div>
            ))}
          </div>
          <div className="complete-actions">
            <button onClick={() => { setExerciseIndex(0); setLineIndex(0); setSessionScores([]); setSessionComplete(false); setFeedback(null); setUserInput(''); }} className="btn-outline">
              Practise again
            </button>
            <Link href="/dashboard" className="btn-primary">Back to dashboard →</Link>
          </div>
        </div>
        <Style />
      </div>
    )
  }

  return (
    <div className="page">
      {/* TOP BAR */}
      <div className="topbar">
        <Link href="/dashboard" className="back-btn">← Dashboard</Link>
        <div className="topbar-center">
          <span className="scenario-title">Meetings & Presentations</span>
          <span className="exercise-label">Exercise {exerciseIndex + 1}/{totalExercises}: {currentExercise.title}</span>
        </div>
        <div className="progress-pill">{Math.round(overallProgress)}% complete</div>
      </div>

      {/* PROGRESS BAR */}
      <div className="progress-bar-track">
        <div className="progress-bar-fill" style={{ width: `${overallProgress}%` }} />
      </div>

      <div className="scene">
        {/* AVATAR PANEL */}
        <div className="avatar-panel">
          <div className="context-box">
            <span className="context-label">Scene</span>
            <p>{currentExercise.context}</p>
          </div>

          <div className="avatar-stage">
            <div className="avatar-figure-wrap">
              <div className={`avatar-head ${currentLine?.speaker === 'avatar' ? 'speaking' : ''}`} />
              <div className="avatar-shoulders" />
              {currentLine?.speaker === 'avatar' && (
                <div className="speaking-indicator">
                  <span /><span /><span />
                </div>
              )}
            </div>
            <div className="avatar-name">Alex — Your Colleague</div>
          </div>

          <div className="dialogue-history">
            {currentExercise.dialogue.slice(0, lineIndex).map((line, i) => (
              <div key={i} className={`history-line ${line.speaker}`}>
                <span className="history-speaker">{line.speaker === 'avatar' ? 'Alex' : 'You'}</span>
                <p>{line.text}</p>
              </div>
            ))}
          </div>

          {/* CURRENT AVATAR LINE */}
          {currentLine?.speaker === 'avatar' && (
            <div className="current-line avatar-line">
              <div className="typing-dots">
                <span /><span /><span />
              </div>
              <p>{currentLine.text}</p>
            </div>
          )}
        </div>

        {/* USER PANEL */}
        <div className="user-panel">
          {isUserTurn ? (
            <>
              <div className="prompt-box">
                <div className="prompt-label">Your turn to speak</div>
                <p className="prompt-text">"{currentLine?.text}"</p>
                {showHint && (
                  <div className="hint-box">
                    💡 Hint: {currentLine?.hint}
                  </div>
                )}
              </div>

              <div className="input-section">
                {hasSpeechSupport && (
                  <button
                    onClick={isListening ? stopListening : startListening}
                    className={`mic-btn ${isListening ? 'listening' : ''}`}
                  >
                    <span className="mic-icon">{isListening ? '⏹' : '🎙️'}</span>
                    <span>{isListening ? 'Stop recording' : 'Speak your response'}</span>
                    {isListening && <span className="recording-dot" />}
                  </button>
                )}

                <div className="input-divider">
                  <span>{hasSpeechSupport ? 'or type below' : 'Type your response'}</span>
                </div>

                <textarea
                  value={userInput}
                  onChange={e => setUserInput(e.target.value)}
                  placeholder="Type your response in Business English..."
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
                  rows={4}
                />

                {feedback && (
                  <div className={`feedback-card ${feedback.score >= 80 ? 'good' : feedback.score >= 50 ? 'ok' : 'low'}`}>
                    <div className="feedback-score">{feedback.score}%</div>
                    <p>{feedback.message}</p>
                  </div>
                )}

                <div className="action-row">
                  <button onClick={() => setShowHint(true)} className="btn-ghost" disabled={showHint}>
                    💡 Show hint
                  </button>
                  <button onClick={handleSubmit} className="btn-primary" disabled={!userInput.trim() || !!feedback}>
                    Submit response →
                  </button>
                </div>
              </div>

              <div className="example-box">
                <div className="example-label">Model answer</div>
                <p className="example-text">{currentLine?.text}</p>
                <p className="example-note">This is a suggested response — your own phrasing is also valid!</p>
              </div>
            </>
          ) : (
            <div className="waiting-state">
              <div className="waiting-icon">👂</div>
              <p>Alex is speaking…</p>
              <p className="waiting-sub">Listen carefully and prepare your response.</p>
            </div>
          )}
        </div>
      </div>

      <Style />
    </div>
  )
}

function Style() {
  return (
    <style>{`
      * { box-sizing: border-box; margin: 0; padding: 0; }
      :root {
        --navy: #0a1628; --navy-mid: #112240; --gold: #c9a84c; --gold-light: #e8c76a;
        --white: #ffffff; --off-white: #f4f6f9; --text: #2d3748; --text-muted: #718096;
        --border: #e2e8f0;
      }
      body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: var(--off-white); }

      .page { min-height: 100vh; display: flex; flex-direction: column; }

      /* TOPBAR */
      .topbar { display: flex; align-items: center; padding: 0 24px; height: 60px; background: var(--white); border-bottom: 1px solid var(--border); gap: 16px; }
      .back-btn { font-size: 14px; color: var(--text-muted); text-decoration: none; flex-shrink: 0; }
      .back-btn:hover { color: var(--navy); }
      .topbar-center { flex: 1; text-align: center; }
      .scenario-title { display: block; font-family: Georgia, serif; font-size: 16px; color: var(--navy); }
      .exercise-label { font-size: 12px; color: var(--text-muted); }
      .progress-pill { font-size: 13px; font-weight: 600; color: var(--gold); background: rgba(201,168,76,0.1); padding: 4px 12px; border-radius: 100px; white-space: nowrap; }

      .progress-bar-track { height: 3px; background: var(--border); }
      .progress-bar-fill { height: 100%; background: var(--gold); transition: width 0.5s ease; }

      /* SCENE */
      .scene { flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 0; }

      /* AVATAR PANEL */
      .avatar-panel { background: var(--navy); padding: 28px; display: flex; flex-direction: column; gap: 20px; overflow-y: auto; max-height: calc(100vh - 63px); }
      .context-box { background: rgba(201,168,76,0.1); border: 1px solid rgba(201,168,76,0.2); border-radius: 10px; padding: 14px 16px; }
      .context-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: var(--gold); font-weight: 600; display: block; margin-bottom: 6px; }
      .context-box p { font-size: 13px; color: rgba(255,255,255,0.75); line-height: 1.5; }

      .avatar-stage { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 24px 0; }
      .avatar-figure-wrap { position: relative; display: flex; flex-direction: column; align-items: center; gap: 0; }
      .avatar-head {
        width: 72px; height: 72px; border-radius: 50%; background: var(--gold);
        border: 3px solid rgba(201,168,76,0.4); transition: all 0.3s;
      }
      .avatar-head.speaking { box-shadow: 0 0 0 6px rgba(201,168,76,0.2), 0 0 0 12px rgba(201,168,76,0.08); animation: speakPulse 1s ease-in-out infinite; }
      @keyframes speakPulse { 0%,100% { box-shadow: 0 0 0 6px rgba(201,168,76,0.2), 0 0 0 12px rgba(201,168,76,0.08); } 50% { box-shadow: 0 0 0 10px rgba(201,168,76,0.25), 0 0 0 20px rgba(201,168,76,0.1); } }
      .avatar-shoulders { width: 100px; height: 48px; background: var(--navy-mid); border-radius: 50px 50px 0 0; margin-top: -4px; }
      .speaking-indicator { position: absolute; top: -12px; right: -16px; display: flex; gap: 3px; align-items: flex-end; }
      .speaking-indicator span { width: 4px; background: var(--gold); border-radius: 2px; animation: soundWave 0.8s ease-in-out infinite; }
      .speaking-indicator span:nth-child(1) { height: 8px; animation-delay: 0s; }
      .speaking-indicator span:nth-child(2) { height: 14px; animation-delay: 0.15s; }
      .speaking-indicator span:nth-child(3) { height: 8px; animation-delay: 0.3s; }
      @keyframes soundWave { 0%,100% { transform: scaleY(0.6); } 50% { transform: scaleY(1); } }
      .avatar-name { font-size: 13px; color: rgba(255,255,255,0.5); font-style: italic; }

      /* DIALOGUE HISTORY */
      .dialogue-history { display: flex; flex-direction: column; gap: 10px; }
      .history-line { padding: 10px 12px; border-radius: 10px; }
      .history-line.avatar { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); }
      .history-line.user { background: rgba(201,168,76,0.08); border: 1px solid rgba(201,168,76,0.15); }
      .history-speaker { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; display: block; margin-bottom: 4px; }
      .history-line.avatar .history-speaker { color: rgba(255,255,255,0.4); }
      .history-line.user .history-speaker { color: var(--gold); }
      .history-line p { font-size: 13px; color: rgba(255,255,255,0.7); line-height: 1.5; }
      .history-line.user p { color: rgba(255,255,255,0.85); }

      .current-line { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); border-radius: 12px; padding: 16px; }
      .current-line p { font-size: 15px; color: var(--white); line-height: 1.6; }
      .typing-dots { display: flex; gap: 4px; margin-bottom: 8px; }
      .typing-dots span { width: 6px; height: 6px; border-radius: 50%; background: var(--gold); animation: typingBounce 1.2s ease-in-out infinite; }
      .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
      .typing-dots span:nth-child(3) { animation-delay: 0.4s; }
      @keyframes typingBounce { 0%,60%,100% { transform: translateY(0); } 30% { transform: translateY(-6px); } }

      /* USER PANEL */
      .user-panel { background: var(--white); padding: 28px; display: flex; flex-direction: column; gap: 20px; overflow-y: auto; max-height: calc(100vh - 63px); }

      .prompt-box { background: var(--off-white); border: 1px solid var(--border); border-radius: 12px; padding: 18px; }
      .prompt-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700; color: var(--navy); margin-bottom: 8px; }
      .prompt-text { font-family: Georgia, serif; font-size: 16px; color: var(--navy); line-height: 1.5; }
      .hint-box { margin-top: 12px; padding: 10px 14px; background: #fffbeb; border: 1px solid #fbd38d; border-radius: 8px; font-size: 13px; color: #744210; line-height: 1.5; }

      .input-section { display: flex; flex-direction: column; gap: 12px; }

      .mic-btn {
        display: flex; align-items: center; justify-content: center; gap: 10px;
        padding: 16px; border-radius: 12px; border: 2px dashed var(--border);
        background: var(--off-white); cursor: pointer; font-family: inherit;
        font-size: 15px; color: var(--text); transition: all 0.2s; width: 100%;
        position: relative;
      }
      .mic-btn:hover { border-color: var(--gold); background: rgba(201,168,76,0.05); }
      .mic-btn.listening { border-color: #fc8181; border-style: solid; background: #fff5f5; animation: recordingPulse 1s ease-in-out infinite; }
      @keyframes recordingPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(252,129,129,0.2); } 50% { box-shadow: 0 0 0 8px rgba(252,129,129,0.1); } }
      .mic-icon { font-size: 20px; }
      .recording-dot { position: absolute; top: 8px; right: 8px; width: 8px; height: 8px; border-radius: 50%; background: #fc8181; animation: blink 1s ease-in-out infinite; }
      @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }

      .input-divider { display: flex; align-items: center; gap: 12px; color: var(--text-muted); font-size: 12px; }
      .input-divider::before,.input-divider::after { content: ''; flex: 1; height: 1px; background: var(--border); }

      textarea {
        width: 100%; padding: 14px; border: 1.5px solid var(--border); border-radius: 10px;
        font-family: inherit; font-size: 15px; color: var(--text); resize: vertical;
        outline: none; transition: border-color 0.2s; line-height: 1.6;
      }
      textarea:focus { border-color: var(--navy); }

      .feedback-card { padding: 14px 16px; border-radius: 10px; display: flex; align-items: flex-start; gap: 12px; }
      .feedback-card.good { background: #f0fff4; border: 1px solid #9ae6b4; }
      .feedback-card.ok { background: #fffaf0; border: 1px solid #fbd38d; }
      .feedback-card.low { background: #fff5f5; border: 1px solid #fed7d7; }
      .feedback-score { font-family: Georgia, serif; font-size: 24px; font-weight: normal; color: var(--navy); flex-shrink: 0; }
      .feedback-card p { font-size: 14px; color: var(--text); line-height: 1.5; padding-top: 4px; }

      .action-row { display: flex; justify-content: space-between; gap: 12px; }
      .btn-ghost { background: none; border: 1px solid var(--border); color: var(--text-muted); padding: 10px 16px; border-radius: 8px; font-family: inherit; font-size: 14px; cursor: pointer; transition: all 0.2s; }
      .btn-ghost:hover:not(:disabled) { border-color: var(--gold); color: var(--text); }
      .btn-ghost:disabled { opacity: 0.4; cursor: not-allowed; }
      .btn-primary { background: var(--gold); color: var(--navy); border: none; padding: 10px 20px; border-radius: 8px; font-family: inherit; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
      .btn-primary:hover:not(:disabled) { background: var(--gold-light); }
      .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
      .btn-outline { background: none; border: 1.5px solid var(--navy); color: var(--navy); padding: 12px 24px; border-radius: 10px; font-family: inherit; font-size: 15px; font-weight: 500; cursor: pointer; text-decoration: none; display: inline-block; transition: all 0.2s; }
      .btn-outline:hover { background: var(--navy); color: var(--white); }

      .example-box { background: #f0fff4; border: 1px solid #9ae6b4; border-radius: 12px; padding: 16px; }
      .example-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; color: #22543d; margin-bottom: 8px; }
      .example-text { font-size: 14px; color: #22543d; line-height: 1.6; margin-bottom: 6px; font-style: italic; }
      .example-note { font-size: 12px; color: #276749; }

      /* WAITING STATE */
      .waiting-state { display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1; gap: 12px; text-align: center; padding: 48px; }
      .waiting-icon { font-size: 48px; }
      .waiting-state p { font-size: 18px; color: var(--navy); font-family: Georgia, serif; }
      .waiting-sub { font-size: 14px; color: var(--text-muted); }

      /* COMPLETE SCREEN */
      .complete-screen { max-width: 560px; margin: 64px auto; padding: 48px; background: var(--white); border-radius: 20px; border: 1px solid var(--border); text-align: center; }
      .complete-icon { font-size: 56px; margin-bottom: 20px; }
      .complete-screen h1 { font-family: Georgia, serif; font-size: 32px; color: var(--navy); margin-bottom: 12px; }
      .complete-screen > p { font-size: 16px; color: var(--text-muted); margin-bottom: 32px; }
      .final-score { margin-bottom: 32px; }
      .score-ring { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 120px; height: 120px; border-radius: 50%; border: 6px solid var(--gold); margin: 0 auto; }
      .score-number { font-family: Georgia, serif; font-size: 36px; color: var(--navy); }
      .score-label { font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
      .score-breakdown { display: flex; flex-direction: column; gap: 10px; margin-bottom: 32px; text-align: left; }
      .score-row { display: flex; align-items: center; gap: 12px; font-size: 13px; color: var(--text-muted); }
      .score-row span:first-child { width: 80px; flex-shrink: 0; }
      .score-bar { flex: 1; height: 8px; background: var(--border); border-radius: 4px; overflow: hidden; }
      .score-fill { height: 100%; border-radius: 4px; transition: width 0.5s; }
      .score-pct { width: 36px; text-align: right; font-weight: 600; color: var(--navy); }
      .complete-actions { display: flex; gap: 16px; justify-content: center; }

      @media (max-width: 768px) {
        .scene { grid-template-columns: 1fr; }
        .avatar-panel { max-height: none; }
        .user-panel { max-height: none; }
      }
    `}</style>
  )
}
