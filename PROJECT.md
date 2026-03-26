# BusinessEnglishAI — Project Brief

## Overview
A web platform for Business English roleplay learning using AI avatars.
Target audience: non-native English speakers, individual learners and small businesses.

## Live URLs
- Production: https://business-english-avatar.vercel.app
- GitHub: https://github.com/fevanschalkwyk/business-english-avatar
- Supabase: https://odmtknznixghcrypcamn.supabase.co

## Tech Stack
- **Frontend:** Next.js 16, TypeScript
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (email/password)
- **AI conversation:** Groq (abstracted for easy provider switching)
- **Voice (free tier):** Azure TTS (pre-recorded, stored, free tier)
- **Voice (paid tier):** Azure TTS at launch, switchable to ElevenLabs once revenue covers cost
- **Email:** Resend
- **Payments:** Paddle
- **Deployment:** Vercel

## Business Model
Freemium subscription with per-roleplay one-time payment option.
Zero infrastructure cost until first paying user.
B2B outreach to small businesses and language schools as primary early revenue strategy.

## Pricing
- **Free tier:** 3 new roleplays unlocked per week, permanently unlocked
  once accessed, unlimited retries
- **Single roleplay ($3):** Unlocks that specific roleplay permanently +
  adds 3 bonus unlocks. 20 minutes of AI conversation time
- **Pro subscription ($12/month):** Full access to ALL roleplays for
  duration of subscription. 160 minutes of AI conversation included per month
- **Add-on pack:** 60 extra minutes for $4
- **Teams/B2B:** Custom pricing (Phase 8)

## Session Rules
- Maximum 20 minutes per session
- Monthly time tracked to the second, displayed as "X minutes remaining"
- Monthly minutes reset on the 1st of each month
- Ending a session early does not waste remaining session time —
  only actual minutes used are deducted

## Subscription Management
- Subscription can be paused for 1 month (retains access until pause date,
  resumes automatically)
- Easy cancellation in account settings — no friction
- Pausing preferred over cancelling — reduces churn

## Terminology
- Use "roleplay" everywhere (NOT "scenario")
- "Scenario" is only used to refer to the background/situation within a roleplay

## Roleplay Format
Each roleplay consists of:
- **Situation:** Background context for the roleplay
- **Suggested phrases:** 4-6 phrases to encourage use during conversation
- **Scripted dialogue:** Used for free tier listen-and-repeat experience
- **Tags:** CEFR level (A1-C2), Category, Function, published status

### Roleplay Tags
- **CEFR level:** A1, A2, B1, B2, C1, C2
- **Category:** Meetings, Negotiations, Presentations, Small Talk, Job Interviews, Performance Reviews (more added over time)
- **Function:** Marketing, HR, Operations, Finance, Strategy, N/A (more added over time)

## Free Tier Experience
1. Student is assigned a role (no choice)
2. Full conversation plays automatically — both roles voiced by pre-recorded
   Azure TTS. Conversation transcript displays in a single column chat-style
   layout (like iMessage) — avatar lines and student lines together, top to
   bottom. Student does not need to look left/right. Avatar visual stays in a
   separate panel above or beside.
3. Word-by-word highlighting as audio plays
4. Suggested phrases highlighted when they appear in conversation
5. Conversation replays — avatar speaks assigned role, student reads their
   lines out loud. Pre-recorded audio for student's part does not play.
   Conversation transcript displays as above.
6. No voice storage, no playback of student voice
7. Unlimited retries on unlocked roleplays
8. 3 new roleplays unlocked per week, student chooses which ones from
   filtered library. Permanently unlocked once accessed.
9. Prompt to upgrade at end of session

## Paid Tier Experience
1. Live AI avatar conversation powered by Groq
2. Avatar speaks with Azure TTS voice (slow, natural pace) — switchable to ElevenLabs
3. Pre-generated audio used for predictable avatar lines (opening, closing,
   transitions) to reduce latency and API costs. Only dynamic AI responses
   use live TTS conversion.
4. Suggested phrases visible and highlighted when relevant
5. Student speaks freely, encouraged to use suggested phrases
6. Avatar shows "thinking" animation + "[Name] is thinking..." text during
   AI processing (3-6 sec) to make latency feel natural
7. Session limited to 20 minutes
8. CEFR feedback after session:
   - Accuracy (A1-C2)
   - Range (A1-C2)
   - Interaction (A1-C2)
   - Fluency — to be added later (requires audio analysis)
   - Overall score (A1-C2)
   - 3-5 grammar/structure corrections
   - New vocabulary list
   - Student notes field (save personal observations alongside AI feedback)
9. Feedback saved to account and emailed via Resend
10. Retry/redo flow with score comparison over time

## Avatar Design
- Free tier: 2D animated avatar
- Paid tier: 2D avatar (3D Ready Player Me avatar — future phase)
- Avatar speaks at slow but natural pace (not unnaturally slow)
- Avatar shows thinking animation during AI processing

## Additional Features
- Onboarding flow after signup → straight into first roleplay
- Level placement on signup (short quiz or self-assessment)
- Progress tracking showing improvement over time
- Favourites — save/bookmark roleplays
- Retry/redo with score comparison
- Demo video/interactive demo on landing page showing full paid conversation
- Search and filter by CEFR level, category, function (once 20+ roleplays exist)
- Mobile optimised throughout
- Offline/low-bandwidth support — free tier audio progressively downloaded,
  "download roleplay" feature for offline practice (Phase 7)
