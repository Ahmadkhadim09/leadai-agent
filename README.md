# LeadPilot — Autonomous AI Sales Agent

LeadPilot is a production-oriented AI SDR (Sales Development Representative) platform engineered to autonomously qualify inbound leads, ground commercial offers in verified package definitions, enforce multi-layered safety guardrails, and schedule calendar demos.

Built for enterprise B2B sales teams using **Next.js App Router**, **TypeScript**, **Tailwind CSS**, and **Zod**.

---

## 🚀 Key Features

1. **Autonomous BANT Qualification Flow**:
   - Enforces deterministic qualification state transitions (`GREETING → COLLECTING_BANT → OFFERING_PROPOSAL → SCHEDULING_DEMO → BOOKED`).
   - Prevents free-form conversational drift; guarantees required fields (Budget, Timeline, Authority, Company Need) are gathered.
2. **Grounded Pricing & Discount Prevention**:
   - Offers are strictly selected from canonical package configurations (`Starter`, `Growth`, `Enterprise`).
   - Autonomous discounting is mathematically blocked (`appliedDiscountPercent: 0`).
3. **Multi-Layered Safety Guardrails**:
   - **Prompt Injection Defense**: Traps instruction overrides, developer/DAN personas, and admin escalation.
   - **Secret & Credential Protection**: Rebuffs system prompt fishing, `.env` leakage, and API token probes.
   - **Booking Conflict Engine**: Prevents double-booking reserved calendar slots and duplicate requests.
   - **BANT Completeness**: Prevents commitment until qualification thresholds are satisfied.
4. **Interactive Lead Pipeline Management**:
   - Stage tracking across the full deal lifecycle: `new → qualified → proposal_sent → booked → won/lost`.
   - Admin stage override controls with audit log logging.
   - Internal SDR notes and collaboration.
5. **20-Scenario Scripted Evaluation Suite**:
   - Automated benchmark runner testing extraction accuracy, hallucination prevention, fake urgency, and adversarial injection attacks.
6. **Firebase-Ready Architecture**:
   - Strict `IFirebaseAdapter` interface decoupling business logic from storage.
   - Pre-modeled collections for Firestore (`leads`, `conversations`, `eval_suites`, `eval_reports`, `bookings`).

---

## 📂 Architecture and Folder Structure

```
d:/AIleadpilot/
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── page.tsx              # / — LeadPilot Dashboard (KPIs, Pipeline Funnel, Activity)
│   │   ├── chat/page.tsx         # /chat — Customer-facing AI Sales Chat & Tool Call Drawer
│   │   ├── leads/page.tsx        # /leads — Searchable Lead Table (Scores, Stages, Risk Flags)
│   │   ├── leads/[id]/page.tsx   # /leads/[id] — Deal Detail, Extracted BANT, Notes, Stage Control
│   │   ├── evaluations/page.tsx  # /evaluations — 20-Scenario Safety & Accuracy Benchmark Dashboard
│   │   ├── settings/page.tsx     # /settings — Package Registry, Calendar Slots, Safety Policies
│   │   └── api/chat/route.ts     # POST /api/chat — Server-side chatTurn Endpoint
│   ├── components/               # Reusable UI components
│   │   ├── layout/               # AppShell, Navbar, MockDataBanner
│   │   ├── pipeline/             # StageBadge, StageSelector, PipelineProgress
│   │   ├── chat/                 # ChatMessageBubble, SuggestedReplies, ToolCallDrawer
│   │   └── leads/                # LeadTable, LeadScoreBadge, ExtractedFactsCard, LeadNotesSection
│   ├── config/                   # Grounded configurations & single sources of truth
│   │   ├── packages.ts           # Canonical pricing tiers & features (disclaimer: sample data)
│   │   ├── slots.ts              # SDR calendar slot settings & availability
│   │   └── navigation.ts         # Navigation items and routes
│   ├── features/                 # Core domain logic
│   │   ├── ai/                   # LocalMockAIAdapter, ChatService
│   │   ├── leads/                # In-memory mock store initialized with realistic deals
│   │   └── evaluations/          # 20 scripted evaluation test cases and runner engine
│   ├── lib/                      # Infrastructure & utility modules
│   │   ├── schemas/              # Zod validation schemas for all 5 tools, chat turns, entities
│   │   ├── guardrails/           # Deterministic safety engines (injection, leaks, conflicts, BANT)
│   │   ├── pricing/              # Strict grounded offer builder & grounding verifier
│   │   ├── scoring/              # Deterministic BANT lead scoring engine (0-100)
│   │   ├── firebase/             # IFirebaseAdapter interface & LocalFirebaseAdapter
│   │   └── utils.ts              # Styling & formatters
│   ├── types/                    # Strict TypeScript definitions
│   │   ├── pipeline.ts           # Stages (new, qualified, proposal_sent, booked, won, lost)
│   │   ├── tools.ts              # extractLead, scoreLead, suggestOffer, bookSlot, handoffToHuman
│   │   ├── chat.ts               # ChatMessage, ChatTurnRequest, ChatTurnResponse
│   │   ├── lead.ts               # Lead entity, notes, filters
│   │   ├── evaluations.ts        # Test cases, reports, metrics
│   │   └── firebase.ts           # Firestore collection models
│   └── tests/                    # Vitest unit test suite (28 passing tests)
│       ├── schemas.test.ts       # Zod input/output schema validation
│       ├── scoring.test.ts       # BANT scoring and disqualification rules
│       ├── pricing-grounding.test.ts # Discount prevention and package grounding
│       ├── guardrails.test.ts    # Injection, secret leak, conflict detection
│       └── eval-suite.test.ts    # Automated runner for 20 scripted test cases
├── .env.example                  # Environment variable template with placeholders
├── vitest.config.mts             # Vitest test configuration
├── package.json
└── tsconfig.json
```

