Two weeks changes everything. Here's the honest truth first.

---

## The Hard Truth About Your Deadline

With 2 weeks left, you cannot build WhatsApp integration properly. Meta's Business API verification alone takes 3-7 business days. If you start today you'll be waiting for approval during your submission window. That's a deadline killer.

Here's what you **can** build in 2 weeks that makes a stronger grant submission than half-built WhatsApp:

---

## The 2-Week UPCST Sprint Plan

```
Week 1 — Impact Metrics (what judges actually fund)
Week 2 — Polish + Demo Video + Submission
```

---

## Week 1 — Build What Judges Fund

### Day 1-2: Business Health Score
This is your highest-leverage feature for the grant. It creates a **measurable, repeatable impact metric** — exactly what UPCST evaluates.

**What to build:**

The score is entirely rule-based — no extra LLM calls needed. Calculate from data you already have in `user_profiles`:

```python
# services/health_score_service.py

def calculate_health_score(profile: UserProfile) -> dict:
    """
    Pure rule-based scoring — instant, no API calls.
    Returns score breakdown across 5 dimensions.
    """
    scores = {}
    recommendations = {}

    # 1. Scheme Utilization (0-20 points)
    # How many schemes has this user engaged with?
    # Pull from user_scheme_interactions count
    scheme_score = min(interactions_count * 5, 20)
    scores["scheme_utilization"] = scheme_score
    if scheme_score < 10:
        recommendations["scheme_utilization"] = (
            "You haven't applied to any schemes yet. "
            "PMEGP could give you up to ₹25L — ask MAYA about it."
        )

    # 2. Registration Compliance (0-20 points)
    reg_score = 0
    if profile.udyam_registered:        reg_score += 12
    if profile.turnover_range != "Not started": reg_score += 8
    scores["registration"] = reg_score
    if not profile.udyam_registered:
        recommendations["registration"] = (
            "Register on Udyam portal — it's free and unlocks "
            "10+ additional government schemes."
        )

    # 3. Financial Health (0-20 points)
    turnover_points = {
        "Not started": 0, "Under ₹10 Lakh": 8,
        "₹10L - ₹50L": 14, "₹50L - ₹5Cr": 18, "Above ₹5Cr": 20
    }
    fin_score = turnover_points.get(profile.turnover_range or "Not started", 0)
    loan_penalty = -5 if profile.existing_loan else 0
    scores["financial"] = max(0, fin_score + loan_penalty)

    # 4. Market Presence (0-20 points)
    # Based on sector and business age — proxy for market establishment
    sector_points = {
        "Technology": 18, "Food & Beverage": 15,
        "Textile & Garments": 15, "Healthcare": 16,
        "Handicrafts": 14, "Retail": 12, "Other": 10
    }
    market_score = sector_points.get(profile.sector or "Other", 10)
    scores["market_presence"] = market_score

    # 5. Growth Readiness (0-20 points)
    goal_points = {
        "Funding / Loan": 15, "Equipment / Machinery": 14,
        "Market Access": 16, "All of the above": 20,
        "Training / Skills": 12, "Brand Building": 13
    }
    growth_score = goal_points.get(profile.primary_goal or "", 10)
    scores["growth_readiness"] = growth_score

    total = sum(scores.values())

    return {
        "total_score": total,
        "max_score": 100,
        "grade": _get_grade(total),
        "dimensions": scores,
        "recommendations": recommendations,
        "eligible_scheme_count": _count_eligible_schemes(profile)
    }

def _get_grade(score: int) -> dict:
    if score >= 80: return {"label": "Excellent",  "color": "emerald"}
    if score >= 60: return {"label": "Good",        "color": "blue"}
    if score >= 40: return {"label": "Developing",  "color": "yellow"}
    return              {"label": "Getting Started","color": "orange"}
```

Add endpoint to `routers/user.py`:
```python
@router.get("/health-score")
async def get_health_score(
    db: AsyncSession = Depends(get_db),
    clerk_user_id: str = Depends(get_current_user_id)
):
    profile = await _get_profile(db, clerk_user_id)
    interactions = await _get_interaction_count(db, clerk_user_id)
    score_data = calculate_health_score(profile, interactions)
    return score_data
```

**Frontend — Health Score Card in dashboard:**

