# SupportSMS Mini

A two-way SMS inbox with AI-suggested replies, built for charity and fundraising teams.

Supporters text in, team members view conversations in a real-time inbox, and AI drafts contextual reply suggestions — all within a clean, modern interface.

## Tech Stack

- **Next.js 16** (App Router) + TypeScript
- **Supabase** — Auth, PostgreSQL, Row Level Security, Realtime
- **Twilio** — Send and receive SMS via webhooks
- **OpenAI** (gpt-4o-mini) — AI-powered reply suggestions
- **Tailwind CSS** — Styling

## Features

- **Email/password auth** with automatic organization creation on signup
- **Multi-tenant isolation** — org_id on all tables with RLS policies
- **Real-time inbox** — new messages appear instantly via Supabase Realtime
- **Conversation threads** — message bubbles with inbound/outbound styling
- **Twilio webhook** — receives inbound SMS, auto-creates contacts
- **Outbound SMS** — send replies directly from the conversation view
- **AI Suggest** — generates a draft reply (max 160 chars) based on conversation context

## Getting Started

### Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project (free tier)
- A [Twilio](https://www.twilio.com/try-twilio) account (free trial)
- An [OpenAI](https://platform.openai.com) API key
- [ngrok](https://ngrok.com) for local webhook testing

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy `.env.example` to `.env.local` and fill in your keys:

```bash
cp .env.example .env.local
```

| Variable | Where to find it |
|----------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard > Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard > Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard > Settings > API |
| `TWILIO_ACCOUNT_SID` | Twilio Console |
| `TWILIO_AUTH_TOKEN` | Twilio Console |
| `TWILIO_PHONE_NUMBER` | Twilio Console > Phone Numbers |
| `OPENAI_API_KEY` | OpenAI Platform > API Keys |
| `DEFAULT_ORG_ID` | UUID of your org (from Supabase after first signup) |

### 3. Set up the database

Run the following SQL in your Supabase SQL Editor:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.org_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id, user_id)
);

CREATE TABLE public.contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id, phone_number)
);

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_org_members_user_id ON public.org_members(user_id);
CREATE INDEX idx_org_members_org_id ON public.org_members(org_id);
CREATE INDEX idx_contacts_org_id ON public.contacts(org_id);
CREATE INDEX idx_contacts_org_phone ON public.contacts(org_id, phone_number);
CREATE INDEX idx_messages_contact_id ON public.messages(contact_id);
CREATE INDEX idx_messages_org_id ON public.messages(org_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);

-- Enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their organizations"
  ON public.organizations FOR SELECT
  USING (id IN (SELECT org_id FROM public.org_members WHERE user_id = auth.uid()));

CREATE POLICY "Authenticated users can create organizations"
  ON public.organizations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view org members"
  ON public.org_members FOR SELECT
  USING (org_id IN (SELECT org_id FROM public.org_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own membership"
  ON public.org_members FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view contacts in their org"
  ON public.contacts FOR SELECT
  USING (org_id IN (SELECT org_id FROM public.org_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert contacts in their org"
  ON public.contacts FOR INSERT
  WITH CHECK (org_id IN (SELECT org_id FROM public.org_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can view messages in their org"
  ON public.messages FOR SELECT
  USING (org_id IN (SELECT org_id FROM public.org_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert messages in their org"
  ON public.messages FOR INSERT
  WITH CHECK (org_id IN (SELECT org_id FROM public.org_members WHERE user_id = auth.uid()));

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign up.

### 5. Set up Twilio webhook (for receiving SMS)

```bash
ngrok http 3000
```

Copy the ngrok HTTPS URL and set it as the webhook in Twilio Console:
**Phone Numbers > Your Number > Messaging > "A message comes in"** → `https://YOUR_NGROK_URL/api/sms` (POST)

### 6. Update DEFAULT_ORG_ID

After signing up, grab your organization's UUID from the Supabase Dashboard (`organizations` table) and add it to `.env.local`.

## Project Structure

```
src/
├── app/
│   ├── page.tsx                              # Landing page
│   ├── login/                                # Login page + server actions
│   ├── signup/                               # Signup page
│   ├── auth/signout/                         # Logout route
│   ├── dashboard/
│   │   ├── page.tsx                          # Inbox
│   │   ├── components/                       # ContactRow, InboxList
│   │   └── conversations/[contactId]/        # Conversation thread
│   └── api/
│       ├── sms/route.ts                      # Twilio inbound webhook
│       ├── sms/send/route.ts                 # Send outbound SMS
│       └── ai/suggest/route.ts               # AI reply suggestion
├── components/ui/                            # Shared UI components
├── lib/
│   ├── supabase/                             # Client, server, middleware utils
│   ├── types/                                # TypeScript types
│   └── helpers/                              # Auth helpers
└── middleware.ts                             # Session refresh + route guards
```

## Architecture Decisions

- **Service role client for inbound webhook** — Twilio webhooks have no user session; the service role key bypasses RLS. Secured via Twilio signature validation in production.
- **DEFAULT_ORG_ID for demo** — Maps all inbound SMS to one org. Production would use a phone number → organization lookup table.
- **router.refresh() for inbox** — Simpler than full client-side state management. Conversation threads use proper client-side realtime for smooth UX.
- **Non-streaming AI** — SMS replies are short (~160 chars), so streaming adds no UX benefit.

## Deploy to Vercel

1. Push to GitHub
2. Import the repo in [Vercel](https://vercel.com)
3. Add all environment variables from `.env.local`
4. Update `NEXT_PUBLIC_APP_URL` to your production URL
5. Update the Twilio webhook URL to your production URL

## License

MIT