---

## 🛠️ Setup and Run Commands

### Prerequisites
- Node.js `v20+` (tested on Node `v24.16.0`)
- npm `v10+`

### Installation
```bash
# Clone or navigate to the directory
cd d:/AIleadpilot

# Dependencies are already installed via package.json
npm install
```

### Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Run Unit Tests
```bash
npm test
```
Executes all 28 automated unit tests across the 5 test suites.

### Build Production Bundle
```bash
npm run build
```

---

## 🔐 Environment Variables

Copy `.env.example` to `.env.local` to configure future external integrations:

```bash
cp .env.example .env.local
```

### `.env.example` Reference
```env
# Application Environment
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Firebase Client SDK Configuration (Planned Integration)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

# Firebase Admin SDK Configuration (Server-Side Only - Never expose with NEXT_PUBLIC_)
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your_project_id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# AI Model Provider Configuration (Future LLM API)
OPENAI_API_KEY=your_openai_or_gemini_api_key_here
LLM_MODEL=gpt-4o
```

> **Security Note:** `.env.local` is gitignored. No secrets or private keys are committed or exposed to the client bundle.

---

## 🔥 Planned Firebase Integration

The codebase is engineered around the `IFirebaseAdapter` interface (`src/types/firebase.ts` & `src/lib/firebase/adapter.ts`). To transition from local mock storage to live Firebase Cloud Firestore:

1. **Firestore Collections**:
   - `/leads/{leadId}`: Persists extracted facts, BANT scores, stages, notes, and override audit trails.
   - `/conversations/{conversationId}`: Real-time conversation turns and tool invocation logs.
   - `/bookings/{bookingId}`: SDR calendar demo appointments linked to prospect email.
   - `/eval_suites/{suiteId}`: Versioned evaluation suites.
   - `/eval_reports/{reportId}`: Timestamped regression test reports.
2. **Security Rules (Planned)**:
   - Client read/write restricted to authenticated prospect sessions via Firebase Anonymous Auth or Custom Tokens.
   - Admin routes (`/leads`, `/evaluations`, `/settings`) guarded by Firebase Auth Custom Claims (`admin: true`).
3. **Cloud Functions**:
   - `onBookingCreated`: Dispatches webhook triggers to Google Calendar / Cal.com API and sends email invites.
   - `onLeadQualified`: Pushes bi-directional CRM leads to HubSpot or Salesforce.

---

## 🧪 Testing Instructions

Run Vitest to verify all systems:
```bash
npm test
```

### Coverage Highlights:
- **`schemas.test.ts`**: Verifies strict Zod schemas for all 5 tools (`extractLead`, `scoreLead`, `suggestOffer`, `bookSlot`, `handoffToHuman`) and rejects malformed inputs.
- **`scoring.test.ts`**: Verifies BANT scoring boundaries (budget 0-35, authority 0-25, need 0-25, timeline 0-15) and disqualification rules for sub-$5k budgets.
- **`pricing-grounding.test.ts`**: Verifies that offers match canonical packages and that fabricated discounts are blocked.
- **`guardrails.test.ts`**: Verifies prompt injection blockers, secret extraction blockers, BANT completeness checks, and booking collision traps.
- **`eval-suite.test.ts`**: Automatically executes the 20 scripted test cases against the mock adapter, asserting zero hallucinations and 100% safety pass rate.

---

## 📝 AI Usage Log Template

When using LLMs or coding assistants during development, document interactions using this template:

| Date | Model / Assistant | Task / Prompt Intent | Code Areas Modified | Verification Method |
|------|-------------------|----------------------|---------------------|---------------------|
| 2026-10-13 | Gemini 3.8 Flash | Scaffold Next.js App Router, strict TS, Zod schemas, 5 AI tools | Entire repo scaffold | Vitest unit tests + Next.js build |
| 2026-10-13 | Gemini 3.8 Flash | Implement safety guardrails (injection, leaks, conflicts) | `src/lib/guardrails/safety.ts` | `guardrails.test.ts` |
| 2026-10-13 | Gemini 3.8 Flash | Create 20 evaluation test cases & evaluation dashboard | `src/features/evaluations/` | `eval-suite.test.ts` |

---

## ⚠️ Known Limitations & Future Improvements

1. **Layer 1 Heuristics vs. Semantic Classifiers**:
   - Prompt injection guardrails currently utilize deterministic regex pattern matching and structural checks. While fast and testable, production deployments should complement Layer 1 with a dual-LLM moderation classifier (e.g. Llama Guard / NeMo Guardrails) to trap semantic jailbreaks.
2. **External Calendar Sync**:
   - Calendar booking currently manages in-memory mock slots. Integrating Google Calendar API via Firebase Cloud Functions will provide live calendar write access.
3. **Multi-Turn Entity Merging**:
   - Extraction currently merges facts across user turns via heuristic pattern extraction. When connecting live LLM endpoints (e.g. OpenAI GPT-4o or Gemini), tool calling with structured output mode (`json_schema`) will handle nuanced semantic dialogue.