```tsx
// components/HealthScoreCard.tsx
export const HealthScoreCard = ({ score }: { score: HealthScore }) => {
    const dimensions = [
        { key: "scheme_utilization", label: "Scheme Access" },
        { key: "registration",       label: "Compliance" },
        { key: "financial",          label: "Financial Health" },
        { key: "market_presence",    label: "Market Presence" },
        { key: "growth_readiness",   label: "Growth Readiness" },
    ]

    return (
        <div className="bg-black/40 border border-emerald-500/20 
                       rounded-2xl p-6 space-y-6">
            {/* Score circle */}
            <div className="flex items-center gap-6">
                <div className="relative w-24 h-24">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                        <circle cx="50" cy="50" r="40"
                            fill="none" stroke="rgba(255,255,255,0.05)"
                            strokeWidth="8" />
                        <circle cx="50" cy="50" r="40"
                            fill="none" stroke="#10b981"
                            strokeWidth="8"
                            strokeDasharray={`${score.total_score * 2.51} 251`}
                            strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col 
                                   items-center justify-center">
                        <span className="text-2xl font-bold text-white">
                            {score.total_score}
                        </span>
                        <span className="text-xs text-gray-400">/ 100</span>
                    </div>
                </div>
                <div>
                    <p className="text-emerald-400 font-semibold text-lg">
                        {score.grade.label}
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                        {score.eligible_scheme_count} schemes you qualify for
                    </p>
                </div>
            </div>

            {/* Dimension bars */}
            <div className="space-y-3">
                {dimensions.map(dim => (
                    <div key={dim.key}>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-400">{dim.label}</span>
                            <span className="text-white font-medium">
                                {score.dimensions[dim.key]}/20
                            </span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-emerald-500 rounded-full 
                                           transition-all duration-700"
                                style={{
                                    width: `${(score.dimensions[dim.key] / 20) * 100}%`
                                }}
                            />
                        </div>
                        {score.recommendations[dim.key] && (
                            <p className="text-xs text-yellow-500/70 mt-1">
                                ↗ {score.recommendations[dim.key]}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
```

---

### Day 3-4: Outcome Tracking (your funding pitch numbers)

This is what UPCST actually funds — **evidence of impact**. Even with 5 test users, having real tracking in place is more credible than promising it.

```python
# Add to models.py
class OutcomeTracking(Base):
    __tablename__ = "outcome_tracking"

    id              = Column(UUID, primary_key=True, default=uuid.uuid4)
    clerk_user_id   = Column(String, ForeignKey("users.clerk_user_id"))
    scheme_id       = Column(Integer, ForeignKey("schemes.id"))
    draft_generated = Column(Boolean, default=False)
    draft_date      = Column(DateTime)
    submitted       = Column(Boolean, default=False)
    submit_date     = Column(DateTime)
    approved        = Column(Boolean)
    amount_approved = Column(Integer)   # in rupees
    reported_at     = Column(DateTime, default=datetime.utcnow)
```

Add a simple follow-up prompt in chat — 30 days after draft generation:

```python
# In scheme_agent_node — check for pending follow-ups
async def check_pending_followups(clerk_user_id: str, db: AsyncSession):
    """
    If user generated a draft 30+ days ago with no outcome reported,
    add a follow-up prompt to the top of their chat response.
    """
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    result = await db.execute(
        select(UserSchemeInteraction).where(
            UserSchemeInteraction.clerk_user_id == clerk_user_id,
            UserSchemeInteraction.application_status == "draft_generated",
            UserSchemeInteraction.updated_at <= thirty_days_ago
        )
    )
    pending = result.scalars().all()
    return pending  # frontend shows a "Did you submit?" banner
```

**Impact dashboard — add to your admin/settings view:**

```tsx
// Simple numbers display — this is your UPCST slide
const ImpactNumbers = () => (
    <div className="grid grid-cols-2 gap-4">
        {[
            { label: "Drafts Generated",    value: stats.drafts,   color: "emerald" },
            { label: "Applications Submitted", value: stats.submitted, color: "blue" },
            { label: "Schemes Accessed",    value: stats.schemes,  color: "purple" },
            { label: "Est. Funding Unlocked", value: `₹${stats.funding_cr}Cr`, color: "yellow" },
        ].map(stat => (
            <div key={stat.label}
                 className="bg-black/40 border border-white/10 
                           rounded-xl p-4 text-center">
                <p className={`text-2xl font-bold text-${stat.color}-400`}>
                    {stat.value}
                </p>
                <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
            </div>
        ))}
    </div>
)
```

---

### Day 5: Apply for WhatsApp Access (parallel, not building)

Don't build WhatsApp yet. **Apply for access today** so approval comes during Week 2:

1. Go to developers.facebook.com
2. Create Meta Business App → WhatsApp → Cloud API
3. Submit business verification with your college/project details
4. Add phone number for testing

This runs in background while you build other things. If approved before submission — great, mention it. If not — still mention it as "in verification" in your grant proposal.

---

## Week 2 — Polish + Grant Submission

### Day 6-7: Demo Flow Polish

Your demo video is worth more than any feature. Script it exactly:

```
0:00 - 0:20  Problem statement (text overlay)
             "90 lakh MSMEs. ₹12,000Cr in schemes. 8% access rate."

0:20 - 0:50  Signup + Onboarding
             Show the 3-step onboarding, data being collected

0:50 - 1:30  Scheme Discovery
             Type: "I want funding for my textile business in Lucknow"
             Show scheme cards appearing with match scores
             Click a scheme → eligibility check shows

1:30 - 2:00  Draft Generation
             Click Generate Draft → modal pre-filled from profile
             Fill 2-3 remaining fields → draft appears
             Download button → show the PDF

2:00 - 2:20  Health Score
             Show the score dashboard updating
             Show one recommendation linking to a scheme

2:20 - 2:30  Impact numbers
             Show the outcome tracking dashboard
             "X drafts generated, ₹X lakh in scheme access unlocked"
```