- Student notes — personal notes field on feedback page, saved to Supabase

## AI and Voice Provider Strategy
- All AI calls abstracted into a single provider function for easy switching
- All TTS calls abstracted into a single provider function for easy switching
- Switching providers (e.g. Groq → Claude → OpenAI) requires changing one file only
- Same abstraction applies to TTS voice provider (Azure → ElevenLabs)
- Current AI: Groq
- Current TTS: Azure (free tier), ElevenLabs when revenue allows

## Admin Panel (Phase 6)
- Add roleplays manually via form
- AI-assisted draft generation (type a brief, AI generates full roleplay)
- Generate and store audio files per roleplay line (Azure TTS, one-time)
- Publish/draft toggle
- Edit/delete existing roleplays
- Basic cost monitoring dashboard (API spend vs revenue)

## Cost Strategy
- Free tier voice: Azure TTS free tier (500,000 chars/month) — $0
- Paid tier voice: Azure TTS at launch, switch to ElevenLabs at 10+ paying users
- Usage caps enforced by app code (not API provider):
  - 20 minutes max per session
  - 8 sessions included per month on Pro
- Monitor cost per user monthly
- Set spend alerts at 60% of monthly revenue
- Upgrade triggers:
  - 10 paying users → ElevenLabs Creator $22/month
  - 50 paying users → ElevenLabs Pro $99/month

## Database Tables (Supabase)
- `profiles` — id, email, full_name, tier, subscription_tier, created_at
- `sessions` — id, user_id, roleplay_id, score, duration_seconds, completed, created_at
- `progress` — user progress tracking
- `roleplays` — id, title, situation, suggested_phrases, scripted_dialogue,
  cefr_level, category, function, published, created_at (Phase 3)
- `favourites` — user_id, roleplay_id, created_at (Phase 7)
- `feedback` — session feedback, CEFR scores, student notes (Phase 3)
- `unlocks` — user_id, roleplay_id, unlocked_at (Phase 4)

## Phase Plan

### ✅ Phase 1 — Foundation (COMPLETE)
- Next.js 16 + TypeScript project
- Vercel deployment
- Supabase connection
- Database tables: profiles, sessions, progress

### ✅ Phase 2 — Free Tier Foundation (COMPLETE)
- Landing page (navy/white/gold)
- Email/password authentication
- Dashboard
- Meetings & Presentations scripted roleplay (temporary — replaced in Phase 3)
- Route protection via proxy middleware
- Session saving to Supabase

### 🔄 Phase 3 — Roleplay Engine + AI Conversation (COMPLETE)
- Redesign database for roleplay format
- `roleplays` and `feedback` tables in Supabase
- Roleplay page fetches from database (not hardcoded)
- Groq AI conversation integration (abstracted provider function)
- Azure TTS voice integration — abstracted provider function (paid tier)
- Pre-generated audio for predictable avatar lines
- Avatar thinking animation during AI processing
- CEFR feedback engine (Accuracy, Range, Interaction — Fluency later)
- Student notes field on feedback page
- Resend email feedback
- Usage tracking (session count, 20-min time limit)
- Update all "scenario" language to "roleplay" across site

### ✅ Phase 4 — Free Tier Audio (COMPLETE)
- Pre-recorded audio generation per roleplay (Azure TTS)
- Audio storage in Supabase Storage
- Word-by-word highlighting synced to audio
- Suggested phrase highlighting
- Assigned role experience
- Single column chat-style transcript layout
- Listen-first then practice flow
- 3 roleplays/week unlock system
- `unlocks` table in Supabase

### 🔄 Phase 5 — Payments
- Paddle subscription ($12/month) — full roleplay access
- Paddle one-time payment ($3/roleplay) — unlocks roleplay + 3 bonus unlocks
- Add-on session packs ($4 for 5 sessions)
- Frictionless payment flow
- Upgrade prompts at natural points
- Pause subscription feature
- Easy cancellation in account settings

### 🔄 Phase 6 — Admin Panel
- Manual roleplay entry form
- AI-assisted roleplay generation
- Audio generation and storage per roleplay
- Publish/draft toggle
- Edit/delete existing roleplays
- Search and filter UI (once 20+ roleplays)
- Basic cost monitoring dashboard

### 🔄 Phase 7 — Polish and Retention
- Onboarding flow (signup → first roleplay immediately)
- Level placement quiz on signup
- Progress visualisation (improvement over time)
- Retry/redo with score history
- Favourites
- Mobile optimisation
- Real testimonials — collect 5 beta user quotes before launch
- Replace placeholder company logos with real ones or remove
- Demo video/interactive demo on landing page
- Offline/low-bandwidth support — download roleplay for offline practice
- Student notes saved to Supabase
- Switch to ElevenLabs for paid tier voice (when revenue allows)

### 🔄 Phase 8 — B2B
- Teacher dashboard
- Bulk seat pricing
- Assign roleplays to students
- Student progress reports
- Pronunciation feedback (requires audio analysis)
- Fluency scoring (requires audio analysis)

## Content Goals
- Target: 100 roleplays at launch
- Minimum 15-20 roleplays across 4-5 categories before launch
- Use admin panel AI assistant to generate drafts, curate manually
- ~5-10 minutes per roleplay for review and editing