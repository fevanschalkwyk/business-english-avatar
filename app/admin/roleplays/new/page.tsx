'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const CATEGORIES = ['Meetings', 'Negotiations', 'Presentations', 'Small Talk', 'Job Interviews', 'Performance Reviews']
const FUNCTIONS = ['Marketing', 'HR', 'Operations', 'Finance', 'Strategy', 'N/A']

interface DialogueLine {
  speaker: string
  text: string
}

export default function NewRoleplayPage() {
  const router = useRouter()
  const supabase = createClient()

  // Form fields
  const [title, setTitle] = useState('')
  const [situation, setSituation] = useState('')
  const [cefrLevel, setCefrLevel] = useState('B1')
  const [category, setCategory] = useState('Meetings')
  const [functionField, setFunctionField] = useState('N/A')
  const [assignedRole, setAssignedRole] = useState('B')
  const [suggestedPhrases, setSuggestedPhrases] = useState<string[]>(['', '', '', ''])
  const [dialogue, setDialogue] = useState<DialogueLine[]>([
    { speaker: 'A', text: '' },
    { speaker: 'B', text: '' },
  ])
  const [published, setPublished] = useState(false)

  // AI generation
  const [brief, setBrief] = useState('')
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // AI generate roleplay from brief
  async function handleGenerate() {
    if (!brief.trim()) {
      setError('Please enter a brief first.')
      return
    }
    setGenerating(true)
    setError('')

    try {
      const response = await fetch('/api/admin/generate-roleplay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief, cefrLevel, category, functionField }),
      })

      if (!response.ok) throw new Error('Generation failed')

      const data = await response.json()

      setTitle(data.title || '')
      setSituation(data.situation || '')
      setSuggestedPhrases(data.suggested_phrases || ['', '', '', ''])
      setDialogue(data.scripted_dialogue || [])
      setAssignedRole(data.assigned_role || 'B')
    } catch (err) {
      setError('AI generation failed. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  // Save roleplay
  async function handleSave() {
    if (!title.trim() || !situation.trim() || dialogue.length < 2) {
      setError('Please fill in title, situation, and at least 2 dialogue lines.')
      return
    }

    setSaving(true)
    setError('')

    const { error: saveError } = await supabase.from('roleplays').insert({
      title,
      situation,
      cefr_level: cefrLevel,
      category,
      function: functionField,
      assigned_role: assignedRole,
      suggested_phrases: suggestedPhrases.filter(p => p.trim()),
      scripted_dialogue: dialogue.filter(d => d.text.trim()),
      published,
      audio_generated: false,
      audio_files: [],
    })

    if (saveError) {
      setError('Save failed: ' + saveError.message)
      setSaving(false)
      return
    }

    setSuccess('Roleplay saved successfully!')
    setTimeout(() => router.push('/admin/roleplays'), 1500)
  }

  // Dialogue helpers
  function addLine() {
    const lastSpeaker = dialogue[dialogue.length - 1]?.speaker || 'A'
    setDialogue([...dialogue, { speaker: lastSpeaker === 'A' ? 'B' : 'A', text: '' }])
  }

  function removeLine(i: number) {
    setDialogue(dialogue.filter((_, idx) => idx !== i))
  }

  function updateLine(i: number, field: 'speaker' | 'text', value: string) {
    const updated = [...dialogue]
    updated[i] = { ...updated[i], [field]: value }
    setDialogue(updated)
  }

  function updatePhrase(i: number, value: string) {
    const updated = [...suggestedPhrases]
    updated[i] = value
    setSuggestedPhrases(updated)
  }

  const inputStyle = {
    width: '100%',
    backgroundColor: '#0a1628',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '8px',
    padding: '10px 14px',
    color: 'white',
    fontSize: '14px',
    fontFamily: 'inherit',
    outline: 'none',
  }

  const labelStyle = {
    display: 'block',
    fontSize: '12px',
    fontWeight: 600,
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    marginBottom: '6px',
  }

  const sectionStyle = {
    backgroundColor: '#0d1f3c',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '20px',
  }

  return (
    <div style={{ maxWidth: '900px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <h1 style={{ color: 'white', fontSize: '24px', fontFamily: 'Georgia, serif' }}>
          New Roleplay
        </h1>
        <a href="/admin/roleplays" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', textDecoration: 'none' }}>
          ← Back to list
        </a>
      </div>

      {/* AI Generation */}
      <div style={{ ...sectionStyle, borderColor: 'rgba(212,175,55,0.3)', backgroundColor: 'rgba(212,175,55,0.05)' }}>
        <div style={{ fontSize: '14px', fontWeight: 700, color: '#d4af37', marginBottom: '12px' }}>
          🤖 AI-Assisted Generation
        </div>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '16px', lineHeight: 1.5 }}>
          Describe the roleplay you want and AI will generate the full draft. You can edit everything after.
        </p>
        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>Brief</label>
          <textarea
            value={brief}
            onChange={e => setBrief(e.target.value)}
            placeholder="e.g. A B2 level negotiation roleplay where a supplier and buyer discuss pricing for a bulk order. The buyer wants a 15% discount."
            rows={3}
            style={{ ...inputStyle, resize: 'vertical' as const }}
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <div>
            <label style={labelStyle}>CEFR Level</label>
            <select value={cefrLevel} onChange={e => setCefrLevel(e.target.value)} style={inputStyle}>
              {CEFR_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} style={inputStyle}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Function</label>
            <select value={functionField} onChange={e => setFunctionField(e.target.value)} style={inputStyle}>
              {FUNCTIONS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          style={{
            backgroundColor: '#d4af37',
            color: '#0a1628',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 24px',
            fontWeight: 700,
            fontSize: '14px',
            cursor: generating ? 'not-allowed' : 'pointer',
            opacity: generating ? 0.7 : 1,
            fontFamily: 'inherit',
          }}
        >
          {generating ? '⏳ Generating...' : '✨ Generate roleplay'}
        </button>
      </div>

      {/* Metadata */}
      <div style={sectionStyle}>
        <div style={{ fontSize: '14px', fontWeight: 700, color: 'white', marginBottom: '16px' }}>Metadata</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Negotiating a Bulk Order Discount" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>CEFR Level</label>
            <select value={cefrLevel} onChange={e => setCefrLevel(e.target.value)} style={inputStyle}>
              {CEFR_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} style={inputStyle}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Function</label>
            <select value={functionField} onChange={e => setFunctionField(e.target.value)} style={inputStyle}>
              {FUNCTIONS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Assigned Student Role</label>
            <select value={assignedRole} onChange={e => setAssignedRole(e.target.value)} style={inputStyle}>
              <option value="A">A</option>
              <option value="B">B</option>
            </select>
          </div>
        </div>
        <div>
          <label style={labelStyle}>Situation</label>
          <textarea
            value={situation}
            onChange={e => setSituation(e.target.value)}
            placeholder="Describe the background context for this roleplay..."
            rows={4}
            style={{ ...inputStyle, resize: 'vertical' as const }}
          />
        </div>
      </div>

      {/* Suggested Phrases */}
      <div style={sectionStyle}>
        <div style={{ fontSize: '14px', fontWeight: 700, color: 'white', marginBottom: '16px' }}>
          Suggested Phrases (4-6)
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {suggestedPhrases.map((phrase, i) => (
            <input
              key={i}
              type="text"
              value={phrase}
              onChange={e => updatePhrase(i, e.target.value)}
              placeholder={`Phrase ${i + 1}`}
              style={inputStyle}
            />
          ))}
          <button
            onClick={() => setSuggestedPhrases([...suggestedPhrases, ''])}
            style={{ alignSelf: 'flex-start', background: 'none', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit' }}
          >
            + Add phrase
          </button>
        </div>
      </div>

      {/* Scripted Dialogue */}
      <div style={sectionStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'white' }}>
            Scripted Dialogue ({dialogue.length} lines)
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
            A = Avatar | B = Student (assigned role: {assignedRole})
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
          {dialogue.map((line, i) => (
            <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <select
                value={line.speaker}
                onChange={e => updateLine(i, 'speaker', e.target.value)}
                style={{ ...inputStyle, width: '60px', flexShrink: 0 }}
              >
                <option value="A">A</option>
                <option value="B">B</option>
              </select>
              <textarea
                value={line.text}
                onChange={e => updateLine(i, 'text', e.target.value)}
                placeholder={`Line ${i + 1}...`}
                rows={2}
                style={{ ...inputStyle, flex: 1, resize: 'vertical' as const }}
              />
              <button
                onClick={() => removeLine(i)}
                style={{ background: 'none', border: '1px solid rgba(229,62,62,0.3)', color: 'rgba(229,62,62,0.6)', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', flexShrink: 0, fontSize: '13px' }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={addLine}
          style={{ background: 'none', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit' }}
        >
          + Add line
        </button>
      </div>

      {/* Save */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '48px' }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            backgroundColor: '#d4af37',
            color: '#0a1628',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 32px',
            fontWeight: 700,
            fontSize: '15px',
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1,
            fontFamily: 'inherit',
          }}
        >
          {saving ? 'Saving...' : 'Save roleplay'}
        </button>

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
          <input
            type="checkbox"
            checked={published}
            onChange={e => setPublished(e.target.checked)}
            style={{ width: '16px', height: '16px' }}
          />
          Publish immediately
        </label>

        {error && <span style={{ color: '#fc8181', fontSize: '13px' }}>{error}</span>}
        {success && <span style={{ color: '#68d391', fontSize: '13px' }}>{success}</span>}
      </div>
    </div>
  )
}