---

### Day 8-9: UPCST Proposal Writing

Your proposal needs these exact sections for UPCST:

```
1. Problem Statement with UP-specific data
   → 90L MSMEs in UP, ₹3,200Cr annual scheme budget,
     less than 8% utilization rate, cite MSME ministry data

2. Solution Architecture (one diagram)
   → Signup → Onboard → Chat → Scheme Match → 
     Eligibility Check → Draft Generate → Submit

3. Social Impact Metrics (your actual numbers)
   → Even 10 test users with drafts generated is real data
   → Project: 2,000 UP MSMEs in year 1

4. UP-Specific Alignment
   → ODOP scheme support (UP's flagship)
   → Vishwakarma Shram Samman coverage
   → Focus on Lucknow, Kanpur, Varanasi districts
   → Hindi language roadmap (even if not built yet)

5. Budget Breakdown
   → Server costs: ₹1,200/month × 12 = ₹14,400
   → API costs: ₹1,500/month × 12 = ₹18,000
   → Development: your time (no cost)
   → Total ask: ₹50,000-75,000 for year 1 infrastructure

6. Team + Institution
   → Your name, GITM affiliation, supervisor name
   → GitHub link showing active development
   → Live demo URL
```

---

### Day 10-12: Hindi Voice Input (minimal viable)

This is achievable in 2-3 days and is a massive grant differentiator:

```python
# routers/voice.py — minimal implementation
from fastapi import APIRouter, UploadFile, File, Depends
import httpx

router = APIRouter(prefix="/api/voice")

@router.post("/transcribe")
async def transcribe_hindi(
    audio: UploadFile = File(...),
    clerk_user_id: str = Depends(get_current_user_id)
):
    """
    Send audio to OpenAI Whisper API.
    Returns Hindi transcription + English translation.
    Cost: ~₹0.50 per minute of audio.
    """
    audio_bytes = await audio.read()

    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.openai.com/v1/audio/transcriptions",
            headers={"Authorization": f"Bearer {settings.OPENAI_API_KEY}"},
            files={"file": ("audio.webm", audio_bytes, "audio/webm")},
            data={
                "model": "whisper-1",
                "language": "hi",        # Hindi
                "response_format": "json"
            }
        )

    transcript = response.json()["text"]
    return {
        "transcript": transcript,
        "language": "hi"
    }
```

Frontend mic button — add to chat input:

```tsx
// In your chat input component
const [recording, setRecording] = useState(false)
const mediaRecorder = useRef<MediaRecorder | null>(null)

const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder.current = new MediaRecorder(stream)
    const chunks: Blob[] = []

    mediaRecorder.current.ondataavailable = e => chunks.push(e.data)
    mediaRecorder.current.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        const formData = new FormData()
        formData.append('audio', blob, 'voice.webm')

        const token = await getToken()
        const res = await fetch('/api/voice/transcribe', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        })
        const data = await res.json()
        setInputText(data.transcript)  // fills chat input with Hindi text
    }

    mediaRecorder.current.start()
    setRecording(true)
}

const stopRecording = () => {
    mediaRecorder.current?.stop()
    setRecording(false)
}

// In your input bar JSX:
<button
    onMouseDown={startRecording}
    onMouseUp={stopRecording}
    className={`p-2 rounded-lg transition-colors ${
        recording
            ? 'bg-red-500 text-white animate-pulse'
            : 'text-gray-400 hover:text-emerald-400'
    }`}
>
    <Mic size={18} />
</button>
```

---

## Complete 2-Week Checklist

```
WEEK 1
□ Day 1-2: Business Health Score
  □ health_score_service.py with rule-based calculation
  □ GET /api/user/health-score endpoint
  □ HealthScoreCard component with circular gauge
  □ Dimension bars with recommendations
  □ Score shown on dashboard/chat sidebar

□ Day 3-4: Outcome Tracking
  □ outcome_tracking table in DB + Alembic migration
  □ Auto-bookmark when draft generated
  □ Impact numbers dashboard (drafts, submissions, funding)
  □ 30-day follow-up detection in chat

□ Day 5: WhatsApp access application submitted to Meta

WEEK 2
□ Day 6-7: Demo video recorded (2:30 minutes, script above)
□ Day 8-9: UPCST proposal written (6 sections above)
□ Day 10-12: Hindi voice input (Whisper API + mic button)
□ Day 13-14: Final testing, submission

GRANT SUBMISSION PACKAGE
□ Live demo URL (deploy to Koyeb + Vercel if not already)
□ GitHub repo with clean README and demo GIF
□ 2:30 demo video uploaded to YouTube (unlisted)
□ Proposal PDF with impact metrics
□ Budget breakdown document
```

The single most important thing you can do today is record even a rough demo video and deploy a live URL. Judges who can click a link and try MAYA themselves will fund it over a polished PDF proposal with no working demo every single time.