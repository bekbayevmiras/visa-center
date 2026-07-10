# VISA CENTER — Architecture Decisions

## Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| Frontend | Next.js 14 App Router | RSC + streaming, SEO-friendly, Vercel-native |
| Styling | Tailwind CSS + shadcn/ui | Speed + consistency |
| Animations | Framer Motion | Production-grade micro-interactions |
| Forms | React Hook Form + Zod | Type-safe validation, no re-renders |
| Auth | Supabase Auth | Email + Google out of the box, JWT |
| Database | Supabase (PostgreSQL) | RLS, Realtime, Storage in one |
| AI Agents | Anthropic Claude API | claude-haiku-4-5 for fast ops, claude-opus-4-8 for complex |
| Agent Orchestration | LangChain + LangGraph | State machine for multi-step agent flows |
| WhatsApp | Green API / 360dialog | WhatsApp Business API for KZ market |
| Payments | Kaspi Pay + CloudPayments | Primary KZ payment methods |
| Email | Resend | Transactional, developer-friendly |
| OCR | AWS Textract | Accurate doc parsing (passport, bank statements) |
| Queues | Upstash Redis + Celery | Background jobs for agents & notifications |
| Monitoring | Sentry + PostHog | Error tracking + behavioral analytics |
| Deploy FE | Vercel | Zero-config Next.js |
| Deploy BE | Railway | FastAPI + Celery workers |

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    CLIENTS                          │
│  Web (Next.js PWA)  │  WhatsApp  │  Telegram        │
└──────────┬──────────┴─────┬──────┴───────┬──────────┘
           │                │              │
           ▼                ▼              ▼
┌─────────────────────────────────────────────────────┐
│              Next.js API Routes / FastAPI            │
│  /api/applications  /webhooks/whatsapp  /api/agents  │
└──────────┬──────────────────────────────────────────┘
           │
    ┌──────┴──────┐
    ▼             ▼
Supabase       Redis Queue
(DB + Auth    (Background
 + Storage     Jobs)
 + Realtime)        │
                    ▼
              AI Agents (7)
              ├── Marketing
              ├── Content
              ├── Scenario
              ├── WhatsApp
              ├── Documents
              ├── Risk
              └── Notifications
```

## Database Design Decisions

- **UUID primary keys** everywhere — safe for distributed systems
- **JSONB columns** for flexible data (requirements, ai_results) — avoids premature schema
- **RLS on all tables** — security by default, not afterthought
- **application_history** — append-only audit log, never update records
- **Separate leads table** — tracks pre-registration funnel separately from users

## Auth Flow

```
Anonymous → Landing → WhatsApp / Registration
Registration → Supabase Auth (email verification or Google OAuth)
→ Profile created in public.users (linked to auth.users by ID)
→ JWT stored in httpOnly cookie via @supabase/ssr
```

## Agent Architecture (MEDVI Model)

Each agent is a LangGraph StateGraph:
- **State**: typed Pydantic model
- **Nodes**: individual LLM calls or tool uses  
- **Edges**: conditional routing based on state
- **Checkpointing**: Redis for long-running flows

Fast tasks (intent classification, FAQ) → `claude-haiku-4-5`  
Complex tasks (risk analysis, content generation) → `claude-opus-4-8`

## File Storage Strategy

- Documents: `supabase/storage/documents/{user_id}/{application_id}/{doc_type}.pdf`
- Photos: `supabase/storage/photos/{user_id}/profile.jpg`
- Max size: 10MB per file
- Allowed types: PDF, JPG, PNG only
- Access: signed URLs with 1-hour expiry (never public URLs for private docs)

## Key Design Decisions

1. **WhatsApp as primary channel** — 95%+ KZ users have WhatsApp, it's the primary touchpoint
2. **Bot-first, human escalation** — AI handles 80%, human takes over on escalation triggers
3. **Kaspi Pay as primary payment** — every KZ adult has Kaspi, removes payment friction
4. **Russian as primary language** — full 100% coverage, Kazakh UI secondary
5. **Mobile-first** — 70%+ of KZ internet users are mobile-only
6. **No microservices** — monorepo with clear module boundaries, scale later if needed
